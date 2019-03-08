import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";
import initializeContext from "./initializeContext";
import { ProviderConfig } from "./provider";

test("creating Wazuh client", async () => {
  const executionContext = createTestIntegrationExecutionContext();

  const integrationConfig: ProviderConfig = {
    userId:
      process.env.WAZUH_API_USER !== undefined
        ? process.env.WAZUH_API_USER
        : "foo",
    password:
      process.env.WAZUH_API_PASSWORD !== undefined
        ? process.env.WAZUH_API_PASSWORD
        : "bar",
    host:
      process.env.WAZUH_API_HOST !== undefined
        ? process.env.WAZUH_API_HOST
        : "localhost",
    port:
      process.env.WAZUH_API_PORT !== undefined
        ? process.env.WAZUH_API_PORT
        : "55000",
    scheme:
      process.env.WAZUH_API_SCHEME !== undefined
        ? process.env.WAZUH_API_SCHEME
        : "https",
  };

  executionContext.instance.config = integrationConfig;
  const integrationContext = initializeContext(executionContext);
  expect(integrationContext.provider).toBeDefined();
});
