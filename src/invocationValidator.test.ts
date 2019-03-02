import invocationValidator from "./invocationValidator";
import { createTestIntegrationExecutionContext } from '@jupiterone/jupiter-managed-integration-sdk';

test("Provider Validation invocation", async () => {
  await invocationValidator(createTestIntegrationExecutionContext() );
});
