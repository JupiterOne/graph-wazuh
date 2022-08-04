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
import { fetchManager } from '.';
import { Entities } from '../constants';
import { wazuhClient } from '../../wazuh/client';

let recording: Recording;

beforeAll(async () => {
  if (!wazuhClient.initialized) {
    await configureWazuhClientWithRecording(
      __dirname,
      'manager-step-client-configure',
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

describe('fetch-manager', () => {
  test('success', async () => {
    recording = setupWazuhRecording({
      directory: __dirname,
      name: 'fetch-manager',
      options: {
        matchRequestsBy: getWazuhMatchRequestsBy(config),
      },
    });
    const context = createMockStepExecutionContext({
      instanceConfig: config,
    });

    await fetchManager(context);

    const managerEntity = context.jobState.collectedEntities;

    expect(managerEntity.length).toBe(1);
    expect(managerEntity).toMatchGraphObjectSchema({
      _class: Entities.MANAGER._class,
    });
  });
});
