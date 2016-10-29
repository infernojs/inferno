/*!
 * inferno-redux v1.0.0-beta5
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('redux'), require('hoist-non-inferno-statics')) :
	typeof define === 'function' && define.amd ? define(['redux', 'hoist-non-inferno-statics'], factory) :
	(global.InfernoRedux = factory(global.redux,global.hoistStatics));
}(this, (function (redux,hoistStatics) { 'use strict';

hoistStatics = 'default' in hoistStatics ? hoistStatics['default'] : hoistStatics;

var Lifecycle = function Lifecycle() {
    this._listeners = [];
};
Lifecycle.prototype.addListener = function addListener (callback) {
    this._listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger () {
        var this$1 = this;

    for (var i = 0; i < this._listeners.length; i++) {
        this$1._listeners[i]();
    }
};

var NO_OP = '$NO_OP';
var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;
function toArray(children) {
    return isArray(children) ? children : (children ? [children] : children);
}
function isArray(obj) {
    return obj instanceof Array;
}
function isStatefulComponent(o) {
    var type = o.type;
    return !isUndefined(type.prototype) && !isUndefined(type.prototype.render);
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
function isAttrAnEvent(attr) {
    return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
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
function isObject(o) {
    return typeof o === 'object';
}
function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(("Inferno Error: " + message));
}

var EMPTY_OBJ = {};

var ELEMENT = 1;
var OPT_ELEMENT = 2;
var TEXT = 3;
var FRAGMENT = 4;
var OPT_BLUEPRINT = 5;
var COMPONENT = 6;
var PLACEHOLDER = 7;

var NON_KEYED = 1;
var KEYED = 2;
var NODE = 3;
var TEXT$1 = 4;
var UNKNOWN = 5;

var CHILDREN = 1;
var PROP_CLASS_NAME = 2;
var PROP_STYLE = 3;
var PROP_DATA = 4;
var PROP_REF = 5;
var PROP_SPREAD = 6;
var PROP_VALUE = 7;
var PROP = 8;

function constructDefaults(string, object, value) {
    /* eslint no-return-assign: 0 */
    string.split(',').forEach(function (i) { return object[i] = value; });
}
var xlinkNS = 'http://www.w3.org/1999/xlink';
var xmlNS = 'http://www.w3.org/XML/1998/namespace';
var svgNS = 'http://www.w3.org/2000/svg';
var strictProps = {};
var booleanProps = {};
var namespaces = {};
var isUnitlessNumber = {};
constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,value,defaultValue,defaultChecked', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context) {
    var domNode = childNodes[counter.i];
    var childNodeType = child.nodeType;
    if (childNodeType === TEXT) {
        var text = child.text;
        child.dom = domNode;
        if (domNode.nodeType === 3 && text !== '') {
            domNode.nodeValue = text;
        }
        else {
            var newDomNode = mountVText(text, null);
            replaceChild(parentDom, newDomNode, domNode);
            childNodes.splice(childNodes.indexOf(domNode), 1, newDomNode);
            child.dom = newDomNode;
        }
    }
    else if (childNodeType === PLACEHOLDER) {
        child.dom = domNode;
    }
    else if (childNodeType === FRAGMENT) {
        var items = child.items;
        // this doesn't really matter, as it won't be used again, but it's what it should be given the purpose of VList
        child.dom = document.createDocumentFragment();
        for (var i = 0; i < items.length; i++) {
            var rebuild = hydrateChild(normaliseChild(items, i), childNodes, counter, parentDom, lifecycle, context);
            if (rebuild) {
                return true;
            }
        }
        // at the end of every VList, there should be a "pointer". It's an empty TextNode used for tracking the VList
        var pointer = childNodes[counter.i++];
        if (pointer && pointer.nodeType === 3) {
            child.pointer = pointer;
        }
        else {
            // there is a problem, we need to rebuild this tree
            return true;
        }
    }
    else {
        var rebuild$1 = hydrate(child, domNode, lifecycle, context);
        if (rebuild$1) {
            return true;
        }
    }
    counter.i++;
}
function normaliseChildNodes(dom) {
    var rawChildNodes = dom.childNodes;
    var length = rawChildNodes.length;
    var i = 0;
    while (i < length) {
        var rawChild = rawChildNodes[i];
        if (rawChild.nodeType === 8) {
            if (rawChild.data === '!') {
                var placeholder = document.createTextNode('');
                dom.replaceChild(placeholder, rawChild);
                i++;
            }
            else {
                dom.removeChild(rawChild);
                length--;
            }
        }
        else {
            i++;
        }
    }
}
function hydrateVComponent(vComponent, dom, lifecycle, context) {
    var type = vComponent.type;
    var props = vComponent.props;
    var hooks = vComponent.hooks;
    var ref = vComponent.ref;
    vComponent.dom = dom;
    if (isStatefulComponent(vComponent)) {
        var isSVG = dom.namespaceURI === svgNS;
        var instance = createStatefulComponentInstance(type, props, context, isSVG, createStaticVElementClone);
        var input = instance._lastInput;
        instance._vComponent = vComponent;
        hydrate(input, dom, lifecycle, instance._childContext);
        mountStatefulComponentCallbacks(ref, instance, lifecycle);
        componentToDOMNodeMap.set(instance, dom);
        vComponent.instance = instance;
    }
    else {
        var input$1 = createStatelessComponentInput(type, props, context);
        hydrate(input$1, dom, lifecycle, context);
        vComponent.instance = input$1;
        vComponent.dom = input$1.dom;
        mountStatelessComponentCallbacks(hooks, dom, lifecycle);
    }
}
function hydrateVElement(vElement, dom, lifecycle, context) {
    var tag = vElement.tag;
    if (!isString(tag)) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('expects VElement to have a string as the tag name');
        }
        throwError();
    }
    var children = vElement.children;
    var props = vElement.props;
    vElement.dom = dom;
    for (var prop in props) {
        if (!props.hasOwnProperty(prop)) {
            continue;
        }
        var value = props[prop];
        if (prop === 'key') {
        }
        else if (prop === 'ref') {
        }
        else if (prop === 'children') {
        }
        else {
            patchProp(prop, null, value, dom, false);
        }
    }
    if (children) {
        hydrateChildren(vElement.childrenType, children, dom, lifecycle, context);
    }
}
function hydrateArrayChildrenWithType(children, dom, lifecycle, context) {
    var domNodes = Array.prototype.slice.call(dom.childNodes);
    for (var i = 0; i < children.length; i++) {
        hydrate(children[i], domNodes[i], lifecycle, context);
    }
}
function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
    var domNodes = Array.prototype.slice.call(dom.childNodes);
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = normaliseChild(children, i);
            if (isObject(child)) {
                hydrate(child, domNodes[i], lifecycle, context);
            }
        }
    }
    else if (isObject(children)) {
        hydrate(children, dom.firstChild, lifecycle, context);
    }
}
function hydrateChildren(childrenType, children, dom, lifecycle, context, isSVG) {
    if ( isSVG === void 0 ) isSVG = false;

    if (childrenType === NODE) {
        hydrate(children, dom.firstChild, lifecycle, context);
    }
    else if (childrenType === KEYED || childrenType === NON_KEYED) {
        hydrateArrayChildrenWithType(children, dom, lifecycle, context);
    }
    else if (childrenType === UNKNOWN) {
        hydrateChildrenWithUnknownType(children, dom, lifecycle, context);
    }
    else if (childrenType !== TEXT$1) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('Bad childrenType value specified when attempting to hydrateChildren.');
        }
        throwError();
    }
}
function hydrateStaticVElement(node, dom) {
    var children = node.children;
    if (!isNull(children) && !isNullOrUndef(dom)) {
        if (!isStringOrNumber(children) && !isInvalid(children)) {
            var childNode = dom.firstChild;
            if (isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (!isStringOrNumber(child) && !isInvalid(child)) {
                        normaliseChildNodes(childNode);
                        hydrateStaticVElement(child, normaliseChildNodes(childNode));
                    }
                    childNode = childNode.nextSibling;
                }
            }
            else {
                normaliseChildNodes(childNode);
                hydrateStaticVElement(children, childNode);
            }
        }
    }
}
function hydrateOptVElement(optVElement, dom, lifecycle, context) {
    var bp = optVElement.bp;
    var bp0 = bp.v0;
    var staticVElement = bp.staticVElement;
    hydrateStaticVElement(staticVElement, dom);
    optVElement.dom = dom;
    if (!isNull(bp0)) {
        hydrateOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context);
        var bp1 = bp.v1;
        if (!isNull(bp1)) {
            hydrateOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context);
            var bp2 = bp.v2;
            if (!isNull(bp2)) {
                hydrateOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context);
                var bp3 = bp.v3;
                if (!isNull(bp3)) {
                    var v3 = optVElement.v3;
                    var d3 = bp.d3;
                    var bp3$1 = bp.v3;
                    for (var i = 0; i < bp3$1.length; i++) {
                        hydrateOptVElementValue(optVElement, bp3$1[i], v3[i], d3[i], dom, lifecycle, context);
                    }
                }
            }
        }
    }
}
function hydrateVText(vText, dom) {
    vText.dom = dom;
}
function hydrateVPlaceholder(vPlaceholder, dom) {
    vPlaceholder.dom = dom;
}
function hydrateVFragment(vFragment, currentDom, lifecycle, context) {
    var children = vFragment.children;
    var parentDom = currentDom.parentNode;
    var pointer = vFragment.pointer = document.createTextNode('');
    for (var i = 0; i < children.length; i++) {
        var child = normaliseChild(children, i);
        var childDom = currentDom;
        if (isObject(child)) {
            hydrate(child, childDom, lifecycle, context);
        }
        currentDom = currentDom.nextSibling;
    }
    parentDom.insertBefore(pointer, currentDom);
}
function hydrateOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context, isSVG) {
    if ( isSVG === void 0 ) isSVG = false;

    switch (valueType) {
        case CHILDREN:
            if (value === null) {
                mountChildren(descriptor, value, dom, lifecycle, context, isSVG, false);
            }
            else {
                hydrateChildren(descriptor, value, dom, lifecycle, context, isSVG);
            }
            break;
        case PROP_SPREAD:
            debugger;
            break;
        case PROP_DATA:
            dom.dataset[descriptor] = value;
            break;
        case PROP_STYLE:
            patchStyle(null, value, dom);
            break;
        case PROP_VALUE:
            dom.value = isNullOrUndef(value) ? '' : value;
            break;
        case PROP:
            patchProp(descriptor, null, value, dom, false);
            break;
        default:
    }
}
function hydrate(input, dom, lifecycle, context) {
    if (process.env.NODE_ENV !== 'production') {
        if (isInvalid(dom)) {
            throwError("failed to hydrate. Server-side render doesn't match client side.");
        }
    }
    normaliseChildNodes(dom);
    switch (input.nodeType) {
        case OPT_ELEMENT:
            return hydrateOptVElement(input, dom, lifecycle, context);
        case COMPONENT:
            return hydrateVComponent(input, dom, lifecycle, context);
        case ELEMENT:
            return hydrateVElement(input, dom, lifecycle, context);
        case TEXT:
            return hydrateVText(input, dom);
        case FRAGMENT:
            return hydrateVFragment(input, dom, lifecycle, context);
        case PLACEHOLDER:
            return hydrateVPlaceholder(input, dom);
        default:
            if (process.env.NODE_ENV !== 'production') {
                throwError('bad input argument called on hydrate(). Input argument may need normalising.');
            }
            throwError();
    }
}
function hydrateRoot(input, parentDom, lifecycle) {
    if (parentDom && parentDom.nodeType === 1) {
        var rootNode = parentDom.querySelector('[data-infernoroot]');
        if (rootNode && rootNode.parentNode === parentDom) {
            rootNode.removeAttribute('data-infernoroot');
            hydrate(input, rootNode, lifecycle, {});
            return true;
        }
    }
    return false;
}

