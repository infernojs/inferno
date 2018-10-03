var path = require('path');
var webpack = require('webpack');
var resolve = pkg => path.join(__dirname, '../../packages', pkg, 'src');

module.exports = {
  entry: './app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: __dirname,
    filename: 'bundle.js'
  },
  mode: "none",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          babelrc: false,
          presets: [
            [
              '@babel/preset-env',
              {
                loose: true,
                targets: {
                  browsers: ['ie >= 10', 'safari > 7']
                }
              }
            ]
          ],
          plugins: [['babel-plugin-inferno', { imports: true }], ['@babel/plugin-proposal-class-properties', { loose: true }]]
        }
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            target: 'es5',
            module: 'commonjs'
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      inferno: resolve('inferno'),
      'inferno-compat': resolve('inferno-compat'),
      'inferno-create-class': resolve('inferno-create-class'),
      'inferno-create-element': resolve('inferno-create-element'),
      'inferno-devtools': resolve('inferno-devtools'),
      'inferno-hydrate': resolve('inferno-hydrate'),
      'inferno-extras': resolve('inferno-extras'),
      'inferno-hyperscript': resolve('inferno-hyperscript'),
      'inferno-mobx': resolve('inferno-mobx'),
      'inferno-redux': resolve('inferno-redux'),
      'inferno-router': resolve('inferno-router'),
      'inferno-server': resolve('inferno-server'),
      'inferno-shared': resolve('inferno-shared'),
      'inferno-test-utils': resolve('inferno-test-utils'),
      'inferno-utils': resolve('inferno-utils'),
      'inferno-vnode-flags': resolve('inferno-vnode-flags'),
      'inferno-clone-vnode': resolve('inferno-clone-vnode')
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    mainFields: ['module', 'main']
  },
  plugins: [
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: JSON.stringify('production') } })
  ],
  optimization: {
    minimize: false
  },
  devServer: {
    port: process.env.PORT || 8000
  }
};
