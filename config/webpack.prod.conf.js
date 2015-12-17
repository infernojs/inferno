// Webpack config for creating the production bundle.

const webpack = require('webpack');
const path = require('path');
const webpackConfig = require('./webpack.dev.conf')

module.exports = Object.assign({}, webpackConfig, {

    cache: false,
    debug: false,
    devtool: false,
    hot: false,
    build: true,
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'inferno.min.js',
        libraryTarget: 'umd',
        library: 'Inferno'
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
});