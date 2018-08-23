const typescript = require('typescript');
const babelJest = require('babel-jest').createTransformer({
  babelrc: false,
  presets: [
    ["@babel/preset-env",
      {
        "modules": "commonjs",
        "loose": true,
        "targets": {
          "node": "current"
        }
      }
    ]
  ],
  plugins: [
    ["babel-plugin-inferno", {"imports": true}],
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
});

const tsConfig = require('./tsconfig.json');
const jestConfig = require('./jest.config.js');

module.exports = {
  process(src, path) {
    return babelJest.process(
      typescript.transpile(
        src,
        tsConfig.compilerOptions,
        path,
        [],
      ),
      path,
      jestConfig
    );
  },
};
