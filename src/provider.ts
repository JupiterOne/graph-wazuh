// import faker from 'faker';
// const faker = require('faker');
// faker.locale = 'en_US';

require("isomorphic-fetch");

// Configuration  TODO
const base_url = "http://user:password@PLACE-SERVERLOCATION-HERE:55000";

export interface WazuhManager {
  msg: string;
  api_version: string;
  hostname: string;
  timestamp: string;
  id: string;
}

export interface Agent {
  status: string;
  name: string;
  ip: string;
  manager: string;
  node_name: string;
  dateAdd: string;
  version: string;
  lastKeepAlive: string;
  // os: {
  // os_major: string,
  // os_name: string,
  // os_uname: string,
  // os_platform: string,
  // os_version: string,
  // os_codename: string,
  // os_arch: string,
  // },
  id: string;
  ownerId: string;
}

export async function fetchProviderInfo(): Promise<string> {
  return await fetch(base_url)
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

export async function fetchManager(): Promise<WazuhManager> {
  return await fetchProviderInfo()
    .then(info => {
      const provider = JSON.parse(info);
      return {
        msg: provider.msg,
        api_version: provider.api_version,
        hostname: provider.hostname,
        timestamp: provider.timestamp,
        id: "0",
      };
    })
    .catch(error => {
      throw new Error(`${error}: fetching wazuh manager info `);
    });
}

export default async function fetchAgentsInfo(): Promise<string> {
  return await fetch(base_url + "/agents/000")
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

export function mapToAgent(a: string): Agent {
  const agent = JSON.parse(JSON.stringify(a));
  return {
    status: agent.status,
    name: agent.name,
    ip: agent.ip,
    manager: agent.manager,
    node_name: agent.node_name,
    dateAdd: agent.dateAdd,
    version: agent.version,
    lastKeepAlive: agent.lastKeepAlive,
    id: agent.id,
    ownerId: "0",
  };
}

export async function fetchAgents(): Promise<Agent[]> {
  const info = await fetchAgentsInfo().catch(error => {
    throw new Error(`${error}: fetching agents`);
  });

  const agents = JSON.parse(JSON.stringify(info));

  if (Array.isArray(agents)) {
    return agents.map(agent => {
      return mapToAgent(agent);
    });
  } else {
    return [mapToAgent(agents)];
  }
}
