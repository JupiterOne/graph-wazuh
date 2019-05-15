/* tslint:disable:no-console */
import { executeIntegrationLocal } from "@jupiterone/jupiter-managed-integration-sdk";
import invocationConfig from "../src/index";

const integrationConfig = {
  username: process.env.WAZUH_LOCAL_EXECUTION_USERNAME,
  password: process.env.WAZUH_LOCAL_EXECUTION_PASSWORD,
  managerUrl: process.env.WAZUH_LOCAL_EXECUTION_MANAGER_URL,
};

const invocationArgs = {
  // providerPrivateKey: process.env.PROVIDER_LOCAL_EXECUTION_PRIVATE_KEY
};

executeIntegrationLocal(
  integrationConfig,
  invocationConfig,
  invocationArgs,
).catch(err => {
  console.error(err);
  process.exit(1);
});
