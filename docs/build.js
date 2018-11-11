const rollup = require('rollup');
const { readdirSync, statSync } = require('fs');
const commonjsPlugin = require('rollup-plugin-commonjs');
const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const babelPlugin = require('rollup-plugin-babel');
const path = require('path');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');
const alias = require('rollup-plugin-alias');

const isProduction = process.env.NODE_ENV === 'production';

const benchmarks = readdirSync(__dirname).filter(file => statSync(path.join(__dirname, file)).isDirectory());

const resolve = pkg => path.resolve(__dirname, '../packages', pkg, 'dist', 'index.esm.js');


console.log(resolve('inferno'));

// see below for details on the options
const plugins = [
  replace({
    'process.env.NODE_ENV': '"production"',
    sourcemap: false
  }),
  nodeResolvePlugin({
    preferBuiltins: false
  }),
  babelPlugin({
    exclude: 'node_modules/**',
    sourceMaps: false,
    babelrc: false,
    presets: [['@babel/env', { loose: true, modules: false }]],
    plugins: [['babel-plugin-inferno', { imports: true, defineAllArguments: true }]]
  }),
  commonjsPlugin({
    sourceMap: false
  }),
  alias({
    inferno: resolve('inferno'),
    'inferno-component': resolve('inferno-component'),
    'inferno-compat': resolve('inferno-compat'),
    'inferno-create-class': resolve('inferno-create-class'),
    'inferno-create-element': resolve('inferno-create-element'),
    'inferno-devtools': resolve('inferno-devtools'),
    'inferno-hydrate': resolve('inferno-hydrate'),
    'inferno-extras': resolve('inferno-extras'),
    'inferno-hyperscript': resolve('inferno-hyperscript'),
    'inferno-mobx': resolve('inferno-mobx'),
    'inferno-redux': resolve('inferno-redux'),
    'inferno-router': resolve('inferno-router'),
    'inferno-server': resolve('inferno-server'),
    'inferno-shared': resolve('inferno-shared'),
    'inferno-test-utils': resolve('inferno-test-utils'),
    'inferno-vnode-flags': resolve('inferno-vnode-flags'),
    'inferno-clone-vnode': resolve('inferno-clone-vnode'),
    mobx: path.join(__dirname, '../../node_modules/mobx/lib/mobx.module.js')
  })
];

if (isProduction) {
  plugins.push(uglify({
    compress: {
      booleans: false,
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
    toplevel: true,
    warnings: false
  }));
}

benchmarks.forEach(dir => {
  const benchmarkPath = path.join(__dirname, dir);

  const inputOptions = {
    input: path.resolve(benchmarkPath, 'app.js'),
    plugins: plugins
  };

  const start = new Date();

  console.log(`Build started -- ${start}`);

  rollup.rollup(inputOptions).then(function (opts) {
    return opts.write({
      format: 'iife',
      file: path.join(benchmarkPath, 'dist', 'bundle.js'),
      sourcemap: false,
      name: 'inferno'
    });
  });
});
