const babel = require('rollup-plugin-babel');
const multiEntry = require('rollup-plugin-multi-entry').default;
const nodeResolve = require('rollup-plugin-node-resolve');
const TypeScript = require('rollup-plugin-typescript');
const Stub = require('rollup-plugin-stub');

/* global module */
module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../',
		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: [
			'sinon-chai',
			'chai-as-promised',
			'chai',
			'mocha'
		],
		files: [
            'node_modules/babel-polyfill/dist/polyfill.js',
            './src/**/*__tests__*/**/*spec.browser.js'
		],
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera (has to be installed with `npm install karma-opera-launcher`)
		// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
		// - PhantomJS
		// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
		browsers: ['PhantomJS'],
		customLaunchers: {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},
		// list of files to exclude
		exclude: [],
		preprocessors: {
			'./src/**/*__tests__*/**/*spec.browser.js': ['rollup']
		},
		rollupPreprocessor: {
			rollup: {
				plugins: [
					multiEntry(),
					babel({
						babelrc: false,
						presets: 'es2015-rollup',
//						exclude: 'node_modules/**',
						plugins: [
							'transform-flow-strip-types',
							'syntax-flow',
							'transform-undefined-to-void',
							'transform-object-rest-spread',
							'babel-plugin-inferno',
							'babel-plugin-syntax-jsx'
						]
					}),
					nodeResolve({
						jsnext: true,
						main: true
					}),
					Stub(),
					TypeScript()
				]
			},
			bundle: {
			}
		},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha'],

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
		autoWatch: false
		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		//singleRun: true
	});

	if (process.env.TRAVIS) {
		config.browsers = ['Chrome_travis_ci'];
		// Used by Travis to push coveralls info corretly to example coveralls.io
		// Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs;-)
		config.browserNoActivityTimeout = 120000;
	}
};
