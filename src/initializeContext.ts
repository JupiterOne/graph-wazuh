import {
  GraphClient,
  IntegrationExecutionContext,
  PersisterClient,
} from "@jupiterone/jupiter-managed-integration-sdk";

import WazuhClient from "./wazuh/WazuhClient";

export interface WazuhExecutionContext extends IntegrationExecutionContext {
  graph: GraphClient;
  persister: PersisterClient;
  wazuh: WazuhClient;
}

export default function initializeContext(
  context: IntegrationExecutionContext,
): WazuhExecutionContext {
  const config = context.instance.config;

  return {
    ...context,
    ...context.clients.getClients(),
    wazuh: new WazuhClient(config),
  };
}
