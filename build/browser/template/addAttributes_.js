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

var _DOMAttrCfg = require("./DOMAttrCfg");

var _DOMAttrCfg2 = _interopRequireDefault(_DOMAttrCfg);

exports["default"] = function (node, attrs, component) {

    var attrName = undefined,
        attrVal = undefined;
    for (attrName in attrs) {

        attrVal = attrs[attrName];

        if (_eventsSharedEvents2["default"][attrName] != null) {

            (0, _eventsClearEventListeners2["default"])(node, component, attrName);
            (0, _eventsAddEventListener2["default"])(node, component, attrName, attrVal);
        } else {

            (0, _DOMAttrCfg2["default"])(attrName).set(node, attrName, attrVal);
        }
    }
};

;
module.exports = exports["default"];