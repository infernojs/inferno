"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _cfgUnitlessCfg = require("./cfg/unitlessCfg");

var _cfgUnitlessCfg2 = _interopRequireDefault(_cfgUnitlessCfg);

exports["default"] = function (name, value) {

    if (value == null || value === "") {

        return "";
    }

    if (value === 0 || (_cfgUnitlessCfg2["default"][name] || isNaN(value))) {

        return "" + value; // cast to string
    }

    if (typeof value === "string" || value instanceof Date) {

        value = value.trim();
    }

    return value + "px";
};

module.exports = exports["default"];