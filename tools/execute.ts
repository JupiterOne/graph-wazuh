/* tslint:disable:no-console */
import {
  createLocalInvocationEvent,
  executeSingleHandlerLocal,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { createLogger, TRACE } from "bunyan";
import { executionHandler } from "../src/index";
import { ProviderConfig} from "../src/provider";

async function run(): Promise<void> {
  const logger = createLogger({ name: "local", level: TRACE });

  if (!process.env.WAZUH_API_USER_CONFIG
  ||  !process.env.WAZUH_API_SECRET_CONFIG
  ||  !process.env.WAZUH_API_HOST_CONFIG
  ||  !process.env.WAZUH_API_PROTOCAL_CONFIG) {
    throw new Error("Local execution requires the WAZUH CONFIG variables be set");
  }

  const integrationConfig: ProviderConfig = {
    userId: process.env.WAZUH_API_USER_CONFIG,
    secret: process.env.WAZUH_API_SECRET_CONFIG,
    baseUrlHost: process.env.WAZUH_API_HOST_CONFIG,
    baseUrlProtocal: process.env.WAZUH_API_PROTOCAL_CONFIG
  };

  logger.info(
    await executeSingleHandlerLocal(
      integrationConfig,
      logger,
      executionHandler,
      // invocationArgs,
      createLocalInvocationEvent(),
    ),
    "Execution completed successfully!",
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});