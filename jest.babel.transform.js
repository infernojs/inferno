// Custom Jest transform implementation that wraps babel-jest and injects our
// babel presets, so we don't have to use .babelrc.

module.exports = require('babel-jest').createTransformer({
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
    ["@babel/plugin-proposal-class-properties", { "loose": true }]
  ]
});
