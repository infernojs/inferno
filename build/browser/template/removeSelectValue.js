"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (node) {

    var options = node.options,
        len = options.length;
    // skip iteration if no length
    if (len) {

        var i = 0;

        while (i < len) {

            options[i++].selected = false;
        }
    }
};

module.exports = exports["default"];