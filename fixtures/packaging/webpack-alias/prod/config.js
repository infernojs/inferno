var path = require('path');

module.exports = {
  entry: './input',
  output: {
    filename: 'output.js'
  },
  resolve: {
    alias: {
      inferno: 'inferno/dist/inferno.min',
      'inferno-create-element':
        'inferno-create-element/dist/inferno-create-element.min'
    },
    modules: [path.resolve('../../../../packages'), "node_modules"]
  }
};
