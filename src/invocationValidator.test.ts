import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import invocationValidator from "./invocationValidator";

test("Provider Validation invocation", async () => {
  await invocationValidator(createTestIntegrationExecutionContext() );
});
