var path = require('path');

module.exports = {
	context: path.join(__dirname),
	entry: path.join(__dirname, '/src/inferno'),
	cache: true,
	debug: true,
	devtool: 'source-map',
	output: {
		path: __dirname + '/tests',
		filename: 'bundle.js',
		publicPath: 'http://localhost:8080/'
	},
	devServer: {
		contentBase: path.join(__dirname, '/tests'),
		noInfo: true,
		hot: true,
		inline: true
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				include: path.join(__dirname, '/src'),
				exclude: ['node_modules'],
				loader: 'babel'
			}
		]
	}
};
