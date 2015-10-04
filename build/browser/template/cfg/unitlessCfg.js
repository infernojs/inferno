"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _utilForIn = require("../../../util/forIn");

var _utilForIn2 = _interopRequireDefault(_utilForIn);

var _prefixes = require("../prefixes");

var _prefixes2 = _interopRequireDefault(_prefixes);

var _prefixKey = require("../prefixKey");

var _prefixKey2 = _interopRequireDefault(_prefixKey);

/**
 * CSS properties which accept numbers but are not in units of "px".
 */
var unitless = {
    animationIterationCount: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    counterRreset: true,
    counterIncrement: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    float: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    pitchRange: true,
    richness: true,
    stress: true,
    tabSize: true,
    volume: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG-related properties
    stopOpacity: true,
    fillOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
};

// convert to vendor prefixed unitless CSS properties
(0, _utilForIn2["default"])(unitless, function (prop, value) {

    _prefixes2["default"].forEach(function (prefix) {

        unitless[(0, _prefixKey2["default"])(prefix, prop)] = value;
    });
});

/**
 * Common snake-cased CSS properties
 */
(0, _utilForIn2["default"])({
    "animation-iteration-count": true,
    "box-flex": true,
    "box-flex-group": true,
    "box-ordinal-group": true,
    "counter-reset": true,
    "counter-increment": true,
    "column-count": true,
    "flex-grow": true,
    "flex-positive": true,
    "flex-shrink": true,
    "flex-negative": true,
    "flex-order": true,
    "font-weight": true,
    "line-clamp": true,
    "line-height": true,

    // SVG-related properties
    "stop-opacity": true,
    "fill-opacity": true,
    "stroke-dashoffset": true,
    "stroke-opacity": true,
    "stroke-width": true
}, function (prop) {

    _prefixes2["default"].forEach(function (prefix, value) {

        unitless[prop] = value;
    });
});

exports["default"] = unitless;
module.exports = exports["default"];