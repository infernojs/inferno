"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _sharedInitialisedListeners = require("./shared/initialisedListeners");

var _sharedInitialisedListeners2 = _interopRequireDefault(_sharedInitialisedListeners);

var _sharedRootListeners = require("./shared/rootListeners");

var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);

exports["default"] = function () {
    // has to do this 'hack' else it will become read-only
    (0, _sharedInitialisedListeners2["default"])(true);

    // FIX ME! Take this out into it's own module and do some event cleanup along the road?
    document.addEventListener("click", function (e) {
        for (var i = 0; i < _sharedRootListeners2["default"].click.length; i++) {
            if (_sharedRootListeners2["default"].click[i].target === e.target) {
                _sharedRootListeners2["default"].click[i].callback(e);
            }
        }
    });
};

module.exports = exports["default"];