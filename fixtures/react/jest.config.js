const fs = require('fs');
const path = require('path');

const defaultConfig = require('../../jest.config');

module.exports = Object.assign(defaultConfig, {
  moduleNameMapper: {
    '^inferno-create-class':
      '<rootDir>/fixtures/react/packages/inferno-create-class.ts',
    '^inferno-create-element':
      '<rootDir>/fixtures/react/packages/inferno-create-element.ts',
    '^inferno-router/utils': '<rootDir>/packages/inferno-router/src/utils',
    '^inferno(.*?)$': '<rootDir>/packages/inferno$1/src'
  },
  testPathIgnorePatterns: ['/node_modules/', '/inferno_server/']
});
