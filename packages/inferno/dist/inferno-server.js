/*!
 * inferno-server v1.0.0-beta38
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('./inferno'), require('stream')) :
	typeof define === 'function' && define.amd ? define(['inferno', 'stream'], factory) :
	(global.Inferno = global.Inferno || {}, global.Inferno.Server = factory(global.Inferno,global.stream));
}(this, (function (inferno,stream) { 'use strict';

var ecapeCharacters = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '&': '&amp;'
};
var escapeChar = function (char) { return ecapeCharacters[char] || char; };
function escapeText(text) {
    return String(text).replace(/[<>"'&]/g, escapeChar);
}
var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
function toHyphenCase(str) {
    return str.replace(uppercasePattern, '-$&').toLowerCase().replace(msPattern, '-ms-');
}
var voidElements = {
    area: true,
    base: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
};
function isVoidElement(str) {
    return !!voidElements[str];
}

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
var isArray = Array.isArray;
function isStatefulComponent(o) {
    return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}
function isStringOrNumber(obj) {
    return isString(obj) || isNumber(obj);
}
function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
}
function isInvalid(obj) {
    return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}
function isFunction(obj) {
    return typeof obj === 'function';
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

function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
}

var options = {
    recyclingEnabled: true,
    findDOMNodeEnabled: false,
    roots: null,
    createVNode: null,
    beforeRender: null,
    afterRender: null,
    afterMount: null,
    afterUpdate: null,
    beforeUnmount: null
};

function createVNode(flags, type, props, children, events, key, ref, noNormalise) {
    if (flags & 16 /* ComponentUnknown */) {
        flags = isStatefulComponent(type) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
    }
    var vNode = {
        children: isUndefined(children) ? null : children,
        dom: null,
        events: events || null,
        flags: flags || 0,
        key: key === undefined ? null : key,
        props: props || null,
        ref: ref || null,
        type: type
    };
    if (!noNormalise) {
        normalize(vNode);
    }
    if (options.createVNode) {
        options.createVNode(vNode);
    }
    return vNode;
}
function cloneVNode(vNodeToClone, props) {
    var _children = [], len = arguments.length - 2;
    while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

    var children = _children;
    if (_children.length > 0 && !isNull(_children[0])) {
        if (!props) {
            props = {};
        }
        if (_children.length === 1) {
            children = _children[0];
        }
        if (isUndefined(props.children)) {
            props.children = children;
        }
        else {
            if (isArray(children)) {
                if (isArray(props.children)) {
                    props.children = props.children.concat(children);
                }
                else {
                    props.children = [props.children].concat(children);
                }
            }
            else {
                if (isArray(props.children)) {
                    props.children.push(children);
                }
                else {
                    props.children = [props.children];
                    props.children.push(children);
                }
            }
        }
    }
    children = null;
    var flags = vNodeToClone.flags;
    var events = vNodeToClone.events || (props && props.events) || null;
    var newVNode;
    if (isArray(vNodeToClone)) {
        newVNode = vNodeToClone.map(function (vNode) { return cloneVNode(vNode); });
    }
    else if (isNullOrUndef(props) && isNullOrUndef(children)) {
        newVNode = Object.assign({}, vNodeToClone);
    }
    else {
        var key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : props.key;
        var ref = vNodeToClone.ref || props.ref;
        if (flags & 28 /* Component */) {
            newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), null, events, key, ref, true);
        }
        else if (flags & 3970 /* Element */) {
            children = (props && props.children) || vNodeToClone.children;
            newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), children, events, key, ref, !children);
        }
    }
    if (flags & 28 /* Component */) {
        var newProps = newVNode.props;
        if (newProps) {
            var newChildren = newProps.children;
            // we need to also clone component children that are in props
            // as the children may also have been hoisted
            if (newChildren) {
                if (isArray(newChildren)) {
                    for (var i = 0; i < newChildren.length; i++) {
                        var child = newChildren[i];
                        if (!isInvalid(child) && isVNode(child)) {
                            newProps.children[i] = cloneVNode(child);
                        }
                    }
                }
                else if (isVNode(newChildren)) {
                    newProps.children = cloneVNode(newChildren);
                }
            }
        }
        newVNode.children = null;
    }
    newVNode.dom = null;
    return newVNode;
}

function createTextVNode(text) {
    return createVNode(1 /* Text */, null, null, text);
}
function isVNode(o) {
    return !!o.flags;
}

