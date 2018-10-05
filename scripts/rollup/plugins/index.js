const bublePlugin = require('rollup-plugin-buble');
const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replacePlugin = require('rollup-plugin-replace');
const tsPlugin = require('rollup-plugin-typescript2');
const uglify = require('rollup-plugin-uglify').uglify;
const aliasPlugin = require('./alias');

module.exports = function(version, options) {
  const plugins = [
    aliasPlugin,
    nodeResolve({
      extensions: ['.ts', '.js', '.json'],
      jsnext: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    tsPlugin({
      abortOnError: true,
      cacheRoot: `.rpt2_cache_${options.env}`,
      check: false,
      clean: true,
      tsconfig: __dirname + '/../../../tsconfig.json' // Have absolute path to fix windows build
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

  if (options.uglify) {
    plugins.push(
      uglify({
        compress: {
          // compress options
          booleans: true,
          dead_code: true,
          drop_debugger: true,
          unused: true,
          keep_fnames: false,
          keep_infinity: true,
          passes: 3
        },
        ie8: false,
        mangle: {
          toplevel: true
        },
        parse: {
          html5_comments: false,
          shebang: false
        },
        sourcemap: false,
        toplevel: false,
        warnings: false
      })
    );
  }

  return plugins;
};
