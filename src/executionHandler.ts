import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAgentEntities,
  createWazuhManagerAgentRelationships,
  createWazuhManagerEntities,
  WAZUH_MANAGER_ENTITY_TYPE,
  WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE,
  AGENT_ENTITY_TYPE,
  WazuhManagerEntity,
  AgentEntity
} from "./converters";

import initializeContext from "./initializeContext";


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
    graph.findRelationshipsByType(WAZUH_MANAGER_AGENT_RELATIONSHIP_TYPE)
  ]);

  const managerEntity: WazuhManagerEntity = await provider.fetchManager()
    .then(manager => {
      // Using the instance id based on the assumption that there is only one manager
      manager.id = context.instance.id; 
      manager.version = "44.4";
      return createWazuhManagerEntities(manager);
    })
    .catch(error => {
      context.logger.debug(error);
      throw new Error(`${error}`);
    });

  const agentEntities: AgentEntity[] = await provider.fetchAgents()
    .then(agents => {
      return createAgentEntities(agents);
    })
    .catch(error => {
      context.logger.debug(error);
      throw new Error(`${error}`);
    });

  return {
    operations: await persister.publishPersisterOperations([
      [
        ...persister.processEntities( oldManagerEntities, [managerEntity ]),
        ...persister.processEntities( oldAgentEntities, agentEntities),
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
