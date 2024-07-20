const path = require('path');
const resolve = pkg => path.join(__dirname, '../../packages', pkg, 'dist', 'index.dev.esm.js');
const useInfernoCompatPkg = process.env.InfernoCompat === '1';

console.info('*** Starting karma tests, Inferno-compat is ' + (useInfernoCompatPkg ? 'on.' : 'off.') + ' ***');

const preProcessorOptions = {};

if (useInfernoCompatPkg) {
  preProcessorOptions['./fixtures/browser/test.index.js'] = ['webpack'];
} else {
  preProcessorOptions['./fixtures/browser/test.no-compat.index.js'] = ['webpack'];
}

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

    files: [path.join(__dirname, '../../fixtures/browser/', useInfernoCompatPkg ? 'test.index.js' : 'test.no-compat.index.js')],

    preprocessors: preProcessorOptions,

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

    client: {
      jasmine: {
        random: false // Adding jasmine.random false disables test random order
      }
    },

    webpack: {
      output: {
        filename: '[name]'
      },
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            loader: path.join(__dirname, 'node_modules/babel-loader'),
            exclude: /node_modules/,
            options: {
              babelrc: false,
              presets: [
                ["@babel/preset-env",
                  {
                    "loose": true,
                    "targets": {
                      "browsers": [
                        "ie >= 10",
                        "safari > 7"
                      ]
                    }
                  }
                ]
              ],
              plugins: [
                ["babel-plugin-inferno", {"imports": true}],
                ["@babel/plugin-transform-class-properties", { "loose": true }]
              ]
            }
          },
          {
            test: /\.tsx?$/,
            loader: path.join(__dirname, 'node_modules/ts-loader'),
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
