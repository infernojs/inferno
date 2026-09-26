// Bundles the browser tests for jasmine-browser-runner, usage: node build-tests.js <babel|ts|swc> [--minimize]
const webpack = require('webpack');
const createConfig = require('./webpack.config.js');

function build(variant, options) {
  const config = createConfig(variant, options);

  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      console.info(stats.toString(config.stats));

      if (stats.hasErrors()) {
        reject(new Error('Webpack build failed'));
        return;
      }

      resolve();
    });
  });
}

module.exports = build;

if (require.main === module) {
  build(process.argv[2], {
    minimize: process.argv.includes('--minimize'),
  }).catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
