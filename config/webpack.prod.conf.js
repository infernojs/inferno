// Webpack config for creating the production bundle.
const webpack = require('webpack');
const path = require('path');
const node_modules_dir = path.resolve(__dirname, 'node_modules');

module.exports = {
    // entry points 
    entry: path.resolve(__dirname, '../src'),
    cache: false,
    debug: false,
    devtool: false,
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'inferno.min.js',
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