// TODO! Refactor
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports["default"] = function (parentDom, item, nextItem) {

    var domItem = item.dom,
        domRefItem = nextItem && nextItem.dom;

    if (domItem !== domRefItem) {

        if (domRefItem) {

            parentDom.insertBefore(domItem, domRefItem);
        } else {

            parentDom.appendChild(domItem);
        }
    }
};

module.exports = exports["default"];