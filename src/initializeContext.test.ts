import {
  createTestIntegrationExecutionContext,
  IntegrationInstanceConfigError,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { default as initializeContext } from "./initializeContext";
import { ProviderConfig } from "./provider";

function resetConfig(): ProviderConfig {
  return {
    username: process.env.WAZUH_LOCAL_EXECUTION_USERNAME || "foo",
    password: process.env.WAZUH_LOCAL_EXECUTION_PASSWORD || "bar",
    managerUrl:
      process.env.WAZUH_LOCAL_EXECUTION_MANAGER_URL ||
      "https://localhost:55000",
  };
}

test("undefined config", () => {
  const executionContext = createTestIntegrationExecutionContext();
  expect(executionContext.instance.config).toBeUndefined();
  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(Error);
});

test("blank username", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.username = "";
  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("blank password", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.password = "";

  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("blank managerUrl", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.managerUrl = "";

  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("complete config", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  const integrationContext = initializeContext(executionContext);
  expect(integrationContext.provider).toBeDefined();
});
