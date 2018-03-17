const path = require('path');
const resolve = pkg => path.join(__dirname, '../../packages', pkg, 'src');

const customLaunchers = {
  slChrome: {
    base: 'SauceLabs',
    browserName: 'chrome'
  },
  slIphone5: {
    base: 'SauceLabs',
    browserName: 'iphone',
    version: '9.3'
  },
  slIpad: {
    base: 'SauceLabs',
    browserName: 'ipad',
    version: '10.3'
  },
  slIpad2: {
    base: 'SauceLabs',
    browserName: 'ipad',
    version: '11.2'
  },
  slIphone6: {
    base: 'SauceLabs',
    browserName: 'iphone',
    version: '10.3'
  },
  slIphone7: {
    base: 'SauceLabs',
    browserName: 'iphone',
    version: '11.2'
  },
  slSafari8: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.10'
  },
  slSafari9: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11'
  },
  sl_mac_firfox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'OS X 10.12'
  },
  sl_safari: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.12',
    version: "11"
  },
  slIE10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10'
  },
  slIE11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '11'
  },
  slEdge13: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: '13',
    platform: 'Windows 10'
  },
  slEdge14: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: '14',
    platform: 'Windows 10'
  },
  slEdge15: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: '15',
    platform: 'Windows 10'
  },
  slEdge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10'
  },
  sl_mac_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'macOS 10.12'
  },
  slFirefox: {
    base: 'SauceLabs',
    browserName: 'firefox'
  },
  slAndroid5: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '5.1'
  },
  slAndroid7: {
    base: 'SauceLabs',
    browserName: 'android',
    version: '6.0'
  }
};

module.exports = function(config) {
  config.set({
    basePath: '../../',

    frameworks: ['jasmine', 'jasmine-matchers'],

    files: [path.join(__dirname, '../../fixtures/browser/test.index.js')],

    preprocessors: {
      './fixtures/browser/test.index.js': ['webpack']
    },

    client: {
      jasmine: {
        random: false // Adding jasmine.random false disables test random order
      }
    },

    reporters: ['failed', 'saucelabs'],
    sauceLabs: {
      build: 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')',
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
      startConnect: true,
      testName: `InfernoJS`,
      recordVideo: false,
      recordScreenshots: false,
      videoUploadOnPass: false,
      recordLogs: false,
      captureHtml: false,
      commandTimeout: 400
    },

    plugins: ['karma-jasmine', 'karma-jasmine-matchers', 'karma-webpack', 'karma-failed-reporter', 'karma-sauce-launcher'],

    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),

    captureTimeout: 600000,
    browserNoActivityTimeout: 600000,
    browserDisconnectTolerance: 2,

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
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: /node_modules/,
            query: {
              presets: ['stage-2'],
              plugins: [
                'transform-decorators-legacy',
                ['babel-plugin-inferno', { imports: true }],
                'transform-class-properties',
                'transform-object-rest-spread',
                'babel-plugin-syntax-jsx',
                'transform-class-properties'
              ]
            }
          },
          {
            test: /\.tsx?$/,
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: 'es5',
                module: 'commonjs',
                sourceMap: false
              }
            }
          }
        ]
      },
      resolve: {
        alias: {
          inferno: resolve('inferno'),
          'inferno-component': resolve('inferno-component'),
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
          'inferno-clone-vnode': resolve('inferno-clone-vnode'),
          mobx: path.join(__dirname, '../../node_modules/mobx/lib/mobx.module.js')
        },
        extensions: ['.js', '.jsx', '.ts'],
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
