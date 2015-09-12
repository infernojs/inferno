var webpack = require("webpack");
var PROD = JSON.parse(process.env.PROD_DEV || "0");
var path = require('path');
var plugins = [
   new webpack.optimize.DedupePlugin()
];

if(PROD) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}

module.exports = {
    context: path.join(__dirname, "/src"),
    entry: path.join(__dirname, "/src/Inferno"),
    cache: true,
    debug: PROD ? false: true,
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "/dist"),
        filename: PROD ? "inferno.min.js" : "inferno.js",
        libraryTarget: "var",
        library: "Inferno",
        publicPath: 'http://localhost:8080/'
    },
    devServer: {
        contentBase: path.join(__dirname, "/examples"),
        noInfo: true,
        hot: true,
        inline: true
    },
    module: {
      loaders: [
        {
          test: /.*\/src\/.*\.js$/,
          exclude: /.spec.js/,
          loader: 'babel?optional[]=runtime&stage=0'
        }
      ]
    },
    plugins: plugins
};
