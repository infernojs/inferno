/* tslint:disable */

const webpack = require('webpack');
const glob = require('glob');
const path = require('path');

const DEVSERVER_FILTER = process.env.DEVSERVER_FILTER || '*';
const testFiles = glob.sync(`./packages/${DEVSERVER_FILTER}/*__tests__*/**/*.js*`);
console.log({ DEVSERVER_FILTER });

module.exports = {
	watch: true,
	entry: testFiles,
	// devtool: 'source-map',
	output: {
		filename: '__spec-build.js'
	},
	performance: {
		hints: false
	},
	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				query: {
					// TODO: This is workaround because some of devDeps are shipping ES6...
					babelrc: false,
					presets: [
						[ 'es2015', { loose: true, modules: false }],
						'stage-2'
					],
					plugins: [
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
	devServer: {
		contentBase: './',
		port: 8080,
		noInfo: false,
		hot: true,
		inline: true,
		historyApiFallback: {
			index: '/config/index.html'
		}
	},
	resolve: {
		extensions: [ '.js', '.jsx' ],
		mainFields: [ 'browser', 'inferno:main', 'module', 'main' ]
	},
	plugins: [
		// By default, webpack does `n=>n` compilation with entry files. This concatenates
		// them into a single chunk.
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1
		}),
		new webpack.HotModuleReplacementPlugin()
	]
};
