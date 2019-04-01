/* tslint:disable:no-console */
import {
  createLocalInvocationEvent,
  executeSingleHandlerLocal,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { createLogger, TRACE } from "bunyan";
import { executionHandler } from "../src/index";
import { ProviderConfig } from "../src/provider";

async function run(): Promise<void> {
  const logger = createLogger({ name: "local", level: TRACE });

  if (
    !process.env.WAZUH_LOCAL_EXECUTION_USERNAME ||
    !process.env.WAZUH_LOCAL_EXECUTION_PASSWORD ||
    !process.env.WAZUH_LOCAL_EXECUTION_MANAGER_URL
  ) {
    throw new Error(
      "Local execution requires WAZUH_LOCAL_EXECUTION_* variables",
    );
  }

  const integrationConfig: ProviderConfig = {
    username: process.env.WAZUH_LOCAL_EXECUTION_USERNAME,
    password: process.env.WAZUH_LOCAL_EXECUTION_PASSWORD,
    managerUrl: process.env.WAZUH_LOCAL_EXECUTION_MANAGER_URL,
  };

  logger.info(
    await executeSingleHandlerLocal(
      integrationConfig,
      logger,
      executionHandler,
      {},
      createLocalInvocationEvent(),
    ),
    "Execution completed successfully!",
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
