import { IntegrationInstanceAuthenticationError } from "@jupiterone/jupiter-managed-integration-sdk";
import "isomorphic-fetch";

export interface WazuhManager {
  id: string;
  compilationDate: string;
  version: string;
  opensslSupport: string;
  maxAgents: string;
  rulesetVersion: string;
  path: string;
  tzName: string;
  type: string;
  tzOffset: string;
}

export interface Agent {
  status: string;
  name: string;
  ip: string;
  manager?: string;
  nodeName: string;
  dateAdd: string;
  version?: string;
  lastKeepAlive?: string;
  osMajor: string;
  osName: string;
  osUname: string;
  osPlatform: string;
  osVersion: string;
  osCodename: string;
  osArch: string;
  osMinor: string;
  id: string;
  ownerId: string;
}

export interface ProviderConfig {
  userId: string;
  password: string;
  scheme: string;
  host: string;
  port: string;
}

export class ProviderClient {
  private managerUrl: string;
  private agentUrl: string;

  constructor(providerConfig: ProviderConfig) {
    this.managerUrl = `${providerConfig.scheme}://${providerConfig.userId}:${
      providerConfig.password
    }@${providerConfig.host}:${providerConfig.port}/manager/info`;

    this.agentUrl = `${providerConfig.scheme}://${providerConfig.userId}:${
      providerConfig.password
    }@${providerConfig.host}:${providerConfig.port}/agents`;
  }

  public async fetchManager(): Promise<WazuhManager> {
    try {
      const response: Response = await fetch(this.managerUrl);
      if (response.status === 401) {
        throw new IntegrationInstanceAuthenticationError(
          Error(response.statusText),
        );
      }
      const info = JSON.stringify(await response.json());
      const provider = JSON.parse(info);
      return {
        compilationDate: provider.data.compilation_date,
        version: provider.data.version,
        opensslSupport: provider.data.openssl_support,
        maxAgents: provider.data.max_agents,
        rulesetVersion: provider.data.ruleset_version,
        path: provider.data.path,
        tzName: provider.data.tz_name,
        type: provider.data.type,
        tzOffset: provider.data.tz_offset,
        id: "0",
      };
    } catch (error) {
      throw new Error(`${error}: fetching provider info`);
    }
  }

  public async fetchAgents(): Promise<Agent[]> {
    try {
      const response: Response = await fetch(this.agentUrl);
      if (response.status === 401) {
        throw new IntegrationInstanceAuthenticationError(
          Error(response.statusText),
        );
      }
      const agentInfo = JSON.parse(JSON.stringify(await response.json()));
      const agents = [];
      for (const agent of agentInfo.data.items) {
        agents.push(this.mapToAgent(agent));
      }
      return agents;
    } catch (error) {
      //      throw new Error(`${error}: fetching agents`);
      throw error;
    }
  }

  private mapToAgent(a: string): Agent {
    const agent = JSON.parse(JSON.stringify(a));

    return {
      status: agent.status,
      name: agent.name,
      ip: agent.ip,
      manager: agent.manager !== undefined ? agent.manager : "",
      nodeName: agent.node_name,
      dateAdd: agent.dateAdd,
      version: agent.version !== undefined ? agent.version : "",
      lastKeepAlive:
        agent.lastKeepAlive !== undefined ? agent.lastKeepAlive : "",
      osMajor:
        agent.os !== undefined && agent.os.major !== undefined
          ? agent.os.major
          : "",
      osName:
        agent.os !== undefined && agent.os.name !== undefined
          ? agent.os.name
          : "",
      osUname:
        agent.os !== undefined && agent.os.uname !== undefined
          ? agent.os.uname
          : "",
      osPlatform:
        agent.os !== undefined && agent.os.platform !== undefined
          ? agent.os.platform
          : "",
      osVersion:
        agent.os !== undefined && agent.os.version !== undefined
          ? agent.os.version
          : "",
      osCodename:
        agent.os !== undefined && agent.os.codename !== undefined
          ? agent.os.codename
          : "",
      osArch:
        agent.os !== undefined && agent.os.arch !== undefined
          ? agent.os.arch
          : "",
      osMinor:
        agent.os !== undefined && agent.os.minor !== undefined
          ? agent.os.minor
          : "",
      id: agent.id,
      ownerId: "0",
    };
  }
} // end of class
