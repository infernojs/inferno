"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isBrowser = false;

if (typeof window != "undefined") {
  isBrowser = true;
}

exports["default"] = isBrowser;
module.exports = exports["default"];