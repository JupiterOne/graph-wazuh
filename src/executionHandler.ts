import {
  IntegrationExecutionContext,
  IntegrationExecutionResult,
  IntegrationInvocationEvent,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  createAgentEntities,
  createWazuhManagerAgentRelationships,
  createWazuhManagerEntities,
} from "./converters";

import { Agent, fetchAgents, fetchManager, WazuhManager } from "./provider";

export default async function executionHandler(
  context: IntegrationExecutionContext<IntegrationInvocationEvent>,
): Promise<IntegrationExecutionResult> {
  const manager: WazuhManager = await fetchManager()
    .then(manager => {
      // context.logger.debug(`Manager: ${manager}` );
      manager.id = Date.now.toString();
      return manager;
    })
    .catch(error => {
      context.logger.debug(error);
      throw new Error(`${error}:`);
    });

  const agents: Agent[] = await fetchAgents()
    .then(agents => {
      // context.logger.debug(`Agents: ${agents}` );
      return agents;
    })
    .catch(error => {
      context.logger.debug(error);
      throw new Error(`${error}:`);
    });

  const managerAgentRel = createWazuhManagerAgentRelationships(
    createWazuhManagerEntities([manager])[0],
    createAgentEntities(agents),
  );

  return {
    operations: {
      created: managerAgentRel.length,
      deleted: 0,
      updated: 0,
    },
  };
}
