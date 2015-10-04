"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _sharedRootListeners = require("./shared/rootListeners");

var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);

var _sharedEvents = require("./shared/events");

var _sharedEvents2 = _interopRequireDefault(_sharedEvents);

exports["default"] = function (parentDom, listenerName, callback) {

    _sharedRootListeners2["default"][_sharedEvents2["default"][listenerName]].push({
        target: parentDom,
        callback: callback
    });
};

module.exports = exports["default"];