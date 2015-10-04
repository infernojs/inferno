"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _setSelectValue = require("./setSelectValue");

var _setSelectValue2 = _interopRequireDefault(_setSelectValue);

exports["default"] = function (node, name, value) {

    if (name === "value" && node.tagName === "SELECT") {

        (0, _setSelectValue2["default"])(node, value);
    } else {

        if (node[name] !== value) {

            node[name] = value;
        }
    }
};

module.exports = exports["default"];