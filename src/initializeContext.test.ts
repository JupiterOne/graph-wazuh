import {
  createTestIntegrationExecutionContext,
  IntegrationInstanceConfigError,
} from "@jupiterone/jupiter-managed-integration-sdk";
import { default as initializeContext } from "./initializeContext";
import { ProviderConfig } from "./provider";

function resetConfig(): ProviderConfig {
  return {
    userId: process.env.WAZUH_API_USER || "foo",
    password: process.env.WAZUH_API_PASSWORD || "bar",
    host: process.env.WAZUH_API_HOST || "localhost",
    port: process.env.WAZUH_API_PORT || "55000",
    scheme: process.env.WAZUH_API_SCHEME || "https",
  };
}

test("creating Wazuh client with undefined config", () => {
  const executionContext = createTestIntegrationExecutionContext();
  expect(executionContext.instance.config).toBeUndefined();
  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(Error);
});

test("creating Wazuh client with blank userId", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.userId = "";
  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("creating Wazuh client with blank password", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.password = "";

  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("creating Wazuh client with blank host", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.host = "";

  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("creating Wazuh client with blank port", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.port = "";

  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("creating Wazuh client with blank scheme", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  executionContext.instance.config.scheme = "";

  function initialize() {
    initializeContext(executionContext);
  }
  expect(initialize).toThrowError(IntegrationInstanceConfigError);
});

test("creating Wazuh client with completed config", () => {
  const executionContext = createTestIntegrationExecutionContext();
  executionContext.instance.config = resetConfig();
  const integrationContext = initializeContext(executionContext);
  expect(integrationContext.provider).toBeDefined();
});
