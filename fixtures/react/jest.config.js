const fs = require("fs");
const path = require("path");

const defaultConfig = require("../../jest.config");

module.exports = Object.assign(defaultConfig, {
  moduleNameMapper: {
    "^inferno$": "<rootDir>/fixtures/react/packages/inferno.ts",
    "^inferno-compat": "<rootDir>/packages/inferno-compat/src",
    "^inferno-component":
      "<rootDir>/fixtures/react/packages/inferno-component.ts",
    "^inferno-create-class":
      "<rootDir>/fixtures/react/packages/inferno-create-class.ts",
    "^inferno-create-element":
      "<rootDir>/fixtures/react/packages/inferno-create-element.ts",
    "^inferno-devtools": "<rootDir>/packages/inferno-devtools/src",
    "^inferno-hyperscript": "<rootDir>/packages/inferno-hyperscript/src",
    "^inferno-mobx": "<rootDir>/packages/inferno-mobx/src",
    "^inferno-redux": "<rootDir>/packages/inferno-redux/src",
    "^inferno-router": "<rootDir>/packages/inferno-router/src",
    "^inferno-router/utils": "<rootDir>/packages/inferno-router/src/utils",
    "^inferno-server": "<rootDir>/packages/inferno-server/src",
    "^inferno-shared": "<rootDir>/packages/inferno-shared/src",
    "^inferno-test-utils": "<rootDir>/packages/inferno-test-utils/src",
    "^inferno-utils": "<rootDir>/packages/inferno-utils/src",
    "^inferno-vnode-flags": "<rootDir>/packages/inferno-vnode-flags/src"
  },
  testPathIgnorePatterns: ["/node_modules/", "/inferno_server/"]
});
