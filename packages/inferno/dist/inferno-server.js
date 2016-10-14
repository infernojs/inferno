/*!
 * inferno-server v1.0.0-beta4
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('stream')) :
	typeof define === 'function' && define.amd ? define(['stream'], factory) :
	(global.InfernoServer = factory(global.stream));
}(this, (function (stream) { 'use strict';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';


function isArray(obj) {
    return obj instanceof Array;
}
function isStatefulComponent(o) {
    var component = o.component;
    return !isUndefined(component.prototype) && !isUndefined(component.prototype.render);
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
constructDefaults('volume,value,defaultValue,defaultChecked', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
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

var ValueTypes = {
    CHILDREN: 1,
    PROP_CLASS_NAME: 2,
    PROP_STYLE: 3,
    PROP_DATA: 4,
    PROP_REF: 5,
    PROP_SPREAD: 6,
    PROP_VALUE: 7,
    PROP: 8
};
var ChildrenTypes = {
    NON_KEYED: 1,
    KEYED: 2,
    NODE: 3,
    TEXT: 4,
    UNKNOWN: 5
};
var NodeTypes = {
    ELEMENT: 1,
    OPT_ELEMENT: 2,
    TEXT: 3,
    FRAGMENT: 4,
    OPT_BLUEPRINT: 5,
    COMPONENT: 6,
    PLACEHOLDER: 7
};

function createVComponent(component, props, key, hooks, ref) {
    return {
        component: component,
        dom: null,
        hooks: hooks || null,
        instance: null,
        key: key,
        props: props,
        ref: ref || null,
        type: NodeTypes.COMPONENT
    };
}

function createVElement(tag, props, children, key, ref, childrenType) {
    return {
        children: children,
        childrenType: childrenType || ChildrenTypes.UNKNOWN,
        dom: null,
        key: key,
        props: props,
        ref: ref || null,
        tag: tag,
        type: NodeTypes.ELEMENT
    };
}



function isVElement(o) {
    return o.type === NodeTypes.ELEMENT;
}
function isOptVElement(o) {
    return o.type === NodeTypes.OPT_ELEMENT;
}
function isVComponent(o) {
    return o.type === NodeTypes.COMPONENT;
}

function convertVOptElementToVElement(optVElement) {
    var bp = optVElement.bp;
    var staticElement = bp.staticVElement;
    var vElement = createVElement(staticElement.tag, null, null, optVElement.key, null, null);
    var bp0 = bp.v0;
    var staticChildren = staticElement.children;
    var staticProps = staticElement.props;
    if (!isNull(staticChildren)) {
        vElement.children = staticChildren;
    }
    if (!isNull(staticProps)) {
        vElement.props = staticProps;
    }
    if (!isNull(bp0)) {
        attachOptVElementValue(vElement, optVElement, bp0, optVElement.v0, bp.d0);
        var bp1 = bp.v1;
        if (!isNull(bp1)) {
            attachOptVElementValue(vElement, optVElement, bp1, optVElement.v1, bp.d1);
            var bp2 = bp.v2;
            if (!isNull(bp2)) {
                attachOptVElementValue(vElement, optVElement, bp2, optVElement.v2, bp.d2);
                var bp3 = bp.v3;
                if (!isNull(bp3)) {
                    var v3 = optVElement.v3;
                    var d3 = bp.d3;
                    var bp3$1 = bp.v3;
                    for (var i = 0; i < bp3$1.length; i++) {
                        attachOptVElementValue(vElement, optVElement, bp3$1[i], v3[i], d3[i]);
                    }
                }
            }
        }
    }
    return vElement;
}
function attachOptVElementValue(vElement, vOptElement, valueType, value, descriptor) {
    switch (valueType) {
        case ValueTypes.CHILDREN:
            vElement.childrenType = descriptor;
            if (isNullOrUndef(vElement.children)) {
                vElement.children = value;
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_CLASS_NAME:
            if (!vElement.props) {
                vElement.props = { className: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_DATA:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props['data-' + descriptor] = value;
            break;
        case ValueTypes.PROP_STYLE:
            if (!vElement.props) {
                vElement.props = { style: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP_VALUE:
            if (!vElement.props) {
                vElement.props = { value: value };
            }
            else {
                debugger;
            }
            break;
        case ValueTypes.PROP:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props[descriptor] = value;
            break;
        case ValueTypes.PROP_REF:
            vElement.ref = value;
            break;
        case ValueTypes.PROP_SPREAD:
            if (!vElement.props) {
                vElement.props = value;
            }
            else {
                debugger;
            }
            break;
        default:
            throw new Error('Unknown ValueType: ' + valueType);
    }
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
        if (isVComponent(vNodeToClone)) {
            newVNode = createVComponent(vNodeToClone.component, Object.assign({}, vNodeToClone.props, props), vNodeToClone.key, vNodeToClone.hooks, vNodeToClone.ref);
        }
        else if (isVElement(vNodeToClone)) {
            newVNode = createVElement(vNodeToClone.tag, Object.assign({}, vNodeToClone.props, props), (props && props.children) || children || vNodeToClone.children, vNodeToClone.key, vNodeToClone.ref, ChildrenTypes.UNKNOWN);
        }
        else if (isOptVElement(vNodeToClone)) {
            newVNode = cloneVNode(convertVOptElementToVElement(vNodeToClone), props, children);
        }
    }
    newVNode.dom = null;
    return newVNode;
}

function renderComponentToString(vComponent, isRoot, context) {
    var Component = vComponent.component;
    var props = vComponent.props;
    if (isStatefulComponent(vComponent)) {
        var instance = new Component(props);
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
        return renderInputToString(node, context, isRoot);
    }
    else {
        return renderInputToString(Component(props, context), context, isRoot);
    }
}
function renderChildren$1(children, context) {
    if (children && isArray(children)) {
        var childrenResult = [];
        var insertComment = false;
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var isText = isStringOrNumber(child);
            var invalid = isInvalid(child);
            if (isText || invalid) {
                if (insertComment === true) {
                    if (isInvalid(child)) {
                        childrenResult.push('<!--!-->');
                    }
                    else {
                        childrenResult.push('<!---->');
                    }
                }
                if (isText) {
                    childrenResult.push(escapeText(child));
                }
                insertComment = true;
            }
            else if (isArray(child)) {
                childrenResult.push('<!---->');
                childrenResult.push(renderChildren$1(child, context));
                childrenResult.push('<!--!-->');
                insertComment = true;
            }
            else {
                insertComment = false;
                childrenResult.push(renderInputToString(child, context, false));
            }
        }
        return childrenResult.join('');
    }
    else if (!isInvalid(children)) {
        if (isStringOrNumber(children)) {
            return escapeText(children);
        }
        else {
            return renderInputToString(children, context, false) || '';
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
function renderVElementToString(vElement, isRoot, context) {
    var tag = vElement.tag;
    var outputProps = [];
    var props = vElement.props;
    var propsKeys = (props && Object.keys(props)) || [];
    var html = '';
    for (var i = 0; i < propsKeys.length; i++) {
        var prop = propsKeys[i];
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
        return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">" + (html || renderChildren$1(vElement.children, context)) + "</" + tag + ">");
    }
}
function renderOptVElementToString(optVElement, isRoot, context) {
    return renderInputToString(convertVOptElementToVElement(optVElement), context, isRoot);
}
function renderInputToString(input, context, isRoot) {
    if (!isInvalid(input)) {
        if (isOptVElement(input)) {
            return renderOptVElementToString(input, isRoot, context);
        }
        else if (isVElement(input)) {
            return renderVElementToString(input, isRoot, context);
        }
        else if (isVComponent(input)) {
            return renderComponentToString(input, isRoot, context);
        }
    }
    throw Error('Inferno Error: Bad input argument called on renderInputToString(). Input argument may need normalising.');
}
function renderToString(input) {
    return renderInputToString(input, null, true);
}
function renderToStaticMarkup(input) {
    return renderInputToString(input, null, false);
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
    RenderStream.prototype.renderNode = function renderNode (node, context, isRoot) {
        if (isInvalid(node)) {
            return;
        }
        else if (isVComponent(node)) {
            return this.renderComponent(node, isRoot, context);
        }
        else if (isVElement(node)) {
            return this.renderNative(node, isRoot, context);
        }
    };
    RenderStream.prototype.renderComponent = function renderComponent (vComponent, isRoot, context) {
        var this$1 = this;

        var Component = vComponent.component;
        var props = vComponent.props;
        if (!isStatefulComponent(vComponent)) {
            return this.renderNode(Component(props), context, isRoot);
        }
        var instance = new Component(props);
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
                    return this$1.renderNode(child, context, false)
                        .then(function () {
                        return false;
                    });
                }
            });
        }, Promise.resolve(false));
    };
    RenderStream.prototype.renderNative = function renderNative (vElement, isRoot, context) {
        var this$1 = this;

        var tag = vElement.tag;
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
