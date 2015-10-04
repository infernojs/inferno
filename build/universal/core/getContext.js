"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _varsContexts = require("../../vars/contexts");

var _varsContexts2 = _interopRequireDefault(_varsContexts);

exports["default"] = function (dom) {

    for (var i = 0; i < _varsContexts2["default"].length; i++) {

        if (_varsContexts2["default"][i].dom === dom) {

            return _varsContexts2["default"][i];
        }
    }
    return null;
};

module.exports = exports["default"];