function applyKeyIfMissing(index, vNode) {
    if (isNull(vNode.key)) {
        vNode.key = "." + index;
    }
    return vNode;
}
function _normalizeVNodes(nodes, result, i) {
    for (; i < nodes.length; i++) {
        var n = nodes[i];
        if (!isInvalid(n)) {
            if (Array.isArray(n)) {
                _normalizeVNodes(n, result, 0);
            }
            else {
                if (isStringOrNumber(n)) {
                    n = createTextVNode(n);
                }
                else if (isVNode(n) && n.dom) {
                    n = cloneVNode(n);
                }
                result.push((applyKeyIfMissing(i, n)));
            }
        }
    }
}
function normalizeVNodes(nodes) {
    var newNodes;
    // we assign $ which basically means we've flagged this array for future note
    // if it comes back again, we need to clone it, as people are using it
    // in an immutable way
    // tslint:disable
    if (nodes['$']) {
        nodes = nodes.slice();
    }
    else {
        nodes['$'] = true;
    }
    // tslint:enable
    for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (isInvalid(n) || Array.isArray(n)) {
            var result = (newNodes || nodes).slice(0, i);
            _normalizeVNodes(nodes, result, i);
            return result;
        }
        else if (isStringOrNumber(n)) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(applyKeyIfMissing(i, createTextVNode(n)));
        }
        else if ((isVNode(n) && n.dom) || (isNull(n.key) && !(n.flags & 64 /* HasNonKeyedChildren */))) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
        }
        else if (newNodes) {
            newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
        }
    }
    return newNodes || nodes;
}
function normalizeChildren(children) {
    if (isArray(children)) {
        return normalizeVNodes(children);
    }
    else if (isVNode(children) && children.dom) {
        return cloneVNode(children);
    }
    return children;
}
function normalizeProps(vNode, props, children) {
    if (!(vNode.flags & 28 /* Component */) && isNullOrUndef(children) && !isNullOrUndef(props.children)) {
        vNode.children = props.children;
    }
    if (props.ref) {
        vNode.ref = props.ref;
    }
    if (props.events) {
        vNode.events = props.events;
    }
    if (!isNullOrUndef(props.key)) {
        vNode.key = props.key;
    }
}
function copyPropsTo(copyFrom, copyTo) {
    for (var prop in copyFrom) {
        if (isUndefined(copyTo[prop])) {
            copyTo[prop] = copyFrom[prop];
        }
    }
}
function normalizeElement(type, vNode) {
    if (type === 'svg') {
        vNode.flags = 128 /* SvgElement */;
    }
    else if (type === 'input') {
        vNode.flags = 512 /* InputElement */;
    }
    else if (type === 'select') {
        vNode.flags = 2048 /* SelectElement */;
    }
    else if (type === 'textarea') {
        vNode.flags = 1024 /* TextareaElement */;
    }
    else if (type === 'media') {
        vNode.flags = 256 /* MediaElement */;
    }
    else {
        vNode.flags = 2 /* HtmlElement */;
    }
}
function normalize(vNode) {
    var props = vNode.props;
    var type = vNode.type;
    var children = vNode.children;
    // convert a wrongly created type back to element
    if (isString(type) && (vNode.flags & 28 /* Component */)) {
        normalizeElement(type, vNode);
        if (props.children) {
            vNode.children = props.children;
            children = props.children;
        }
    }
    if (props) {
        normalizeProps(vNode, props, children);
    }
    if (!isInvalid(children)) {
        vNode.children = normalizeChildren(children);
    }
    if (props && !isInvalid(props.children)) {
        props.children = normalizeChildren(props.children);
    }
}

function constructDefaults(string, object, value) {
    /* eslint no-return-assign: 0 */
    string.split(',').forEach(function (i) { return object[i] = value; });
}
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';

var strictProps = {};
var booleanProps = {};
var namespaces = {};
var isUnitlessNumber = {};
var skipProps = {};