var recyclingEnabled = true;
var vComponentPools = new Map();

function recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount) {
    var bp = optVElement.bp;
    var key = optVElement.key;
    var pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed.get(key);
    if (!isUndefined(pool)) {
        var recycledOptVElement = pool.pop();
        if (!isUndefined(recycledOptVElement)) {
            patchOptVElement(recycledOptVElement, optVElement, null, lifecycle, context, isSVG, shallowUnmount);
            return optVElement.dom;
        }
    }
    return null;
}
function poolOptVElement(optVElement) {
    var bp = optVElement.bp;
    var key = optVElement.key;
    var pools = bp.pools;
    if (isNull(key)) {
        pools.nonKeyed.push(optVElement);
    }
    else {
        var pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(optVElement);
    }
}
function recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount) {
    var type = vComponent.type;
    var key = vComponent.key;
    var pools = vComponentPools.get(type);
    if (!isUndefined(pools)) {
        var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
        if (!isUndefined(pool)) {
            var recycledVComponent = pool.pop();
            if (!isUndefined(recycledVComponent)) {
                var failed = patchVComponent(recycledVComponent, vComponent, null, lifecycle, context, isSVG, shallowUnmount);
                if (!failed) {
                    return vComponent.dom;
                }
            }
        }
    }
    return null;
}
function poolVComponent(vComponent) {
    var type = vComponent.type;
    var key = vComponent.key;
    var hooks = vComponent.hooks;
    var nonRecycleHooks = hooks && (hooks.onComponentWillMount ||
        hooks.onComponentWillUnmount ||
        hooks.onComponentDidMount ||
        hooks.onComponentWillUpdate ||
        hooks.onComponentDidUpdate);
    if (nonRecycleHooks) {
        return;
    }
    var pools = vComponentPools.get(type);
    if (isUndefined(pools)) {
        pools = {
            nonKeyed: [],
            keyed: new Map()
        };
        vComponentPools.set(type, pools);
    }
    if (isNull(key)) {
        pools.nonKeyed.push(vComponent);
    }
    else {
        var pool = pools.keyed.get(key);
        if (isUndefined(pool)) {
            pool = [];
            pools.keyed.set(key, pool);
        }
        pool.push(vComponent);
    }
}

function unmount(input, parentDom, lifecycle, canRecycle, shallowUnmount) {
    if (!isInvalid(input)) {
        switch (input.nodeType) {
            case OPT_ELEMENT:
                unmountOptVElement(input, parentDom, lifecycle, canRecycle, shallowUnmount);
                break;
            case COMPONENT:
                unmountVComponent(input, parentDom, lifecycle, canRecycle, shallowUnmount);
                break;
            case ELEMENT:
                unmountVElement(input, parentDom, lifecycle, shallowUnmount);
                break;
            case FRAGMENT:
                unmountVFragment(input, parentDom, true, lifecycle, shallowUnmount);
                break;
            case TEXT:
                unmountVText(input, parentDom);
                break;
            case PLACEHOLDER:
                unmountVPlaceholder(input, parentDom);
                break;
            default:
        }
    }
}
function unmountVPlaceholder(vPlaceholder, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vPlaceholder.dom);
    }
}
function unmountVText(vText, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vText.dom);
    }
}
function unmountOptVElement(optVElement, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var bp = optVElement.bp;
    var bp0 = bp.v0;
    if (!shallowUnmount) {
        if (!isNull(bp0)) {
            unmountOptVElementValue(optVElement, bp0, optVElement.v0, lifecycle, shallowUnmount);
            var bp1 = bp.v1;
            if (!isNull(bp1)) {
                unmountOptVElementValue(optVElement, bp1, optVElement.v1, lifecycle, shallowUnmount);
                var bp2 = bp.v2;
                if (!isNull(bp2)) {
                    unmountOptVElementValue(optVElement, bp2, optVElement.v2, lifecycle, shallowUnmount);
                }
            }
        }
    }
    if (!isNull(parentDom)) {
        parentDom.removeChild(optVElement.dom);
    }
    if (recyclingEnabled && (parentDom || canRecycle)) {
        poolOptVElement(optVElement);
    }
}
function unmountOptVElementValue(optVElement, valueType, value, lifecycle, shallowUnmount) {
    switch (valueType) {
        case CHILDREN:
            unmountChildren(value, lifecycle, shallowUnmount);
            break;
        case PROP_REF:
            unmountRef(value);
            break;
        case PROP_SPREAD:
            unmountProps(value, lifecycle);
            break;
        default:
    }
}
function unmountVFragment(vFragment, parentDom, removePointer, lifecycle, shallowUnmount) {
    var children = vFragment.children;
    var childrenLength = children.length;
    var pointer = vFragment.pointer;
    if (!shallowUnmount && childrenLength > 0) {
        for (var i = 0; i < childrenLength; i++) {
            var child = children[i];
            if (child.nodeType === FRAGMENT) {
                unmountVFragment(child, parentDom, true, lifecycle, false);
            }
            else {
                unmount(child, parentDom, lifecycle, false, shallowUnmount);
            }
        }
    }
    if (parentDom && removePointer) {
        removeChild(parentDom, pointer);
    }
}
function unmountVComponent(vComponent, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var instance = vComponent.instance;
    if (!shallowUnmount) {
        var instanceHooks = null;
        vComponent.unmounted = true;
        if (!isNullOrUndef(instance)) {
            var ref = vComponent.ref;
            if (ref) {
                ref(null);
            }
            instanceHooks = instance.hooks;
            if (instance.render !== undefined) {
                instance.componentWillUnmount();
                instance._unmounted = true;
                componentToDOMNodeMap.delete(instance);
                unmount(instance._lastInput, null, lifecycle, false, shallowUnmount);
            }
            else {
                unmount(instance, null, lifecycle, false, shallowUnmount);
            }
        }
        var hooks = vComponent.hooks || instanceHooks;
        if (!isNullOrUndef(hooks)) {
            if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
                hooks.onComponentWillUnmount();
            }
        }
    }
    if (parentDom) {
        var lastInput = instance._lastInput;
        if (isNullOrUndef(lastInput)) {
            lastInput = instance;
        }
        if (lastInput.nodeType === FRAGMENT) {
            unmountVFragment(lastInput, parentDom, true, lifecycle, true);
        }
        else {
            removeChild(parentDom, vComponent.dom);
        }
    }
    if (recyclingEnabled && (parentDom || canRecycle)) {
        poolVComponent(vComponent);
    }
}
function unmountVElement(vElement, parentDom, lifecycle, shallowUnmount) {
    var dom = vElement.dom;
    var ref = vElement.ref;
    if (!shallowUnmount) {
        if (ref) {
            unmountRef(ref);
        }
        var children = vElement.children;
        if (!isNullOrUndef(children)) {
            unmountChildren(children, lifecycle, shallowUnmount);
        }
    }
    if (parentDom) {
        removeChild(parentDom, dom);
    }
}
function unmountChildren(children, lifecycle, shallowUnmount) {
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (isObject(child)) {
                unmount(child, null, lifecycle, false, shallowUnmount);
            }
        }
    }
    else if (isObject(children)) {
        unmount(children, null, lifecycle, false, shallowUnmount);
    }
}
function unmountRef(ref) {
    if (isFunction(ref)) {
        ref(null);
    }
    else {
        if (isInvalid(ref)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
        }
        throwError();
    }
}
function unmountProps(props, lifecycle) {
    for (var prop in props) {
        if (!props.hasOwnProperty(prop)) {
            continue;
        }
        var value = props[prop];
        if (prop === 'ref') {
            unmountRef(value);
        }
    }
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
        case CHILDREN:
            vElement.childrenType = descriptor;
            if (isNullOrUndef(vElement.children)) {
                vElement.children = value;
            }
            else {
                debugger;
            }
            break;
        case PROP_CLASS_NAME:
            if (!vElement.props) {
                vElement.props = { className: value };
            }
            else {
                vElement.props.className = value;
            }
            break;
        case PROP_DATA:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props['data-' + descriptor] = value;
            break;
        case PROP_STYLE:
            if (!vElement.props) {
                vElement.props = { style: value };
            }
            else {
                vElement.props.style = value;
            }
            break;
        case PROP_VALUE:
            if (!vElement.props) {
                vElement.props = { value: value };
            }
            else {
                vElement.props.value = value;
            }
            break;
        case PROP:
            if (!vElement.props) {
                vElement.props = {};
            }
            vElement.props[descriptor] = value;
            break;
        case PROP_REF:
            vElement.ref = value;
            break;
        case PROP_SPREAD:
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
        var nodeType = vNodeToClone.nodeType;
        if (nodeType === COMPONENT) {
            newVNode = createVComponent(vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), vNodeToClone.key, vNodeToClone.hooks, vNodeToClone.ref);
        }
        else if (nodeType === ELEMENT) {
            newVNode = createVElement(vNodeToClone.tag, Object.assign({}, vNodeToClone.props, props), (props && props.children) || children || vNodeToClone.children, vNodeToClone.key, vNodeToClone.ref, UNKNOWN);
        }
        else if (nodeType === OPT_ELEMENT) {
            newVNode = cloneVNode(convertVOptElementToVElement(vNodeToClone), props, children);
        }
    }
    newVNode.dom = null;
    return newVNode;
}

