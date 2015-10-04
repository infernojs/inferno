"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _eventsAddRootListener = require("../events/addRootListener");

var _eventsAddRootListener2 = _interopRequireDefault(_eventsAddRootListener);

var _eventsSharedInitialisedListeners = require("../events/shared/initialisedListeners");

var _eventsSharedInitialisedListeners2 = _interopRequireDefault(_eventsSharedInitialisedListeners);

var _varsContexts = require("../../vars/contexts");

var _varsContexts2 = _interopRequireDefault(_varsContexts);

var _universalCoreGetContext = require("../../universal/core/getContext");

var _universalCoreGetContext2 = _interopRequireDefault(_universalCoreGetContext);

var _universalCoreAttachFragment = require("../../universal/core/attachFragment");

var _universalCoreAttachFragment2 = _interopRequireDefault(_universalCoreAttachFragment);

var _universalCoreUpdateFragment = require("../../universal/core/updateFragment");

var _universalCoreUpdateFragment2 = _interopRequireDefault(_universalCoreUpdateFragment);

var _universalCoreMaintainFocus = require("../../universal/core/maintainFocus");

var _universalCoreMaintainFocus2 = _interopRequireDefault(_universalCoreMaintainFocus);

exports["default"] = function (fragment, dom, component) {

    var context, generatedFragment;
    if (component === undefined) {
        if ((0, _eventsSharedInitialisedListeners2["default"])() === false) {
            (0, _eventsAddRootListener2["default"])();
            (0, _eventsSharedInitialisedListeners2["default"])(true);
        }

        context = (0, _universalCoreGetContext2["default"])(dom);

        if (context == null) {

            context = {
                fragment: fragment,
                dom: dom,
                shouldRecycle: true
            };
            (0, _universalCoreAttachFragment2["default"])(context, fragment, dom, component);
            _varsContexts2["default"].push(context);
        } else {

            var activeElement = document.activeElement;
            (0, _universalCoreUpdateFragment2["default"])(context, context.fragment, fragment, dom, component, false);
            context.fragment = fragment;

            // TODO! Move to moveFragment()
            (0, _universalCoreMaintainFocus2["default"])(activeElement);
        }
    } else {

        if (component.context == null) {

            generatedFragment = fragment();
            context = component.context = {
                fragment: generatedFragment,
                dom: dom,
                shouldRecycle: true
            };
            component.componentWillMount();
            (0, _universalCoreAttachFragment2["default"])(context, generatedFragment, dom, component);
            component.componentDidMount();
        } else {

            generatedFragment = fragment();
            context = component.context;
            (0, _universalCoreUpdateFragment2["default"])(context, context.fragment, generatedFragment, dom, component, false);
            context.fragment = generatedFragment;
        }
    }
};

module.exports = exports["default"];