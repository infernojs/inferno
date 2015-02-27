'use strict'

var inflate = require('./rawinflate').RawDeflate.inflate;

exports.run = function(data, level) {
  return inflate(data.deflateRawTyped);
}
