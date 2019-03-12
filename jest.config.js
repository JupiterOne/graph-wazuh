module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["<rootDir>/src/**/*.test.{js,ts}"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/executionHandler.ts",
    "!src/invocationValidator.ts",
    "!src/provider.ts",
  ],
  moduleFileExtensions: ["ts", "js"],
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
