export default {
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
    "^inferno-router/utils": "<rootDir>/packages/inferno-router/src/utils.ts",
    "^inferno(.*?)$": "<rootDir>/packages/inferno$1/src/index.ts",
    "mobx": "<rootDir>/node_modules/mobx/dist/mobx.cjs.development.js"
  },
  setupFiles: ["<rootDir>/scripts/test/requestAnimationFrame.ts"],
  testMatch: [
    "<rootDir>/packages/*/__tests__/**/*spec.@(js|ts)?(x)",
    "<rootDir>/packages/*/__tests__/**/*spec.server.@(js|ts)?(x)"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/packages/inferno/__tests__/transition.spec.tsx",
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ['@swc/jest', {
      "jsc": {
        "parser": {
          "syntax": "typescript",
          "tsx": true,
        },
        "experimental": {
          "plugins": [
            ["swc-plugin-inferno", {
              "pure": false
            }]
          ],
        },
        "target": "es2022",
        "loose": true
      }
    }],
  },
  testEnvironment: "jsdom",
  testRunner: "jest-jasmine2",
  reporters: [["jest-silent-reporter", { "useDots": true }]]
}
