const base = require('./karma.base.conf');
const {
  CI,
  TRAVIS_BRANCH,
  TRAVIS_BUILD_NUMBER,
  TRAVIS_JOB_NUMBER,
  TRAVIS_PULL_REQUEST
} = process.env;

const ci = String(CI).match(/^(1|true)$/gi);
const pullRequest = !String(TRAVIS_PULL_REQUEST).match(/^(0|false|undefined)$/gi);
const masterBranch = String(TRAVIS_BRANCH).match(/^master$/gi);
const sauce = ci && !pullRequest && masterBranch;
const varToBool = (sVar) => !!String(sVar).match('true');

const path = require('path');
const resolve = pkg => path.join(__dirname, '../../packages', pkg, 'src');

const sauceLaunchers = require('./sauce');

module.exports = function(config) {
  config.set({
    basePath: '../../',

    frameworks: ['jasmine', 'jasmine-matchers'],

    files: [
      require.resolve('es5-shim'),
      require.resolve('es6-shim'),
      require.resolve('babel-polyfill/dist/polyfill'),
      './scripts/test/jasmine-polyfill.js',
      './scripts/test/globals.js',
      './packages/*/__tests__/*',
      './packages/*/__tests__/**/*'
    ],

    preprocessors: {
      './packages/*/__tests__/**/*': ['webpack', 'sourcemap'],
      './packages/*/__tests__/*': ['webpack', 'sourcemap']
    },

    reporters: [
      'failed',
      'saucelabs'
    ],
    sauceLabs: {
      testName: 'Inferno Browser Karma Tests: ' + TRAVIS_JOB_NUMBER,
      build: (TRAVIS_JOB_NUMBER || 'Local'),
      tags: [(TRAVIS_BRANCH || 'master')]
    },
    customLaunchers: sauceLaunchers.launchers,
    browsers: sauceLaunchers.browsers,

    browserConsoleLogOptions: {
      level: 'warn',
      terminal: false
    },
    colors: true,
    singleRun: true,
    autoWatch: false,
    concurrency: 1,

    webpackMiddleware: {
      stats: 'errors-only',
      noInfo: true
    },
    webpack: {
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              plugins: ['transform-decorators-legacy']
            }
          },
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: /lodash/
          },
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: 'es5',
                module: 'commonjs'
              }
            }
          }
        ]
      },
      resolve: {
        alias: {
          inferno: resolve('inferno'),
          'inferno-compat': resolve('inferno-compat'),
          'inferno-create-class': resolve('inferno-create-class'),
          'inferno-create-element': resolve('inferno-create-element'),
          'inferno-devtools': resolve('inferno-devtools'),
          'inferno-hyperscript': resolve('inferno-hyperscript'),
          'inferno-mobx': resolve('inferno-mobx'),
          'inferno-redux': resolve('inferno-redux'),
          'inferno-router': resolve('inferno-router'),
          'inferno-server': resolve('inferno-server'),
          'inferno-shared': resolve('inferno-shared'),
          'inferno-test-utils': resolve('inferno-test-utils'),
          'inferno-utils': resolve('inferno-utils'),
          'inferno-vnode-flags': resolve('inferno-vnode-flags'),
          'inferno-clone-vnode': resolve('inferno-clone-vnode')
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        mainFields: ['module', 'main']
      },
      devServer: {
        noInfo: true
      },
      stats: 'errors-only',
      performance: {
        hints: false
      }
    }
  });
};
