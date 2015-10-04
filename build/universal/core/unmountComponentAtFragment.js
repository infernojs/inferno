"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeContext = require("./removeContext");

var _removeContext2 = _interopRequireDefault(_removeContext);

var _badUpdate = require('./badUpdate');

var _badUpdate2 = _interopRequireDefault(_badUpdate);

exports["default"] = function (fragment) {

    var component = fragment.component;
    component.componentWillUnmount();
    (0, _removeContext2["default"])(component.context.dom);
    component.forceUpdate = _badUpdate2["default"];
    component.context = null;
    component = null;
};

module.exports = exports["default"];