"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var _arguments = arguments;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _createFragment = require("./createFragment");

var _createFragment2 = _interopRequireDefault(_createFragment);

var _fragmentTypes = require("./fragmentTypes");

var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

var _browserTemplateAddAttributes = require("../../browser/template/addAttributes");

var _browserTemplateAddAttributes2 = _interopRequireDefault(_browserTemplateAddAttributes);

//this was added so vdom lovers can still use their beloved vdom API from React :)
//this won't be performant and should only be used for prototyping/testing/experimenting
//note, props/attrs will not update with this current implementation

var templateKeyMap = new WeakMap();

exports["default"] = function (tag, props) {

    for (var _len = _arguments.length, _children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {

        _children[_key - 2] = _arguments[_key];
    }

    console.warn("Inferno.vdom.createElement() is purely experimental, " + "it's performance will be poor and attributes/properities will not update (as of yet)");

    if (children.length === 1) {

        children = children[0];
    }
    //we need to create a template for this
    function template(fragment) {

        var root = document.createElement(tag);
        fragment.templateElement = root;

        if (typeof children !== "object") {

            fragment.templateType = _fragmentTypes2["default"].TEXT;
            root.textContent = children;
        } else {

            if (children instanceof Array) {

                fragment.templateType = _fragmentTypes2["default"].LIST;
            } else {

                fragment.templateType = _fragmentTypes2["default"].FRAGMENT;
            }
        }

        if (props) {

            Inferno.template.addAttributes(root, props);
        }
        fragment.dom = root;
    }

    return (0, _createFragment2["default"])(children, template);
};

module.exports = exports["default"];