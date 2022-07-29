export interface WazuhClientConfig {
  username: string;
  password: string;
  managerUrl: string;
  selfSignedCert?: boolean;
}

export interface WazuhAuth {
  token: string;
}

export interface WazuhManager {
  compilation_date: string;
  version: string;
  openssl_support: string;
  max_agents: string;
  ruleset_version: string;
  path: string;
  tz_name: string;
  type: string;
  tz_offset: string;
}

export interface WazuhAgentOS {
  arch: string;
  codename: string;
  major: string;
  minor: string;
  name: string;
  platform: string;
  uname: string;
  version: string;
}

export interface WazuhAgent {
  status: string;
  dateAdd: string;
  ip: string;
  node_name: string;
  registerIP: string;
  id: string;
  name: string;
  group?: string[];
  os?: WazuhAgentOS;
  version?: string;
  manager?: string;
  lastKeepAlive?: string; // changes constantly, do not transfer to entity
  mergedSum?: string;
  configSum?: string;
}
