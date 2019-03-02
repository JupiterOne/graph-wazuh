import { createTestIntegrationExecutionContext } from '@jupiterone/jupiter-managed-integration-sdk';
import executionHandler from './executionHandler';

test("executionHandler", async () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = {
    userId: process.env.WAZUH_API_USER_CONFIG,
    secret: process.env.WAZUH_API_SECRET_CONFIG,
    baseUrlHost: process.env.WAZUH_API_HOST_CONFIG,
    baseUrlProtocal: process.env.WAZUH_API_PROTOCAL_CONFIG
};

  await executionHandler(executionContext);
});