var delegatedProps = {};
constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,defaultValue,defaultChecked', strictProps, true);
constructDefaults('children,ref,key,selected,checked,value,multiple', skipProps, true);
constructDefaults('onClick,onMouseDown,onMouseUp,onMouseMove,onSubmit,onDblClick,onKeyDown,onKeyUp,onKeyPress', delegatedProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readOnly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

function renderStylesToString(styles) {
    if (isStringOrNumber(styles)) {
        return styles;
    }
    else {
        var renderedString = '';
        for (var styleName in styles) {
            var value = styles[styleName];
            var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';
            if (!isNullOrUndef(value)) {
                renderedString += (toHyphenCase(styleName)) + ":" + (escapeText(value)) + px + ";";
            }
        }
        return renderedString;
    }
}
function renderVNodeToString(vNode, context, firstChild) {
    var flags = vNode.flags;
    var type = vNode.type;
    var props = vNode.props || inferno.EMPTY_OBJ;
    var children = vNode.children;
    if (flags & 28 /* Component */) {
        var isClass = flags & 4;
        // Primitive node doesn't have defaultProps, only Component
        if (!isNullOrUndef(type.defaultProps)) {
            copyPropsTo(type.defaultProps, props);
            vNode.props = props;
        }
        if (isClass) {
            var instance = new type(props, context);
            var childContext = instance.getChildContext();
            if (!isNullOrUndef(childContext)) {
                context = Object.assign({}, context, childContext);
            }
            if (instance.props === inferno.EMPTY_OBJ) {
                instance.props = props;
            }
            instance.context = context;
            instance._pendingSetState = true;
            instance._unmounted = false;
            if (isFunction(instance.componentWillMount)) {
                instance.componentWillMount();
            }
            var nextVNode = instance.render(props, vNode.context);
            instance._pendingSetState = false;
            // In case render returns invalid stuff
            if (isInvalid(nextVNode)) {
                return '<!--!-->';
            }
            return renderVNodeToString(nextVNode, context, true);
        }
        else {
            var nextVNode$1 = type(props, context);
            if (isInvalid(nextVNode$1)) {
                return '<!--!-->';
            }
            return renderVNodeToString(nextVNode$1, context, true);
        }
    }
    else if (flags & 3970 /* Element */) {
        var renderedString = "<" + type;
        var html;
        var isVoidElement$$1 = isVoidElement(type);
        if (!isNull(props)) {
            for (var prop in props) {
                var value = props[prop];
                if (prop === 'dangerouslySetInnerHTML') {
                    html = value.__html;
                }
                else if (prop === 'style') {
                    renderedString += " style=\"" + (renderStylesToString(props.style)) + "\"";
                }
                else if (prop === 'className' && !isNullOrUndef(value)) {
                    renderedString += " class=\"" + (escapeText(value)) + "\"";
                }
                else {
                    if (isStringOrNumber(value)) {
                        renderedString += " " + prop + "=\"" + (escapeText(value)) + "\"";
                    }
                    else if (isTrue(value)) {
                        renderedString += " " + prop;
                    }
                }
            }
        }
        if (isVoidElement$$1) {
            renderedString += ">";
        }
        else {
            renderedString += ">";
            if (!isInvalid(children)) {
                if (isArray(children)) {
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (!isInvalid(child)) {
                            renderedString += renderVNodeToString(child, context, i === 0);
                        }
                    }
                }
                else if (isStringOrNumber(children)) {
                    renderedString += escapeText(children);
                }
                else {
                    renderedString += renderVNodeToString(children, context, true);
                }
            }
            else if (html) {
                renderedString += html;
            }
            if (!isVoidElement$$1) {
                renderedString += "</" + type + ">";
            }
        }
        return renderedString;
    }
    else if (flags & 1 /* Text */) {
        return (firstChild ? '' : '<!---->') + escapeText(children);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            if (typeof vNode === 'object') {
                throwError(("renderToString() received an object that's not a valid VNode, you should stringify it first. Object: \"" + (JSON.stringify(vNode)) + "\"."));
            }
            else {
                throwError(("renderToString() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode) + "\"."));
            }
        }
        throwError();
    }
}
function renderToString(input) {
    return renderVNodeToString(input, {}, true);
}
function renderToStaticMarkup(input) {
    return renderVNodeToString(input, {}, true);
}

function renderStyleToString(style) {
    if (isStringOrNumber(style)) {
        return style;
    }
    else {
        var styles = [];
        for (var styleName in style) {
            var value = style[styleName];
            var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';
            if (!isNullOrUndef(value)) {
                styles.push(((toHyphenCase(styleName)) + ":" + (escapeText(value)) + px + ";"));
            }
        }
        return styles.join();
    }
}
function renderAttributes(props) {
    var outputAttrs = [];
    var propsKeys = (props && Object.keys(props)) || [];
    propsKeys.forEach(function (propKey, i) {
        var value = props[propKey];
        switch (propKey) {
            case 'dangerouslySetInnerHTML':
            case 'className':
            case 'style':
                return;
            default:
                if (isStringOrNumber(value)) {
                    outputAttrs.push(escapeText(propKey) + '="' + escapeText(value) + '"');
                }
                else if (isTrue(value)) {
                    outputAttrs.push(escapeText(propKey));
                }
        }
    });
    return outputAttrs;
}

