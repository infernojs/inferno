"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeFragment = require("./removeFragment");

var _removeFragment2 = _interopRequireDefault(_removeFragment);

exports["default"] = function (context, parentDom, fragments, i, to) {

    for (; i < to; i++) {

        (0, _removeFragment2["default"])(context, parentDom, fragments[i]);
    }
};

module.exports = exports["default"];