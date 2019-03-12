import {
  GraphClient,
  IntegrationExecutionContext,
  IntegrationInstanceConfigError,
  IntegrationInvocationEvent,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { ProviderClient, ProviderConfig } from "./provider";

export interface WazuhExecutionContext
  extends IntegrationExecutionContext<IntegrationInvocationEvent> {
  graph: GraphClient;
  persister: PersisterClient;
  provider: ProviderClient;
}

export default function initializeContext(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): WazuhExecutionContext {
  if (!context.instance.config) {
    throw new Error(
      "Provider config must be provided by the exectution environment",
    );
  }

  if (
    !context.instance.config.userId ||
    !context.instance.config.password ||
    !context.instance.config.scheme ||
    !context.instance.config.host ||
    !context.instance.config.port
  ) {
    throw new IntegrationInstanceConfigError(
      "Config Wazuh userID, password, scheme, host, and port must be provided by the user",
    );
  }

  const providerConfig: ProviderConfig = {
    userId: context.instance.config.userId,
    password: context.instance.config.password,
    scheme: context.instance.config.scheme,
    host: context.instance.config.host,
    port: context.instance.config.port,
  };

  return {
    ...context,
    ...context.clients.getClients(),
    provider: new ProviderClient(providerConfig),
  };
}
