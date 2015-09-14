var webpack = require("webpack");
var PROD = JSON.parse(process.env.PROD_DEV || "0");
var path = require('path');
var plugins = [
   new webpack.optimize.DedupePlugin(),
   new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
];

if(PROD) {
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        minimize: true,
        compressor: {
          screw_ie8: true,
          warnings: false
        }
      })
    );
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
          test: /\.js$/,
          exclude: ["node_modules"],
          include: path.join(__dirname, "/src"),
          loader: 'babel',
		  query: {
			  optional: ['runtime']
		  }
        }
      ]
    },
    plugins: plugins
};
