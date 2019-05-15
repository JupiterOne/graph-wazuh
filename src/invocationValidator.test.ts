import {
  createTestIntegrationExecutionContext,
  IntegrationInstanceAuthenticationError,
  IntegrationInstanceConfigError,
} from "@jupiterone/jupiter-managed-integration-sdk";

import { default as invocationValidator } from "./invocationValidator";
import { ProviderClient, ProviderConfig } from "./provider";

jest.mock("./provider");

function resetConfig(): ProviderConfig {
  return {
    username: process.env.WAZUH_LOCAL_EXECUTION_USERNAME || "foo",
    password: process.env.WAZUH_LOCAL_EXECUTION_PASSWORD || "bar",
    managerUrl:
      process.env.WAZUH_LOCAL_EXECUTION_MANAGER_URL ||
      "https://localhost:55000",
  };
}

test("undefined config", async () => {
  const context = createTestIntegrationExecutionContext();
  expect(context.instance.config).toBeUndefined();
  await expect(invocationValidator(context)).rejects.toThrowError(Error);
});

test("blank username", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = resetConfig();
  context.instance.config.username = "";
  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("blank password", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = resetConfig();
  context.instance.config.password = "";
  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("blank managerUrl", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = resetConfig();
  context.instance.config.managerUrl = "";

  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceConfigError,
  );
});

test("complete config", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = resetConfig();
  await expect(invocationValidator(context)).resolves.toBeUndefined();
  expect(ProviderClient).toHaveBeenCalledTimes(1);
});

test("access verification failure", async () => {
  const context = createTestIntegrationExecutionContext();
  context.instance.config = resetConfig();

  const verifyAccess = jest.fn().mockRejectedValue(new Error("any err"));

  (ProviderClient as jest.Mock).mockImplementation(() => {
    return {
      verifyAccess,
    };
  });

  await expect(invocationValidator(context)).rejects.toThrowError(
    IntegrationInstanceAuthenticationError,
  );
});
