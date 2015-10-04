"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (previousActiveElement) {

    if (previousActiveElement && previousActiveElement != document.body && previousActiveElement != document.activeElement) {

        previousActiveElement.focus();
    }
};

module.exports = exports["default"];