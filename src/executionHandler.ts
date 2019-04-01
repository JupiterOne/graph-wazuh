import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  AGENT_ENTITY_TYPE,
  AgentEntity,
  createAgentEntities,
  createWazuhManagerAgentRelationships,
  createWazuhManagerEntities,
  WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
  WAZUH_MANAGER_ENTITY_TYPE,
  WazuhManagerEntity,
} from "./converters";
import initializeContext from "./initializeContext";
import { WazuhManager } from "./provider";

export default async function executionHandler(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, provider } = initializeContext(context);

  const [
    oldManagerEntities,
    oldAgentEntities,
    oldManagerAgentRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType<WazuhManagerEntity>(WAZUH_MANAGER_ENTITY_TYPE),
    graph.findEntitiesByType<AgentEntity>(AGENT_ENTITY_TYPE),
    graph.findRelationshipsByType(WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE),
  ]);

  const manager: WazuhManager = await provider.fetchManager();
  manager.id = context.instance.id;
  const managerEntity: WazuhManagerEntity = createWazuhManagerEntities(manager);
  const agentEntities: AgentEntity[] = createAgentEntities(
    await provider.fetchAgents(),
  );

  return {
    operations: await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldManagerEntities, [managerEntity]),
        ...persister.processEntities(oldAgentEntities, agentEntities),
      ],
      [
        ...persister.processRelationships(
          oldManagerAgentRelationships,
          createWazuhManagerAgentRelationships(managerEntity, agentEntities),
        ),
      ],
    ]),
  };
}
