import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import { wazuhClient } from '../../wazuh/client';
import { Entities, Steps } from '../constants';
import { createManagerEntity } from './converter';

export async function fetchManager({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.addEntity(
    createManagerEntity(instance.id, await wazuhClient.fetchManager()),
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
