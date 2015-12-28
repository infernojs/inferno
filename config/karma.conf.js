const path = require('path');

// Karma configuration
module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai'],

        // list of files / patterns to load in the browser
        files: [
            '../test/browser/**/*.js',
            '../test/shared/**/*.js'
        ],
        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '../test/shared/**/*.js': ['webpack'],
            '../test/browser/**/*.js': ['webpack'],
        },
        webpack: {
//            devtool: 'source-map',
            module: {
                postLoaders: [{
                    test: /(\.jsx)|(\.js)$/,
                    exclude: /test|node_modules\/dist/,
                    loader: 'isparta-instrumenter-loader',
					include: path.join(__dirname, '../src')
                }],
                loaders: [{
                    test: /\.js$/,
                    exclude: /(src|bower_components|node_modules)/,
                    loader: 'babel-loader'
                }]
            }
        },

        webpackMiddleware: {
            noInfo: true
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'coverage'],

        coverageReporter: {
            reporters: [{
                type: 'html',
                dir: '../coverage'
            }, {
                type: 'text',
                dir: '../coverage'
            }, {
                type: 'lcov',
                dir: '../coverage'
            }]
        },
        browsers: ['Chrome'],
        // custom launchers
        customLaunchers: {
            Chrome_for_Travis_CI: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
    if (process.env.TRAVIS) {

        // Use Chrome as default browser for Travis CI
        config.browsers = ['Chrome_for_Travis_CI'];
        // Used by Travis to push coveralls info corretly to example coveralls.io
        config.reporters = ['mocha', 'coverage', 'coveralls'];
        // Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs;-)
       // config.browserNoActivityTimeout = 120000;
    }
};
