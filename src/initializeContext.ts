import {
  GraphClient,
  IntegrationExecutionContext,
  IntegrationInstanceConfigError,
  IntegrationInvocationEvent,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { ProviderClient } from "./provider";

export interface WazuhExecutionContext
  extends IntegrationExecutionContext<IntegrationInvocationEvent> {
  graph: GraphClient;
  persister: PersisterClient;
  provider: ProviderClient;
}

export default function initializeContext(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): WazuhExecutionContext {
  const config = context.instance.config;

  if (!config) {
    throw new Error(
      "Provider config must be provided by the exectution environment",
    );
  }

  if (!config.username || !config.password || !config.managerUrl) {
    throw new IntegrationInstanceConfigError(
      "Config requires username, password, and managerUrl",
    );
  }

  return {
    ...context,
    ...context.clients.getClients(),
    provider: new ProviderClient(config),
  };
}
