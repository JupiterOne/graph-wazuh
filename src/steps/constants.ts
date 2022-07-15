import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  MANAGER: 'fetch-manager',
  AGENTS: 'fetch-agents',
  MANAGER_AGENT_RELATIONSHIPS: 'build-manager-agent-relationships',
  CLEANUP_WAZUH_CLIENT: 'cleanup-wazuh-client',
};

export const Entities: Record<'MANAGER' | 'AGENT', StepEntityMetadata> = {
  MANAGER: {
    resourceName: 'Account',
    _type: 'wazuh_manager',
    _class: ['Service', 'Control'],
    schema: {
      properties: {
        compilationDate: { type: 'number' },
        version: { type: 'string' },
        opensslSupport: { type: 'string' },
        maxAgents: { type: 'string' },
        rulesetVersion: { type: 'string' },
        path: { type: 'string' },
        tzName: { type: 'string' },
        type: { type: 'string' },
        tzOffset: { type: 'string' },
      },
      required: [],
    },
  },
  AGENT: {
    resourceName: 'Agent',
    _type: 'wazuh_agent',
    _class: ['HostAgent'],
    schema: {
      properties: {
        agentId: { type: 'string' },
        status: { type: 'string' },
        name: { type: 'string' },
        ip: { type: 'string' },
        manager: { type: 'string' },
        nodeName: { type: 'string' },
        dateAdd: { type: 'number' },
        version: { type: 'string' },
        osMajor: { type: 'string' },
        osName: { type: 'string' },
        osUname: { type: 'string' },
        osPlatform: { type: 'string' },
        osVersion: { type: 'string' },
        osCodename: { type: 'string' },
        osArch: { type: 'string' },
        osMinor: { type: 'string' },
      },
      required: [],
    },
  },
};

export const Relationships: Record<
  'MANAGER_HAS_AGENT',
  StepRelationshipMetadata
> = {
  MANAGER_HAS_AGENT: {
    _type: 'wazuh_manager_has_agent',
    sourceType: Entities.MANAGER._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.AGENT._type,
  },
};
