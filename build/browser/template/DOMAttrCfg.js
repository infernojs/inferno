"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _cfgAttrsCfg = require("./cfg/attrsCfg");

var _cfgAttrsCfg2 = _interopRequireDefault(_cfgAttrsCfg);

var _cfgDefaultAttrCfg = require("./cfg/defaultAttrCfg");

var _cfgDefaultAttrCfg2 = _interopRequireDefault(_cfgDefaultAttrCfg);

exports["default"] = function (attrName) {

    return _cfgAttrsCfg2["default"][attrName] || _cfgDefaultAttrCfg2["default"];
};

module.exports = exports["default"];