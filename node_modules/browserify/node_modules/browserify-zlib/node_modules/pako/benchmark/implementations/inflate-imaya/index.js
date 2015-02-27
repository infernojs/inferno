'use strict'

var inflateSync = require('./node-zlib').inflateSync;

exports.run = function(data, level) {
  // Compression levels not supported. Use unknown defaults always
  return inflateSync(data.deflateTyped);
}
