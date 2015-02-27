'use strict'

var deflateSync = require('./node-zlib').deflateSync;

exports.run = function(data, level) {
  // Compression levels not supported. Use unknown defaults always
  return deflateSync(data.typed, { level: level });
}
