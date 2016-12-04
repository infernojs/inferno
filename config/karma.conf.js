/* global module */
/* tslint:disable */

const path = require('path');

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: path.join(__dirname, '..'),
		frameworks: [
			'chai',
			'mocha'
		],
		files: [
			'./node_modules/babel-polyfill/dist/polyfill.js',
			'./node_modules/sinon/pkg/sinon.js',
			'./src/**/*__tests__*/**/*.ts',
			'./src/**/*__tests__*/**/*.tsx',
			'./src/**/*__tests__*/**/*.js',
			'./src/**/*__tests__*/**/*.jsx'
		],
		
		browsers: ['Chrome'],
		reporters: [
			'progress'
		],
		
		preprocessors: {
			'./src/**/__tests__/**/*': ['webpack']
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
				extensions: ['.js', '.jsx', '.ts', '.tsx']
			}
		},
		webpackMiddleware: {
			noInfo: true,
		},

		browserDisconnectTimeout: 10000,
		browserDisconnectTolerance: 2,
		captureTimeout: 2 * 60 * 10000,
		browserNoActivityTimeout: 2 * 60 * 1000,
		autoWatch: false,
		singleRun: true
	});

	const {
		CI,
		TRAVIS,
		TRAVIS_BRANCH,
		TRAVIS_BUILD_NUMBER,
		TRAVIS_PULL_REQUEST,
	} = process.env;

	if (TRAVIS) {
		const travisLaunchers = {
			chrome_travis: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		};
		config.set({
			reporters: [
				'failed',
			],
			browsers: [
				'Chrome_travis_ci'
			],
		});
	}

	if (CI && TRAVIS_PULL_REQUEST && TRAVIS_BRANCH === 'sauce-labs') {
		const customLaunchers = {
			sl_chrome: {
				base: 'SauceLabs',
				browserName: 'chrome',
				platform: 'Windows 10'
			},
			sl_firefox: {
				base: 'SauceLabs',
				browserName: 'firefox',
				platform: 'Windows 10'
			},
			sl_safari: {
				base: 'SauceLabs',
				browserName: 'safari',
				platform: 'OS X 10.11'
			},
			sl_edge: {
				base: 'SauceLabs',
				browserName: 'MicrosoftEdge',
				platform: 'Windows 10'
			},
			sl_ie_11: {
				base: 'SauceLabs',
				browserName: 'internet explorer',
				version: '11.103',
				platform: 'Windows 10'
			},
			sl_ie_10: {
				base: 'SauceLabs',
				browserName: 'internet explorer',
				version: '10.0',
				platform: 'Windows 7'
			},
			sl_ie_9: {
				base: 'SauceLabs',
				browserName: 'internet explorer',
				version: '9.0',
				platform: 'Windows 7'
			}
		};
		config.set({
			sauceLabs: {
					testName: 'Inferno Browser Unit Tests: ' + (TRAVIS_BUILD_NUMBER || 'Local')
			},
			concurrency: 2,
			customLaunchers: customLaunchers,
			browsers: Object.keys(customLaunchers),
			reporters: [
				'failed',
				'saucelabs'
			]
		})
	}
};
