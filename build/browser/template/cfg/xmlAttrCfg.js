"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _xmlCfg = require("./xmlCfg");

var _xmlCfg2 = _interopRequireDefault(_xmlCfg);

exports["default"] = {
    set: function set(node, key, value) {

        node.setAttributeNS("http://www.w3.org/XML/1998/namespace", _xmlCfg2["default"][key], "" + value);
    },
    remove: function remove(node, key) {

        node.removeAttributeNS("http://www.w3.org/XML/1998/namespace", _xmlCfg2["default"][key]);
    }
};
module.exports = exports["default"];