var RenderStream = (function (Readable$$1) {
    function RenderStream(initNode, staticMarkup) {
        Readable$$1.call(this);
        this.started = false;
        this.initNode = initNode;
        this.staticMarkup = staticMarkup;
    }

    if ( Readable$$1 ) RenderStream.__proto__ = Readable$$1;
    RenderStream.prototype = Object.create( Readable$$1 && Readable$$1.prototype );
    RenderStream.prototype.constructor = RenderStream;
    RenderStream.prototype._read = function _read () {
        var this$1 = this;

        if (this.started) {
            return;
        }
        this.started = true;
        Promise.resolve().then(function () {
            return this$1.renderNode(this$1.initNode, null, this$1.staticMarkup);
        }).then(function () {
            this$1.push(null);
        }).catch(function (err) {
            this$1.emit('error', err);
        });
    };
    RenderStream.prototype.renderNode = function renderNode (vNode, context, isRoot) {
        if (isInvalid(vNode)) {
            return;
        }
        else {
            var flags = vNode.flags;
            if (flags & 28 /* Component */) {
                return this.renderComponent(vNode, isRoot, context, flags & 4 /* ComponentClass */);
            }
            else if (flags & 3970 /* Element */) {
                return this.renderElement(vNode, isRoot, context);
            }
            else {
                return this.renderText(vNode, isRoot, context);
            }
        }
    };
    RenderStream.prototype.renderComponent = function renderComponent (vComponent, isRoot, context, isClass) {
        var this$1 = this;

        var type = vComponent.type;
        var props = vComponent.props;
        if (!isClass) {
            return this.renderNode(type(props), context, isRoot);
        }
        var instance = new type(props);
        var childContext = instance.getChildContext();
        if (!isNullOrUndef(childContext)) {
            context = Object.assign({}, context, childContext);
        }
        instance.context = context;
        // Block setting state - we should render only once, using latest state
        instance._pendingSetState = true;
        return Promise.resolve(instance.componentWillMount()).then(function () {
            var node = instance.render();
            instance._pendingSetState = false;
            return this$1.renderNode(node, context, isRoot);
        });
    };
    RenderStream.prototype.renderChildren = function renderChildren (children, context) {
        var this$1 = this;

        if (isStringOrNumber(children)) {
            return this.push(escapeText(children));
        }
        if (!children) {
            return;
        }
        var childrenIsArray = isArray(children);
        if (!childrenIsArray && !isInvalid(children)) {
            return this.renderNode(children, context, false);
        }
        if (!childrenIsArray) {
            throw new Error('invalid component');
        }
        return children.reduce(function (p, child) {
            return p.then(function (insertComment) {
                var isText = isStringOrNumber(child);
                if (isText) {
                    if (insertComment === true) {
                        this$1.push('<!---->');
                    }
                    if (isText) {
                        this$1.push(escapeText(child));
                    }
                    return true;
                }
                else if (isArray(child)) {
                    this$1.push('<!---->');
                    return Promise.resolve(this$1.renderChildren(child)).then(function () {
                        this$1.push('<!--!-->');
                        return true;
                    });
                }
                else if (!isInvalid(child)) {
                    if (child.flags & 1 /* Text */) {
                        if (insertComment) {
                            this$1.push('<!---->');
                        }
                        insertComment = true;
                    }
                    return this$1.renderNode(child, context, false)
                        .then(function (_insertComment) {
                        if (child.flags & 1 /* Text */) {
                            return true;
                        }
                        return false;
                    });
                }
            });
        }, Promise.resolve(false));
    };
    RenderStream.prototype.renderText = function renderText (vNode, isRoot, context) {
        var this$1 = this;

        return Promise.resolve().then(function (insertComment) {
            this$1.push(vNode.children);
            return insertComment;
        });
    };
    RenderStream.prototype.renderElement = function renderElement (vElement, isRoot, context) {
        var this$1 = this;

        var tag = vElement.type;
        var props = vElement.props;
        var outputAttrs = renderAttributes(props);
        var html = '';
        if (props) {
            var className = props.className;
            if (!isNullOrUndef(className)) {
                outputAttrs.push('class="' + escapeText(className) + '"');
            }
            var style = props.style;
            if (style) {
                outputAttrs.push('style="' + renderStyleToString(style) + '"');
            }
            if (props.dangerouslySetInnerHTML) {
                html = props.dangerouslySetInnerHTML.__html;
            }
        }
        if (isRoot) {
            outputAttrs.push('data-infernoroot');
        }
        this.push(("<" + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + ">"));
        if (isVoidElement(tag)) {
            return;
        }
        if (html) {
            this.push(html);
            this.push(("</" + tag + ">"));
            return;
        }
        return Promise.resolve(this.renderChildren(vElement.children, context)).then(function () {
            this$1.push(("</" + tag + ">"));
        });
    };

    return RenderStream;
}(stream.Readable));
function streamAsString(node) {
    return new RenderStream(node, false);
}
function streamAsStaticMarkup(node) {
    return new RenderStream(node, true);
}

var index = {
	renderToString: renderToString,
	renderToStaticMarkup: renderToStaticMarkup,
	streamAsString: streamAsString,
	streamAsStaticMarkup: streamAsStaticMarkup,
	RenderStream: RenderStream
};

return index;

})));
