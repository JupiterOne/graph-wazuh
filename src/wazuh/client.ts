import {
  IntegrationLogger,
  IntegrationProviderAPIError,
} from '@jupiterone/integration-sdk-core';
import fetch, { RequestInit } from 'node-fetch';
import * as https from 'https';
import {
  WazuhAgent,
  WazuhAuth,
  WazuhClientConfig,
  WazuhManager,
  WazuhResponse,
} from './types';

class WazuhClient {
  private requestOptions: RequestInit;

  private config: WazuhClientConfig;

  private refreshAuthInterval: NodeJS.Timer;

  private logger: IntegrationLogger;

  public initialized: boolean;

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
    const jwtToken = authenticateResponse?.token;
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
        method: 'POST',
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
    return this.fetchData('/manager/info');
  }

  public async fetchManager(): Promise<WazuhManager> {
    const items = (await this.fetchData<WazuhManager>('/manager/info'))
      .affected_items;
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
   *
   * @param offset // used for pagination
   * @returns
   * Promise<{
   *  agents: WazuhAgent[],
   *  next?: number // pass back into this function to fetch "next page"
   * }>
   */
  public async fetchBatchOfAgents(
    offset: number = 0,
    limit: number = 500,
  ): Promise<{
    agents: WazuhAgent[];
    next?: number;
  }> {
    const response = await this.fetchData<WazuhAgent>(
      `/agents?offset=${offset}&limit=${limit}`,
    );
    const total = offset + response.affected_items.length;
    if (total === response.total_affected_items) {
      return {
        agents: response.affected_items,
      };
    } else {
      return {
        agents: response.affected_items,
        next: total,
      };
    }
  }

  private async fetchAuth(
    requestOptionsOverride: RequestInit,
  ): Promise<WazuhAuth> {
    const json = await makeRequest(
      `${this.config.managerUrl}/security/user/authenticate`,
      requestOptionsOverride,
    );
    return json.data;
  }

  private async fetchData<T>(path: string): Promise<WazuhResponse<T>> {
    const json = await makeRequest(
      `${this.config.managerUrl}${path}`,
      this.requestOptions,
    );
    const response: WazuhResponse<T> = json.data;
    if (response.error || response.failed_items.length) {
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
}

async function makeRequest<T>(url: string, init?: RequestInit): Promise<any> {
  const response = await fetch(url, init);
  if (response.status >= 400) {
    throw new IntegrationProviderAPIError({
      endpoint: url,
      statusText: response.statusText,
      status: response.status,
    });
  } else {
    return response.json();
  }
}

export const wazuhClient = new WazuhClient();
