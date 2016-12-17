const path = require('path');

module.exports = function (config) {
	config.set({
		basePath: path.join(__dirname, '..', '..'),
		browsers: [
			'Chrome'
		],
		preprocessors: {
			'src/**/*': ['webpack']
		},
		webpack: {
			module: {
				loaders: [
					{
						test: /\.tsx?$/,
						loaders: [ 'babel-loader', 'ts-loader' ],
						exclude: /node_modules/
					}, {
						test: /\.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/
					}
				]
			},
			resolve: {
				extensions: [ '.js', '.jsx', '.ts', '.tsx' ]
			}
		},
		webpackMiddleware: {
			stats: 'errors-only',
			noInfo: true
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
				'Firefox',
				'Chrome_travis_ci'
			]
		});
	}
};