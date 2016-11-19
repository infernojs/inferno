/*!
 * inferno-server v1.0.0-beta10
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('stream')) :
	typeof define === 'function' && define.amd ? define(['stream'], factory) :
	(global.Inferno = global.Inferno || {}, global.Inferno.Server = factory(global.stream));
}(this, (function (stream) { 'use strict';

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
function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
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

function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
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
constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,defaultValue,defaultChecked', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readonly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

function escapeText(str) {
    return (str + '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\//g, '&#x2F;');
}
function escapeAttr(str) {
    return (str + '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;');
}
function toHyphenCase(str) {
    return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
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
    var newVNode;
    if (isArray(vNodeToClone)) {
        newVNode = vNodeToClone.map(function (vNode) { return cloneVNode(vNode); });
    }
    else if (isNullOrUndef(props) && isNullOrUndef(children)) {
        newVNode = Object.assign({}, vNodeToClone);
    }
    else {
        var flags = vNodeToClone.flags;
        if (flags & 28 /* Component */) {
            newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), null, vNodeToClone.key, vNodeToClone.ref, true);
        }
        else if (flags & 3970 /* Element */) {
            children = (props && props.children) || vNodeToClone.children;
            newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), children, vNodeToClone.key, vNodeToClone.ref, !children);
        }
    }
    newVNode.dom = null;
    return newVNode;
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
                result.push(n);
            }
        }
    }
}
function normalizeVNodes(nodes) {
    var newNodes;
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
            newNodes.push(createTextVNode(n));
        }
        else if (isVNode(n) && n.dom) {
            if (!newNodes) {
                newNodes = nodes.slice(0, i);
            }
            newNodes.push(cloneVNode(n));
        }
        else if (newNodes) {
            newNodes.push(cloneVNode(n));
        }
    }
    return newNodes || nodes;
}
function normalize(vNode) {
    var props = vNode.props;
    var children = vNode.children;
    if (props) {
        if (isNullOrUndef(children) && !isNullOrUndef(props.children)) {
            vNode.children = props.children;
        }
        if (props.ref) {
            vNode.ref = props.ref;
        }
        if (!isNullOrUndef(props.key)) {
            vNode.key = props.key;
        }
    }
    if (isArray(children)) {
        vNode.children = normalizeVNodes(children);
    }
}
function createVNode(flags, type, props, children, key, ref, noNormalise) {
    if (flags & 16 /* ComponentUnknown */) {
        flags = isStatefulComponent(type) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
    }
    var vNode = {
        children: isUndefined(children) ? null : children,
        dom: null,
        flags: flags || 0,
        key: key === undefined ? null : key,
        props: props || null,
        ref: ref || null,
        type: type
    };
    if (!noNormalise) {
        normalize(vNode);
    }
    return vNode;
}

function createTextVNode(text) {
    return createVNode(1 /* Text */, null, null, text);
}
function isVNode(o) {
    return !!o.flags;
}

