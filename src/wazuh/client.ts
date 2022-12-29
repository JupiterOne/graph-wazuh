import {
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';
import fetch, { RequestInit, Response } from 'node-fetch';
import * as https from 'https';
import {
  WazuhAgent,
  WazuhAPIInfo,
  WazuhAuth,
  WazuhClientConfig,
  WazuhManager,
  WazuhPaginatedData,
  WazuhResponse,
} from './types';
import { retry } from '@lifeomic/attempt';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

class WazuhClient {
  private requestOptions: RequestInit;
  private config: WazuhClientConfig;
  private refreshAuthInterval: NodeJS.Timer;
  private logger: IntegrationLogger;
  public initialized: boolean;
  private pageSize = 1; // TODO: for testing purposes only; change to 500 before official PR

  constructor() {
    this.initialized = false;
  }

  public async configure(config: WazuhClientConfig, logger: IntegrationLogger) {
    if (this.initialized) {
      return;
    }
    this.config = config;
    this.logger = logger;
    const basicAuthorization = Buffer.from(
      `${config.username}:${config.password}`,
    ).toString('base64');
    const agent = new https.Agent({
      rejectUnauthorized: config.selfSignedCert ? false : true,
    });
    const basicRequestOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuthorization}`,
      },
      agent,
    };
    const authenticateResponse = await this.fetchAuth(basicRequestOptions);
    const jwtToken = (authenticateResponse?.data as WazuhAuth).token;
    this.requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      agent,
    };
    // https://documentation.wazuh.com/current/user-manual/api/reference.html#section/Authentication
    // jwt expires every 900 seconds
    this.refreshAuthInterval = setInterval(async () => {
      await makeRequest(`${this.config.managerUrl}/security/config`, {
        ...this.requestOptions,
        method: 'PUT',
        body: JSON.stringify({
          auth_token_exp_timeout: 900,
        }),
      });
    }, 800000);

    this.initialized = true;
  }

  public destroy() {
    clearInterval(this.refreshAuthInterval);
    this.initialized = false;
  }

  public async verifyAccess() {
    return await makeRequest<WazuhAPIInfo>(
      `${this.config.managerUrl}/`,
      this.requestOptions,
    );
  }

  public async fetchManager(): Promise<WazuhManager> {
    const items = (
      (await this.fetchPaginatedData<WazuhManager>(
        '/manager/info',
      )) as WazuhPaginatedData<WazuhManager>
    ).affected_items;
    if (items.length === 1) {
      return items[0];
    } else {
      if (items.length) {
        this.logger.warn(
          {
            managerInfo: items.map((item) => {
              return {
                type: item.type,
                version: item.version,
              };
            }),
          },
          `Wazuh Api responded back with ${items.length} Managers when we only expected one. We only consumed the first one.`,
        );
        return items[0];
      } else {
        throw new IntegrationProviderAPIError({
          endpoint: `${this.config.managerUrl}/manager/info`,
          status: '500',
          statusText: 'Internal Error',
          message:
            'empty non-error response from Wazuh API when fetching manager info',
        });
      }
    }
  }

  /**
   * Iterates each agent in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateAgents(
    iteratee: ResourceIteratee<WazuhAgent>,
  ): Promise<void> {
    await this.paginatedRequest<WazuhAgent>(`/agents`, iteratee);
  }

  private async fetchAuth(
    requestOptionsOverride: RequestInit,
  ): Promise<WazuhResponse<WazuhAuth>> {
    const json: WazuhResponse<WazuhAuth> = await makeRequest(
      `${this.config.managerUrl}/security/user/authenticate`,
      requestOptionsOverride,
    );
    return json;
  }

  private async fetchPaginatedData<T>(
    path: string,
  ): Promise<WazuhPaginatedData<T>> {
    const json = await makeRequest<WazuhResponse<WazuhPaginatedData<T>>>(
      `${this.config.managerUrl}${path}`,
      this.requestOptions,
    );
    const response: WazuhPaginatedData<T> =
      json.data as unknown as WazuhPaginatedData<T>;
    if (response.error || response.failed_items?.length) {
      this.logger.error(
        {
          total_affected_items: response.total_affected_items,
          total_failed_items: response.total_failed_items,
          message: response.message,
          error: response.error,
        },
        'error fetching from Wazuh Api in WazuhClient#fetchData',
      );
      throw new IntegrationProviderAPIError({
        endpoint: `${this.config.managerUrl}${path}`,
        status: '500',
        statusText: 'Internal Error',
        message: `Encountered error fetching data from Wazuh Api. We recieved the following message from the server: ${response.message}`,
      });
    }
    return response;
  }

  private async paginatedRequest<T>(
    uri: string,
    iteratee: ResourceIteratee<T>,
  ): Promise<void> {
    try {
      let offset: number = 0;
      let nextUri:
        | string
        | null = `${uri}?limit=${this.pageSize}&offset=${offset}`;
      do {
        const response = (await this.fetchPaginatedData<T>(
          nextUri || uri,
        )) as WazuhPaginatedData<T>;
        offset += 1;
        nextUri =
          response.total_affected_items > this.pageSize * offset
            ? `${uri}?limit=${this.pageSize}&offset=${offset}`
            : null;
        for (const item of response.affected_items) {
          await iteratee(item as T);
        }
      } while (nextUri);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: new Error(err.message),
        endpoint: uri,
        status: err.statusCode,
        statusText: err.message,
      });
    }
  }
}

async function makeRequest<T>(url: string, init?: RequestInit): Promise<T> {
  try {
    // Handle rate-limiting
    const response = await retry(
      async () => {
        const res: Response = await fetch(url, init);
        if (res.status >= 400) {
          throw new IntegrationProviderAPIError({
            endpoint: url,
            statusText: res.statusText,
            status: res.status,
          });
        } else {
          return res;
        }
      },
      {
        delay: 5000,
        maxAttempts: 10,
        handleError: (err, context) => {
          if (
            err.statusCode !== 429 ||
            ([500, 502, 503].includes(err.statusCode) && context.attemptNum > 1)
          )
            context.abort();
        },
      },
    );
    return response.json() as unknown as T;
  } catch (err) {
    throw new IntegrationProviderAPIError({
      endpoint: url,
      status: err.status,
      statusText: err.statusText,
    });
  }
}

export const wazuhClient = new WazuhClient();
