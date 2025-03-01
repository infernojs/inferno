const path = require('path');
const gzipPreprocessor = require('./gzip/gzippreprocessor');
const resolve = (pkg) => path.join(__dirname, '../../packages', pkg, 'dist', 'index.dev.mjs');

const customLaunchers = {
  slChrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    browserVersion: 'latest',
    platform: 'Windows 11'
  },
  slSafari14: {
    base: 'SauceLabs',
    browserName: 'safari',
    browserVersion: '16',
    platform: 'macOS 12'
  },
  slSafari15: {
    base: 'SauceLabs',
    browserName: 'safari',
    browserVersion: 'latest',
    platform: 'macOS 13'
  },
  slEdge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    browserVersion: 'latest',
    platform: 'Windows 11'
  },
  sl_mac_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    browserVersion: 'latest',
    platform: 'macOS 12'
  },
  slFirefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    browserVersion: 'latest'
  },
  slFirefox119: {
    base: 'SauceLabs',
    browserName: 'firefox',
    browserVersion: '119',
    platform: 'Linux',
    'sauce:options': {
      geckodriverVersion: '0.33.0'
    }
  }
};

module.exports = function (config) {
  config.set({
    basePath: '../../',

    frameworks: ['jasmine'],

    files: [path.join(__dirname, '../../fixtures/browser/test.index.js')],

    preprocessors: {
      './fixtures/browser/test.index.js': ['webpack', 'gzip']
    },

    client: {
      jasmine: {
        random: false // Adding jasmine.random false disables test random order
      }
    },

    reporters: ['dots', 'saucelabs'],
    sauceLabs: {
      startConnect: true,
      testName: `InfernoJS`,
      recordVideo: false,
      recordScreenshots: false,
      videoUploadOnPass: false,
      recordLogs: false,
      captureHtml: false,
      commandTimeout: 400
    },

    plugins: ['karma-jasmine', 'karma-webpack', gzipPreprocessor, 'havunen-karma-sauce-launcher2'],

    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),

    reportSlowerThan: 2000,

    captureTimeout: 600000,
    browserNoActivityTimeout: 600000,
    browserDisconnectTolerance: 2,
    processKillTimeout: 20000,
    browserDisconnectTimeout: 10000,

    browserConsoleLogOptions: {
      level: 'warn',
      terminal: false
    },
    colors: true,
    singleRun: true,
    autoWatch: false,
    concurrency: 1,

    webpack: {
      devtool: false,
      mode: 'none',
      optimization: {
        splitChunks: false,
        runtimeChunk: false,
        minimize: true
      },
      target: ['web'],
      module: {
        rules: [
          {
            test: /\.(ts|tsx|js|jsx)$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'swc-loader',
              options: {
                "jsc": {
                  "parser": {
                    "syntax": "typescript",
                    "tsx": true,
                  },
                  "experimental": {
                    "plugins": [
                      ["swc-plugin-inferno", {}]
                    ],
                  },
                  "target": "es2022",
                  "loose": true
                }
              }
            },
          }
        ]
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
          'inferno-utils': path.join(__dirname, '../../packages', 'inferno-utils', 'src', 'index.ts'),
          'inferno-vnode-flags': resolve('inferno-vnode-flags'),
          'inferno-clone-vnode': resolve('inferno-clone-vnode'),
          mobx: path.join(__dirname, '../../node_modules/mobx/dist/mobx.esm.js')
        },
        extensions: ['.js', '.jsx', '.tsx', '.ts'],
        mainFields: ['browser', 'main']
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
