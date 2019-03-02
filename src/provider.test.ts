// import { createTestIntegrationExecutionContext } from '@jupiterone/jupiter-managed-integration-sdk';
import {ProviderClient, ProviderConfig} from "./provider";

const integrationConfig: ProviderConfig = {
  userId: process.env.WAZUH_API_USER_CONFIG,
  secret: process.env.WAZUH_API_SECRET_CONFIG,
  baseUrlHost: process.env.WAZUH_API_HOST_CONFIG,
  baseUrlProtocal: process.env.WAZUH_API_PROTOCAL_CONFIG
};

test("Wazuh Manager information and connection", async () => {
  // const executionContext = createTestIntegrationExecutionContext();
  let providerClient: ProviderClient = new ProviderClient(integrationConfig);
  await providerClient.fetchManagerInfo();
});

test("Return of the Wazuh Manager ", async () => {
  let providerClient: ProviderClient = new ProviderClient(integrationConfig);
  await providerClient.fetchManager();
});

test("Raw information of all registered agents ", async () => {
  let providerClient: ProviderClient = new ProviderClient(integrationConfig);
  await providerClient.fetchAgentsInfo();
});

test("Listing all registered agents ", async () => {
  let providerClient: ProviderClient = new ProviderClient(integrationConfig);
  await providerClient.fetchAgents();
});
