import { IntegrationProviderAPIError } from '@jupiterone/integration-sdk-core';
import fetch, { RequestInit } from 'node-fetch';
import * as https from 'https';
import {
  WazuhAgent,
  WazuhAuth,
  WazuhClientConfig,
  WazuhManager,
} from './types';

class WazuhClient {
  private requestOptions: RequestInit;

  private config: WazuhClientConfig;

  private refreshAuthInterval: NodeJS.Timer;

  constructor() {
    // https://documentation.wazuh.com/current/user-manual/api/reference.html#section/
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
  }

  public async configure(config: WazuhClientConfig) {
    this.config = config;
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
    const authenticateResponse = await this.fetchData<WazuhAuth>(
      '/security/user/authenticate',
      basicRequestOptions,
    );
    const jwtToken = authenticateResponse?.token;
    this.requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
      agent,
    };
  }

  public destroy() {
    clearInterval(this.refreshAuthInterval);
  }

  public async verifyAccess() {
    return this.fetchData('/manager/info');
  }

  public async fetchManager(): Promise<WazuhManager> {
    return this.fetchData<WazuhManager>('/manager/info');
  }

  public async fetchAgents(): Promise<WazuhAgent[]> {
    return this.fetchDataItems<WazuhAgent[]>('/agents');
  }

  private async fetchData<T>(
    path: string,
    requestOptionsOverride?: RequestInit,
  ): Promise<T> {
    const json = await makeRequest(
      `${this.config.managerUrl}${path}`,
      requestOptionsOverride ? requestOptionsOverride : this.requestOptions,
    );
    return json.data;
  }

  private async fetchDataItems<T>(path: string): Promise<T> {
    return (await this.fetchData<any>(path)).items;
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
