/*!
 * inferno-create-element v1.0.0-beta7
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno')) :
    typeof define === 'function' && define.amd ? define(['inferno'], factory) :
    (global.InfernoCreateElement = factory(global.Inferno));
}(this, (function (Inferno) { 'use strict';

Inferno = 'default' in Inferno ? Inferno['default'] : Inferno;

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';






function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}

function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}
function isString(obj) {
    return typeof obj === 'string';
}

function isNull(obj) {
    return obj === null;
}
function isTrue(obj) {
    return obj === true;
}
function isUndefined(obj) {
    return obj === undefined;
}
function isObject(o) {
    return typeof o === 'object';
}

var createVElement = Inferno.createVElement;
var createVComponent = Inferno.createVComponent;
var componentHooks = {
    onComponentWillMount: true,
    onComponentDidMount: true,
    onComponentWillUnmount: true,
    onComponentShouldUpdate: true,
    onComponentWillUpdate: true,
    onComponentDidUpdate: true
};
function createElement$1(name, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    if (isInvalid(name) || isObject(name)) {
        throw new Error('Inferno Error: createElement() name paramater cannot be undefined, null, false or true, It must be a string, class or function.');
    }
    var children = _children;
    var vNode;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        }
        else if (_children.length === 0) {
            children = undefined;
        }
    }
    if (isString(name)) {
        vNode = createVElement(name, null, null, null, null, null);
        for (var prop in props) {
            if (prop === 'key') {
                vNode.key = props.key;
                delete props.key;
            }
            else if (prop === 'children' && isUndefined(children)) {
                vNode.children = props.children; // always favour children args, default to props
            }
            else if (prop === 'ref') {
                vNode.ref = props.ref; // TODO: Verify it works - tests
            }
            else if (isAttrAnEvent(prop)) {
                var lowerCase = prop.toLowerCase();
                if (lowerCase !== prop) {
                    props[prop.toLowerCase()] = props[prop];
                    delete props[prop];
                }
            }
        }
        vNode.props = props;
        if (!isUndefined(children)) {
            vNode.children = children;
        }
    }
    else {
        var hooks;
        vNode = createVComponent(name, null, null, null, null);
        if (!isUndefined(children)) {
            if (!props) {
                props = {};
            }
            props.children = children;
        }
        for (var prop$1 in props) {
            if (componentHooks[prop$1]) {
                if (!hooks) {
                    hooks = {};
                }
                hooks[prop$1] = props[prop$1];
            }
            else if (prop$1 === 'key') {
                vNode.key = props.key;
                delete props.key;
            }
        }
        vNode.props = props;
        if (hooks) {
            vNode.hooks = hooks;
        }
    }
    return vNode;
}

return createElement$1;

})));
