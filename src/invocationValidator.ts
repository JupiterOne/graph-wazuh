import {
  IntegrationExecutionContext,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { fetchProviderInfo } from "./provider";

/* *
 * Performs validation of the execution before the execution handler function is
 * invoked.
 *
 * At a minimum, integrations should ensure that the instance configuration is
 * valid. It is also helpful to perform authentication with the provider to
 * ensure that credentials are valid. The function will be awaited to support
 * connecting to the provider for this purpose.
 *
 * @param executionContext
 */
export default async function invocationValidator(
  executionContext: IntegrationExecutionContext<IntegrationInvocationEvent>,
) {
  // const { config } = executionContext.instance;

  fetchProviderInfo().catch(error => {
    throw new Error(`${error}: validating provider connection`);
  });
}
