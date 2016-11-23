const fs      = require('fs');
const path    = require('path');
const webpack = require('webpack');

const examplesDir = path.join( __dirname, 'src', '_examples');
function getExampleNames() {
	const isDir = ( dirName ) => fs.statSync( dirName ).isDirectory();
	return fs.readdirSync(examplesDir).filter((file) =>  isDir(path.join(examplesDir, file)));
}

function createExampleEntry() {
	const exampleNames = getExampleNames();
	return exampleNames.reduce((entry, name) => Object.assign({}, entry, { [name]: `${examplesDir}/${name}/index.js`}), {});
}

module.exports =  {
	entry: Object.assign({}, createExampleEntry()),
	output: {
		path: path.join(__dirname, 'src', 'assets', 'js', 'examples'),
		filename: 'example--[name].js',
	},
	module: {
		loaders: [
			{
				test: /\.tsx?$/,
				loaders: [
					'babel-loader',
					'ts-loader',
				],
				exclude: /node_modules/,
			},
			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
			},
		],
	},
	plugins: [
		new webpack.optimize.LimitChunkCountPlugin({
			maxChunks: 1,
		}),
	],
};
