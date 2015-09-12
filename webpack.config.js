var webpack = require("webpack");
var PROD = JSON.parse(process.env.PROD_DEV || "0");
var plugins = [
   new webpack.optimize.DedupePlugin()
];

if(PROD) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({minimize: true}));
}

module.exports = {
    context: __dirname + "/src",
    entry: "./Inferno",
    cache: true,
    debug: PROD ? false: true,
    devtool: 'source-map',
    output: {
        path: __dirname + "/dist",
        filename: PROD ? "inferno.min.js" : "inferno.js",
        libraryTarget: "var",
        library: "Inferno"
    },
    devServer: {
        contentBase: "/",
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
