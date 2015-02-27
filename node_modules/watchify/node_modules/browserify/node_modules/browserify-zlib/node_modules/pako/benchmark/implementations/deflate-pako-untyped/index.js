'use strict'

var pako = require('../../../');
var utils = require('../../../lib/utils/common');

exports.run = function(data, level) {
  utils.setTyped(false);
  pako.deflate(data.typed, {
    level: level
  });
  utils.setTyped(true);
}
