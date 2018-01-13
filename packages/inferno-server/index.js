'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/index.cjs.min.js');
} else {
  console.info("Inferno server is in development mode.");

  module.exports = require('./dist/index.cjs.js');
}
