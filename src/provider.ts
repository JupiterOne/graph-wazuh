import fetch from "node-fetch";

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
  username: string;
  password: string;
  managerUrl: string;
}

export class ProviderClient {
  private requestOptions: object;

  constructor(readonly config: ProviderConfig) {
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
    const response = await fetch(
      `${this.config.managerUrl}/manager/info`,
      this.requestOptions,
    );
    if (response.status !== 200) {
      const err = new Error(response.statusText) as any;
      err.code = "UnexpectedStatusCode";
      err.statusCode = response.status;
      throw err;
    }
  }

  public async fetchManager(): Promise<WazuhManager> {
    const response = await fetch(
      `${this.config.managerUrl}/manager/info`,
      this.requestOptions,
    );

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
  }

  public async fetchAgents(): Promise<Agent[]> {
    const response = await fetch(`${this.config.managerUrl}/agents`);

    const agentInfo = JSON.parse(JSON.stringify(await response.json()));
    const agents = [];
    for (const agent of agentInfo.data.items) {
      agents.push(this.mapToAgent(agent));
    }
    return agents;
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
}
