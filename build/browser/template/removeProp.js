"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeSelectValue = require("./removeSelectValue");

var _removeSelectValue2 = _interopRequireDefault(_removeSelectValue);

var defaultPropVals = {};

function getDefaultPropVal(tag, attrName) {

    var tagAttrs = defaultPropVals[tag] || (defaultPropVals[tag] = {});
    return attrName in tagAttrs ? tagAttrs[attrName] : tagAttrs[attrName] = document.createElement(tag)[attrName];
}

exports["default"] = function (node, name) {

    if (name === "value" && node.tagName === "SELECT") {

        (0, _removeSelectValue2["default"])(node);
    } else {

        node[name] = getDefaultPropVal(node.tagName, name);
    }
};

module.exports = exports["default"];