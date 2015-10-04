"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _destroyFragment = require("./destroyFragment");

var _destroyFragment2 = _interopRequireDefault(_destroyFragment);

exports["default"] = function (context, parentDom, domNode, nextFragment, replace) {

    var noDestroy = false;
    if (nextFragment) {

        var domNextFragment = nextFragment.dom;
        if (!domNextFragment) {

            domNextFragment = nextFragment;
            parentDom = domNextFragment.parentNode;
            noDestroy = true;
        }
        if (replace) {

            if (noDestroy === false) {

                (0, _destroyFragment2["default"])(context, nextFragment);
            }
            parentDom.replaceChild(domNode, domNextFragment);
        } else {

            parentDom.insertBefore(domNode, domNextFragment);
        }
    } else {

        parentDom.appendChild(domNode);
    }
};

module.exports = exports["default"];