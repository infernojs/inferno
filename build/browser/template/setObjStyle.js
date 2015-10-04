"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _cleanValues = require("./cleanValues");

var _cleanValues2 = _interopRequireDefault(_cleanValues);

var _utilForIn = require("../../util/forIn");

var _utilForIn2 = _interopRequireDefault(_utilForIn);

var _utilIsArray = require("../../util/isArray");

var _utilIsArray2 = _interopRequireDefault(_utilIsArray);

/**
 * Set CSS styles
 *
 * @param {Object} node
 * @param {String} propertyName
 * @param {String} value
 */

exports["default"] = function (node, propertyName, value) {

    if (typeof value === "string") {

        node.cssText = value;
    } else {
        (function () {

            var idx = 0,
                len = undefined,
                style = node[propertyName];

            (0, _utilForIn2["default"])(value, function (styleName, styleValue) {

                if (styleValue != null) {

                    if ((0, _utilIsArray2["default"])(styleValue)) {

                        for (len = styleValue.length; idx < len; idx++) {

                            style[styleName] = (0, _cleanValues2["default"])(styleName, styleValue[idx]);
                        }
                    } else {

                        style[styleName] = (0, _cleanValues2["default"])(styleName, styleValue);
                    }
                } else {

                    style[styleName] = "";
                }
            });
        })();
    }
};

module.exports = exports["default"];