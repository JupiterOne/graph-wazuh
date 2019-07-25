import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAgentEntity,
  createWazuhManagerAgentRelationship,
  createWazuhManagerEntity,
  WAZUH_AGENT_ENTITY_TYPE,
  WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
  WAZUH_MANAGER_ENTITY_TYPE,
  WazuhAgentEntity,
  WazuhManagerEntity,
} from "./converters";
import initializeContext from "./initializeContext";
import { WazuhManager } from "./wazuh/types";

export default async function executionHandler(
  context: IntegrationExecutionContext,
): Promise<IntegrationExecutionResult> {
  const { graph, persister, wazuh } = initializeContext(context);

  const [
    oldManagerEntities,
    oldAgentEntities,
    oldManagerAgentRelationships,
  ] = await Promise.all([
    graph.findEntitiesByType<WazuhManagerEntity>(WAZUH_MANAGER_ENTITY_TYPE),
    graph.findEntitiesByType<WazuhAgentEntity>(WAZUH_AGENT_ENTITY_TYPE),
    graph.findRelationshipsByType(WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE),
  ]);

  const manager: WazuhManager = await wazuh.fetchManager();
  const managerEntity: WazuhManagerEntity = createWazuhManagerEntity(
    context.instance,
    manager,
  );

  const agentEntities = (await wazuh.fetchAgents()).map(createAgentEntity);
  const managerAgentRelationships = agentEntities.map(e =>
    createWazuhManagerAgentRelationship(managerEntity, e),
  );

  return {
    operations: await persister.publishPersisterOperations([
      [
        ...persister.processEntities(oldManagerEntities, [managerEntity]),
        ...persister.processEntities(oldAgentEntities, agentEntities),
      ],
      persister.processRelationships(
        oldManagerAgentRelationships,
        managerAgentRelationships,
      ),
    ]),
  };
}
