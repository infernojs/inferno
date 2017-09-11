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
  moduleFileExtensions: ["ts", "js", "jsx", "json"],
  moduleNameMapper: {
    "^inferno-router/utils": "<rootDir>/packages/inferno-router/src/utils",
    "^inferno(.*?)$": "<rootDir>/packages/inferno$1/src",
  },
  // projects: [
    // "<rootDir>/packages/*",
    // "<rootDir>/packages/inferno-create-class",
    // "<rootDir>/packages/inferno-create-element",
    // "<rootDir>/packages/inferno-shared",
    // "<rootDir>/packages/inferno-vnode-flags"
  // ],
  rootDir: __dirname,
  setupFiles: ["<rootDir>/scripts/test/requestAnimationFrame.ts"],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.js?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.browser.js?(x)"
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
  setupTestFrameworkScriptFile: require.resolve("./JEST-DEBUG.js")
};
