"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _addAttributes = require("./addAttributes");

var _addAttributes2 = _interopRequireDefault(_addAttributes);

var _addProperties = require("./addProperties");

var _addProperties2 = _interopRequireDefault(_addProperties);

var isBrowser = false;

if (typeof window != "undefined") {

    isBrowser = true;
}

exports["default"] = {

    addAttributes: _addAttributes2["default"],
    addProperties: _addProperties2["default"],
    createElement: function createElement(tag) {
        return document.createElement(tag);
    },
    createText: function createText(text) {
        return document.createTextNode(text);
    },
    createEmptyText: function createEmptyText() {
        return document.createTextNode("");
    },
    createFragment: function createFragment() {
        return document.createFragment();
    }
};
module.exports = exports["default"];