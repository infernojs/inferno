"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _varsRecycledFragments = require("../../vars/recycledFragments");

var _varsRecycledFragments2 = _interopRequireDefault(_varsRecycledFragments);

exports["default"] = function (templateKey) {

    var fragments = _varsRecycledFragments2["default"][templateKey];
    if (!fragments || fragments.length === 0) {

        return null;
    }
    return fragments.pop();
};

module.exports = exports["default"];