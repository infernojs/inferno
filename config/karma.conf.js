/* global module */
module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [
			'chai',
			'mocha'
		],
		files: [
			'./../node_modules/babel-polyfill/dist/polyfill.js',
			'./../node_modules/sinon/pkg/sinon.js',
			'./../src/mobx/__tests__/**'
		],
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera (has to be installed with `npm install karma-opera-launcher`)
		// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
		// - PhantomJS
		// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
		browsers: ['Chrome'],
		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},
		// list of files to exclude
		exclude: [],
		preprocessors: {
			'./../src/mobx/__tests__/**': ['webpack']
		},
		webpack: {
			module: {
				loaders: [
					{
						test: /\.tsx?$/,
						loaders: ['babel-loader', 'ts-loader'],
						exclude: /node_modules/
					}, {
						test: /\.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/
					}
				]
			},
			resolve: {
				extensions: ['.js', '.ts', '.tsx']
			}
		},
		webpackMiddleware: {
			noInfo: true,
			stats: {
				// With console colors
				colors: true,
				// Add the hash of the compilation
				hash: false,
				// Add webpack version information
				version: false,
				// Add timing information
				timings: true,
				// Add assets information
				assets: false,
				// Add chunk information
				chunks: false,
				// Add built modules information to chunk information
				chunkModules: false,
				// Add built modules information
				modules: false,
				// Add also information about cached (not built) modules
				cached: false,
				// Add information about the reasons why modules are included
				reasons: false,
				// Add the source code of modules
				source: false,
				// Add details to errors (like resolving log)
				errorDetails: true,
				// Add the origins of chunks and chunk merging info
				chunkOrigins: false,
				// Add messages from child loaders
				children: false
			}
		},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],

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
		config.browsers = ['Chrome_travis_ci'];
		// Used by Travis to push coveralls info corretly to example coveralls.io
		// Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs;-)
		config.browserNoActivityTimeout = 120000;
	}
};
