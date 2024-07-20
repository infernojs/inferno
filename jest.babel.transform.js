// Custom Jest transform implementation that wraps babel-jest and injects our
// babel presets, so we don't have to use .babelrc.
import babelJest from 'babel-jest';

export default babelJest.createTransformer({
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
    ["babel-plugin-inferno", { "imports": true }],
    ["@babel/plugin-transform-class-properties", { "loose": true }]
  ]
});
