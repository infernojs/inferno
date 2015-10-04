"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeFragment = require("./removeFragment");

var _removeFragment2 = _interopRequireDefault(_removeFragment);

var _varsRecycledFragments = require("../../vars/recycledFragments");

var _varsRecycledFragments2 = _interopRequireDefault(_varsRecycledFragments);

/**
 * Destroy fragment
 */

exports["default"] = function (context, fragment) {

    var templateKey = undefined;

    //long winded approach, but components have their own context which is how we find their template keys
    if (fragment.component) {

        templateKey = fragment.component.context.fragment.template.key;
    } else {

        templateKey = fragment.template.key;
    }

    if (context.shouldRecycle === true) {

        var toRecycleForKey = _varsRecycledFragments2["default"][templateKey];
        if (!toRecycleForKey) {

            _varsRecycledFragments2["default"][templateKey] = toRecycleForKey = [];
        }
        toRecycleForKey.push(fragment);
    }
};

module.exports = exports["default"];