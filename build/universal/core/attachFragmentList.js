"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _attachFragment = require("./attachFragment");

var _attachFragment2 = _interopRequireDefault(_attachFragment);

exports["default"] = function (context, list, parentDom, component) {

    for (var i = 0; i < list.length; i++) {

        (0, _attachFragment2["default"])(context, list[i], parentDom, component);
    }
};

module.exports = exports["default"];