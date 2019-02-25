//import { createTestIntegrationExecutionContext } from '@jupiterone/jupiter-managed-integration-sdk';
import * as t from "./provider";

test("Wazuh Manager information and connection", async () => {
  // const executionContext = createTestIntegrationExecutionContext();
  await t.fetchProviderInfo();
});

test("Return of the Wazuh Manager ", async () => {
  await t.fetchManager();
});

test("Raw information of all registered agents ", async () => {
  await t.default();
});

test("Listing all registered agents ", async () => {
  await t.fetchAgents();
});
