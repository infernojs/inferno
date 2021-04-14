const bublePlugin = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replacePlugin = require('rollup-plugin-replace');
const terser = require('rollup-plugin-terser').terser;
const aliasPlugin = require('./alias');

module.exports = function (version, options) {
  const plugins = [
    aliasPlugin,
    nodeResolve({
      extensions: ['.js', '.json'],
      mainFields: ['module', 'main'],
      preferBuiltins: true
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ];

  if (!options.esnext) {
    plugins.push(bublePlugin());
  }

  const replaceValues = {
    'process.env.INFERNO_VERSION': JSON.stringify(options.version)
  };

  if (options.replace) {
    replaceValues['process.env.NODE_ENV'] = JSON.stringify(options.env);
  }

  plugins.push(replacePlugin(replaceValues));

  if (options.minify) {
    plugins.push(
      terser({
        compress: {
          ecma: 5,
          inline: true,
          if_return: false,
          reduce_funcs: false,
          passes: 5,
          comparisons: false
        },
        ie8: false,
        mangle: {
          toplevel: true
        },
        parse: {
          html5_comments: false,
          shebang: false
        },
        toplevel: false,
        warnings: false
      })
    );
  }

  return plugins;
};
