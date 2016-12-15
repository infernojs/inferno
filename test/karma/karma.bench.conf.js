/* global module */
/* tslint:disable */

const path = require('path');

module.exports = function (config) {
	config.set({
		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: path.join(__dirname, '../..'),
		files: [
			'./src/**/__benchmarks__/**/*.ts',
			'./src/**/__benchmarks__/**/*.tsx',
			'./src/**/__benchmarks__/**/*.js',
			'./src/**/__benchmarks__/**/*.jsx'
		],
		
		browsers: [
			'Chrome'
		],
		frameworks: [
      'benchmark'
    ],
    reporters: [
      'benchmark'
    ],
		
		preprocessors: {
			'./src/**/__benchmarks__/**/*': ['webpack']
		},
		webpack: {
			module: {
				loaders: [
					{
						test: /\.tsx?$/,
						loaders: ['babel-loader', 'ts-loader'],
						exclude: /node_modules/,
					}, {
						test: /\.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/,
					},
				],
			},
			resolve: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
		webpackMiddleware: {
			noInfo: true,
		},

		concurrency: 1,
		browserDisconnectTimeout: 10000,
		browserDisconnectTolerance: 2,
		captureTimeout: 2 * 60 * 10000,
		browserNoActivityTimeout: 2 * 60 * 1000,
		autoWatch: false,
		singleRun: true
	});

	const ci = String(process.env.CI).match(/^(1|true)$/gi);
	if (ci) {
		const travisLaunchers = {
			Chrome_travis_ci: {
				base: 'Chrome',
				flags: ['--no-sandbox']
			}
		};
		config.set({
			customLaunchers: travisLaunchers,
			browsers: [
				'Chrome_travis_ci'
			],
		});
	}
};
