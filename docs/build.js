import {rollup} from "rollup";
import { existsSync, readdirSync, statSync } from "fs";
import commonjsPlugin from "@rollup/plugin-commonjs";
import nodeResolvePlugin from "@rollup/plugin-node-resolve";
import { dirname, join, resolve } from "path";
import replace from "@rollup/plugin-replace";
import terser from '@rollup/plugin-terser';
import alias from "@rollup/plugin-alias";
import { fileURLToPath } from "url";
import babel from "@rollup/plugin-babel";

const isProduction = process.env.NODE_ENV === 'production';

const __dirname = dirname(fileURLToPath(import.meta.url));
const benchmarks = readdirSync(__dirname).filter(file => statSync(join(__dirname, file)).isDirectory());
const resolvePkg = pkg => resolve(__dirname, '../packages', pkg, 'dist', 'index.mjs');


console.log(resolvePkg('inferno'));

// see below for details on the options
const plugins = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': '"production"',
    sourcemap: false
  }),
  nodeResolvePlugin({
    preferBuiltins: false
  }),
  babel({
    exclude: 'node_modules/**',
    sourceMaps: false,
    babelrc: false,
    presets: [['@babel/env', {loose: true, modules: false}]],
    plugins: [
      ['babel-plugin-inferno', {imports: true, defineAllArguments: true}],
      ["@babel/plugin-proposal-class-properties", { "loose": true }]
    ]
  }),
  commonjsPlugin({
    sourceMap: false
  }),
  alias({
    resolve: ['.js'],
    entries: [
      {find: 'inferno', replacement: resolvePkg('inferno')},
      {find: 'inferno-animation', replacement: resolvePkg('inferno-animation')},
      {find: 'inferno-compat', replacement: resolvePkg('inferno-compat')},
      {find: 'inferno-create-element', replacement: resolvePkg('inferno-create-element')},
      {find: 'inferno-hydrate', replacement: resolvePkg('inferno-hydrate')},
      {find: 'inferno-extras', replacement: resolvePkg('inferno-extras')},
      {find: 'inferno-hyperscript', replacement: resolvePkg('inferno-hyperscript')},
      {find: 'inferno-mobx', replacement: resolvePkg('inferno-mobx')},
      {find: 'inferno-redux', replacement: resolvePkg('inferno-redux')},
      {find: 'inferno-router', replacement: resolvePkg('inferno-router')},
      {find: 'inferno-server', replacement: resolvePkg('inferno-server')},
      {find: 'inferno-shared', replacement: resolvePkg('inferno-shared')},
      {find: 'inferno-test-utils', replacement: resolvePkg('inferno-test-utils')},
      {find: 'inferno-vnode-flags', replacement: resolvePkg('inferno-vnode-flags')},
      {find: 'inferno-clone-vnode', replacement: resolvePkg('inferno-clone-vnode')},
      {find: 'mobx', replacement: join(__dirname, '../node_modules/mobx/dist/mobx.esm.js')},
      {find: 'perf-monitor', replacement: join(__dirname, '../node_modules/perf-monitor/dist/index.js')}
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
      toplevel: false,
      warnings: false
    })
  );
}

for (const dir of benchmarks) {
  const benchmarkPath = join(__dirname, dir);
  const appJsPath = resolve(benchmarkPath, 'app.js')

  // Don't build examples that don't have app.js
  if (!existsSync(appJsPath)) continue;

  const inputOptions = {
    input: appJsPath,
    plugins: plugins
  };

  const start = new Date();

  console.log(`Build started -- ${start}`);

  rollup(inputOptions).then(function (opts) {
    return opts.write({
      format: 'iife',
      file: join(benchmarkPath, 'dist', 'bundle.js'),
      sourcemap: false,
      name: 'inferno'
    });
  });
}
