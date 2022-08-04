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
    const items = await this.fetchData<WazuhManager>('/manager/info');
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

  public async fetchAgents(): Promise<WazuhAgent[]> {
    return this.fetchData<WazuhAgent>('/agents');
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

  private async fetchData<T>(path: string): Promise<T[]> {
    const json = await makeRequest(
      `${this.config.managerUrl}${path}`,
      this.requestOptions,
    );
    const response: WazuhResponse<T> = json.data;
    if (response.error || response.failed_items.length) {
      this.logger.error(
        {
          ...response,
          affected_items: undefined,
          failed_items: undefined,
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
    return response.affected_items;
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
