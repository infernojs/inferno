var webpack = require('webpack');
var pkg = require('./package.json');
var PROD = JSON.parse(process.env.PROD_DEV || '0');
var path = require('path');
var plugins = [
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.OccurenceOrderPlugin(),
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
		__VERSION__: JSON.stringify(pkg.version)
	})
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

if (PROD) {
	plugins.push(
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
		new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            compress: {
                'unused': true,
                'dead_code': true,
                warnings: false,
                screw_ie8: true
            }
        })
	);
}

module.exports = {
	entry: path.join(__dirname, 'src'),
	cache: true,
	debug: PROD ? false: true,
	devtool: 'source-map',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: PROD ? 'inferno.min.js' : 'inferno.js',
		libraryTarget: 'umd',
		library: 'Inferno',
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: ['node_modules'],
				include: path.join(__dirname, 'src'),
				loader: 'babel',
				query: {
					presets: ['es2015', 'stage-0'],
					plugins: ['inferno', 'syntax-jsx']
				}
			}
		]
	},
	plugins: plugins
};
