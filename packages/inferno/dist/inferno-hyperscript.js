/*!
 * inferno-hyperscript v1.0.0-beta7
 * (c) 2016 undefined
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno')) :
    typeof define === 'function' && define.amd ? define(['inferno'], factory) :
    (global.InfernoHyperscript = factory(global.Inferno));
}(this, (function (Inferno) { 'use strict';

Inferno = 'default' in Inferno ? Inferno['default'] : Inferno;

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


function isArray(obj) {
    return obj instanceof Array;
}

function isStringOrNumber(obj) {
    return isString(obj) || isNumber(obj);
}




function isString(obj) {
    return typeof obj === 'string';
}
function isNumber(obj) {
    return typeof obj === 'number';
}


function isUndefined(obj) {
    return obj === undefined;
}

var UNKNOWN = 5;

var createVElement = Inferno.createVElement;
var createVComponent = Inferno.createVComponent;
var classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;
var notClassId = /^\.|#/;
function parseTag(tag, props) {
    if (!tag) {
        return 'div';
    }
    var noId = props && isUndefined(props.id);
    var tagParts = tag.split(classIdSplit);
    var tagName = null;
    if (notClassId.test(tagParts[1])) {
        tagName = "div";
    }
    var classes;
    for (var i = 0; i < tagParts.length; i++) {
        var part = tagParts[i];
        if (!part) {
            continue;
        }
        var type = part.charAt(0);
        if (!tagName) {
            tagName = part;
        }
        else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        }
        else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }
    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }
        props.className = classes.join(' ');
    }
    return tagName ? tagName.toLowerCase() : "div";
}
function isChildren(x) {
    return isStringOrNumber(x) || (x && isArray(x));
}
function extractProps(_props, _tag) {
    var tag = isString(_tag) ? parseTag(_tag, _props) : _tag;
    var props = {};
    var key = null;
    var ref = null;
    var hooks = null;
    var children = null;
    var childrenType = UNKNOWN;
    for (var prop in _props) {
        if (prop === 'key') {
            key = _props[prop];
        }
        else if (prop === 'ref') {
            ref = _props[prop];
        }
        else if (prop.substr(0, 11) === 'onComponent') {
            if (!hooks) {
                hooks = {};
            }
            hooks[prop] = _props[prop];
        }
        else if (prop === 'hooks') {
            hooks = _props[prop];
        }
        else if (prop === 'children') {
            children = _props[prop];
        }
        else if (prop === 'childrenType') {
            childrenType = _props[prop];
        }
        else {
            props[prop] = _props[prop];
        }
    }
    return { tag: tag, props: props, key: key, ref: ref, children: children, childrenType: childrenType, hooks: hooks };
}
function hyperscript$1(_tag, _props, _children, _childrenType) {
    // If a child array or text node are passed as the second argument, shift them
    if (!_children && isChildren(_props)) {
        _children = _props;
        _props = {};
    }
    var ref$1 = extractProps(_props, _tag);
    var tag = ref$1.tag;
    var props = ref$1.props;
    var key = ref$1.key;
    var ref = ref$1.ref;
    var children = ref$1.children;
    var childrenType = ref$1.childrenType;
    var hooks = ref$1.hooks;
    if (isString(tag)) {
        return createVElement(tag, props, _children || children, key, ref, _childrenType || childrenType);
    }
    else {
        return createVComponent(tag, props, key, hooks, ref);
    }
}

return hyperscript$1;

})));
