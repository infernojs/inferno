const path = require('path');
const resolve = pkg => path.join(__dirname, '../../packages', pkg, 'src');

module.exports = function(config) {
  config.set({
    basePath: '../../',

    frameworks: ['detectBrowsers', 'jasmine', 'jasmine-matchers'],

    detectBrowsers: {
      postDetection(browserList) {
        const results = [];

        if (browserList.indexOf('Chrome') > -1) {
          results.push('Chrome');
        }

        if (browserList.indexOf('Firefox') > -1) {
          results.push('Firefox');
        }

        if (browserList.indexOf('IE') > -1) {
          results.push('IE');
        }

        if (browserList.indexOf('Edge') > -1) {
          results.push('Edge');
        }

        return results;
      }
    },

    files: ['./packages/*/__tests__/**/*.spec.js', './packages/*/__tests__/**/*.spec.jsx'],

    preprocessors: {
      './packages/*/__tests__/**/*': ['webpack'],
      './packages/*/__tests__/*': ['webpack']
    },

    plugins: [
      'karma-ie-launcher',
      'karma-detect-browsers',
      'karma-jasmine',
      'karma-jasmine-matchers',
      'karma-firefox-launcher',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-edge-launcher'
    ],

    reporters: ['progress'],

    browserConsoleLogOptions: {
      level: 'warn',
      terminal: false
    },
    colors: true,
    autoWatch: false,
    concurrency: 1,

    webpackMiddleware: {
      stats: 'errors-only',
      noInfo: true
    },
    webpack: {
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
                'transform-es2015-modules-commonjs',
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
          'inferno-clone-vnode': resolve('inferno-clone-vnode')
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
