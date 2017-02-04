/* tslint:disable */

const webpack = require('webpack');
const glob = require('glob');
const path = require('path');

const testFiles = glob.sync('./packages/*/*__tests__*/**/*.js*');

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
				exclude: /node_modules/,
				query: {
					compact: false
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
		mainFields: [ 'browser', 'module', 'main' ],
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
