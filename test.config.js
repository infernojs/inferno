var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');
var plugins = [
	new webpack.DefinePlugin({
		__VERSION__: JSON.stringify(pkg.version)
	})
];

var srcDir = path.join(__dirname, 'src');
var testDir = path.join(__dirname, 'tests');

module.exports = {
	entry: srcDir,
	cache: true,
	debug: true,
	devtool: 'source-map',
	output: {
		path: testDir,
		filename: 'bundle.js',
		publicPath: 'http://localhost:8080/'
	},
	devServer: {
		contentBase: testDir,
		noInfo: true,
		hot: true,
		inline: true
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: [srcDir, testDir],
				exclude: ['node_modules'],
				loader: 'babel-loader'
			}
		]
	},
	plugins: plugins
};
