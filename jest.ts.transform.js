const typescript = require('typescript');
const babelJest = require('babel-jest').default;

const transformer = babelJest.createTransformer({
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

module.exports = {
  process(src, path, config) {
    return transformer.process(
      typescript.transpile(
        src,
        tsConfig.compilerOptions,
        path,
        [],
      ),
      path,
      config
    );
  },
};
