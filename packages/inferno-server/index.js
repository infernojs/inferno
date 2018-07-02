'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/index.cjs.min.js');
} else {
  module.exports = require('./dist/index.cjs.js');
}
