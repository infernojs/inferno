"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _updateFragment = require("./updateFragment");

var _updateFragment2 = _interopRequireDefault(_updateFragment);

var _fragmentTypes = require("./fragmentTypes");

var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

var _updateFragmentList = require("./updateFragmentList");

var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);

var _browserEventsClearEventListeners = require("../../browser/events/clearEventListeners");

var _browserEventsClearEventListeners2 = _interopRequireDefault(_browserEventsClearEventListeners);

var _browserEventsAddEventListener = require("../../browser/events/addEventListener");

var _browserEventsAddEventListener2 = _interopRequireDefault(_browserEventsAddEventListener);

exports["default"] = function (context, oldFragment, fragment, parentDom, component) {

    var element = oldFragment.templateElement,
        type = oldFragment.templateType;

    fragment.templateElement = element;
    fragment.templateType = type;

    if (fragment.templateValue !== oldFragment.templateValue) {

        switch (type) {
            case _fragmentTypes2["default"].LIST:
            case _fragmentTypes2["default"].LIST_REPLACE:
                (0, _updateFragmentList2["default"])(context, oldFragment.templateValue, fragment.templateValue, element, component);
                return;
            case _fragmentTypes2["default"].TEXT:
                element.firstChild.nodeValue = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].TEXT_DIRECT:
                element.nodeValue = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].FRAGMENT:
            case _fragmentTypes2["default"].FRAGMENT_REPLACE:
                (0, _updateFragment2["default"])(context, oldFragment.templateValue, fragment.templateValue, element, component);
                return;
            case _fragmentTypes2["default"].ATTR_CLASS:
                element.className = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_CHECKED:
                element.checked = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_SELECTED:
                element.selected = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_DISABLED:
                element.disabled = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_HREF:
                element.href = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_ID:
                element.id = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_VALUE:
                element.value = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_NAME:
                element.name = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_TYPE:
                element.type = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_LABEL:
                element.label = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_PLACEHOLDER:
                element.placeholder = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_STYLE:
                //TODO
                return;
            case _fragmentTypes2["default"].ATTR_WIDTH:
                element.width = fragment.templateValue;
                return;
            case _fragmentTypes2["default"].ATTR_HEIGHT:
                element.height = fragment.templateValue;
                return;
            default:
                if (!element.props) {

                    if (events[type] != null) {

                        (0, _browserEventsClearEventListeners2["default"])(element, type);
                        (0, _browserEventsAddEventListener2["default"])(element, type, fragment.templateValue);
                    } else {

                        element.setAttribute(type, fragment.templateValue);
                    }
                }
                //component prop, update it
                else {
                        //TODO make component props work for single value fragments
                    }
                return;
        }
    }
};

module.exports = exports["default"];