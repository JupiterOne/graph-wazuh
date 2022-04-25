import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import { createMockExecutionContext } from '@jupiterone/integration-sdk-testing';
import { validateInvocation } from './config';

describe('#validateInvocation', () => {
  test.each(['username', 'password', 'managerUrl'])(
    'should throw `IntegrationValidationError` if missing `%s` in config',
    async (configProperty) => {
      expect.assertions(1);

      try {
        await validateInvocation(
          createMockExecutionContext({
            instanceConfig: {
              username: 'abc',
              password: 'abc',
              managerUrl: 'https://localhost:9000',
              [configProperty]: undefined,
            },
          }),
        );
      } catch (err) {
        expect(err instanceof IntegrationValidationError).toEqual(true);
      }
    },
  );
});
