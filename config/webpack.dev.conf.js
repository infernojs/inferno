const webpack = require('webpack');
const glob = require('glob');

const entries = glob.sync('./src/**/*__tests__*/**/*spec.browser.js')
    .concat(glob.sync('./src/**/*__tests__*/**/*spec.jsx.js'))
	//.concat(glob.sync('./test/specs/no-jsx/**/*.spec.js'))
    //	.concat(glob.sync('./test/specs/no-jsx/**/*.spec.server.js'))
	//.concat(glob.sync('./test/**/*.spec.browser.js'))
    //.concat(glob.sync('./test/specs/jsx/**/*.spec.server.js'))
    //.concat(glob.sync('./test/specs/jsx/**/*.spec.js'))
	.map(function(file) { return 'mocha!' + file; });

module.exports = {
  entry: entries,
  output: {
    path: './config',
    filename: 'specs.js',
    publicPath: 'http://localhost:8080/'
  },
  //devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules\/dist/,
      loader: 'babel-loader'
    }]
  },
  devServer: {
    contentBase: './',
    port: 8080,
    noInfo: true,
	hot: true,
    inline: true,
    proxy: {
      '/': {
        bypass: function(req, res, proxyOptions) {
          return '/config/index.html';
        }
      }
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
}
