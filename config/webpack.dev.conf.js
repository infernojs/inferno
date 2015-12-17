const webpack = require('webpack');
const path = require('path');
const node_modules_dir = path.resolve(__dirname, 'node_modules');

module.exports = {
    // entry points 
    entry: path.resolve(__dirname, '../src'),
    cache: true,
    debug: true,
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'inferno.js',
        libraryTarget: 'umd',
        library: 'Inferno'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: [node_modules_dir],
            loader: 'babel-loader'
        }]
    },
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            '__DEV__': true,
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};