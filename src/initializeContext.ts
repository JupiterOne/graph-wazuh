import {
  GraphClient,
  IntegrationExecutionContext,
  // EntityFromIntegration,
  IntegrationInvocationEvent,
  PersisterClient
} from "@jupiterone/jupiter-managed-integration-sdk";
import { ProviderClient, ProviderConfig } from "./provider";

export interface WazuhExecutionContext
  extends IntegrationExecutionContext<IntegrationInvocationEvent> {
  graph: GraphClient;
  persister: PersisterClient;
  provider: ProviderClient;
}

export default function initializeContext(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>
): WazuhExecutionContext {
  let providerConfig: ProviderConfig = {
    userId: context.instance.config.userId,
    secret: context.instance.config.secret,
    baseUrlProtocal: context.instance.config.baseUrlProtocal,
    baseUrlHost: context.instance.config.baseUrlHost
  };

  return {
    ...context,
    ...context.clients.getClients(),
    provider: new ProviderClient(providerConfig)
  };
}
