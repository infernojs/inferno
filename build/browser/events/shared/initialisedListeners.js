"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var initialisedListeners = false;

exports["default"] = function (value) {
    if (value) {
        initialisedListeners = value;
    } else {
        return initialisedListeners;
    }
};

module.exports = exports["default"];