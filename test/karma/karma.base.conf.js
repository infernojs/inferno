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
						exclude: /node_modules/,
						query: {
							compact: false,
							presets: [[ 'es2015', { loose: true }]],
							plugins: [
								'transform-class-properties',
								'transform-object-rest-spread',
								'babel-plugin-syntax-jsx',
								[ 'babel-plugin-inferno', { imports: true }]
							]
						}
					}
				]
			},
			resolve: {
				extensions: [ '.js', '.jsx', '.ts', '.tsx' ],
				mainFields: ['main']
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
