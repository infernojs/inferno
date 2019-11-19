const rollup = require('rollup');
const {readdirSync, statSync} = require('fs');
const commonjsPlugin = require('rollup-plugin-commonjs');
const nodeResolvePlugin = require('rollup-plugin-node-resolve');
const babelPlugin = require('rollup-plugin-babel');
const path = require('path');
const replace = require('rollup-plugin-replace');
const terser = require('rollup-plugin-terser').terser;
const alias = require('@rollup/plugin-alias');

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
    presets: [['@babel/env', {loose: true, modules: false}]],
    plugins: [['babel-plugin-inferno', {imports: true, defineAllArguments: true}]]
  }),
  commonjsPlugin({
    sourceMap: false
  }),
  alias({
    resolve: ['.js'],
    entries: [
      {find: 'inferno', replacement: resolve('inferno')},
      {find: 'inferno-component', replacement: resolve('inferno-component')},
      {find: 'inferno-compat', replacement: resolve('inferno-compat')},
      {find: 'inferno-create-class', replacement: resolve('inferno-create-class')},
      {find: 'inferno-create-element', replacement: resolve('inferno-create-element')},
      {find: 'inferno-devtools', replacement: resolve('inferno-devtools')},
      {find: 'inferno-hydrate', replacement: resolve('inferno-hydrate')},
      {find: 'inferno-extras', replacement: resolve('inferno-extras')},
      {find: 'inferno-hyperscript', replacement: resolve('inferno-hyperscript')},
      {find: 'inferno-mobx', replacement: resolve('inferno-mobx')},
      {find: 'inferno-redux', replacement: resolve('inferno-redux')},
      {find: 'inferno-router', replacement: resolve('inferno-router')},
      {find: 'inferno-server', replacement: resolve('inferno-server')},
      {find: 'inferno-shared', replacement: resolve('inferno-shared')},
      {find: 'inferno-test-utils', replacement: resolve('inferno-test-utils')},
      {find: 'inferno-vnode-flags', replacement: resolve('inferno-vnode-flags')},
      {find: 'inferno-clone-vnode', replacement: resolve('inferno-clone-vnode')},
      {find: 'mobx', replacement: path.join(__dirname, '../../node_modules/mobx/lib/mobx.module.js')}
    ]
  })
];

if (isProduction) {
  plugins.push(
    terser({
      compress: {
        ecma: 5,
        inline: true,
        if_return: false,
        reduce_funcs: false,
        passes: 5,
        comparisons: false,
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
