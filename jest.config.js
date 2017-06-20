const fs = require("fs");
const path = require("path");

module.exports = {
  collectCoverageFrom: [
    "packages/*/src/**/*.ts",
    "!**/*.ts.js",
    "!**/inferno-utils/**/*",
    "!**/inferno-devtools/**/*"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 85
    }
  },
  globals: {
    usingJSDOM: true,
    usingJest: true
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^inferno$": "<rootDir>/packages/inferno/src",
    "^inferno-compat": "<rootDir>/packages/inferno-compat/src",
    "^inferno-component": "<rootDir>/packages/inferno-component/src",
    "^inferno-create-class": "<rootDir>/packages/inferno-create-class/src",
    "^inferno-create-element": "<rootDir>/packages/inferno-create-element/src",
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
    "^inferno-vnode-flags": "<rootDir>/packages/inferno-vnode-flags/src",
    "^inferno/core/VNodes": "<rootDir>/packages/inferno/src/core/VNodes"
  },
  projects: [
    "<rootDir>/packages/inferno",
    "<rootDir>/packages/inferno-component",
    "<rootDir>/packages/inferno-create-class",
    "<rootDir>/packages/inferno-create-element",
    "<rootDir>/packages/inferno-shared",
    "<rootDir>/packages/inferno-vnode-flags"
  ],
  rootDir: __dirname,
  setupFiles: ["<rootDir>/scripts/test/requestAnimationFrame.ts"],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.js?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.ts?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.browser.js?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.browser.ts?(x)"
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"]
};
