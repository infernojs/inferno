const path = require('path');

module.exports = function (config) {
	config.set({
		basePath: path.resolve(__dirname, '..', '..'),
		browsers: [
			'Chrome'
		],
		preprocessors: {
			'packages/*/dist-es/**/*': ['webpack'],
			'packages/*/__benchmarks__/**/*': ['webpack'],
			'packages/*/__tests__/**/*': ['webpack']
		},
		webpack: {
			module: {
				loaders: [
					{
						test: /\.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/,
						query: {
							compact: false
						}
					}
				]
			},
			resolve: {
				extensions: [ '.js', '.jsx' ],
				mainFields: [ 'module', 'main' ]
			},
			performance: {
				hints: false
			}
		},
		webpackMiddleware: {
			stats: 'errors-only',
			noInfo: true
		},

		concurrency: 1,
		browserConsoleLogOptions: {
			terminal: true
		},
		browserDisconnectTimeout: 10000,
		browserDisconnectTolerance: 2,
		browserLogOptions: {
			terminal: true
		},
		browserNoActivityTimeout: 2 * 60 * 1000,
		captureTimeout: 2 * 60 * 10000,
		autoWatch: false,
		singleRun: true,
		failOnEmptyTestSuite: false
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
				'Firefox',
				'Chrome_travis_ci'
			]
		});
	}
};
