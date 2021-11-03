module.exports = {
  collectCoverageFrom: [
    "packages/*/src/**/*.ts",
    "!**/*.ts.js",
    "!**/inferno-utils/**/*",
    "!**/inferno-router/**/utils.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["html", "lcov", "text"],
  globals: {
    usingJSDOM: true,
    usingJest: true
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    "^inferno-router/utils": "<rootDir>/packages/inferno-router/src/utils",
    "^inferno(.*?)$": "<rootDir>/packages/inferno$1/src/index.ts",
    "mobx": "<rootDir>/node_modules/mobx"
  },
  rootDir: __dirname,
  setupFiles: [],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.server-nodom.@(js|ts)?(x)"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/packages/inferno/__tests__/transition.spec.jsx",
  ],
  transform: {
    "^.+\\.jsx?$": "<rootDir>/jest.babel.transform.js",
    "^.+\\.tsx?$": "<rootDir>/jest.ts.transform.js"
  },
  testEnvironment: "node",
  testRunner: "jest-jasmine2",
  reporters: [["jest-silent-reporter", { "useDots": true }]]
};