var devToolsStatus = {
    connected: false
};
var internalIncrementer = {
    id: 0
};
var componentIdMap = new Map();
function getIncrementalId() {
    return internalIncrementer.id++;
}
function sendToDevTools(global, data) {
    var event = new CustomEvent('inferno.client.message', {
        detail: JSON.stringify(data, function (key, val) {
            if (!isNull(val) && !isUndefined(val)) {
                if (key === '_vComponent' || !isUndefined(val.nodeType)) {
                    return;
                }
                else if (isFunction(val)) {
                    return ("$$f:" + (val.name));
                }
            }
            return val;
        })
    });
    global.dispatchEvent(event);
}
function rerenderRoots() {
    for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        render$1(root.input, root.dom);
    }
}

function sendRoots(global) {
    sendToDevTools(global, { type: 'roots', data: roots });
}

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
var roots = [];
var componentToDOMNodeMap = new Map();

function getRoot(dom) {
    for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        if (root.dom === dom) {
            return root;
        }
    }
    return null;
}
function setRoot(dom, input) {
    roots.push({
        dom: dom,
        input: input
    });
}
function removeRoot(root) {
    for (var i = 0; i < roots.length; i++) {
        if (roots[i] === root) {
            roots.splice(i, 1);
            return;
        }
    }
}
var documetBody = isBrowser ? document.body : null;
function render$1(input, parentDom) {
    if (documetBody === parentDom) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
        }
        throwError();
    }
    if (input === NO_OP) {
        return;
    }
    var root = getRoot(parentDom);
    var lifecycle = new Lifecycle();
    if (isNull(root)) {
        if (!isInvalid(input)) {
            if (input.dom) {
                input = cloneVNode(input);
            }
            if (!hydrateRoot(input, parentDom, lifecycle)) {
                mountChildrenWithUnknownType(input, parentDom, lifecycle, {}, false, false);
            }
            lifecycle.trigger();
            setRoot(parentDom, input);
        }
    }
    else {
        if (isNullOrUndef(input)) {
            unmount(root.input, parentDom, lifecycle, false, false);
            removeRoot(root);
        }
        else {
            if (input.dom) {
                input = cloneVNode(input);
            }
            patchChildrenWithUnknownType(root.input, input, parentDom, lifecycle, {}, false, false);
        }
        lifecycle.trigger();
        root.input = input;
    }
    if (devToolsStatus.connected) {
        sendRoots(window);
    }
}

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
    unmount(lastInput, null, lifecycle, false, shallowUnmount);
}
function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (lastInput !== nextInput) {
        var lastNodeType = lastInput.nodeType;
        var nextNodeType = nextInput.nodeType;
        if (nextNodeType === OPT_ELEMENT) {
            if (lastNodeType === OPT_ELEMENT) {
                patchOptVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountOptVElement(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (lastNodeType === OPT_ELEMENT) {
            replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else if (nextNodeType === COMPONENT) {
            if (lastNodeType === COMPONENT) {
                patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (lastNodeType === COMPONENT) {
            replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else if (nextNodeType === ELEMENT) {
            if (lastNodeType === ELEMENT) {
                patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountVElement(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (lastNodeType === ELEMENT) {
            replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else if (nextNodeType === FRAGMENT) {
            if (lastNodeType === FRAGMENT) {
                patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                replaceVNode(parentDom, mountVFragment(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (lastNodeType === FRAGMENT) {
            replaceVFragmentWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lifecycle, shallowUnmount);
        }
        else if (nextNodeType === TEXT) {
            if (lastNodeType === TEXT) {
                patchVText(lastInput, nextInput);
            }
            else {
                replaceVNode(parentDom, mountVText(nextInput, null), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (lastNodeType === TEXT) {
            replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
        }
        else if (nextNodeType === PLACEHOLDER) {
            if (lastNodeType === PLACEHOLDER) {
                patchVPlaceholder(lastInput, nextInput);
            }
            else {
                replaceVNode(parentDom, mountVPlaceholder(nextInput, null), lastInput, shallowUnmount, lifecycle);
            }
        }
        else if (lastNodeType === PLACEHOLDER) {
            replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput.dom);
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                throwError('bad input argument called on patch(). Input argument may need normalising.');
            }
            throwError();
        }
    }
}
function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var nextTag = nextVElement.tag;
    var lastTag = lastVElement.tag;
    if (nextTag === 'svg') {
        isSVG = true;
    }
    if (lastTag !== nextTag) {
        replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else {
        var dom = lastVElement.dom;
        var lastProps = lastVElement.props;
        var nextProps = nextVElement.props;
        var lastChildren = lastVElement.children;
        var nextChildren = nextVElement.children;
        nextVElement.dom = dom;
        if (lastChildren !== nextChildren) {
            var lastChildrenType = lastVElement.childrenType;
            var nextChildrenType = nextVElement.childrenType;
            if (lastChildrenType === nextChildrenType) {
                patchChildren(lastChildrenType, lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                patchChildrenWithUnknownType(lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
            }
        }
        if (lastProps !== nextProps) {
            var formValue = patchProps(nextVElement, lastProps, nextProps, dom, shallowUnmount, false, isSVG, lifecycle, context);
            if (nextTag === 'select') {
                formSelectValue(dom, formValue);
            }
        }
    }
}
function patchOptVElement(lastOptVElement, nextOptVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var dom = lastOptVElement.dom;
    var lastBp = lastOptVElement.bp;
    var nextBp = nextOptVElement.bp;
    nextOptVElement.dom = dom;
    if (lastBp !== nextBp) {
        var newDom = mountOptVElement(nextOptVElement, null, lifecycle, context, isSVG, shallowUnmount);
        replaceChild(parentDom, newDom, dom);
        unmount(lastOptVElement, null, lifecycle, true, shallowUnmount);
    }
    else {
        var bp0 = nextBp.v0;
        var tag = nextBp.staticVElement.tag;
        var ignoreDiff = false;
        if (tag === 'svg') {
            isSVG = true;
        }
        else if (tag === 'input') {
            // input elements are problematic due to the large amount of internal state that hold
            // so instead of making lots of assumptions, we instead reset common values and re-apply
            // the the patching each time
            resetFormInputProperties(dom);
            ignoreDiff = true;
        }
        else if (tag === 'textarea') {
            // textarea elements are like input elements, except they have sligthly less internal state to
            // worry about
            ignoreDiff = true;
        }
        if (!isNull(bp0)) {
            var lastV0 = lastOptVElement.v0;
            var nextV0 = nextOptVElement.v0;
            var bp1 = nextBp.v1;
            if (lastV0 !== nextV0 || ignoreDiff) {
                patchOptVElementValue(nextOptVElement, bp0, lastV0, nextV0, nextBp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            if (!isNull(bp1)) {
                var lastV1 = lastOptVElement.v1;
                var nextV1 = nextOptVElement.v1;
                var bp2 = nextBp.v2;
                if (lastV1 !== nextV1 || ignoreDiff) {
                    patchOptVElementValue(nextOptVElement, bp1, lastV1, nextV1, nextBp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
                }
                if (!isNull(bp2)) {
                    var lastV2 = lastOptVElement.v2;
                    var nextV2 = nextOptVElement.v2;
                    var bp3 = nextBp.v3;
                    if (lastV2 !== nextV2 || ignoreDiff) {
                        patchOptVElementValue(nextOptVElement, bp2, lastV2, nextV2, nextBp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
                    }
                    if (!isNull(bp3)) {
                        var d3 = nextBp.d3;
                        var lastV3s = lastOptVElement.v3;
                        var nextV3s = nextOptVElement.v3;
                        for (var i = 0; i < lastV3s.length; i++) {
                            var lastV3 = lastV3s[i];
                            var nextV3 = nextV3s[i];
                            if (lastV3 !== nextV3 || ignoreDiff) {
                                patchOptVElementValue(nextOptVElement, bp3[i], lastV3, nextV3, d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
                            }
                        }
                    }
                }
            }
        }
        if (tag === 'select') {
            formSelectValue(dom, getPropFromOptElement(nextOptVElement, PROP_VALUE));
        }
    }
}
function patchOptVElementValue(optVElement, valueType, lastValue, nextValue, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
    switch (valueType) {
        case CHILDREN:
            patchChildren(descriptor, lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
            break;
        case PROP_CLASS_NAME:
            if (isNullOrUndef(nextValue)) {
                dom.removeAttribute('class');
            }
            else {
                if (isSVG) {
                    dom.setAttribute('class', nextValue);
                }
                else {
                    dom.className = nextValue;
                }
            }
            break;
        case PROP_DATA:
            dom.dataset[descriptor] = nextValue;
            break;
        case PROP_STYLE:
            patchStyle(lastValue, nextValue, dom);
            break;
        case PROP_VALUE:
            dom.value = isNullOrUndef(nextValue) ? '' : nextValue;
            break;
        case PROP:
            patchProp(descriptor, lastValue, nextValue, dom, isSVG);
            break;
        case PROP_SPREAD:
            patchProps(optVElement, lastValue, nextValue, dom, shallowUnmount, true, isSVG, lifecycle, context);
            break;
        default:
    }
}
function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    switch (childrenType) {
        case TEXT$1:
            updateTextContent(parentDom, nextChildren);
            break;
        case NODE:
            patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
            break;
        case KEYED:
            patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
            break;
        case NON_KEYED:
            patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, false, shallowUnmount);
            break;
        case UNKNOWN:
            patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
            break;
        default:
            if (process.env.NODE_ENV !== 'production') {
                throwError('bad childrenType value specified when attempting to patchChildren.');
            }
            throwError();
    }
}
function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (isInvalid(nextChildren)) {
        if (!isInvalid(lastChildren)) {
            if (isVNode(lastChildren)) {
                unmount(lastChildren, parentDom, lifecycle, true, shallowUnmount);
            }
            else {
                removeAllChildren(parentDom, lastChildren, lifecycle, shallowUnmount);
            }
        }
    }
    else if (isInvalid(lastChildren)) {
        if (isStringOrNumber(nextChildren)) {
            setTextContent(parentDom, nextChildren);
        }
        else if (!isInvalid(nextChildren)) {
            if (isArray(nextChildren)) {
                mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
            else {
                mount(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
            }
        }
    }
    else if (isVNode(lastChildren) && isVNode(nextChildren)) {
        patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isStringOrNumber(nextChildren)) {
        if (isStringOrNumber(lastChildren)) {
            updateTextContent(parentDom, nextChildren);
        }
        else {
            setTextContent(parentDom, nextChildren);
        }
    }
    else if (isStringOrNumber(lastChildren)) {
        var child = normalise(lastChildren);
        child.dom = parentDom.firstChild;
        patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isArray(nextChildren)) {
        if (isArray(lastChildren)) {
            nextChildren.complex = lastChildren.complex;
            if (isKeyed(lastChildren, nextChildren)) {
                patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
            }
            else {
                patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
            }
        }
        else {
            patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
        }
    }
    else if (isArray(lastChildren)) {
        patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError('bad input argument called on patchChildrenWithUnknownType(). Input argument may need normalising.');
        }
        throwError();
    }
}
function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var lastType = lastVComponent.type;
    var nextType = nextVComponent.type;
    var nextProps = nextVComponent.props || {};
    if (lastType !== nextType) {
        if (isStatefulComponent(nextVComponent)) {
            replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount);
        }
        else {
            var lastInput = lastVComponent.instance._lastInput || lastVComponent.instance;
            var nextInput = createStatelessComponentInput(nextType, nextProps, context);
            patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, true);
            var dom = nextVComponent.dom = nextInput.dom;
            nextVComponent.instance = nextInput;
            mountStatelessComponentCallbacks(nextVComponent.hooks, dom, lifecycle);
            unmount(lastVComponent, null, lifecycle, false, shallowUnmount);
        }
    }
    else {
        if (isStatefulComponent(nextVComponent)) {
            var instance = lastVComponent.instance;
            if (instance._unmounted) {
                if (isNull(parentDom)) {
                    return true;
                }
                replaceChild(parentDom, mountVComponent(nextVComponent, null, lifecycle, context, isSVG, shallowUnmount), lastVComponent.dom);
            }
            else {
                var defaultProps = nextType.defaultProps;
                var lastProps = instance.props;
                if (instance._devToolsStatus.connected && !instance._devToolsId) {
                    componentIdMap.set(instance._devToolsId = getIncrementalId(), instance);
                }
                if (!isUndefined(defaultProps)) {
                    copyPropsTo(lastProps, nextProps);
                    nextVComponent.props = nextProps;
                }
                var lastState = instance.state;
                var nextState = instance.state;
                var childContext = instance.getChildContext();
                nextVComponent.instance = instance;
                instance._isSVG = isSVG;
                if (!isNullOrUndef(childContext)) {
                    childContext = Object.assign({}, context, childContext);
                }
                else {
                    childContext = context;
                }
                var lastInput$1 = instance._lastInput;
                var nextInput$1 = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false);
                var didUpdate = true;
                instance._childContext = childContext;
                if (isInvalid(nextInput$1)) {
                    nextInput$1 = createVPlaceholder();
                }
                else if (isArray(nextInput$1)) {
                    nextInput$1 = createVFragment(nextInput$1, null);
                }
                else if (nextInput$1 === NO_OP) {
                    nextInput$1 = lastInput$1;
                    didUpdate = false;
                }
                instance._lastInput = nextInput$1;
                instance._vComponent = nextVComponent;
                if (didUpdate) {
                    patch(lastInput$1, nextInput$1, parentDom, lifecycle, childContext, isSVG, shallowUnmount);
                    instance.componentDidUpdate(lastProps, lastState);
                    componentToDOMNodeMap.set(instance, nextInput$1.dom);
                }
                nextVComponent.dom = nextInput$1.dom;
            }
        }
        else {
            var shouldUpdate = true;
            var lastProps$1 = lastVComponent.props;
            var nextHooks = nextVComponent.hooks;
            var nextHooksDefined = !isNullOrUndef(nextHooks);
            var lastInput$2 = lastVComponent.instance;
            nextVComponent.dom = lastVComponent.dom;
            nextVComponent.instance = lastInput$2;
            if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
                shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps$1, nextProps);
            }
            if (shouldUpdate !== false) {
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
                    nextHooks.onComponentWillUpdate(lastProps$1, nextProps);
                }
                var nextInput$2 = nextType(nextProps, context);
                if (isInvalid(nextInput$2)) {
                    nextInput$2 = createVPlaceholder();
                }
                else if (isArray(nextInput$2)) {
                    nextInput$2 = createVFragment(nextInput$2, null);
                }
                else if (nextInput$2 === NO_OP) {
                    return false;
                }
                patch(lastInput$2, nextInput$2, parentDom, lifecycle, context, isSVG, shallowUnmount);
                nextVComponent.instance = nextInput$2;
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
                    nextHooks.onComponentDidUpdate(lastProps$1, nextProps);
                }
            }
        }
    }
    return false;
}
function patchVText(lastVText, nextVText) {
    var nextText = nextVText.text;
    var dom = lastVText.dom;
    nextVText.dom = dom;
    if (lastVText.text !== nextText) {
        dom.nodeValue = nextText;
    }
}
function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
    nextVPlacholder.dom = lastVPlacholder.dom;
}
function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var lastChildren = lastVFragment.children;
    var nextChildren = nextVFragment.children;
    var pointer = lastVFragment.pointer;
    nextVFragment.dom = lastVFragment.dom;
    nextVFragment.pointer = pointer;
    if (!lastChildren !== nextChildren) {
        var lastChildrenType = lastVFragment.childrenType;
        var nextChildrenType = nextVFragment.childrenType;
        if (lastChildrenType === nextChildrenType) {
            if (nextChildrenType === KEYED) {
                return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
            }
            else if (nextChildrenType === NON_KEYED) {
                return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, false, shallowUnmount);
            }
        }
        if (isKeyed(lastChildren, nextChildren)) {
            patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
        }
        else {
            patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, true, shallowUnmount);
        }
    }
}
function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList, shouldNormalise, shallowUnmount) {
    var lastChildrenLength = lastChildren.length;
    var nextChildrenLength = nextChildren.length;
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    for (; i < commonLength; i++) {
        var lastChild = lastChildren[i];
        var nextChild = shouldNormalise ? normaliseChild(nextChildren, i) : nextChildren[i];
        patch(lastChild, nextChild, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; i++) {
            var child = normaliseChild(nextChildren, i);
            insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG, shallowUnmount), parentVList && parentVList.pointer);
        }
    }
    else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; i++) {
            unmount(lastChildren[i], dom, lifecycle, false, shallowUnmount);
        }
    }
}
function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, parentVList, shallowUnmount) {
    var aLength = a.length;
    var bLength = b.length;
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i;
    var j;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    var aNode;
    var bNode;
    var nextNode;
    var nextPos;
    var node;
    if (aLength === 0) {
        if (bLength !== 0) {
            mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG, shallowUnmount);
        }
        return;
    }
    else if (bLength === 0) {
        if (aLength !== 0) {
            removeAllChildren(dom, a, lifecycle, shallowUnmount);
        }
        return;
    }
    // Step 1
    /* eslint no-constant-condition: 0 */
    outer: while (true) {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }
        // Move and sync nodes from right to left.
        if (aEndNode.key === bStartNode.key) {
            patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
            insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
            aEnd--;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break;
            }
            aEndNode = a[aEnd];
            bStartNode = b[bStart];
            // In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
            // immediately jump to the start of this prefix/suffix algo.
            continue;
        }
        // Move and sync nodes from left to right.
        if (aStartNode.key === bEndNode.key) {
            patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
            insertOrAppend(dom, bEndNode.dom, nextNode);
            aStart++;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break;
            }
            aStartNode = a[aStart];
            bEndNode = b[bEnd];
            continue;
        }
        break;
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
            while (bStart <= bEnd) {
                insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), nextNode);
            }
        }
    }
    else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            unmount(a[aStart++], dom, lifecycle, false, shallowUnmount);
        }
    }
    else {
        aLength = aEnd - aStart + 1;
        bLength = bEnd - bStart + 1;
        var aNullable = a;
        var sources = new Array(bLength);
        // Mark all nodes as inserted.
        for (i = 0; i < bLength; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;
        if ((bLength <= 4) || (aLength * bLength <= 16)) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            }
                            else {
                                pos = j;
                            }
                            patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
                            patched++;
                            aNullable[i] = null;
                            break;
                        }
                    }
                }
            }
        }
        else {
            var keyIndex = new Map();
            for (i = bStart; i <= bEnd; i++) {
                node = b[i];
                keyIndex.set(node.key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLength) {
                    j = keyIndex.get(aNode.key);
                    if (!isUndefined(j)) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        }
                        else {
                            pos = j;
                        }
                        patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
                        patched++;
                        aNullable[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            removeAllChildren(dom, a, lifecycle, shallowUnmount);
            while (bStart < bLength) {
                insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), null);
            }
        }
        else {
            i = aLength - patched;
            while (i > 0) {
                aNode = aNullable[aStart++];
                if (!isNull(aNode)) {
                    unmount(aNode, dom, lifecycle, false, shallowUnmount);
                    i--;
                }
            }
            if (moved) {
                var seq = lis_algorithm(sources);
                j = seq.length - 1;
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
                        insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG, shallowUnmount), nextNode);
                    }
                    else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
                            insertOrAppend(dom, node.dom, nextNode);
                        }
                        else {
                            j--;
                        }
                    }
                }
            }
            else if (patched !== bLength) {
                for (i = bLength - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
                        insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG, shallowUnmount), nextNode);
                    }
                }
            }
        }
    }
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function lis_algorithm(a) {
    var p = a.slice(0);
    var result = [];
    result.push(0);
    var i;
    var j;
    var u;
    var v;
    var c;
    for (i = 0; i < a.length; i++) {
        if (a[i] === -1) {
            continue;
        }
        j = result[result.length - 1];
        if (a[j] < a[i]) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            c = ((u + v) / 2) | 0;
            if (a[result[c]] < a[i]) {
                u = c + 1;
            }
            else {
                v = c;
            }
        }
        if (a[i] < a[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
// returns true if a property has been applied that can't be cloned via elem.cloneNode()
function patchProp(prop, lastValue, nextValue, dom, isSVG) {
    if (prop === 'children') {
        return;
    }
    if (strictProps[prop]) {
        dom[prop] = isNullOrUndef(nextValue) ? '' : nextValue;
    }
    else if (booleanProps[prop]) {
        dom[prop] = nextValue ? true : false;
    }
    else {
        if (lastValue !== nextValue) {
            if (isNullOrUndef(nextValue)) {
                dom.removeAttribute(prop);
                return false;
            }
            if (prop === 'className') {
                if (isSVG) {
                    dom.setAttribute('class', nextValue);
                }
                else {
                    dom.className = nextValue;
                }
                return false;
            }
            else if (prop === 'style') {
                patchStyle(lastValue, nextValue, dom);
            }
            else if (isAttrAnEvent(prop)) {
                dom[prop.toLowerCase()] = nextValue;
            }
            else if (prop === 'dangerouslySetInnerHTML') {
                var lastHtml = lastValue && lastValue.__html;
                var nextHtml = nextValue && nextValue.__html;
                if (isNullOrUndef(nextHtml)) {
                    if (process.env.NODE_ENV !== 'production') {
                        throwError('dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.');
                    }
                    throwError();
                }
                if (lastHtml !== nextHtml) {
                    dom.innerHTML = nextHtml;
                }
            }
            else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
                var ns = namespaces[prop];
                if (ns) {
                    dom.setAttributeNS(ns, prop, nextValue);
                }
                else {
                    dom.setAttribute(prop, nextValue);
                }
                return false;
            }
        }
    }
    return true;
}
function patchProps(vNode, lastProps, nextProps, dom, shallowUnmount, isSpread, isSVG, lifecycle, context) {
    lastProps = lastProps || {};
    nextProps = nextProps || {};
    var formValue;
    for (var prop in nextProps) {
        if (!nextProps.hasOwnProperty(prop)) {
            continue;
        }
        var nextValue = nextProps[prop];
        var lastValue = lastProps[prop];
        if (prop === 'value') {
            formValue = nextValue;
        }
        if (isNullOrUndef(nextValue)) {
            removeProp(prop, dom);
        }
        else if (prop === 'children') {
            if (isSpread) {
                patchChildrenWithUnknownType(lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            else if (vNode === ELEMENT) {
                vNode.children = nextValue;
            }
        }
        else {
            patchProp(prop, lastValue, nextValue, dom, isSVG);
        }
    }
    for (var prop$1 in lastProps) {
        if (isNullOrUndef(nextProps[prop$1])) {
            removeProp(prop$1, dom);
        }
    }
    return formValue;
}
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    if (isString(nextAttrValue)) {
        dom.style.cssText = nextAttrValue;
    }
    else if (isNullOrUndef(lastAttrValue)) {
        if (!isNullOrUndef(nextAttrValue)) {
            for (var style in nextAttrValue) {
                var value = nextAttrValue[style];
                if (isNumber(value) && !isUnitlessNumber[style]) {
                    dom.style[style] = value + 'px';
                }
                else {
                    dom.style[style] = value;
                }
            }
        }
    }
    else if (isNullOrUndef(nextAttrValue)) {
        dom.removeAttribute('style');
    }
    else {
        for (var style$1 in nextAttrValue) {
            var value$1 = nextAttrValue[style$1];
            if (isNumber(value$1) && !isUnitlessNumber[style$1]) {
                dom.style[style$1] = value$1 + 'px';
            }
            else {
                dom.style[style$1] = value$1;
            }
        }
        for (var style$2 in lastAttrValue) {
            if (isNullOrUndef(nextAttrValue[style$2])) {
                dom.style[style$2] = '';
            }
        }
    }
}
function removeProp(prop, dom) {
    if (prop === 'className') {
        dom.removeAttribute('class');
    }
    else if (prop === 'value') {
        dom.value = '';
    }
    else {
        dom.removeAttribute(prop);
    }
}

function mount(input, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    switch (input.nodeType) {
        case OPT_ELEMENT:
            return mountOptVElement(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
        case ELEMENT:
            return mountVElement(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
        case COMPONENT:
            return mountVComponent(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
        case PLACEHOLDER:
            return mountVPlaceholder(input, parentDom);
        case FRAGMENT:
            return mountVFragment(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
        case TEXT:
            return mountVText(input, parentDom);
        default:
            if (process.env.NODE_ENV !== 'production') {
                throwError('bad input argument called on mount(). Input argument may need normalising.');
            }
            throwError();
    }
}
function mountVPlaceholder(vPlaceholder, parentDom) {
    var dom = document.createTextNode('');
    vPlaceholder.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVElement(vElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var tag = vElement.tag;
    if (!isString(tag)) {
        if (process.env.NODE_ENV !== 'production') {
            throwError('expects VElement to have a string as the tag name');
        }
        throwError();
    }
    if (tag === 'svg') {
        isSVG = true;
    }
    var dom = documentCreateElement(tag, isSVG);
    var children = vElement.children;
    var props = vElement.props;
    var ref = vElement.ref;
    var hasProps = !isNullOrUndef(props);
    var formValue;
    vElement.dom = dom;
    if (!isNullOrUndef(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (hasProps) {
        formValue = mountProps(vElement, props, dom, lifecycle, context, isSVG, false, shallowUnmount);
    }
    if (!isNullOrUndef(children)) {
        mountChildren(vElement.childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    if (tag === 'select' && formValue) {
        formSelectValue(dom, formValue);
    }
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var children = vFragment.children;
    var pointer = document.createTextNode('');
    var dom = document.createDocumentFragment();
    var childrenType = vFragment.childrenType;
    if (childrenType === KEYED || childrenType === NON_KEYED) {
        mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (childrenType === UNKNOWN) {
        mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    vFragment.pointer = pointer;
    vFragment.dom = dom;
    appendChild(dom, pointer);
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVText(vText, parentDom) {
    var dom = document.createTextNode(vText.text);
    vText.dom = dom;
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountOptVElement(optVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var bp = optVElement.bp;
    var dom = null;
    if (recyclingEnabled) {
        dom = recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount);
    }
    var tag = bp.staticVElement.tag;
    if (isNull(dom)) {
        if (isSVG || tag === 'svg') {
            isSVG = true;
            dom = (bp.svgClone && bp.svgClone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
        }
        else {
            dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
        }
        optVElement.dom = dom;
        var bp0 = bp.v0;
        if (!isNull(bp0)) {
            mountOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
            var bp1 = bp.v1;
            if (!isNull(bp1)) {
                mountOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
                var bp2 = bp.v2;
                if (!isNull(bp2)) {
                    mountOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
                    var bp3 = bp.v3;
                    if (!isNull(bp3)) {
                        var v3 = optVElement.v3;
                        var d3 = bp.d3;
                        var bp3$1 = bp.v3;
                        for (var i = 0; i < bp3$1.length; i++) {
                            mountOptVElementValue(optVElement, bp3$1[i], v3[i], d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
                        }
                    }
                }
            }
        }
        if (tag === 'select') {
            formSelectValue(dom, getPropFromOptElement(optVElement, PROP_VALUE));
        }
    }
    if (!isNull(parentDom)) {
        parentDom.appendChild(dom);
    }
    return dom;
}
function mountOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
    switch (valueType) {
        case CHILDREN:
            mountChildren(descriptor, value, dom, lifecycle, context, isSVG, shallowUnmount);
            break;
        case PROP_CLASS_NAME:
            if (!isNullOrUndef(value)) {
                if (isSVG) {
                    dom.setAttribute('class', value);
                }
                else {
                    dom.className = value;
                }
            }
            break;
        case PROP_DATA:
            dom.dataset[descriptor] = value;
            break;
        case PROP_STYLE:
            patchStyle(null, value, dom);
            break;
        case PROP_VALUE:
            dom.value = isNullOrUndef(value) ? '' : value;
            break;
        case PROP:
            patchProp(descriptor, null, value, dom, isSVG);
            break;
        case PROP_REF:
            mountRef(dom, value, lifecycle);
            break;
        case PROP_SPREAD:
            mountProps(optVElement, value, dom, lifecycle, context, isSVG, true, shallowUnmount);
            break;
        default:
    }
}
function mountChildren(childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount) {
    if (childrenType === TEXT$1) {
        setTextContent(dom, children);
    }
    else if (childrenType === NODE) {
        mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (childrenType === KEYED || childrenType === NON_KEYED) {
        mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (childrenType === UNKNOWN) {
        mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError('bad childrenType value specified when attempting to mountChildren.');
        }
        throwError();
    }
}
function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
    for (var i = 0; i < children.length; i++) {
        mount(children[i], dom, lifecycle, context, isSVG, shallowUnmount);
    }
}
function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
    if (isArray(children)) {
        mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
    else if (isStringOrNumber(children)) {
        setTextContent(dom, children);
    }
    else if (!isInvalid(children)) {
        mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
    }
}
function mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
    children.complex = false;
    for (var i = 0; i < children.length; i++) {
        var child = normaliseChild(children, i);
        if (child === TEXT) {
            mountVText(child, dom);
            children.complex = true;
        }
        else if (child === PLACEHOLDER) {
            mountVPlaceholder(child, dom);
            children.complex = true;
        }
        else if (child === FRAGMENT) {
            mountVFragment(child, dom, lifecycle, context, isSVG, shallowUnmount);
            children.complex = true;
        }
        else {
            mount(child, dom, lifecycle, context, isSVG, shallowUnmount);
        }
    }
}
function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    if (recyclingEnabled) {
        var dom$1 = recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount);
        if (!isNull(dom$1)) {
            if (!isNull(parentDom)) {
                appendChild(parentDom, dom$1);
            }
            return dom$1;
        }
    }
    var type = vComponent.type;
    var props = vComponent.props || EMPTY_OBJ;
    var hooks = vComponent.hooks;
    var ref = vComponent.ref;
    var dom;
    if (isStatefulComponent(vComponent)) {
        var defaultProps = type.defaultProps;
        if (!isUndefined(defaultProps)) {
            copyPropsTo(defaultProps, props);
            vComponent.props = props;
        }
        if (hooks) {
            if (process.env.NODE_ENV !== 'production') {
                throwError('"hooks" are not supported on stateful components.');
            }
            throwError();
        }
        var instance = createStatefulComponentInstance(type, props, context, isSVG, devToolsStatus);
        var input = instance._lastInput;
        instance._vComponent = vComponent;
        vComponent.dom = dom = mount(input, null, lifecycle, instance._childContext, false, shallowUnmount);
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
        mountStatefulComponentCallbacks(ref, instance, lifecycle);
        componentToDOMNodeMap.set(instance, dom);
        vComponent.instance = instance;
    }
    else {
        if (ref) {
            if (process.env.NODE_ENV !== 'production') {
                throwError('"refs" are not supported on stateless components.');
            }
            throwError();
        }
        var input$1 = createStatelessComponentInput(type, props, context);
        vComponent.dom = dom = mount(input$1, null, lifecycle, context, isSVG, shallowUnmount);
        vComponent.instance = input$1;
        mountStatelessComponentCallbacks(hooks, dom, lifecycle);
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
    }
    return dom;
}
function mountStatefulComponentCallbacks(ref, instance, lifecycle) {
    if (ref) {
        if (isFunction(ref)) {
            lifecycle.addListener(function () { return ref(instance); });
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
            }
            throwError();
        }
    }
    if (!isNull(instance.componentDidMount)) {
        lifecycle.addListener(function () {
            instance.componentDidMount();
        });
    }
}
function mountStatelessComponentCallbacks(hooks, dom, lifecycle) {
    if (!isNullOrUndef(hooks)) {
        if (!isNullOrUndef(hooks.onComponentWillMount)) {
            hooks.onComponentWillMount();
        }
        if (!isNullOrUndef(hooks.onComponentDidMount)) {
            lifecycle.addListener(function () { return hooks.onComponentDidMount(dom); });
        }
    }
}
function mountProps(vNode, props, dom, lifecycle, context, isSVG, isSpread, shallowUnmount) {
    var formValue;
    for (var prop in props) {
        if (!props.hasOwnProperty(prop)) {
            continue;
        }
        var value = props[prop];
        if (prop === 'value') {
            formValue = value;
        }
        if (prop === 'key') {
            vNode.key = value;
        }
        else if (prop === 'ref') {
            mountRef(dom, value, lifecycle);
        }
        else if (prop === 'children') {
            if (isSpread) {
                mountChildrenWithUnknownType(value, dom, lifecycle, context, isSVG, shallowUnmount);
            }
            else if (vNode === ELEMENT) {
                vNode.children = value;
            }
        }
        else {
            patchProp(prop, null, value, dom, isSVG);
        }
    }
    return formValue;
}
function mountRef(dom, value, lifecycle) {
    if (isFunction(value)) {
        lifecycle.addListener(function () { return value(dom); });
    }
    else {
        if (isInvalid(value)) {
            return;
        }
        if (process.env.NODE_ENV !== 'production') {
            throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
        }
        throwError();
    }
}

function copyPropsTo(copyFrom, copyTo) {
    for (var prop in copyFrom) {
        if (isUndefined(copyTo[prop])) {
            copyTo[prop] = copyFrom[prop];
        }
    }
}
function createStatefulComponentInstance(Component, props, context, isSVG, devToolsStatus) {
    var instance = new Component(props, context);
    instance.context = context;
    instance._patch = patch;
    instance._devToolsStatus = devToolsStatus;
    instance._componentToDOMNodeMap = componentToDOMNodeMap;
    var childContext = instance.getChildContext();
    if (!isNullOrUndef(childContext)) {
        instance._childContext = Object.assign({}, context, childContext);
    }
    else {
        instance._childContext = context;
    }
    instance._unmounted = false;
    instance._pendingSetState = true;
    instance._isSVG = isSVG;
    instance.componentWillMount();
    instance.beforeRender && instance.beforeRender();
    var input = instance.render(props, context);
    instance.afterRender && instance.afterRender();
    if (isArray(input)) {
        input = createVFragment(input, null);
    }
    else if (isInvalid(input)) {
        input = createVPlaceholder();
    }
    instance._pendingSetState = false;
    instance._lastInput = input;
    return instance;
}
function replaceVNode(parentDom, dom, vNode, shallowUnmount, lifecycle) {
    // we cannot cache nodeType here as vNode might be re-assigned below
    if (vNode.nodeType === COMPONENT) {
        // if we are accessing a stateful or stateless component, we want to access their last rendered input
        // accessing their DOM node is not useful to us here
        vNode = vNode.instance._lastInput || vNode.instance;
    }
    if (vNode.nodeType === FRAGMENT) {
        replaceVFragmentWithNode(parentDom, vNode, dom, lifecycle, shallowUnmount);
    }
    else {
        replaceChild(parentDom, dom, vNode.dom);
        unmount(vNode, null, lifecycle, false, shallowUnmount);
    }
}
function createStatelessComponentInput(component, props, context) {
    var input = component(props, context);
    if (isArray(input)) {
        input = createVFragment(input, null);
    }
    else if (isInvalid(input)) {
        input = createVPlaceholder();
    }
    return input;
}
function setTextContent(dom, text) {
    if (text !== '') {
        dom.textContent = text;
    }
    else {
        dom.appendChild(document.createTextNode(''));
    }
}
function updateTextContent(dom, text) {
    dom.firstChild.nodeValue = text;
}
function appendChild(parentDom, dom) {
    parentDom.appendChild(dom);
}
function insertOrAppend(parentDom, newNode, nextNode) {
    if (isNullOrUndef(nextNode)) {
        appendChild(parentDom, newNode);
    }
    else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
function replaceVFragmentWithNode(parentDom, vFragment, dom, lifecycle, shallowUnmount) {
    var pointer = vFragment.pointer;
    unmountVFragment(vFragment, parentDom, false, lifecycle, shallowUnmount);
    replaceChild(parentDom, dom, pointer);
}
function getPropFromOptElement(optVElement, valueType) {
    var bp = optVElement.bp;
    // TODO check "prop" and "spread"
    if (!isNull(bp.v0)) {
        if (bp.v0 === valueType) {
            return optVElement.v0;
        }
        if (!isNull(bp.v1)) {
            if (bp.v1 === valueType) {
                return optVElement.v1;
            }
            if (!isNull(bp.v2)) {
                if (bp.v2 === valueType) {
                    return optVElement.v2;
                }
            }
        }
    }
}
function documentCreateElement(tag, isSVG) {
    var dom;
    if (isSVG === true) {
        dom = document.createElementNS(svgNS, tag);
    }
    else {
        dom = document.createElement(tag);
    }
    return dom;
}
function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, shallowUnmount) {
    var lastInstance = null;
    var instanceLastNode = lastNode._lastInput;
    if (!isNullOrUndef(instanceLastNode)) {
        lastInstance = lastNode;
        lastNode = instanceLastNode;
    }
    unmount(lastNode, null, lifecycle, true, shallowUnmount);
    var dom = mount(nextNode, null, lifecycle, context, isSVG, shallowUnmount);
    nextNode.dom = dom;
    replaceChild(parentDom, dom, lastNode.dom);
    if (lastInstance !== null) {
        lastInstance._lasInput = nextNode;
    }
}
function replaceChild(parentDom, nextDom, lastDom) {
    parentDom.replaceChild(nextDom, lastDom);
}
function normalise(object) {
    if (isStringOrNumber(object)) {
        return createVText(object);
    }
    else if (isInvalid(object)) {
        return createVPlaceholder();
    }
    else if (isArray(object)) {
        return createVFragment(object, null);
    }
    else if (isVNode(object) && object.dom) {
        return cloneVNode(object);
    }
    return object;
}
function normaliseChild(children, i) {
    var child = children[i];
    children[i] = normalise(child);
    return children[i];
}
function removeChild(parentDom, dom) {
    parentDom.removeChild(dom);
}
function removeAllChildren(dom, children, lifecycle, shallowUnmount) {
    dom.textContent = '';
    for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (!isInvalid(child)) {
            unmount(child, null, lifecycle, true, shallowUnmount);
        }
    }
}
function isKeyed(lastChildren, nextChildren) {
    if (lastChildren.complex) {
        return false;
    }
    return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
        && lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
function formSelectValueFindOptions(dom, value, isMap) {
    var child = dom.firstChild;
    while (child) {
        var tagName = child.tagName;
        if (tagName === 'OPTION') {
            child.selected = !!((!isMap && child.value === value) || (isMap && value.get(child.value)));
        }
        else if (tagName === 'OPTGROUP') {
            formSelectValueFindOptions(child, value, isMap);
        }
        child = child.nextSibling;
    }
}
function formSelectValue(dom, value) {
    var isMap = false;
    if (!isNullOrUndef(value)) {
        if (isArray(value)) {
            // Map vs Object v using reduce here for perf?
            value = value.reduce(function (o, v) { return o.set(v, true); }, new Map());
            isMap = true;
        }
        else {
            // convert to string
            value = value + '';
        }
        formSelectValueFindOptions(dom, value, isMap);
    }
}
function resetFormInputProperties(dom) {
    if (dom.checked) {
        dom.checked = false;
    }
    if (dom.disabled) {
        dom.disabled = false;
    }
}

function mountStaticChildren(children, dom, isSVG) {
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            mountStaticChildren(child, dom, isSVG);
        }
    }
    else if (isStringOrNumber(children)) {
        dom.appendChild(document.createTextNode(children));
    }
    else if (!isInvalid(children)) {
        mountStaticNode(children, dom, isSVG);
    }
}
function mountStaticNode(node, parentDom, isSVG) {
    var tag = node.tag;
    if (tag === 'svg') {
        isSVG = true;
    }
    var dom = documentCreateElement(tag, isSVG);
    var children = node.children;
    if (!isNull(children)) {
        mountStaticChildren(children, dom, isSVG);
    }
    var props = node.props;
    if (!isNull(props)) {
        for (var prop in props) {
            if (!props.hasOwnProperty(prop)) {
                continue;
            }
            patchProp(prop, null, props[prop], dom, isSVG);
        }
    }
    if (parentDom) {
        parentDom.appendChild(dom);
    }
    return dom;
}
function createStaticVElementClone(bp, isSVG) {
    if (!isBrowser) {
        return null;
    }
    var staticNode = bp.staticVElement;
    var dom = mountStaticNode(staticNode, null, isSVG);
    if (isSVG) {
        bp.svgClone = dom;
    }
    else {
        bp.clone = dom;
    }
    return dom.cloneNode(true);
}

function createVComponent(type, props, key, hooks, ref) {
    return {
        type: type,
        dom: null,
        hooks: hooks || null,
        instance: null,
        key: key,
        nodeType: COMPONENT,
        props: props,
        ref: ref || null
    };
}
function createVText(text) {
    return {
        dom: null,
        text: text,
        nodeType: TEXT
    };
}
function createVElement(tag, props, children, key, ref, childrenType) {
    return {
        children: children,
        childrenType: childrenType || UNKNOWN,
        dom: null,
        key: key,
        nodeType: ELEMENT,
        props: props,
        ref: ref || null,
        tag: tag
    };
}

function createVFragment(children, childrenType) {
    return {
        children: children,
        childrenType: childrenType || UNKNOWN,
        dom: null,
        nodeType: FRAGMENT,
        pointer: null
    };
}
function createVPlaceholder() {
    return {
        dom: null,
        nodeType: PLACEHOLDER
    };
}
function isVNode(o) {
    return !isUndefined(o.nodeType);
}

var noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
var componentCallbackQueue = new Map();
function addToQueue(component, force, callback) {
    // TODO this function needs to be revised and improved on
    var queue = componentCallbackQueue.get(component);
    if (!queue) {
        queue = [];
        componentCallbackQueue.set(component, queue);
        requestAnimationFrame(function () {
            applyState(component, force, function () {
                for (var i = 0; i < queue.length; i++) {
                    queue[i]();
                }
            });
            componentCallbackQueue.delete(component);
            component._processingSetState = false;
        });
    }
    if (callback) {
        queue.push(callback);
    }
}
function queueStateChanges(component, newState, callback) {
    if (isFunction(newState)) {
        newState = newState(component.state);
    }
    for (var stateKey in newState) {
        component._pendingState[stateKey] = newState[stateKey];
    }
    if (!component._pendingSetState) {
        if (component._processingSetState || callback) {
            addToQueue(component, false, callback);
        }
        else {
            component._pendingSetState = true;
            component._processingSetState = true;
            applyState(component, false, callback);
            component._processingSetState = false;
        }
    }
    else {
        component.state = Object.assign({}, component.state, component._pendingState);
        component._pendingState = {};
    }
}
function applyState(component, force, callback) {
    if ((!component._deferSetState || force) && !component._blockRender) {
        component._pendingSetState = false;
        var pendingState = component._pendingState;
        var prevState = component.state;
        var nextState = Object.assign({}, prevState, pendingState);
        var props = component.props;
        var context = component.context;
        component._pendingState = {};
        var nextInput = component._updateComponent(prevState, nextState, props, props, context, force);
        var didUpdate = true;
        if (isInvalid(nextInput)) {
            nextInput = createVPlaceholder();
        }
        else if (isArray(nextInput)) {
            nextInput = createVFragment(nextInput, null);
        }
        else if (nextInput === NO_OP) {
            nextInput = component._lastInput;
            didUpdate = false;
        }
        var lastInput = component._lastInput;
        var parentDom = lastInput.dom.parentNode;
        component._lastInput = nextInput;
        if (didUpdate) {
            var subLifecycle = new Lifecycle();
            var childContext = component.getChildContext();
            if (!isNullOrUndef(childContext)) {
                childContext = Object.assign({}, context, component._childContext, childContext);
            }
            else {
                childContext = Object.assign({}, context, component._childContext);
            }
            component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
            subLifecycle.trigger();
            component.componentDidUpdate(props, prevState);
        }
        component._vComponent.dom = nextInput.dom;
        component._componentToDOMNodeMap.set(component, nextInput.dom);
        if (!isNullOrUndef(callback)) {
            callback();
        }
    }
}
var Component = function Component(props, context) {
    this.state = {};
    this.refs = {};
    this._processingSetState = false;
    this._blockRender = false;
    this._blockSetState = false;
    this._deferSetState = false;
    this._pendingSetState = false;
    this._pendingState = {};
    this._lastInput = null;
    this._vComponent = null;
    this._unmounted = true;
    this._devToolsStatus = null;
    this._devToolsId = null;
    this._childContext = null;
    this._patch = null;
    this._isSVG = false;
    this._componentToDOMNodeMap = null;
    /** @type {object} */
    this.props = props || {};
    /** @type {object} */
    this.context = context || {};
    if (!this.componentDidMount) {
        this.componentDidMount = null;
    }
};
Component.prototype.render = function render (nextProps, nextContext) {
};
Component.prototype.forceUpdate = function forceUpdate (callback) {
    if (this._unmounted) {
        throw Error(noOp);
    }
    applyState(this, true, callback);
};
Component.prototype.setState = function setState (newState, callback) {
    if (this._unmounted) {
        throw Error(noOp);
    }
    if (this._blockSetState === false) {
        queueStateChanges(this, newState, callback);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError('cannot update state via setState() in componentWillUpdate().');
        }
        throwError();
    }
};
Component.prototype.componentWillMount = function componentWillMount () {
};
Component.prototype.componentWillUnmount = function componentWillUnmount () {
};
Component.prototype.componentDidUpdate = function componentDidUpdate (prevProps, prevState, prevContext) {
};
Component.prototype.shouldComponentUpdate = function shouldComponentUpdate (nextProps, nextState, context) {
    return true;
};
Component.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps, context) {
};
Component.prototype.componentWillUpdate = function componentWillUpdate (nextProps, nextState, nextContext) {
};
Component.prototype.getChildContext = function getChildContext () {
};
Component.prototype._updateComponent = function _updateComponent (prevState, nextState, prevProps, nextProps, context, force) {
    if (this._unmounted === true) {
        throw new Error('You can\'t update an unmounted component!');
    }
    if (!isNullOrUndef(nextProps) && isNullOrUndef(nextProps.children)) {
        nextProps.children = prevProps.children;
    }
    if (prevProps !== nextProps || prevState !== nextState || force) {
        if (prevProps !== nextProps) {
            this._blockRender = true;
            this.componentWillReceiveProps(nextProps, context);
            this._blockRender = false;
            if (this._pendingSetState) {
                nextState = Object.assign({}, nextState, this._pendingState);
                this._pendingSetState = false;
                this._pendingState = {};
            }
        }
        var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState, context);
        if (shouldUpdate !== false || force) {
            this._blockSetState = true;
            this.componentWillUpdate(nextProps, nextState, context);
            this._blockSetState = false;
            this.props = nextProps;
            this.state = nextState;
            this.context = context;
            this.beforeRender && this.beforeRender();
            var render = this.render(nextProps, context);
            this.afterRender && this.afterRender();
            return render;
        }
    }
    return NO_OP;
};

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning$1(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message);
    }
    /* eslint-enable no-console */
    try {
        // This error was thrown as a convenience so that if you enable
        // "break on all exceptions" in your console,
        // it would pause the execution at this line.
        throw new Error(message);
    }
    catch (e) { }
    /* eslint-enable no-empty */
}
function shallowEqual(objA, objB) {
    if (objA === objB) {
        return true;
    }
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) {
        return false;
    }
    // Test for A's keys different from B.
    var hasOwn = Object.prototype.hasOwnProperty;
    for (var i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(objB, keysA[i]) ||
            objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }
    return true;
}
function wrapActionCreators(actionCreators) {
    return function (dispatch) { return redux.bindActionCreators(actionCreators, dispatch); };
}

var didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
    if (didWarnAboutReceivingStore) {
        return;
    }
    didWarnAboutReceivingStore = true;
    warning$1('<Provider> does not support changing `store` on the fly.');
}
var Provider = (function (Component$$1) {
    function Provider(props, context) {
        Component$$1.call(this, props, context);
        this.store = props.store;
    }

    if ( Component$$1 ) Provider.__proto__ = Component$$1;
    Provider.prototype = Object.create( Component$$1 && Component$$1.prototype );
    Provider.prototype.constructor = Provider;
    Provider.prototype.getChildContext = function getChildContext () {
        return { store: this.store };
    };
    Provider.prototype.render = function render () {
        if (isNullOrUndef(this.props.children) || toArray(this.props.children).length !== 1) {
            throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
        }
        return this.props.children;
    };

    return Provider;
}(Component));
if (process.env.NODE_ENV !== 'production') {
    Provider.prototype.componentWillReceiveProps = function (nextProps) {
        var ref = this;
        var store = ref.store;
        var nextStore = nextProps.store;
        if (store !== nextStore) {
            warnAboutReceivingStore();
        }
    };
}

// From https://github.com/lodash/lodash/blob/es
function overArg(func, transform) {
    return function (arg) {
        return func(transform(arg));
    };
}
var getPrototype = overArg(Object.getPrototypeOf, Object);
function isObjectLike(value) {
    return value != null && typeof value === 'object';
}
var objectTag = '[object Object]';
var funcProto = Function.prototype;
var objectProto = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty = objectProto.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
var objectToString = objectProto.toString;
function isPlainObject(value) {
    if (!isObjectLike(value) || objectToString.call(value) !== objectTag) {
        return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
        return true;
    }
    var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return (typeof Ctor === 'function' &&
        Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString);
}

var errorObject = { value: null };
var defaultMapStateToProps = function (state) { return ({}); }; // eslint-disable-line no-unused-vars
var defaultMapDispatchToProps = function (dispatch) { return ({ dispatch: dispatch }); };
var defaultMergeProps = function (stateProps, dispatchProps, parentProps) { return Object.assign({}, parentProps, stateProps, dispatchProps); };
function tryCatch(fn, ctx) {
    try {
        return fn.apply(ctx);
    }
    catch (e) {
        errorObject.value = e;
        return errorObject;
    }
}
function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
// Helps track hot reloading.
var nextVersion = 0;
function connect(mapStateToProps, mapDispatchToProps, mergeProps, options) {
    if ( options === void 0 ) options = {};

    var shouldSubscribe = Boolean(mapStateToProps);
    var mapState = mapStateToProps || defaultMapStateToProps;
    var mapDispatch;
    if (isFunction(mapDispatchToProps)) {
        mapDispatch = mapDispatchToProps;
    }
    else if (!mapDispatchToProps) {
        mapDispatch = defaultMapDispatchToProps;
    }
    else {
        mapDispatch = wrapActionCreators(mapDispatchToProps);
    }
    var finalMergeProps = mergeProps || defaultMergeProps;
    var pure = options.pure; if ( pure === void 0 ) pure = true;
    var withRef = options.withRef; if ( withRef === void 0 ) withRef = false;
    var checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;
    // Helps track hot reloading.
    var version = nextVersion++;
    return function wrapWithConnect(WrappedComponent) {
        var connectDisplayName = "Connect(" + (getDisplayName(WrappedComponent)) + ")";
        function checkStateShape(props, methodName) {
            if (!isPlainObject(props)) {
                warning$1(methodName + "() in " + connectDisplayName + " must return a plain object. " +
                    "Instead received " + props + ".");
            }
        }
        function computeMergedProps(stateProps, dispatchProps, parentProps) {
            var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
            if (process.env.NODE_ENV !== 'production') {
                checkStateShape(mergedProps, 'mergeProps');
            }
            return mergedProps;
        }
        var Connect = (function (Component$$1) {
            function Connect(props, context) {
                var this$1 = this;

                Component$$1.call(this, props, context);
                this.version = version;
                this.store = (props && props.store) || (context && context.store);
                this.componentDidMount = function () {
                    this$1.trySubscribe();
                };
                if (!this.store) {
                    throwError('Could not find "store" in either the context or ' +
                        "props of \"" + connectDisplayName + "\". " +
                        'Either wrap the root component in a <Provider>, ' +
                        "or explicitly pass \"store\" as a prop to \"" + connectDisplayName + "\".");
                }
                var storeState = this.store.getState();
                this.state = { storeState: storeState };
                this.clearCache();
            }

            if ( Component$$1 ) Connect.__proto__ = Component$$1;
            Connect.prototype = Object.create( Component$$1 && Component$$1.prototype );
            Connect.prototype.constructor = Connect;
            Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate () {
                return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
            };
            Connect.prototype.computeStateProps = function computeStateProps (store, props) {
                if (!this.finalMapStateToProps) {
                    return this.configureFinalMapState(store, props);
                }
                var state = store.getState();
                var stateProps = this.doStatePropsDependOnOwnProps ?
                    this.finalMapStateToProps(state, props) :
                    this.finalMapStateToProps(state);
                return stateProps;
            };
            Connect.prototype.configureFinalMapState = function configureFinalMapState (store, props) {
                var mappedState = mapState(store.getState(), props);
                var isFactory = isFunction(mappedState);
                this.finalMapStateToProps = isFactory ? mappedState : mapState;
                this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;
                if (isFactory) {
                    return this.computeStateProps(store, props);
                }
                return mappedState;
            };
            Connect.prototype.computeDispatchProps = function computeDispatchProps (store, props) {
                if (!this.finalMapDispatchToProps) {
                    return this.configureFinalMapDispatch(store, props);
                }
                var dispatch = store.dispatch;
                var dispatchProps = this.doDispatchPropsDependOnOwnProps ?
                    this.finalMapDispatchToProps(dispatch, props) :
                    this.finalMapDispatchToProps(dispatch);
                return dispatchProps;
            };
            Connect.prototype.configureFinalMapDispatch = function configureFinalMapDispatch (store, props) {
                var mappedDispatch = mapDispatch(store.dispatch, props);
                var isFactory = isFunction(mappedDispatch);
                this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
                this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;
                if (isFactory) {
                    return this.computeDispatchProps(store, props);
                }
                return mappedDispatch;
            };
            Connect.prototype.updateStatePropsIfNeeded = function updateStatePropsIfNeeded () {
                var nextStateProps = this.computeStateProps(this.store, this.props);
                if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
                    return false;
                }
                this.stateProps = nextStateProps;
                return true;
            };
            Connect.prototype.updateDispatchPropsIfNeeded = function updateDispatchPropsIfNeeded () {
                var nextDispatchProps = this.computeDispatchProps(this.store, this.props);
                if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
                    return false;
                }
                this.dispatchProps = nextDispatchProps;
                return true;
            };
            Connect.prototype.updateMergedPropsIfNeeded = function updateMergedPropsIfNeeded () {
                var nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);
                if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
                    return false;
                }
                this.mergedProps = nextMergedProps;
                return true;
            };
            Connect.prototype.isSubscribed = function isSubscribed () {
                return isFunction(this.unsubscribe);
            };
            Connect.prototype.trySubscribe = function trySubscribe () {
                if (shouldSubscribe && !this.unsubscribe) {
                    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
                    this.handleChange();
                }
            };
            Connect.prototype.tryUnsubscribe = function tryUnsubscribe () {
                if (this.unsubscribe) {
                    this.unsubscribe();
                    this.unsubscribe = null;
                }
            };
            Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps (nextProps) {
                if (!pure || !shallowEqual(nextProps, this.props)) {
                    this.haveOwnPropsChanged = true;
                }
            };
            Connect.prototype.componentWillUnmount = function componentWillUnmount () {
                this.tryUnsubscribe();
                this.clearCache();
            };
            Connect.prototype.clearCache = function clearCache () {
                this.dispatchProps = null;
                this.stateProps = null;
                this.mergedProps = null;
                this.haveOwnPropsChanged = true;
                this.hasStoreStateChanged = true;
                this.haveStatePropsBeenPrecalculated = false;
                this.statePropsPrecalculationError = null;
                this.renderedElement = null;
                this.finalMapDispatchToProps = null;
                this.finalMapStateToProps = null;
            };
            Connect.prototype.handleChange = function handleChange () {
                if (!this.unsubscribe) {
                    return;
                }
                var storeState = this.store.getState();
                var prevStoreState = this.state.storeState;
                if (pure && prevStoreState === storeState) {
                    return;
                }
                if (pure && !this.doStatePropsDependOnOwnProps) {
                    var haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
                    if (!haveStatePropsChanged) {
                        return;
                    }
                    if (haveStatePropsChanged === errorObject) {
                        this.statePropsPrecalculationError = errorObject.value;
                    }
                    this.haveStatePropsBeenPrecalculated = true;
                }
                this.hasStoreStateChanged = true;
                this.setState({ storeState: storeState });
            };
            Connect.prototype.getWrappedInstance = function getWrappedInstance () {
                return this.refs.wrappedInstance;
            };
            Connect.prototype.render = function render () {
                var ref = this;
                var haveOwnPropsChanged = ref.haveOwnPropsChanged;
                var hasStoreStateChanged = ref.hasStoreStateChanged;
                var haveStatePropsBeenPrecalculated = ref.haveStatePropsBeenPrecalculated;
                var statePropsPrecalculationError = ref.statePropsPrecalculationError;
                var renderedElement = ref.renderedElement;
                this.haveOwnPropsChanged = false;
                this.hasStoreStateChanged = false;
                this.haveStatePropsBeenPrecalculated = false;
                this.statePropsPrecalculationError = null;
                if (statePropsPrecalculationError) {
                    throw statePropsPrecalculationError;
                }
                var shouldUpdateStateProps = true;
                var shouldUpdateDispatchProps = true;
                if (pure && renderedElement) {
                    shouldUpdateStateProps = hasStoreStateChanged || (haveOwnPropsChanged && this.doStatePropsDependOnOwnProps);
                    shouldUpdateDispatchProps =
                        haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
                }
                var haveStatePropsChanged = false;
                var haveDispatchPropsChanged = false;
                if (haveStatePropsBeenPrecalculated) {
                    haveStatePropsChanged = true;
                }
                else if (shouldUpdateStateProps) {
                    haveStatePropsChanged = this.updateStatePropsIfNeeded();
                }
                if (shouldUpdateDispatchProps) {
                    haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
                }
                var haveMergedPropsChanged = true;
                if (haveStatePropsChanged ||
                    haveDispatchPropsChanged ||
                    haveOwnPropsChanged) {
                    haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
                }
                else {
                    haveMergedPropsChanged = false;
                }
                if (!haveMergedPropsChanged && renderedElement) {
                    return renderedElement;
                }
                if (withRef) {
                    this.renderedElement = createVComponent(WrappedComponent, Object.assign({}, this.mergedProps, { ref: 'wrappedInstance' }));
                }
                else {
                    this.renderedElement = createVComponent(WrappedComponent, this.mergedProps);
                }
                return this.renderedElement;
            };

            return Connect;
        }(Component));
        Connect.displayName = connectDisplayName;
        Connect.WrappedComponent = WrappedComponent;
        if (process.env.NODE_ENV !== 'production') {
            Connect.prototype.componentWillUpdate = function componentWillUpdate() {
                if (this.version === version) {
                    return;
                }
                // We are hot reloading!
                this.version = version;
                this.trySubscribe();
                this.clearCache();
            };
        }
        return hoistStatics(Connect, WrappedComponent);
    };
}

var index = {
	Provider: Provider,
	connect: connect,
};

return index;

})));
