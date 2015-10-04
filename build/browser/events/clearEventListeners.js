"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _sharedRootlisteners = require("./shared/rootlisteners");

var _sharedRootlisteners2 = _interopRequireDefault(_sharedRootlisteners);

var _sharedEvents = require("./shared/events");

var _sharedEvents2 = _interopRequireDefault(_sharedEvents);

exports["default"] = function (parentDom, listenerName) {
    var listeners = _sharedRootlisteners2["default"][_sharedEvents2["default"][listenerName]],
        index = 0;

    while (index < listeners.length) {
        if (listeners[index].target === parentDom) {
            listeners.splice(index, 1);
            index = 0;
        }
        index++;
    }
};

module.exports = exports["default"];