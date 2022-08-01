import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { integrationSteps } from './steps';
import {
  validateInvocation,
  WazuhIntegrationConfig,
  instanceConfigFields,
} from './config';

export const invocationConfig: IntegrationInvocationConfig<WazuhIntegrationConfig> =
  {
    instanceConfigFields,
    validateInvocation,
    integrationSteps,
  };
