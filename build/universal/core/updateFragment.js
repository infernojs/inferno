"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _removeFragment = require("./removeFragment");

var _removeFragment2 = _interopRequireDefault(_removeFragment);

var _attachFragment = require("./attachFragment");

var _attachFragment2 = _interopRequireDefault(_attachFragment);

var _updateFragmentValue = require("./updateFragmentValue");

var _updateFragmentValue2 = _interopRequireDefault(_updateFragmentValue);

var _updateFragmentValues = require("./updateFragmentValues");

var _updateFragmentValues2 = _interopRequireDefault(_updateFragmentValues);

var _unmountComponentAtFragment = require("./unmountComponentAtFragment");

var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);

exports["default"] = function (context, oldFragment, fragment, parentDom, component) {

    if (fragment === null) {

        (0, _removeFragment2["default"])(context, parentDom, oldFragment);
        return;
    }
    if (oldFragment === null) {

        (0, _attachFragment2["default"])(context, fragment, parentDom, component);
        return;
    }
    if (oldFragment.template !== fragment.template) {

        if (oldFragment.component) {

            var oldComponentFragment = oldFragment.component.context.fragment;
            (0, _unmountComponentAtFragment2["default"])(oldFragment);
            (0, _attachFragment2["default"])(context, fragment, parentDom, component, oldComponentFragment, true);
        } else {

            (0, _attachFragment2["default"])(context, fragment, parentDom, component, oldFragment, true);
        }
    } else {

        var fragmentComponent = oldFragment.component;

        //if this fragment is a component
        if (fragmentComponent) {
            fragmentComponent.props = fragment.props;
            fragmentComponent.forceUpdate();
            fragment.component = fragmentComponent;
            return;
        }

        //ensure we reference the new fragment with the old fragment's DOM node
        fragment.dom = oldFragment.dom;

        if (fragment.templateValue) {

            //update a single value in the fragement (templateValue rather than templateValues)
            (0, _updateFragmentValue2["default"])(context, oldFragment, fragment, parentDom, component);
        } else if (fragment.templateValues) {

            //updates all values within the fragment (templateValues is an array)
            (0, _updateFragmentValues2["default"])(context, oldFragment, fragment, parentDom, component);
        }
    }
};

module.exports = exports["default"];