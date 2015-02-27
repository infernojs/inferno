'use strict'

var pako = require('../../../index.js');

exports.run = function(data, level) {
  return pako.deflate(data.typed, {
    level: level
  });
}
