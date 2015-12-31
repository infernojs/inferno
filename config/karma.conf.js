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
			'../src/**/*__tests__*/**/*.js', // UT
			'../test/specs/**/*spec.browser.js', // AT
			'../test/specs/**/*spec.server.js', // AT
			'../test/specs/**/*spec.js', // AT
			'../test/specs/jsx/**/*spec.browser.js', // AT
			'../test/specs/jsx/**/*spec.server.js', // AT
			'../test/specs/jsx/**/*spec.js' // AT

		],
		// list of files to exclude
		exclude: [],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'../src/**/*__tests__*/**/*spec.ut.js': ['webpack'], // UT
			'../test/specs/**/*spec.server.js': ['webpack'], // AT
			'../test/specs/**/*spec.js': ['webpack'], // AT
			'../test/specs/**/*.spec.browser.js': ['webpack'], // AT
			'../test/specs/jsx/**/*spec.server.js': ['webpack'], // AT
			'../test/specs/jsx/**/*spec.js': ['webpack'], // AT
			'../test/specs/jsx/**/*.spec.browser.js': ['webpack'], // AT

		},
		webpack: {
			module: {
				postLoaders: [{
					test: /(\.jsx)|(\.js)$/,
					exclude: /test|dist|.git|node_modules\/dist/,
					loader: 'isparta',
					include: path.join(__dirname, '../src')
				}],
				loaders: [{
					test: /\.js$/,
					exclude: /(src|dist|.git|node_modules)/,
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
		// reporter options
		mochaReporter: {
			colors: {
				success: 'green',
				info: 'bgYellow',
				warning: 'cyan',
				error: 'bgRed'
			},
			divider: ''
		},
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

		browserDisconnectTimeout: 10000,
		browserDisconnectTolerance: 2,
		// concurrency level how many browser should be started simultaneously
		concurrency: 4,
		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 100000,
		browserNoActivityTimeout: 30000,
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
		config.browserNoActivityTimeout = 120000;
	}
};