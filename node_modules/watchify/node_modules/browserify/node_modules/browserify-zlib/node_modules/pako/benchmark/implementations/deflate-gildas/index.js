'use strict'

var deflate = require('./deflate');

exports.run = function(data, level) {
  return deflate(data.typed, level);
}
