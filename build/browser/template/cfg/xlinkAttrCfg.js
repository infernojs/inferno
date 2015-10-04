"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _xlinkCfg = require("./xlinkCfg");

var _xlinkCfg2 = _interopRequireDefault(_xlinkCfg);

exports["default"] = {
    set: function set(node, key, value) {

        node.setAttributeNS("http://www.w3.org/1999/xlink", _xlinkCfg2["default"][key], "" + value);
    },
    remove: function remove(node, key) {

        node.removeAttributeNS("http://www.w3.org/1999/xlink", _xlinkCfg2["default"][key]);
    }
};
module.exports = exports["default"];