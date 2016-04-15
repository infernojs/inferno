const babel = require('rollup-plugin-babel');
const multi = require('rollup-plugin-multi-entry').default;
const nodeResolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript');
const stub = require('rollup-plugin-stub');
const istanbul = require('rollup-plugin-istanbul');
const glob = require('glob');

const testFiles = glob.sync('./src/**/*__tests__*/**/*spec.browser.js')
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.jsx.js'))
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.ssr.js'));

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
		files: testFiles,
		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera (has to be installed with `npm install karma-opera-launcher`)
		// - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
		// - PhantomJS
		// - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
		browsers: ['Chrome'],
		// custom launchers
		customLaunchers: {
			ChromeForTravisCI: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		},
		// list of files to exclude
		exclude: [],
		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'src/**/*.js': ['rollup']
		},
		rollupPreprocessor: {
			rollup: {
				plugins: [
					multi(),
					babel({
						babelrc: false,
						presets: 'es2015-rollup',
						exclude: 'node_modules/**',
						plugins: [
							'transform-inline-environment-variables',
							'transform-flow-strip-types',
							'syntax-flow',
							'transform-undefined-to-void',
							'babel-plugin-syntax-jsx',
							'babel-plugin-inferno',
							'transform-object-rest-spread'
						]
					}), istanbul({
						exclude: testFiles
					}),
					nodeResolve({
						jsnext: true,
						main: true
					}),
					stub()
				]
			},
			bundle: {
			}
		},
		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha', 'coverage'],
		coverageReporter: {
			dir: 'dist/coverage',
			//includeAllSources: true,
			reporters: [
				{'type': 'text'},
				{'type': 'html', subdir: 'html'},
				{'type': 'lcov', subdir: './'}
			]
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
		//singleRun: true
	});

	if (process.env.TRAVIS) {

		// Use Chrome as default browser for Travis CI
		config.browsers = ['ChromeForTravisCI'];
		// Used by Travis to push coveralls info corretly to example coveralls.io
		config.reporters = ['mocha', 'coverage', 'coveralls'];
		// Karma (with socket.io 1.x) buffers by 50 and 50 tests can take a long time on IEs;-)
		config.browserNoActivityTimeout = 120000;
	}
};
