import { managerSteps } from './manager';
import { agentSteps } from './agent';

const integrationSteps = [...managerSteps, ...agentSteps];

export { integrationSteps };
