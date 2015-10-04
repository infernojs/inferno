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

var _browserSharedEvents = require("../../browser/shared/events");

var _browserSharedEvents2 = _interopRequireDefault(_browserSharedEvents);

//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
//refactored to by more DRY. although, this causes a significant performance cost
//on the v8 compiler. need to explore how to refactor without introducing this performance cost

exports["default"] = function (context, oldFragment, fragment, parentDom, component) {
    var componentsToUpdate = [],
        i = undefined;

    for (i = 0, length = fragment.templateValues.length; i < length; i++) {

        var element = oldFragment.templateElements[i];
        var type = oldFragment.templateTypes[i];

        fragment.templateElements[i] = element;
        fragment.templateTypes[i] = type;

        if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
            switch (type) {
                case _fragmentTypes2["default"].LIST:
                case _fragmentTypes2["default"].LIST_REPLACE:
                    (0, _updateFragmentList2["default"])(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
                    break;
                case _fragmentTypes2["default"].TEXT:
                    element.firstChild.nodeValue = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].TEXT_DIRECT:
                    element.nodeValue = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].FRAGMENT:
                case _fragmentTypes2["default"].FRAGMENT_REPLACE:
                    (0, _updateFragment2["default"])(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
                    break;
                case _fragmentTypes2["default"].ATTR_CLASS:
                    element.className = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_CHECKED:
                    element.checked = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_SELECTED:
                    element.selected = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_DISABLED:
                    element.disabled = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_HREF:
                    element.href = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_ID:
                    element.id = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_VALUE:
                    element.value = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_NAME:
                    element.name = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_TYPE:
                    element.type = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_LABEL:
                    element.label = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_PLACEHOLDER:
                    element.placeholder = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_STYLE:
                    //TODO
                    break;
                case _fragmentTypes2["default"].ATTR_WIDTH:
                    element.width = fragment.templateValues[i];
                    break;
                case _fragmentTypes2["default"].ATTR_HEIGHT:
                    element.height = fragment.templateValues[i];
                    break;
                default:
                    //custom attribute, so simply setAttribute it
                    if (!element.props) {
                        if (_browserSharedEvents2["default"][type] != null) {
                            (0, _browserEventsClearEventListeners2["default"])(element, type);
                            (0, _browserEventsAddEventListener2["default"])(element, type, fragment.templateValues[i]);
                        } else {
                            element.setAttribute(type, fragment.templateValues[i]);
                        }
                    }
                    //component prop, update it
                    else {
                            element.props[type] = fragment.templateValues[i];
                            var alreadyInQueue = false;
                            for (s = 0; s < componentsToUpdate.length; s++) {
                                if (componentsToUpdate[s] === element) {
                                    alreadyInQueue = true;
                                }
                            }
                            if (alreadyInQueue === false) {
                                componentsToUpdate.push(element);
                            }
                        }
                    break;
            }
        }
    }
    if (componentsToUpdate.length > 0) {
        for (i = 0; i < componentsToUpdate.length; i++) {
            componentsToUpdate[i].forceUpdate();
        }
    }
};

module.exports = exports["default"];