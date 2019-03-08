import { RelationshipFromIntegration } from "@jupiterone/jupiter-managed-integration-sdk";

import { Agent, WazuhManager } from "./provider";

import {
  AGENT_ENTITY_CLASS,
  AGENT_ENTITY_TYPE,
  AgentEntity,
  createAgentEntities,
  createWazuhManagerAgentRelationships,
  createWazuhManagerEntities,
  WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS,
  WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
  WAZUH_MANAGER_ENTITY_TYPE,
  WazuhManagerEntity,
} from "./converters";

function fetchManager(): WazuhManager {
  return {
    id: "0",
    compilationDate: "2018-10-11 09:38:47",
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

test("Wazuh Manager being converted to Manager Entity where manager = manager entyity.", () => {
  const m: WazuhManager = fetchManager();
  const managerEntity: WazuhManagerEntity = createWazuhManagerEntities(m);

  expect(m.id).toEqual(managerEntity.id);
  expect(m.compilationDate).toEqual(managerEntity.compilationDate);
  expect(m.version).toEqual(managerEntity.version);
  expect(m.opensslSupport).toEqual(managerEntity.opensslSupport);
  expect(m.maxAgents).toEqual(managerEntity.maxAgents);
  expect(m.rulesetVersion).toEqual(managerEntity.rulesetVersion);
  expect(m.path).toEqual(managerEntity.path);
  expect(m.tzName).toEqual(managerEntity.tzName);
  expect(m.type).toEqual(managerEntity.type);
  expect(m.tzOffset).toEqual(managerEntity.tzOffset);
  expect(`${WAZUH_MANAGER_ENTITY_TYPE}-${m.id}`).toEqual(managerEntity._key);
  expect(`${m.type} ${m.version}`).toEqual(managerEntity.displayName);
});

test("Wazuh Agents being converted to Agent Entities where agent = agent entyity.", () => {
  const a: Agent[] = fetchAgents();
  const agentEntity: AgentEntity[] = createAgentEntities(a);

  for (let i: number = 0; i < a.length; i++) {
    expect(a[i].id).toEqual(agentEntity[i].id);
    expect(a[i].status).toEqual(agentEntity[i].status);
    expect(a[i].name).toEqual(agentEntity[i].name);
    expect(a[i].ip).toEqual(agentEntity[i].ip);
    expect(a[i].manager).toEqual(agentEntity[i].manager);
    expect(a[i].nodeName).toEqual(agentEntity[i].nodeName);
    expect(a[i].dateAdd).toEqual(agentEntity[i].dateAdd);
    expect(a[i].version).toEqual(agentEntity[i].version);
    expect(a[i].lastKeepAlive).toEqual(agentEntity[i].lastKeepAlive);
    expect(a[i].osMajor).toEqual(agentEntity[i].osMajor);
    expect(a[i].osName).toEqual(agentEntity[i].osName);
    expect(a[i].osUname).toEqual(agentEntity[i].osUname);
    expect(a[i].osPlatform).toEqual(agentEntity[i].osPlatform);
    expect(a[i].osVersion).toEqual(agentEntity[i].osVersion);
    expect(a[i].osCodename).toEqual(agentEntity[i].osCodename);
    expect(a[i].osArch).toEqual(agentEntity[i].osArch);
    expect(a[i].osMinor).toEqual(agentEntity[i].osMinor);
    expect(AGENT_ENTITY_TYPE).toEqual(agentEntity[i]._type);
    expect(AGENT_ENTITY_CLASS).toEqual(agentEntity[i]._class);
    expect(`${AGENT_ENTITY_TYPE}-id-${a[i].id}`).toEqual(agentEntity[i]._key);
    expect(`${a[i].name}: ${a[i].nodeName}`).toEqual(
      agentEntity[i].displayName,
    );
  }
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

  for (let i: number = 0; i < managerAgentRel.length; i++) {
    expect(`${mEntity._key}_has_${aEntity[i]._key}`).toEqual(
      managerAgentRel[i]._key,
    );
    expect(WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE).toEqual(
      managerAgentRel[i]._type,
    );
    expect(WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS).toEqual(
      managerAgentRel[i]._class,
    );
    expect(mEntity._key).toEqual(managerAgentRel[i]._fromEntityKey);
    expect(aEntity[i]._key).toEqual(managerAgentRel[i]._toEntityKey);
  }
});
