var webpack = require("webpack");

module.exports = {
    context: __dirname + "/src",
    entry: "./Inferno",
    cache: true,
    devtool: 'source-map',
    progress: true,
    output: {
        path: __dirname + "/dist",
        filename: "inferno.js"
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
    plugins: [
  	   new webpack.optimize.DedupePlugin()
  	]
};
