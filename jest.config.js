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
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  moduleNameMapper: {
    "^inferno-router/utils": "<rootDir>/packages/inferno-router/src/utils",
    "^inferno(.*?)$": "<rootDir>/packages/inferno$1/src"
  },
  rootDir: __dirname,
  setupFiles: ["<rootDir>/scripts/test/requestAnimationFrame.ts"],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.@(js|ts)?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.server.@(js|ts)?(x)"
  ],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "typescript-babel-jest"
  },
  setupTestFrameworkScriptFile: require.resolve("./JEST-DEBUG.js")
};
