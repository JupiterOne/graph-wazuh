import {
  Agent,
  ProviderClient,
  ProviderConfig,
  WazuhManager,
} from "./provider";

class ProviderClientMock extends ProviderClient {
  public async fetchManager(): Promise<WazuhManager> {
    return {
      id: "0",
      compilationDate: "2018-10-11 09:38:47",
      version: "v3.8.2",
      opensslSupport: "yes",
      maxAgents: "1400",
      rulesetVersion: "3801",
      path: "/var/ossec",
      tzName: "UTC",
      type: "manager",
      tzOffset: "+0000",
    };
  }

  public async fetchAgents(): Promise<Agent[]> {
    return [
      {
        ownerId: "0",
        status: "Active",
        name: `agent1`,
        ip: "192.168.1.7",
        manager: "manager",
        nodeName: "node01",
        dateAdd: "2018-10-11 09:38:47",
        version: "Wazuh v3.8.2",
        lastKeepAlive: "2018-10-11 13:58:08",
        osMajor: "16",
        osName: "ubuntu",
        osUname:
          "Linux |ubuntu |4.4.0-135-generic |#161-Ubuntu SMP Mon Aug 27 10:45:01 UTC 2018 |x86_64",
        osPlatform: "ubuntu",
        osVersion: "16.04.5 LTS",
        osCodename: "Xenial Xerus",
        osArch: "x86_64",
        osMinor: "04",
        id: "001",
      },
      {
        ownerId: "0",
        status: "Disconnected",
        name: `agent2`,
        ip: "192.168.1.77",
        manager: "manager",
        nodeName: "node02",
        dateAdd: "2018-10-11 09:38:47",
        version: "Wazuh v3.8.2",
        lastKeepAlive: "2018-10-11 13:58:08",
        osMajor: "16",
        osName: "ubuntu",
        osUname:
          "Linux |ubuntu |4.4.0-135-generic |#161-Ubuntu SMP Mon Aug 27 10:45:01 UTC 2018 |x86_64",
        osPlatform: "ubuntu",
        osVersion: "16.04.5 LTS",
        osCodename: "Xenial Xerus",
        osArch: "x86_64",
        osMinor: "04",
        id: "002",
      },
    ];
  }
}

function getProviderClient(providerConfig: ProviderConfig): ProviderClient {
  return process.env.WAZUH_API_INTEGRATION !== undefined &&
    process.env.WAZUH_API_INTEGRATION === "1"
    ? new ProviderClient(providerConfigEnv())
    : new ProviderClientMock(providerConfigEnv());
}

function providerConfigEnv(): ProviderConfig {
  return {
    userId: process.env.WAZUH_API_USER || "foo",
    password: process.env.WAZUH_API_PASSWORD || "bar",
    host: process.env.WAZUH_API_HOST || "localhost",
    port: process.env.WAZUH_API_PORT || "55000",
    scheme: process.env.WAZUH_API_SCHEME || "https",
  };
}

test("Wazuh Manager request and type check", async () => {
  const providerClient: ProviderClient = getProviderClient(providerConfigEnv());
  const manager: WazuhManager = await providerClient.fetchManager();
  expect(manager).toBeDefined();
  expect(manager.type).toEqual("manager");
});

test("Listing all registered agents and validate status", async () => {
  const ValidManger = ["manager", "wazuh-server"];
  const ValidStatus = ["Active", "Disconnected"];
  const providerClient: ProviderClient = getProviderClient(providerConfigEnv());
  const agents: Agent[] = await providerClient.fetchAgents();
  expect(agents).toBeDefined();
  agents.forEach(agent => {
    expect(ValidStatus).toEqual(expect.arrayContaining([agent.status]));
    expect(ValidManger).toEqual(expect.arrayContaining([agent.manager]));
  });
});

test("Invalid manager password ", async () => {
  const providerConfig: ProviderConfig = providerConfigEnv();
  providerConfig.password = "xxx";
  const providerClient: ProviderClient = getProviderClient(providerConfig);
  try {
    await providerClient.fetchManager();
  } catch (error) {
    expect.hasAssertions();
  }
});

test("Invalid agent password ", async () => {
  const providerConfig: ProviderConfig = providerConfigEnv();
  providerConfig.password = "xxx";
  const providerClient: ProviderClient = getProviderClient(providerConfig);
  try {
    await providerClient.fetchAgents();
  } catch (error) {
    expect.hasAssertions();
  }
});
