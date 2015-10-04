"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (arr, item) {

    var len = arr.length;

    var i = 0;

    while (i < len) {

        if (arr[i++] == item) {

            return true;
        }
    }

    return false;
};

module.exports = exports["default"];