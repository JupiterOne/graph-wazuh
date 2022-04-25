import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { WazuhAgent } from '../../wazuh/types';
import { Entities } from '../constants';

export function createAgentEntity(data: WazuhAgent): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `${Entities.AGENT._type}_${data.id}`,
        _type: Entities.AGENT._type,
        _class: Entities.AGENT._class,
        agentId: data.id,
        displayName: `${data.name}: ${data.node_name}`,
        status: data.status,
        name: data.name,
        ip: data.ip,
        manager: data.manager,
        nodeName: data.node_name,
        dateAdd: parseTimePropertyValue(data.dateAdd)!,
        createdOn: parseTimePropertyValue(data.dateAdd)!,
        version: data.version,
        osPlatform: data.os?.platform,
        osName: data.os?.name,
        osUname: data.os?.uname,
        osMajor: data.os?.major,
        osMinor: data.os?.minor,
        osVersion: data.os?.version,
        osCodename: data.os?.codename,
        osArch: data.os?.arch,
      },
    },
  });
}
