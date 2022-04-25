import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { WazuhManager } from '../../wazuh/types';
import { Entities } from '../constants';

export function buildManagerEntityKey(integrationInstanceId: string) {
  return `${Entities.MANAGER._type}_${integrationInstanceId}`;
}

export function createManagerEntity(
  integrationInstanceId: string,
  data: WazuhManager,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: buildManagerEntityKey(integrationInstanceId),
        _type: Entities.MANAGER._type,
        _class: Entities.MANAGER._class,
        displayName: `${data.type} ${data.version}`,
        compilationDate: parseTimePropertyValue(data.compilation_date),
        version: data.version,
        opensslSupport: data.openssl_support,
        maxAgents: data.max_agents,
        rulesetVersion: data.ruleset_version,
        path: data.path,
        tzName: data.tz_name,
        type: data.type,
        tzOffset: data.tz_offset,
      },
    },
  });
}
