import {
  createMockStepExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import {
  configureWazuhClientWithRecording,
  getWazuhMatchRequestsBy,
  setupWazuhRecording,
} from '../../../test/recording';
import { config } from '../../../test/config';
import { buildManagerAgentRelationships, fetchAgents } from '.';
import { Entities, Relationships } from '../constants';
import { wazuhClient } from '../../wazuh/client';
import { createAgentEntity } from './converter';
import { createManagerEntity } from '../manager/converter';

let recording: Recording;

beforeAll(async () => {
  if (!wazuhClient.initialized) {
    await configureWazuhClientWithRecording(
      __dirname,
      'agent-step-client-configure',
      config,
    );
  }
});

afterEach(async () => {
  if (recording) {
    await recording.stop();
  }
});

afterAll(() => {
  if (wazuhClient.initialized) {
    wazuhClient.destroy();
  }
});

function createMockAgentEntity(name: string) {
  return createAgentEntity({
    status: 'indisposed',
    dateAdd: 'yesterday',
    ip: '1.2.3.4',
    node_name: 'node_01',
    registerIP: 'localhost',
    id: `${name}'s_ID`,
    name,
  });
}

function createMockManagerEntity(instanceId: string) {
  return createManagerEntity(instanceId, {
    compilation_date: 'today',
    version: '0.0001',
    openssl_support: 'yes(ish)',
    max_agents: '100',
    ruleset_version: '5',
    path: '->',
    tz_name: 'UTC',
    type: 'the best',
    tz_offset: 'alot',
  });
}

describe('fetch-agents', () => {
  test('success', async () => {
    recording = setupWazuhRecording({
      directory: __dirname,
      name: 'fetch-agents',
      options: {
        matchRequestsBy: getWazuhMatchRequestsBy(config),
      },
    });
    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchAgents(context);

    const agentEntities = context.jobState.collectedEntities;

    expect(agentEntities.length).toBe(2);
    expect(agentEntities).toMatchGraphObjectSchema({
      _class: Entities.AGENT._class,
    });
  });
});

describe('manager-agent relationships', () => {
  test('success', async () => {
    const gyozaAgent = createMockAgentEntity('Gyoza');
    const turkeyAgent = createMockAgentEntity('Turkey');

    const context = createMockStepExecutionContext({
      instanceConfig: config,
      entities: [gyozaAgent, turkeyAgent],
    });

    const manager = createMockManagerEntity(context.instance.id);
    await context.jobState.addEntity(manager);

    await buildManagerAgentRelationships(context);
    const relationships = context.jobState.collectedRelationships;
    expect(relationships).toHaveLength(2);
    expect(relationships).toMatchDirectRelationshipSchema({
      schema: {
        properties: {
          _type: { const: Relationships.MANAGER_HAS_AGENT._type },
          _class: { const: Relationships.MANAGER_HAS_AGENT._class },
        },
      },
    });
    const toEntityKeys = relationships.map((r) => r._toEntityKey);
    expect(toEntityKeys).toContain(gyozaAgent._key);
    expect(toEntityKeys).toContain(turkeyAgent._key);
    const fromEntityKeys = relationships.map((r) => r._fromEntityKey);
    expect(fromEntityKeys.every((key) => key === manager._key)).toEqual(true);
  });
});
