import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { ProviderClient } from "./provider";

export interface WazuhExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  provider: ProviderClient;
}

export default function initializeContext(
  context: IntegrationExecutionContext,
): WazuhExecutionContext {
  const config = context.instance.config;

  return {
    ...context,
    ...context.clients.getClients(),
    provider: new ProviderClient(config),
  };
}
