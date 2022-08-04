import { IntegrationStep } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import { wazuhClient } from '../../wazuh/client';
import { Steps } from '../constants';

export function cleanupWazuhClient() {
  wazuhClient.destroy();
}

export const cleanupSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.CLEANUP_WAZUH_CLIENT,
    name: 'Clean up Wazuh Client',
    entities: [],
    relationships: [],
    dependsOn: [Steps.AGENTS, Steps.MANAGER],
    executionHandler: cleanupWazuhClient,
  },
];
