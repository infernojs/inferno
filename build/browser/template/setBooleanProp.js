"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (node, propertyName, propertyValue) {

    node[propertyName] = !!propertyValue;
};

module.exports = exports["default"];