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

test("Wazuh Manager being converted to Manager Entity where manager = manager entity.", () => {
  const m: WazuhManager = fetchManager();
  const managerEntity: WazuhManagerEntity = createWazuhManagerEntities(m);

  expect(managerEntity.id).toEqual(m.id);
  expect(managerEntity.compilationDate).toEqual(m.compilationDate);
  expect(managerEntity.version).toEqual(m.version);
  expect(managerEntity.opensslSupport).toEqual(m.opensslSupport);
  expect(managerEntity.maxAgents).toEqual(m.maxAgents);
  expect(managerEntity.rulesetVersion).toEqual(m.rulesetVersion);
  expect(managerEntity.path).toEqual(m.path);
  expect(managerEntity.tzName).toEqual(m.tzName);
  expect(managerEntity.type).toEqual(m.type);
  expect(managerEntity.tzOffset).toEqual(m.tzOffset);
  expect(managerEntity._key).toEqual(`${WAZUH_MANAGER_ENTITY_TYPE}-${m.id}`);
  expect(managerEntity.displayName).toEqual(`${m.type} ${m.version}`);
});

test("Wazuh Agents being converted to Agent Entities where agent = agent entyity.", () => {
  const a: Agent[] = fetchAgents();
  const agentEntity: AgentEntity[] = createAgentEntities(a);

  for (let i: number = 0; i < a.length; i++) {
    expect(agentEntity[i].id).toEqual(a[i].id);
    expect(agentEntity[i].status).toEqual(a[i].status);
    expect(agentEntity[i].name).toEqual(a[i].name);
    expect(agentEntity[i].ip).toEqual(a[i].ip);
    expect(agentEntity[i].manager).toEqual(a[i].manager);
    expect(agentEntity[i].nodeName).toEqual(a[i].nodeName);
    expect(agentEntity[i].dateAdd).toEqual(a[i].dateAdd);
    expect(agentEntity[i].version).toEqual(a[i].version);
    expect(agentEntity[i].lastKeepAlive).toEqual(a[i].lastKeepAlive);
    expect(agentEntity[i].osMajor).toEqual(a[i].osMajor);
    expect(agentEntity[i].osName).toEqual(a[i].osName);
    expect(agentEntity[i].osUname).toEqual(a[i].osUname);
    expect(agentEntity[i].osPlatform).toEqual(a[i].osPlatform);
    expect(agentEntity[i].osVersion).toEqual(a[i].osVersion);
    expect(agentEntity[i].osCodename).toEqual(a[i].osCodename);
    expect(agentEntity[i].osArch).toEqual(a[i].osArch);
    expect(agentEntity[i].osMinor).toEqual(a[i].osMinor);
    expect(agentEntity[i]._type).toEqual(AGENT_ENTITY_TYPE);
    expect(agentEntity[i]._class).toEqual(AGENT_ENTITY_CLASS);
    expect(agentEntity[i]._key).toEqual(`${AGENT_ENTITY_TYPE}-id-${a[i].id}`);
    expect(agentEntity[i].displayName).toEqual(
      `${a[i].name}: ${a[i].nodeName}`,
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
    expect(managerAgentRel[i]._key).toEqual(
      `${mEntity._key}_has_${aEntity[i]._key}`,
    );
    expect(managerAgentRel[i]._type).toEqual(
      WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
    );
    expect(managerAgentRel[i]._class).toEqual(
      WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS,
    );
    expect(managerAgentRel[i]._fromEntityKey).toEqual(mEntity._key);
    expect(managerAgentRel[i]._toEntityKey).toEqual(aEntity[i]._key);
  }
});
