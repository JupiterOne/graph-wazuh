import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { WazuhIntegrationConfig } from '../../config';
import { wazuhClient } from '../../wazuh/client';
import { Entities, Steps } from '../constants';
import { createManagerEntity } from './converter';

export async function fetchManager({
  instance,
  jobState,
}: IntegrationStepExecutionContext<WazuhIntegrationConfig>) {
  await jobState.addEntity(
    createManagerEntity(instance.id, await wazuhClient.fetchManager()),
  );
}

export const managerSteps: IntegrationStep<WazuhIntegrationConfig>[] = [
  {
    id: Steps.MANAGER,
    name: 'Fetch Manager',
    entities: [Entities.MANAGER],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchManager,
  },
];
