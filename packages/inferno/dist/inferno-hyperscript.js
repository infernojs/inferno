/*!
 * inferno-hyperscript v1.0.0-beta7
 * (c) 2016 undefined
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.InfernoHyperscript = factory());
}(this, (function () { 'use strict';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


function isArray(obj) {
    return obj instanceof Array;
}
function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}
function isStringOrNumber(obj) {
    return isString(obj) || isNumber(obj);
}

function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}


function isString(obj) {
    return typeof obj === 'string';
}
function isNumber(obj) {
    return typeof obj === 'number';
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

var VNodeFlags;
(function (VNodeFlags) {
    VNodeFlags[VNodeFlags["Text"] = 1] = "Text";
    VNodeFlags[VNodeFlags["HtmlElement"] = 2] = "HtmlElement";
    VNodeFlags[VNodeFlags["ComponentClass"] = 4] = "ComponentClass";
    VNodeFlags[VNodeFlags["ComponentFunction"] = 8] = "ComponentFunction";
    VNodeFlags[VNodeFlags["HasKeyedChildren"] = 16] = "HasKeyedChildren";
    VNodeFlags[VNodeFlags["HasNonKeyedChildren"] = 32] = "HasNonKeyedChildren";
    VNodeFlags[VNodeFlags["SvgElement"] = 64] = "SvgElement";
    VNodeFlags[VNodeFlags["MediaElement"] = 128] = "MediaElement";
    VNodeFlags[VNodeFlags["InputElement"] = 256] = "InputElement";
    VNodeFlags[VNodeFlags["TextAreaElement"] = 512] = "TextAreaElement";
    VNodeFlags[VNodeFlags["SelectElement"] = 1024] = "SelectElement";
    VNodeFlags[VNodeFlags["Fragment"] = 2048] = "Fragment";
    VNodeFlags[VNodeFlags["Void"] = 4096] = "Void";
    VNodeFlags[VNodeFlags["Element"] = 1986] = "Element";
    VNodeFlags[VNodeFlags["Component"] = 12] = "Component";
})(VNodeFlags || (VNodeFlags = {}));
function _normaliseVNodes(nodes, result, i) {
    for (; i < nodes.length; i++) {
        var n = nodes[i];
        if (!isInvalid(n)) {
            if (Array.isArray(n)) {
                _normaliseVNodes(n, result, 0);
            }
            else {
                if (isStringOrNumber(n)) {
                    n = createTextVNode(n);
                }
                result.push(n);
            }
        }
    }
}
function normaliseVNodes(nodes) {
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (isInvalid(n) || Array.isArray(n)) {
            var result = nodes.slice(0, i);
            _normaliseVNodes(nodes, result, i);
            return result;
        }
        else if (isStringOrNumber(n)) {
            nodes[i] = createTextVNode(n);
        }
    }
    return nodes;
}
function createVNode(flags, type, props, children, key, ref) {
    if (isArray(children)) {
        children = normaliseVNodes(children);
    }
    return {
        children: isUndefined(children) ? null : children,
        dom: null,
        flags: flags || 0,
        key: key === undefined ? null : key,
        props: props || null,
        ref: ref || null,
        type: type
    };
}


function createTextVNode(text) {
    return createVNode(VNodeFlags.Text, null, null, text);
}

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
    _props = _props || {};
    var tag = isString(_tag) ? parseTag(_tag, _props) : _tag;
    var props = {};
    var key = null;
    var ref = null;
    var children = null;
    for (var prop in _props) {
        if (prop === 'key') {
            key = _props[prop];
        }
        else if (prop === 'ref') {
            ref = _props[prop];
        }
        else if (prop.substr(0, 11) === 'onComponent') {
            if (!ref) {
                ref = {};
            }
            ref[prop] = _props[prop];
        }
        else if (prop === 'hooks') {
            ref = _props[prop];
        }
        else if (prop === 'children') {
            children = _props[prop];
        }
        else {
            props[prop] = _props[prop];
        }
    }
    return { tag: tag, props: props, key: key, ref: ref, children: children };
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
    if (isString(tag)) {
        var flags = VNodeFlags.HtmlElement;
        switch (tag) {
            case 'svg':
                flags = VNodeFlags.SvgElement;
                break;
            case 'input':
                flags = VNodeFlags.InputElement;
                break;
            case 'textarea':
                flags = VNodeFlags.TextAreaElement;
                break;
            case 'select':
                flags = VNodeFlags.SelectElement;
                break;
            default:
        }
        return createVNode(flags, tag, props, _children || children, key, ref);
    }
    else {
        var flags$1 = isStatefulComponent(tag) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
        return createVNode(flags$1, tag, props, null, key, ref);
    }
}

return hyperscript$1;

})));
