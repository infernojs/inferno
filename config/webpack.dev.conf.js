const webpack = require('webpack')

module.exports = {
  entry: 'mocha!./test/bootstrap.js',
  output: {
    path: './test',
    filename: 'specs.js',
    publicPath: 'http://localhost:8080/'
  },
//  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules\/dist/,
      loader: 'babel-loader'
    }]
  },
  devServer: {
    contentBase: './test',
    port: 8080,
    noInfo: true,
	hot: true,
    inline: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
