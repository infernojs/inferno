"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _eventsSharedEvents = require("../events/shared/events");

var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);

var _eventsClearEventListeners = require("../events/clearEventListeners");

var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);

var _eventsAddEventListener = require("../events/addEventListener");

var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);

var _DOMPropsCfg = require("./DOMPropsCfg");

var _DOMPropsCfg2 = _interopRequireDefault(_DOMPropsCfg);

exports["default"] = function (node, props, component) {
    var propName = undefined,
        propVal = undefined;

    for (propName in props) {
        propVal = props[propName];
        if (_eventsSharedEvents2["default"][propName] != null) {
            (0, _eventsClearEventListeners2["default"])(node, propName);
            (0, _eventsAddEventListener2["default"])(node, propName, propVal);
        } else {
            (0, _DOMPropsCfg2["default"])(propName).set(node, propName, propVal);
        }
    }
};

;
module.exports = exports["default"];