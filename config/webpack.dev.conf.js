const webpack = require('webpack');
const glob = require('glob');

const entries = glob.sync('./src/**/*__tests__*/**/*spec.browser.js')
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.jsx.js'))
	.concat(glob.sync('./src/**/*__tests__*/**/*spec.ssr.js'))
	.map(function (file) { return 'mocha!' + file; });

module.exports = {
	entry: {
		specs: entries,
		playground: './examples/playground/playground.js'
	},
	output: {
		path: './config',
		filename: '[name].js',
		publicPath: 'http://localhost:8080/'
	},
	//devtool: 'source-map',
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
		noInfo: true,
		hot: true,
		inline: true,
		proxy: {
			'/': {
				bypass: function (req, res, proxyOptions) {
					return '/config/index.html';
				}
			}
		}
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
};
