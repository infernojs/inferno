var webpack = require("webpack");

module.exports = {
    context: __dirname + "/tests",
    entry: "./tests",
    cache: true,
    debug: true,
    devtool: 'source-map',
    output: {
        path: __dirname + "/tests",
        filename: "test.js",
    },
    devServer: {
        contentBase: "/",
        noInfo: true,
        inline: true
    },
    module: {
      loaders: [
        {
          test: /.*\/src\/.*\.js$/,
          exclude: /.spec.js/,
          loader: 'babel'
        }
      ]
    }
};
