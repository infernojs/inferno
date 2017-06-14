const { join } = require("path");

const baseConfig = require("../../jest.config");

module.exports = Object.assign({}, baseConfig, {
  moduleNameMapper: Object.assign({}, baseConfig.moduleNameMapper, {
    "^inferno-component":
      "<rootDir>/fixtures/react-suite/packages/inferno-component",
    "^inferno-create-class":
      "<rootDir>/fixtures/react-suite/packages/inferno-create-class",
    "^inferno-create-element":
      "<rootDir>/fixtures/react-suite/packages/inferno-create-element",
    "^inferno-vnode-flags":
      "<rootDir>/fixtures/react-suite/packages/inferno-vnode-flags",
    "^inferno$": "<rootDir>/fixtures/react-suite/packages/inferno"
  }),
  rootDir: join(__dirname, "../../"),
  testPathIgnorePatterns: ["/node_modules/", "/inferno-server/"]
});
