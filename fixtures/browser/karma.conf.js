const path = require('path');
const resolve = package => path.join(__dirname, '../../packages', package, 'src');

module.exports = function(config) {
	config.set({
		basePath: '../../',

		frameworks: [
			'jasmine'
		],

		browsers: [
			'Chrome'
		],

		files: [
			require.resolve('es5-shim'),
			require.resolve('es6-shim'),
			require.resolve('babel-polyfill/dist/polyfill'),
			'./packages/*/__tests__/*',
			'./packages/*/__tests__/**/*',
		],

		preprocessors: {
			'./packages/**/*': ['webpack'],
		},

		reporters: [
			'progress'
		],

		port: 9876,
		colors: true,
		singleRun: true,
		autoWatch: false,
		concurrency: Infinity,

		webpack: {
			module: {
				rules: [{
					test: /\.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/
				}, {
					test: /\.tsx?$/,
					loaders: [ 'babel-loader', 'ts-loader' ]
				}]
			},
			resolve: {
				alias: {
					"inferno": resolve('inferno'),
					"inferno-compat": resolve('inferno-compat'),
					"inferno-component": resolve('inferno-component'),
					"inferno-create-class": resolve('inferno-create-class'),
					"inferno-create-element": resolve('inferno-create-element'),
					"inferno-devtools": resolve('inferno-devtools'),
					"inferno-hyperscript": resolve('inferno-hyperscript'),
					"inferno-mobx": resolve('inferno-mobx'),
					"inferno-redux": resolve('inferno-redux'),
					"inferno-router": resolve('inferno-router'),
					"inferno-server": resolve('inferno-server'),
					"inferno-shared": resolve('inferno-shared'),
					"inferno-test-utils": resolve('inferno-test-utils'),
					"inferno-utils": resolve('inferno-utils'),
					"inferno-vnode-flags": resolve('inferno-vnode-flags'),
				},
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
				mainFields: ['inferno:main', 'module', 'main' ]
			},
			performance: {
				hints: false
			}
		}
	});
};
