var path = require('path');

module.exports = {
  entry: './input',
  output: {
    filename: 'output.js'
  },
  mode: 'development',
  resolve: {
    modules: [path.resolve('../../../../packages'), 'node_modules']
  }
};
