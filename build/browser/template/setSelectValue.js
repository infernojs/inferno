"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _utilInArray = require("../../util/inArray");

var _utilInArray2 = _interopRequireDefault(_utilInArray);

var _utilIsArray = require("../../util/isArray");

var _utilIsArray2 = _interopRequireDefault(_utilIsArray);

exports["default"] = function (node, value) {

    var isMultiple = (0, _utilIsArray2["default"])(value),
        options = node.options,
        len = options.length;

    var i = 0,
        optionNode = undefined;

    if (value != null) {

        while (i < len) {

            optionNode = options[i++];

            if (isMultiple) {

                optionNode.selected = (0, _utilInArray2["default"])(value, optionNode.value);
            } else {

                optionNode.selected = optionNode.value == value;
            }
        }
    }
};

module.exports = exports["default"];