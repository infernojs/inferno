'use strict'

var deflate = require('./rawdeflate').RawDeflate.deflate;

exports.run = function(data, level) {
  return deflate(data.typed, 0);
}
