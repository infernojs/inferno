"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeFragment = require("./removeFragment");

var _removeFragment2 = _interopRequireDefault(_removeFragment);

var _removeContext = require("./removeContext");

var _removeContext2 = _interopRequireDefault(_removeContext);

var _getContext = require("./getContext");

var _getContext2 = _interopRequireDefault(_getContext);

var _unmountComponentAtFragment = require("./unmountComponentAtFragment");

var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);

/**
 * Unmount 
 * @param {Element} dom DOM element
 */

exports["default"] = function (dom) {

    var context = (0, _getContext2["default"])(dom);
    if (context !== null) {

        var component = context.fragment.component;
        if (component) {

            (0, _removeFragment2["default"])(context, dom, component.fragment);
            (0, _unmountComponentAtFragment2["default"])(component.fragment);
        } else {

            (0, _removeFragment2["default"])(context, dom, context.fragment);
            (0, _removeContext2["default"])(dom);
        }
    }
};

module.exports = exports["default"];