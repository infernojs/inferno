'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/index.min.cjs');
} else {
  module.exports = require('./dist/index.cjs');
}

module.exports.default = module.exports;
