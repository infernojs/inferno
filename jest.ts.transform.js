import typescript from 'typescript';
import babelJest from 'babel-jest';
import {readFileSync} from 'fs';

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

const tsConfig = JSON.parse(readFileSync('./tsconfig.json'));

export default {
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
}
