"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (node, name, val) {

    if (name === "type" && node.tagName === "INPUT") {

        var value = node.value; // value will be lost in IE if type is changed
        node.setAttribute(name, "" + val);
        node.value = value;
    } else {

        node.setAttribute(name, "" + val);
    }
};

module.exports = exports["default"];