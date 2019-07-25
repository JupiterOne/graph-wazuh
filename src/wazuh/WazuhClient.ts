import fetch, { Request, RequestInit } from "node-fetch";

import { IntegrationError } from "@jupiterone/jupiter-managed-integration-sdk";

import { WazuhAgent, WazuhClientConfig, WazuhManager } from "./types";

export default class WazuhClient {
  private requestOptions: object;

  constructor(readonly config: WazuhClientConfig) {
    const authorization = Buffer.from(
      `${config.username}:${config.password}`,
    ).toString("base64");
    this.requestOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authorization}`,
      },
    };
  }

  public async verifyAccess() {
    return this.fetchData("/manager/info");
  }

  public async fetchManager(): Promise<WazuhManager> {
    return this.fetchData<WazuhManager>("/manager/info");
  }

  public async fetchAgents(): Promise<WazuhAgent[]> {
    return this.fetchDataItems<WazuhAgent[]>("/agents");
  }

  private async fetchData<T>(path: string): Promise<T> {
    const json = await makeRequest(
      `${this.config.managerUrl}${path}`,
      this.requestOptions,
    );
    return json.data;
  }

  private async fetchDataItems<T>(path: string): Promise<T> {
    return (await this.fetchData<any>(path)).items;
  }
}

async function makeRequest<T>(url: string | Request, init?: RequestInit) {
  const response = await fetch(url, init);
  if (response.status >= 400) {
    throw new IntegrationError({
      expose: true,
      message: response.statusText,
      statusCode: response.status,
    });
  } else {
    return response.json();
  }
}
