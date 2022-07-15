import { managerSteps } from './manager';
import { agentSteps } from './agent';
import { cleanupSteps } from './cleanupWazuhClient';

const integrationSteps = [...managerSteps, ...agentSteps, ...cleanupSteps];

export { integrationSteps };
