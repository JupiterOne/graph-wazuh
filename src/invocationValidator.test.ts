import {
  createTestIntegrationExecutionContext,
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { default as invocationValidator } from "./invocationValidator";
import { WazuhClientConfig } from "./wazuh/types";
import WazuhClient from "./wazuh/WazuhClient";

jest.mock("./wazuh/WazuhClient");

function createConfig(
  overrides?: Partial<WazuhClientConfig>,
): WazuhClientConfig {
  return {
    managerUrl: "https://localhost:5500",
    password: "password",
    username: "username",
    ...overrides,
  };
}

test("undefined config", async () => {
  const context = createTestIntegrationExecutionContext();
  expect(context.instance.config).toBeUndefined();
  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("blank username", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = createConfig({ username: "" });
  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("blank password", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = createConfig({ password: "" });
  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("blank managerUrl", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = createConfig({ managerUrl: "" });

  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("complete config", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = createConfig();
  await expect(invocationValidator(context)).resolves.toBeUndefined();
  expect(WazuhClient).toHaveBeenCalledTimes(1);
});

test("access verification failure", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = createConfig();

  const verifyAccess = jest.fn().mockRejectedValue(new Error("any err"));

  (WazuhClient as jest.Mock).mockImplementation(() => {
    return {
      verifyAccess,
    };
  });

  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceAuthenticationError,
  );
});
