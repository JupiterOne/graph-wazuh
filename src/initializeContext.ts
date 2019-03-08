import {
  GraphClient,
  IntegrationExecutionContext,
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
