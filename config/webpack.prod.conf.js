// Webpack config for creating the production bundle.

const webpack = require('webpack');
const path = require('path');

module.exports = {
    // entry points 
    entry: path.join(__dirname, '../src'),
    cache: false,
    debug: false,
    devtool: false,
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'inferno.min.js',
        libraryTarget: 'umd',
        library: 'Inferno'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            include: path.join(__dirname, '../src'),
            loader: 'babel-loader'
        }]
    },
    resolve: {
        extensions: ['', '.js']
    },
    plugins: [
        // optimizations
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            compress: {
			    unused: true,
                dead_code: true,
                warnings: false,
                screw_ie8: true
            }
        }),
        new webpack.DefinePlugin({
            '__DEV__': false,
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ]
};