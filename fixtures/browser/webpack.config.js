const path = require('path');
const assumptions = require('../../scripts/babel/assumptions.json');
const targets = require('../../scripts/babel/targets.json');
const transformInferno = require('ts-plugin-inferno').default;
const resolve = (pkg) =>
  path.join(__dirname, '../../packages', pkg, 'dist', 'index.dev.mjs');

// Loader rules per JSX transformer: babel-plugin-inferno, ts-plugin-inferno and swc-plugin-inferno
const rulesByVariant = {
  babel: [
    {
      test: /\.(js|jsx|tsx|ts)$/,
      loader: path.join(__dirname, 'node_modules/babel-loader'),
      options: {
        babelrc: false,
        assumptions,
        presets: [
          '@babel/typescript',
          [
            '@babel/preset-env',
            {
              exclude: ['transform-typeof-symbol'],
              targets,
            },
          ],
        ],
        plugins: [
          ['babel-plugin-inferno', { imports: true, uselessFlags: 'off' }],
          '@babel/plugin-transform-class-properties',
        ],
      },
    },
  ],
  ts: [
    {
      test: /\.(ts|tsx)$/,
      loader: path.join(__dirname, 'node_modules/ts-loader'),
      options: {
        compilerOptions: {
          module: 'es6',
          target: 'es2022',
          jsx: 'preserve',
          allowJs: true,
          moduleResolution: 'bundler',
        },
        getCustomTransformers: () => ({
          after: [transformInferno({ uselessFlags: 'off' })],
        }),
      },
    },
    {
      test: /\.(js|jsx)$/,
      loader: path.join(__dirname, 'node_modules/babel-loader'),
      options: {
        babelrc: false,
        assumptions,
        presets: [
          [
            '@babel/preset-env',
            {
              exclude: ['transform-typeof-symbol'],
              targets,
            },
          ],
          '@babel/typescript',
        ],
        plugins: [
          ['babel-plugin-inferno', { imports: true, uselessFlags: 'off' }],
          '@babel/plugin-transform-class-properties',
        ],
      },
    },
  ],
  swc: [
    {
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: /(node_modules)/,
      use: {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
            },
            experimental: {
              plugins: [['swc-plugin-inferno', { uselessFlags: 'off' }]],
            },
            target: 'es2022',
            loose: true,
          },
        },
      },
    },
  ],
};

// compat: include inferno-compat tests, minimize: minify the bundle like a production build
module.exports = function (
  variant,
  { compat = process.env.InfernoCompat === '1', minimize = false } = {},
) {
  const rules = rulesByVariant[variant];

  if (!rules) {
    throw new Error(
      `Unknown variant "${variant}", expected one of: ${Object.keys(rulesByVariant).join(', ')}`,
    );
  }

  console.info(
    `*** Building ${variant} browser tests, Inferno-compat is ${compat ? 'on' : 'off'}${minimize ? ', minified' : ''}. ***`,
  );

  return {
    context: path.join(__dirname, '../..'),
    entry: path.join(
      __dirname,
      compat ? 'test.index.js' : 'test.no-compat.index.js',
    ),
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'tests.js',
    },
    devtool: false,
    mode: 'none',
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
      minimize,
    },
    target: ['web'],
    module: {
      rules,
    },
    resolve: {
      alias: {
        inferno: resolve('inferno'),
        'inferno-animation': resolve('inferno-animation'),
        'inferno-compat': resolve('inferno-compat'),
        'inferno-create-element': resolve('inferno-create-element'),
        'inferno-hydrate': resolve('inferno-hydrate'),
        'inferno-extras': resolve('inferno-extras'),
        'inferno-hyperscript': resolve('inferno-hyperscript'),
        'inferno-mobx': resolve('inferno-mobx'),
        'inferno-redux': resolve('inferno-redux'),
        'inferno-router': resolve('inferno-router'),
        'inferno-server': resolve('inferno-server'),
        'inferno-shared': resolve('inferno-shared'),
        'inferno-test-utils': resolve('inferno-test-utils'),
        'inferno-utils': path.join(
          __dirname,
          '../../packages',
          'inferno-utils',
          'src',
          'index.ts',
        ),
        'inferno-vnode-flags': resolve('inferno-vnode-flags'),
        'inferno-clone-vnode': resolve('inferno-clone-vnode'),
        mobx: path.join(__dirname, '../../node_modules/mobx/dist/mobx.mjs'),
      },
      extensions: ['.js', '.jsx', '.tsx', '.ts'],
      mainFields: ['browser', 'main'],
    },
    stats: 'minimal',
    performance: {
      hints: false,
    },
  };
};
