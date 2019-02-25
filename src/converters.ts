import {
  EntityFromIntegration,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { Agent, WazuhManager } from "./provider";

export const WAZUH_MANAGER_ENTITY_TYPE = "provider_wazuhmanager";
export const WAZUH_MANAGER_ENTITY_CLASS = "Wazuhmanager";

export const AGENT_ENTITY_TYPE = "provider_agent";
export const AGENT_ENTITY_CLASS = "Agent";

export const WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE =
  "provider_wazuhmanager_agent";
export const WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS = "HAS";

export interface WazuhManagerEntity extends EntityFromIntegration {
  managerId: string;
}

export interface AgentEntity extends EntityFromIntegration {
  agentId: string;
  ownerId: string;
}

export function createWazuhManagerEntities(
  data: WazuhManager[],
): WazuhManagerEntity[] {
  return data.map(d => ({
    _key: `${WAZUH_MANAGER_ENTITY_TYPE}-${d.id}`,
    _type: WAZUH_MANAGER_ENTITY_TYPE,
    _class: WAZUH_MANAGER_ENTITY_CLASS,
    managerId: d.id,
    displayName: `${d.hostname} ${d.api_version}`,
  }));
}

export function createAgentEntities(data: Agent[]): AgentEntity[] {
  return data.map(d => ({
    _key: `provider-device-id-${d.id}`,
    _type: AGENT_ENTITY_TYPE,
    _class: AGENT_ENTITY_CLASS,
    agentId: d.id,
    ownerId: d.ownerId,
    displayName: `${d.name} ${d.node_name}`,
  }));
}

export function createWazuhManagerAgentRelationships(
  manager: WazuhManagerEntity,
  agents: AgentEntity[],
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
  agent: AgentEntity,
): RelationshipFromIntegration {
  return {
    _key: `${manager._key}_has_${agent._key}`,
    _type: WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
    _class: WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS,
    _fromEntityKey: manager._key,
    _toEntityKey: agent._key,
  };
}
