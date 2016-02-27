const webpack = require('webpack');
const glob = require('glob');

const testFiles = glob.sync('./src/**/*__tests__*/**/*spec.browser.js')
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.jsx.js'))
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.ssr.js'));

module.exports = {
	entry: {
		specs:  ['./config/browser.js'].concat(testFiles),
		playground: './examples/playground/playground.js'
	},
	output: {
		path: './config',
		filename: '[name].js',
		publicPath: 'http://localhost:8080/'
	},
	//devtool: 'inline-source-map',
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules\/dist/,
			loader: 'babel-loader'
		}]
	},
	devServer: {
		contentBase: './',
		port: 8080,
		host: '0.0.0.0',
		noInfo: false,
		hot: true,
		inline: true
	},
	plugins: [
		// By default, webpack does `n=>n` compilation with entry files. This concatenates
		// them into a single chunk.
		new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }),
		new webpack.HotModuleReplacementPlugin()
	]
};
