import {
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
  IntegrationValidationContext,
} from "@jupiterone/jupiter-managed-integration-sdk";

import WazuhClient from "./wazuh/WazuhClient";

/**
 * Performs validation of the execution before the execution handler function is
 * invoked.
 *
 * At a minimum, integrations should ensure that the
 * `context.instance.config` is valid. Integrations that require
 * additional information in `context.invocationArgs` should also
 * validate those properties. It is also helpful to perform authentication with
 * the provider to ensure that credentials are valid.
 *
 * The function will be awaited to support connecting to the provider for this
 * purpose.
 *
 * @param context
 */
export default async function invocationValidator(
  context: IntegrationValidationContext,
) {
  const config = context.instance.config;

  if (!config) {
    throw new IntegrationInstanceConfigError(
      "Missing integration configuration",
    );
  }

  if (!config.username || !config.password || !config.managerUrl) {
    throw new IntegrationInstanceConfigError(
      "Config requires username, password, and managerUrl",
    );
  }

  const wazuhClient = new WazuhClient(config);
  try {
    await wazuhClient.verifyAccess();
  } catch (err) {
    throw new IntegrationInstanceAuthenticationError(err);
  }
}
