require("isomorphic-fetch");

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
  secret: string;
  baseUrlProtocal: string;
  baseUrlHost: string;
}

export class ProviderClient {
  private managerUrl: string;
  private agentUrl: string;

  constructor(_providerConfig: ProviderConfig) {
    if (
      _providerConfig.userId === undefined ||
      _providerConfig.userId === undefined ||
      _providerConfig.userId === "" ||
      _providerConfig.userId === ""
    ) {
      throw new Error("User ID and Password required");
    } else {
      this.manager_Url = `${_providerConfig.baseUrlProtocal}${
        _providerConfig.userId
      }:${_providerConfig.secret}@${_providerConfig.baseUrlHost}/manager/info`;
      this.agent_Url = `${_providerConfig.baseUrlProtocal}${
        _providerConfig.userId
      }:${_providerConfig.secret}@${_providerConfig.baseUrlHost}/agents`;
      console.log(this.manager_Url);
      console.log(this.agent_Url);
    }
  }

  public async fetchManagerInfo(): Promise<string> {
    return await fetch(this.manager_Url)
      .then((response: Response) => {
        return response.json();
      })
      .then(data => {
        return JSON.stringify(data);
      })
      .catch(error => {
        throw new Error(`${error}: fetching provider info`);
      });
  }

  public async fetchManager(): Promise<WazuhManager> {
    return await this.fetchManagerInfo()
      .then(info => {
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
          id: "0"
        };
      })
      .catch(error => {
        throw new Error(`${error}: fetching wazuh manager info `);
      });
  }

  public async fetchAgentsInfo(): Promise<string> {
    return await fetch(this.agent_Url)
      .then((response: Response) => {
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        throw new Error(`${error}: fetching agents`);
      });
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
      ownerId: "0"
    };
  }

  public async fetchAgents(): Promise<Agent[]> {
    return await this.fetchAgentsInfo()
      .then(info => {
        const agentInfo = JSON.parse(JSON.stringify(info));
        const agents = [];
        for (const agent of agentInfo.data.items) {
          agents.push(this.mapToAgent(agent));
        }
        return agents;
      })
      .catch(error => {
        throw new Error(`${error}: fetching agents`);
      });
  }
} // end of class
