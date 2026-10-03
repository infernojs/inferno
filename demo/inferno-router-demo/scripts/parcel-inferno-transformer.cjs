const { Transformer } = require('@parcel/plugin');
const SourceMap = require('@parcel/source-map').default;
const { createRequire } = require('node:module');
const path = require('node:path');
// Babel 8 uses package imports that Parcel's CommonJS loader cannot resolve.
const { transformAsync } = createRequire(__filename)('@babel/core');

// Parcel's built-in Babel transformer requires Babel 7. Use Babel 8 for Inferno JSX.
module.exports = new Transformer({
  async loadConfig({ config }) {
    const specifiers = ['@babel/core', 'babel-plugin-inferno'];
    for (let i = 0, len = specifiers.length; i < len; ++i) {
      const specifier = specifiers[i];
      config.addDevDependency({ specifier, resolveFrom: __filename });
    }
    const babelConfig = await config.getConfig(['.babelrc']);
    return babelConfig?.contents || {};
  },

  async transform({ asset, config, options }) {
    const inputMap = await asset.getMap();
    const result = await transformAsync(await asset.getCode(), {
      ...config,
      cwd: path.resolve(__dirname, '..'),
      filename: asset.filePath,
      babelrc: false,
      configFile: false,
      parserOpts: {
        plugins: asset.type === 'tsx' ? ['typescript', 'jsx'] : ['jsx']
      },
      sourceMaps: true,
      inputSourceMap: inputMap ? { version: 3, ...inputMap.toVLQ() } : undefined
    });

    asset.setCode(result.code);
    const map = new SourceMap(options.projectRoot);
    map.addVLQMap(result.map);
    asset.setMap(map);
    return [asset];
  }
});
