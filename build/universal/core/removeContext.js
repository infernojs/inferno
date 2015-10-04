"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _varsContexts = require("../../vars/contexts");

var _varsContexts2 = _interopRequireDefault(_varsContexts);

exports["default"] = function (dom) {

    var idx = _varsContexts2["default"].length;

    while (idx--) {

        if (_varsContexts2["default"][idx].dom === dom) {

            _varsContexts2["default"].splice(idx, 1);
            return;
        }
    }
};

module.exports = exports["default"];