function renderComponentToString(vComponent, isRoot, context, isClass) {
    var type = vComponent.type;
    var props = vComponent.props;
    if (isClass) {
        var instance = new type(props);
        var childContext = instance.getChildContext();
        if (!isNullOrUndef(childContext)) {
            context = Object.assign({}, context, childContext);
        }
        instance.context = context;
        // Block setting state - we should render only once, using latest state
        instance._pendingSetState = true;
        instance.componentWillMount();
        var node = instance.render(props, vComponent.context);
        instance._pendingSetState = false;
        return renderVNodeToString(node, context, isRoot);
    }
    else {
        return renderVNodeToString(type(props, context), context, isRoot);
    }
}
function renderChildrenToString(children, context) {
    if (children && isArray(children)) {
        var childrenResult = [];
        var insertComment = false;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var isText = isStringOrNumber(child);
            if (isInvalid(child)) {
                childrenResult.push('<!--!-->');
            }
            else if (isText) {
                if (insertComment) {
                    childrenResult.push('<!---->');
                }
                if (isText) {
                    childrenResult.push(escapeText(child));
                }
                insertComment = true;
            }
            else if (isArray(child)) {
                childrenResult.push('<!---->');
                childrenResult.push(renderChildrenToString(child, context));
                childrenResult.push('<!--!-->');
                insertComment = true;
            }
            else if (isVNode(child)) {
                if (child.flags & 1 /* Text */) {
                    if (insertComment) {
                        childrenResult.push('<!---->');
                    }
                    insertComment = true;
                }
                else {
                    insertComment = false;
                }
                childrenResult.push(renderVNodeToString(child, context, false));
            }
        }
        return childrenResult.join('');
    }
    else if (!isInvalid(children)) {
        if (isStringOrNumber(children)) {
            return escapeText(children);
        }
        else {
            return renderVNodeToString(children, context, false) || '';
        }
    }
    return '';
}
function renderStyleToString(style) {
    if (isStringOrNumber(style)) {
        return style;
    }
    else {
        var styles = [];
        var keys = Object.keys(style);
        for (var i = 0; i < keys.length; i++) {
            var styleName = keys[i];
            var value = style[styleName];
            var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';
            if (!isNullOrUndef(value)) {
                styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
            }
        }
        return styles.join('');
    }
}
function renderElementToString(vNode, isRoot, context) {
    var tag = vNode.type;
    var outputProps = [];
    var props = vNode.props;
    var html = '';
    for (var prop in props) {
        var value = props[prop];
        if (prop === 'dangerouslySetInnerHTML') {
            html = value.__html;
        }
        else if (prop === 'style') {
            outputProps.push('style="' + renderStyleToString(props.style) + '"');
        }
        else if (prop === 'className') {
            outputProps.push('class="' + value + '"');
        }
        else {
            if (isStringOrNumber(value)) {
                outputProps.push(escapeAttr(prop) + '="' + escapeAttr(value) + '"');
            }
            else if (isTrue(value)) {
                outputProps.push(escapeAttr(prop));
            }
        }
    }
    if (isRoot) {
        outputProps.push('data-infernoroot');
    }
    if (isVoidElement(tag)) {
        return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">");
    }
    else {
        var content = html || renderChildrenToString(vNode.children, context);
        return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">" + content + "</" + tag + ">");
    }
}
function renderTextToString(vNode, context, isRoot) {
    return escapeText(vNode.children);
}
function renderVNodeToString(vNode, context, isRoot) {
    var flags = vNode.flags;
    if (flags & 28 /* Component */) {
        return renderComponentToString(vNode, isRoot, context, flags & 4 /* ComponentClass */);
    }
    else if (flags & 3970 /* Element */) {
        return renderElementToString(vNode, isRoot, context);
    }
    else if (flags & 1 /* Text */) {
        return renderTextToString(vNode, isRoot, context);
    }
    else {
        throwError(("renderVNodeToString() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode) + "\"."));
    }
}
function renderToString(input) {
    return renderVNodeToString(input, null, true);
}
function renderToStaticMarkup(input) {
    return renderVNodeToString(input, null, false);
}

function renderStyleToString$1(style) {
    if (isStringOrNumber(style)) {
        return style;
    }
    else {
        var styles = [];
        var keys = Object.keys(style);
        for (var i = 0; i < keys.length; i++) {
            var styleName = keys[i];
            var value = style[styleName];
            var px = isNumber(value) && !isUnitlessNumber[styleName] ? 'px' : '';
            if (!isNullOrUndef(value)) {
                styles.push(((toHyphenCase(styleName)) + ":" + (escapeAttr(value)) + px + ";"));
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
                    outputAttrs.push(escapeAttr(propKey) + '="' + escapeAttr(value) + '"');
                }
                else if (isTrue(value)) {
                    outputAttrs.push(escapeAttr(propKey));
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
                var childIsInvalid = isInvalid(child);
                if (isText || childIsInvalid) {
                    if (insertComment === true) {
                        if (childIsInvalid) {
                            this$1.push('<!--!-->');
                        }
                        else {
                            this$1.push('<!---->');
                        }
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
                else {
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
            if (className) {
                outputAttrs.push('class="' + escapeAttr(className) + '"');
            }
            var style = props.style;
            if (style) {
                outputAttrs.push('style="' + renderStyleToString$1(style) + '"');
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
