import {
  EntityFromIntegration,
  RelationshipFromIntegration
} from "@jupiterone/jupiter-managed-integration-sdk";
import { Agent, WazuhManager } from "./provider";

export const ACCOUNT_ENTITY_CLASS = "Account";

export const WAZUH_MANAGER_ENTITY_TYPE = "provider_wazuhmanager";
export const WAZUH_MANAGER_ENTITY_CLASS = "Wazuhmanager";

export const AGENT_ENTITY_TYPE = "provider_agent";
export const AGENT_ENTITY_CLASS = "Agent";

export const ACCOUNT_WAZUH_MANAGER_RELATIONSHIP_TYPE =
  "provider_account_wazuhmanager";
export const ACCOUNT_WAZUH_MANAGER_RELATIONSHIP_CLASS = "HAS";

export const WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE =
  "provider_wazuhmanager_agent";
export const WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS = "HAS";

export interface WazuhManagerEntity
  extends EntityFromIntegration,
    WazuhManager {
  managerId: string;
}

export interface AgentEntity extends EntityFromIntegration, Agent {
  ownerId: string;
}

export function createWazuhManagerEntities(
  data: WazuhManager
): WazuhManagerEntity {
  // Note the manager is also the account entity
  return {
    _key: `${WAZUH_MANAGER_ENTITY_TYPE}-${data.id}`,
    _type: WAZUH_MANAGER_ENTITY_TYPE,
    _class: [WAZUH_MANAGER_ENTITY_CLASS, ACCOUNT_ENTITY_CLASS],
    managerId: data.id,
    displayName: `${data.type} ${data.version}`,
    id: data.id,
    compilationDate: data.compilationDate,
    version: data.version,
    opensslSupport: data.opensslSupport,
    maxAgents: data.maxAgents,
    rulesetVersion: data.rulesetVersion,
    path: data.path,
    tzName: data.tzName,
    type: data.type,
    tzOffset: data.tzOffset
  };
}

export function createAgentEntities(data: Agent[]): AgentEntity[] {
  return data.map(d => ({
    _key: `${AGENT_ENTITY_TYPE}-id-${d.id}`,
    _type: AGENT_ENTITY_TYPE,
    _class: AGENT_ENTITY_CLASS,
    agentId: d.id,
    ownerId: d.ownerId,
    displayName: `${d.name}: ${d.nodeName}`,
    status: d.status,
    name: d.name,
    ip: d.ip,
    manager: d.manager,
    nodeName: d.nodeName,
    dateAdd: d.dateAdd,
    version: d.version,
    lastKeepAlive: d.lastKeepAlive,
    osMajor: d.osMajor,
    osName: d.osName,
    osUname: d.osUname,
    osPlatform: d.osPlatform,
    osVersion: d.osVersion,
    osCodename: d.osCodename,
    osArch: d.osArch,
    osMinor: d.osMinor,
    id: d.id
  }));
}

export function createWazuhManagerAgentRelationships(
  manager: WazuhManagerEntity,
  agents: AgentEntity[]
) {
  const relationships = [];
  for (const agent of agents) {
    agent.ownerId = manager.managerId;
    relationships.push(createWazuhManagerAgentRelationship(manager, agent));
  }

  return relationships;
}

function createWazuhManagerAgentRelationship(
  manager: WazuhManagerEntity,
  agent: AgentEntity
): RelationshipFromIntegration {
  return {
    _key: `${manager._key}_has_${agent._key}`,
    _type: WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
    _class: WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS,
    _fromEntityKey: manager._key,
    _toEntityKey: agent._key
  };
}
