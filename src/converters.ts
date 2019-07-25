import {
  EntityFromIntegration,
  IntegrationInstance,
  RelationshipFromIntegration,
} from "@jupiterone/jupiter-managed-integration-sdk";

import getTime from "./utils/getTime";
import { WazuhAgent, WazuhManager } from "./wazuh/types";

export const WAZUH_MANAGER_ENTITY_TYPE = "wazuh_manager";
export const WAZUH_MANAGER_ENTITY_CLASS = ["Service", "Control"];

export const WAZUH_AGENT_ENTITY_TYPE = "wazuh_agent";
export const AGENT_ENTITY_CLASS = "HostAgent";

export const WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE = "wazuh_manager_has_agent";
export const WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS = "HAS";

export interface WazuhManagerEntity extends EntityFromIntegration {
  compilationDate: number;
  version: string;
  opensslSupport: string;
  maxAgents: string;
  rulesetVersion: string;
  path: string;
  tzName: string;
  type: string;
  tzOffset: string;
}

export interface WazuhAgentEntity extends EntityFromIntegration {
  agentId: string;
  status: string;
  name: string;
  ip: string;
  manager?: string;
  nodeName: string;
  dateAdd: number;
  createdOn: number;
  version?: string;
  osMajor?: string;
  osName?: string;
  osUname?: string;
  osPlatform?: string;
  osVersion?: string;
  osCodename?: string;
  osArch?: string;
  osMinor?: string;
}

export function createWazuhManagerEntity(
  instance: IntegrationInstance,
  data: WazuhManager,
): WazuhManagerEntity {
  return {
    _key: `${WAZUH_MANAGER_ENTITY_TYPE}_${instance.id}`,
    _type: WAZUH_MANAGER_ENTITY_TYPE,
    _class: WAZUH_MANAGER_ENTITY_CLASS,
    displayName: `${data.type} ${data.version}`,
    compilationDate: getTime(data.compilation_date)!,
    version: data.version,
    opensslSupport: data.openssl_support,
    maxAgents: data.max_agents,
    rulesetVersion: data.ruleset_version,
    path: data.path,
    tzName: data.tz_name,
    type: data.type,
    tzOffset: data.tz_offset,
  };
}

export function createAgentEntity(data: WazuhAgent): WazuhAgentEntity {
  return {
    _key: `${WAZUH_AGENT_ENTITY_TYPE}_${data.id}`,
    _type: WAZUH_AGENT_ENTITY_TYPE,
    _class: AGENT_ENTITY_CLASS,
    agentId: data.id,
    displayName: `${data.name}: ${data.node_name}`,
    status: data.status,
    name: data.name,
    ip: data.ip,
    manager: data.manager,
    nodeName: data.node_name,
    dateAdd: getTime(data.dateAdd)!,
    createdOn: getTime(data.dateAdd)!,
    version: data.version,
    osPlatform: data.os && data.os.platform,
    osName: data.os && data.os.name,
    osUname: data.os && data.os.uname,
    osMajor: data.os && data.os.major,
    osMinor: data.os && data.os.minor,
    osVersion: data.os && data.os.version,
    osCodename: data.os && data.os.codename,
    osArch: data.os && data.os.arch,
  };
}

export function createWazuhManagerAgentRelationship(
  manager: WazuhManagerEntity,
  agent: WazuhAgentEntity,
): RelationshipFromIntegration {
  return {
    _key: `${manager._key}_has_${agent._key}`,
    _type: WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
    _class: WAZUH_MANAGER_AGENT_RELATIONSHIP_CLASS,
    _fromEntityKey: manager._key,
    _toEntityKey: agent._key,
  };
}
