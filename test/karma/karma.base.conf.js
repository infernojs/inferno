const path = require('path');

const grep = process.env.TEST_GREP_FILTER || false;
const filter = process.env.PKG_FILTER || '*';
const distes = 'packages/*/dist-es/**/*';
const benchmarks = `packages/${filter}/__benchmarks__/**/*`;
const tests = `packages/${filter}/__tests__/**/*`;

console.log({ filter, grep });

module.exports = function (config) {
	if (grep) {
		config.set({
			client: {
				mocha: {
					grep // passed directly to mocha
				}
			}
		});
	}

	config.set({
		basePath: path.resolve(__dirname, '..', '..'),
		browsers: [
			'Chrome'
		],
		preprocessors: {
			[distes]: ['webpack'],
			[benchmarks]: ['webpack'],
			[tests]: ['webpack']
		},
		webpack: {
			module: {
				loaders: [
					{
						test: /\.jsx?$/,
						loader: 'babel-loader',
						exclude: /node_modules/,
						query: JSON.stringify({
							compact: false
						})
					}
				]
			},
			resolve: {
				extensions: [ '.js', '.jsx' ],
				mainFields: [ 'inferno:main', 'module', 'main' ]
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
