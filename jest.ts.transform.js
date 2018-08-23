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
    const isTypeScript = path.endsWith('.ts') || path.endsWith('.tsx');
    const isJavaScript = path.endsWith('.js') || path.endsWith('.jsx');

    if (isTypeScript) {
      src = typescript.transpile(
        src,
        tsConfig.compilerOptions,
        path,
        [],
      );
    }

    if (isJavaScript || isTypeScript) {
      // babel-jest hack for transpile src without file
      const fileName = isJavaScript
        ? path
        : 'file.js';

      src = babelJest.process(
        src,
        fileName,
        jestConfig
      );
    }

    return src;
  },
};
