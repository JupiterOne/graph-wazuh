import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import { WazuhClient } from '../../wazuh/client';
import { Entities, Steps } from '../constants';
import { createManagerEntity } from './converter';

export async function fetchManager({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const client = new WazuhClient({
    username: instance.config.username,
    password: instance.config.password,
    managerUrl: instance.config.managerUrl,
  });

  await jobState.addEntity(
    createManagerEntity(instance.id, await client.fetchManager()),
  );
}

export const managerSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.MANAGER,
    name: 'Fetch Manager',
    entities: [Entities.MANAGER],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchManager,
  },
];
