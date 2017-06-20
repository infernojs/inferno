const { join } = require("path");

const baseConfig = require("../../jest.config");

module.exports = Object.assign({}, baseConfig, {
  moduleNameMapper: Object.assign({}, baseConfig.moduleNameMapper, {
    "^inferno-component":
      "<rootDir>/fixtures/react-suite/packages/inferno-component.ts",
    "^inferno-create-class":
      "<rootDir>/fixtures/react-suite/packages/inferno-create-class.ts",
    "^inferno-create-element":
      "<rootDir>/fixtures/react-suite/packages/inferno-create-element.ts",
    "^inferno$": "<rootDir>/fixtures/react-suite/packages/inferno.ts"
  }),
  rootDir: join(__dirname, "../../"),
  testPathIgnorePatterns: ["/node_modules/", "/inferno-server/"]
});
