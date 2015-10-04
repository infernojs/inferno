"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _getRecycledFragment = require("./getRecycledFragment");

var _getRecycledFragment2 = _interopRequireDefault(_getRecycledFragment);

var _updateFragment = require("./updateFragment");

var _updateFragment2 = _interopRequireDefault(_updateFragment);

var _attachFragmentList = require("./attachFragmentList");

var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);

var _fragmentTypes = require("./fragmentTypes");

var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

var _insertFragment = require("./insertFragment");

var _insertFragment2 = _interopRequireDefault(_insertFragment);

var _browserCoreRender = require("../../browser/core/render");

var _browserCoreRender2 = _interopRequireDefault(_browserCoreRender);

var _otherSetT7Dependency = require("../../other/setT7Dependency");

var _otherSetT7Dependency2 = _interopRequireDefault(_otherSetT7Dependency);

var attachFragment = function attachFragment(context, fragment, parentDom, component, nextFragment, replace) {
    var fragmentComponent = fragment.component;

    if (fragmentComponent) {
        if (typeof fragmentComponent === "function") {
            fragmentComponent = fragment.component = new fragmentComponent(fragment.props);
            fragmentComponent.context = null;
            fragmentComponent.forceUpdate = Inferno.render.bind(null, fragmentComponent.render.bind(fragmentComponent), parentDom, fragmentComponent);
            fragmentComponent.forceUpdate();
        }
        return;
    }

    var recycledFragment = null,
        template = fragment.template,
        templateKey = template.key;

    if (context.shouldRecycle === true) {
        recycledFragment = (0, _getRecycledFragment2["default"])(templateKey);
    }

    if (recycledFragment !== null) {
        (0, _updateFragment2["default"])(context, recycledFragment, fragment, parentDom, component);
    } else {
        //the user can optionally opt out of using the t7 dependency, thus removing the requirement
        //to pass the t7 reference into the template constructor
        if ((0, _otherSetT7Dependency2["default"])()) {
            template(fragment, fragment.t7ref);
        } else {
            template(fragment);
        }
        //if this fragment has a single value, we attach only that value
        if (fragment.templateValue) {
            switch (fragment.templateType) {
                case _fragmentTypes2["default"].LIST:
                    (0, _attachFragmentList2["default"])(context, fragment.templateValue, fragment.templateElement);
                    break;
                case _fragmentTypes2["default"].LIST_REPLACE:
                    attachFragment(context, fragment.templateValue, fragment.templateElement, component);
                    break;
                case _fragmentTypes2["default"].FRAGMENT:
                    //TODO do we need this still?
                    break;
                case _fragmentTypes2["default"].FRAGMENT_REPLACE:
                    attachFragment(context, fragment.templateValue, parentDom, fragment.templateElement, true);
                    fragment.templateElement = fragment.templateValue.dom.parentNode;
                    break;
            }
        } else if (fragment.templateValues) {
            //if the fragment has multiple values, we must loop through them all and attach them
            //pulling this block of code out into its own function caused strange things to happen
            //with performance. it was faster in Gecko but far slower in v8
            for (var i = 0, _length = fragment.templateValues.length; i < _length; i++) {

                var element = fragment.templateElements[i],
                    value = fragment.templateValues[i];
                switch (fragment.templateTypes[i]) {
                    case _fragmentTypes2["default"].LIST:
                        (0, _attachFragmentList2["default"])(context, value, element);
                        break;
                    case _fragmentTypes2["default"].LIST_REPLACE:
                        var nodeList = document.createDocumentFragment(),
                            placeholderNode = fragment.templateElements[i];
                        (0, _attachFragmentList2["default"])(context, value, nodeList);
                        placeholderNode.parentNode.replaceChild(nodeList, placeholderNode);
                        fragment.templateElements[i] = nodeList;
                        break;
                    case _fragmentTypes2["default"].FRAGMENT:
                        //TODO do we need this still?
                        break;
                    case _fragmentTypes2["default"].FRAGMENT_REPLACE:
                        attachFragment(context, value, parentDom, component, element, true);
                        fragment.templateElements[i] = value.dom.parentNode;
                        break;
                }
            }
        }
    }

    (0, _insertFragment2["default"])(context, parentDom, fragment.dom, nextFragment, replace);
};

exports["default"] = attachFragment;
module.exports = exports["default"];