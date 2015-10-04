/**
 * Simple for - in iteration loop to save some variables 
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (obj, callback) {

    if (obj) {

        var propName = undefined;

        for (propName in obj) {

            callback(propName, obj[propName]);
        }
    }
    return obj;
};

module.exports = exports["default"];