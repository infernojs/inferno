"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _cfgPropsCfg = require("./cfg/propsCfg");

var _cfgPropsCfg2 = _interopRequireDefault(_cfgPropsCfg);

var _cfgDefaultPropCfg = require("./cfg/defaultPropCfg");

var _cfgDefaultPropCfg2 = _interopRequireDefault(_cfgDefaultPropCfg);

exports["default"] = function (propName) {

    return _cfgPropsCfg2["default"][propName] || _cfgDefaultPropCfg2["default"];
};

module.exports = exports["default"];