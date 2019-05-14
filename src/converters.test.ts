import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

import { Agent, WazuhManager } from "./provider";

import {
  AgentEntity,
  createAgentEntities,
  createWazuhManagerAgentRelationships,
  createWazuhManagerEntities,
  WazuhManagerEntity,
} from "./converters";

function fetchManager(): WazuhManager {
  return {
    id: "0",
    compilationDate: "Thu Oct 11 09:38:47 2018",
    version: "v3.8.2",
    opensslSupport: "yes",
    maxAgents: "1400",
    rulesetVersion: "3801",
    path: "/var/ossec",
    tzName: "UTC",
    type: "manager",
    tzOffset: "+0000",
  };
}

function fetchAgents(): Agent[] {
  return [
    {
      ownerId: "0",
      status: "Active",
      name: `agent1`,
      ip: "192.168.1.7",
      manager: "manager",
      nodeName: "node01",
      dateAdd: "2018-10-11 09:38:47",
      version: "Wazuh v3.8.2",
      lastKeepAlive: "2018-10-11 13:58:08",
      osMajor: "16",
      osName: "ubuntu",
      osUname:
        "Linux |ubuntu |4.4.0-135-generic |#161-Ubuntu SMP Mon Aug 27 10:45:01 UTC 2018 |x86_64",
      osPlatform: "ubuntu",
      osVersion: "16.04.5 LTS",
      osCodename: "Xenial Xerus",
      osArch: "x86_64",
      osMinor: "04",
      id: "001",
    },
    {
      ownerId: "0",
      status: "Disconnected",
      name: `agent2`,
      ip: "192.168.1.77",
      manager: "manager",
      nodeName: "node02",
      dateAdd: "2018-10-11 09:38:47",
      version: "Wazuh v3.8.2",
      lastKeepAlive: "2018-10-11 13:58:08",
      osMajor: "16",
      osName: "ubuntu",
      osUname:
        "Linux |ubuntu |4.4.0-135-generic |#161-Ubuntu SMP Mon Aug 27 10:45:01 UTC 2018 |x86_64",
      osPlatform: "ubuntu",
      osVersion: "16.04.5 LTS",
      osCodename: "Xenial Xerus",
      osArch: "x86_64",
      osMinor: "04",
      id: "002",
    },
  ];
}

test("Wazuh Manager being converted to Manager Entity.", () => {
  const m: WazuhManager = fetchManager();
  const managerEntity: WazuhManagerEntity = createWazuhManagerEntities(m);

  expect(managerEntity).toEqual({
    _class: ["Service", "Control"],
    _key: "wazuh_manager-0",
    _type: "wazuh_manager",
    compilationDate: 1539250727000,
    displayName: "manager v3.8.2",
    id: "0",
    managerId: "0",
    maxAgents: "1400",
    opensslSupport: "yes",
    path: "/var/ossec",
    rulesetVersion: "3801",
    type: "manager",
    tzName: "UTC",
    tzOffset: "+0000",
    version: "v3.8.2",
  });
});

test("Wazuh Agents being converted to Agent Entities.", () => {
  const a: Agent[] = fetchAgents();
  const agentEntity: AgentEntity[] = createAgentEntities(a);

  expect(agentEntity).toEqual([
    {
      _class: "HostAgent",
      _key: "wazuh_agent-id-001",
      _type: "wazuh_agent",
      agentId: "001",
      dateAdd: 1539250727000,
      displayName: "agent1: node01",
      id: "001",
      ip: "192.168.1.7",
      lastKeepAlive: 1539266288000,
      manager: "manager",
      name: "agent1",
      nodeName: "node01",
      osArch: "x86_64",
      osCodename: "Xenial Xerus",
      osMajor: "16",
      osMinor: "04",
      osName: "ubuntu",
      osPlatform: "ubuntu",
      osUname:
        "Linux |ubuntu |4.4.0-135-generic |#161-Ubuntu SMP Mon Aug 27 10:45:01 UTC 2018 |x86_64",
      osVersion: "16.04.5 LTS",
      ownerId: "0",
      status: "Active",
      version: "Wazuh v3.8.2",
    },
    {
      _class: "HostAgent",
      _key: "wazuh_agent-id-002",
      _type: "wazuh_agent",
      agentId: "002",
      dateAdd: 1539250727000,
      displayName: "agent2: node02",
      id: "002",
      ip: "192.168.1.77",
      lastKeepAlive: 1539266288000,
      manager: "manager",
      name: "agent2",
      nodeName: "node02",
      osArch: "x86_64",
      osCodename: "Xenial Xerus",
      osMajor: "16",
      osMinor: "04",
      osName: "ubuntu",
      osPlatform: "ubuntu",
      osUname:
        "Linux |ubuntu |4.4.0-135-generic |#161-Ubuntu SMP Mon Aug 27 10:45:01 UTC 2018 |x86_64",
      osVersion: "16.04.5 LTS",
      ownerId: "0",
      status: "Disconnected",
      version: "Wazuh v3.8.2",
    },
  ]);
});

test("Wazuh Manager has Agents relationship.", () => {
  const mEntity: WazuhManagerEntity = createWazuhManagerEntities(
    fetchManager(),
  );
  const aEntity: AgentEntity[] = createAgentEntities(fetchAgents());
  const managerAgentRel: RelationshipFromIntegration[] = createWazuhManagerAgentRelationships(
    mEntity,
    aEntity,
  );

  expect(managerAgentRel).toEqual([
    {
      _class: "HAS",
      _fromEntityKey: "wazuh_manager-0",
      _key: "wazuh_manager-0_has_wazuh_agent-id-001",
      _toEntityKey: "wazuh_agent-id-001",
      _type: "wazuh_manager_has_agent",
    },
    {
      _class: "HAS",
      _fromEntityKey: "wazuh_manager-0",
      _key: "wazuh_manager-0_has_wazuh_agent-id-002",
      _toEntityKey: "wazuh_agent-id-002",
      _type: "wazuh_manager_has_agent",
    },
  ]);
});
