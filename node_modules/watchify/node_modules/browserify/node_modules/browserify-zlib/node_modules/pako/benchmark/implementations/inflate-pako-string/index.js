'use strict'

var pako = require('../../../index.js');

exports.run = function(data) {
  return pako.inflate(data.deflateString, {
    to: 'string'
  });
}
