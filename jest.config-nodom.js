import defaultSettings from "./jest.config.js";

export default {
  ...defaultSettings,
  setupFiles: [],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.server-nodom.@(js|ts)?(x)"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/packages/inferno/__tests__/transition.spec.tsx",
  ],
  testEnvironment: "node",
}
