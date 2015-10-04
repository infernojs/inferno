"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeAttr = require(".././removeAttr");

var _removeAttr2 = _interopRequireDefault(_removeAttr);

var _setBooleanAttr = require(".././setBooleanAttr");

var _setBooleanAttr2 = _interopRequireDefault(_setBooleanAttr);

exports["default"] = {
    set: _setBooleanAttr2["default"],
    remove: _removeAttr2["default"]
};
module.exports = exports["default"];