"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _uppercasePattern = /([A-Z])/g;

exports["default"] = function (string) {
  return string.replace(_uppercasePattern, "-$1").toLowerCase();
};

module.exports = exports["default"];