import {
  IntegrationExecutionContext,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
  IntegrationValidationError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';
import { wazuhClient } from './wazuh/client';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific account in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  username: {
    type: 'string',
  },
  password: {
    type: 'string',
    mask: true,
  },
  managerUrl: {
    type: 'string',
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  username: string;
  password: string;
  managerUrl: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const config = context.instance.config;

  if (!config.username || !config.password || !config.managerUrl) {
    throw new IntegrationValidationError(
      'Config requires all of {username, password, managerUrl}',
    );
  }

  try {
    await wazuhClient.configure({
      username: config.username,
      password: config.password,
      managerUrl: config.managerUrl,
    });
    await wazuhClient.verifyAccess();
  } catch (err) {
    wazuhClient.destroy();
    throw new IntegrationProviderAuthorizationError(err);
  }
}
