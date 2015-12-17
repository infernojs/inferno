const webpack = require('webpack');
const path = require('path');

module.exports = {
    // entry points 
    entry: path.join(__dirname, '../src'),
    cache: true,
    debug: true,
    output: {
        path: path.join(__dirname, '../dist'),
        filename: 'inferno.js',
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
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            '__DEV__': true,
            'process.env.NODE_ENV': JSON.stringify('development')
        })
    ]
};