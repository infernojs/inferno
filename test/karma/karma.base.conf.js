const path = require('path');

const grep = process.env.TEST_GREP_FILTER || false;
const filter = process.env.PKG_FILTER || '*';
const distes = 'packages/*/dist-es/**/*';
const dist = 'packages/*/index.js';
const benchmarks = `packages/${filter}/__benchmarks__/**/*`;
const tests = `packages/${filter}/__tests__/**/*`;

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
			[dist]: ['webpack'],
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
						query: {
							// TODO: This is workaround because some of devDeps are shipping ES6...
							babelrc: false,
							presets: [
								[ 'es2015', { loose: true, modules: false }],
								'stage-2'
							],
							plugins: [
								'transform-decorators-legacy',
								'transform-class-properties',
								'transform-object-rest-spread',
								'babel-plugin-syntax-jsx',
								[ 'babel-plugin-inferno', { imports: true }],
								[ 'module-resolver', {
									extensions: [ '.js', '.jsx' ],
									alias: {
										'inferno-compat': './packages/inferno-compat/dist-es',
										'inferno-component': './packages/inferno-component/dist-es',
										'inferno-create-class': './packages/inferno-create-class/dist-es',
										'inferno-create-element': './packages/inferno-create-element/dist-es',
										'inferno-shared': './packages/inferno-shared/dist-es',
										'inferno-hyperscript': './packages/inferno-hyperscript/dist-es',
										'inferno-mobx': './packages/inferno-mobx/dist-es',
										'inferno-redux': './packages/inferno-redux/dist-es',
										'inferno-router': './packages/inferno-router/dist-es',
										'inferno-server': './packages/inferno-server/dist-es',
										inferno: './packages/inferno/dist-es'
									}
								}]
							]
						}
					}
				]
			},
			resolve: {
				extensions: [ '.js', '.jsx' ],
				mainFields: [ 'inferno:main', 'module', 'main' ]
			},
			performance: {
				hints: false
			},
			devServer: {
				stats: 'errors-only'
			}
		},
		webpackMiddleware: {
			stats: 'errors-only',
			noInfo: true
		},

		concurrency: 1,
		browserConsoleLogOptions: {
			level: 'error',
			terminal: false
		},
		browserDisconnectTimeout: 10000,
		browserDisconnectTolerance: 2,
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
