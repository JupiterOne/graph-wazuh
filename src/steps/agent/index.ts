import {
  createDirectRelationship,
  IntegrationError,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { WazuhIntegrationConfig } from '../../config';
import { wazuhClient } from '../../wazuh/client';
import { Entities, Relationships, Steps } from '../constants';
import { buildManagerEntityKey } from '../manager/converter';
import { createAgentEntity } from './converter';

export async function fetchAgents({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<WazuhIntegrationConfig>) {
  const agents = await wazuhClient.fetchAgents();

  for (const agent of agents) {
    await jobState.addEntity(createAgentEntity(agent));
  }
}

export async function buildManagerAgentRelationships({
  instance,
  jobState,
}: IntegrationStepExecutionContext<WazuhIntegrationConfig>) {
  const managerEntity = await jobState.findEntity(
    buildManagerEntityKey(instance.id),
  );

  if (!managerEntity) {
    throw new IntegrationError({
      message: 'Mising required wazuh_manager entity',
      code: 'MISSING_ENTITY',
    });
  }

  await jobState.iterateEntities(
    {
      _type: Entities.AGENT._type,
    },
    async (agentEntity) => {
      await jobState.addRelationship(
        createDirectRelationship({
          from: managerEntity,
          to: agentEntity,
          _class: RelationshipClass.HAS,
        }),
      );
    },
  );
}

export const agentSteps: IntegrationStep<WazuhIntegrationConfig>[] = [
  {
    id: Steps.AGENTS,
    name: 'Fetch Agents',
    entities: [Entities.AGENT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAgents,
  },
  {
    id: Steps.MANAGER_AGENT_RELATIONSHIPS,
    name: 'Build manager and agent relationships',
    entities: [],
    relationships: [Relationships.MANAGER_HAS_AGENT],
    dependsOn: [Steps.MANAGER, Steps.AGENTS],
    executionHandler: buildManagerAgentRelationships,
  },
];
