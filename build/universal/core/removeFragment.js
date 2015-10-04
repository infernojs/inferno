"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _destroyFragment = require("./destroyFragment");

var _destroyFragment2 = _interopRequireDefault(_destroyFragment);

exports["default"] = function (context, parentDom, item) {

    var domItem = item.dom;
    (0, _destroyFragment2["default"])(context, item);
    parentDom.removeChild(domItem);
};

module.exports = exports["default"];