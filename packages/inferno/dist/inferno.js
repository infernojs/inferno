/*!
 * inferno v1.0.0-beta6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, (function () { 'use strict';

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
    VNodeFlags[VNodeFlags["Fragment"] = 1024] = "Fragment";
    VNodeFlags[VNodeFlags["Void"] = 2048] = "Void";
    VNodeFlags[VNodeFlags["Element"] = 962] = "Element";
    VNodeFlags[VNodeFlags["Component"] = 12] = "Component";
})(VNodeFlags || (VNodeFlags = {}));
function createVNode(type, props, children, flags, key, ref, className) {
    return {
        children: children || null,
        className: className || null,
        dom: null,
        flags: flags,
        key: key === undefined ? null : key,
        props: props || null,
        ref: ref || null,
        type: type
    };
}
function createFragmentVNode(children) {
    return createVNode(null, null, children, VNodeFlags.Fragment, null, null, null);
}
function createVoidVNode() {
    return createVNode(null, null, null, VNodeFlags.Void, null, null, null);
}
function isVNode(o) {
    return !!o.flags;
}

var NO_OP = '$NO_OP';
var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
var isBrowser = typeof window !== 'undefined' && window.document;

function isArray(obj) {
    return obj instanceof Array;
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
function warning(condition, message) {
    if (!condition) {
        console.error(message);
    }
}
var EMPTY_OBJ = {};

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

function unmount(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var flags = vNode.flags;
    if (flags & VNodeFlags.Component) {
        unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount);
    }
    else if (flags & VNodeFlags.Element) {
        unmountElement(vNode, parentDom, lifecycle, shallowUnmount);
    }
    else if (flags & VNodeFlags.Fragment) {
        unmountFragment(vNode, parentDom, true, lifecycle, shallowUnmount);
    }
    else if (flags & VNodeFlags.Text) {
        unmountText(vNode, parentDom);
    }
    else if (flags & VNodeFlags.Void) {
        unmountVoid(vNode, parentDom);
    }
}
function unmountVoid(vNode, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vNode.dom);
    }
}
function unmountText(vNode, parentDom) {
    if (parentDom) {
        removeChild(parentDom, vNode.dom);
    }
}
function unmountFragment(vNode, parentDom, removePointer, lifecycle, shallowUnmount) {
    var children = vNode.children;
    var childrenLength = children.length;
    // const pointer = vNode.pointer;
    if (!shallowUnmount && childrenLength > 0) {
        for (var i = 0; i < childrenLength; i++) {
            var child = children[i];
            if (child.flags === VNodeFlags.Fragment) {
                unmountFragment(child, parentDom, true, lifecycle, false);
            }
            else {
                unmount(child, parentDom, lifecycle, false, shallowUnmount);
            }
        }
    }
    // if (parentDom && removePointer) {
    // 	removeChild(parentDom, pointer);
    // }
}
function unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
    var instance = vNode.children;
    if (!shallowUnmount) {
        var instanceHooks = null;
        vNode.unmounted = true;
        if (!isNullOrUndef(instance)) {
            instanceHooks = instance.ref;
            if (instance.render !== undefined) {
                var ref = vNode.ref;
                if (ref) {
                    ref(null);
                }
                instance.componentWillUnmount();
                instance._unmounted = true;
                componentToDOMNodeMap.delete(instance);
                unmount(instance._lastInput, null, lifecycle, false, shallowUnmount);
            }
            else {
                unmount(instance, null, lifecycle, false, shallowUnmount);
            }
        }
        var hooks = vNode.ref || instanceHooks;
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
        if (lastInput.flags === VNodeFlags.Fragment) {
            unmountFragment(lastInput, parentDom, true, lifecycle, true);
        }
        else {
            removeChild(parentDom, vNode.dom);
        }
    }
    // if (recyclingEnabled && (parentDom || canRecycle)) {
    // 	poolVComponent(vComponent);
    // }
}
function unmountElement(vNode, parentDom, lifecycle, shallowUnmount) {
    var dom = vNode.dom;
    var ref = vNode.ref;
    if (!shallowUnmount) {
        if (ref) {
            unmountRef(ref);
        }
        var children = vNode.children;
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

// import {
// 	getIncrementalId,
// 	componentIdMap
// } from './devtools';
function patch(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG) {
    if (lastVNode !== nextVNode) {
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        if (nextFlags & VNodeFlags.Component) {
            if (lastFlags & VNodeFlags.Component) {
                patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, nextFlags & VNodeFlags.ComponentClass);
            }
            else {
                replaceVNode(parentDom, mountComponent(nextVNode, null, lifecycle, context, isSVG, nextFlags & VNodeFlags.ComponentClass), lastVNode, lifecycle);
            }
        }
        else if (nextFlags & VNodeFlags.Element) {
            if (lastFlags & VNodeFlags.Element) {
                patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
            }
            else {
                replaceVNode(parentDom, mountElement(nextVNode, null, lifecycle, context, isSVG), lastVNode, lifecycle);
            }
        }
        else {
            if (lastFlags & (VNodeFlags.Component | VNodeFlags.Element)) {
                replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
            }
            else {
                if (process.env.NODE_ENV !== 'production') {
                    throwError('bad input argument called on patch(). Input argument may need normalising.');
                }
                throwError();
            }
        }
    }
}
function patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG) {
    var nextTag = nextVNode.type;
    var lastTag = lastVNode.type;
    if (lastTag !== nextTag) {
        replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
    }
    else {
        var dom = lastVNode.dom;
        var lastProps = lastVNode.props;
        var nextProps = nextVNode.props;
        var lastChildren = lastVNode.children;
        var nextChildren = nextVNode.children;
        var lastFlags = lastVNode.flags;
        var nextFlags = nextVNode.flags;
        nextVNode.dom = dom;
        if (lastChildren !== nextChildren) {
            if (isString(lastChildren) && isString(nextChildren)) {
                updateTextContent(dom, nextChildren);
            }
            else if (isVNode(lastChildren) && isVNode(nextChildren)) {
                patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
            }
            else {
                if (isArray(nextChildren)) {
                    if (isArray(lastChildren)) {
                        // check if we can do keyed updates
                        if ((lastFlags & VNodeFlags.HasKeyedChildren) && (nextFlags & VNodeFlags.HasKeyedChildren)) {
                            patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
                        }
                        else if (nextFlags & VNodeFlags.HasNonKeyedChildren) {
                            patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
                        }
                        else {
                            // we can do a validation check here, but for now just do non keyed
                            patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
                        }
                    }
                    else {
                    }
                }
                else {
                    if (isArray(lastChildren)) {
                        removeAllChildren(dom, lastChildren, lifecycle, false);
                        mount(nextChildren, dom, lifecycle, context, isSVG);
                    }
                    else {
                    }
                }
            }
        }
        if (lastProps !== nextProps) {
            patchProps(lastProps, nextProps, dom, lifecycle, context, isSVG);
        }
    }
}
// function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	switch (childrenType) {
// 		case CHILDREN_TEXT:
// 			updateTextContent(parentDom, nextChildren);
// 			break;
// 		case NODE:
// 			patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			break;
// 		case KEYED:
// 			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
// 			break;
// 		case NON_KEYED:
// 			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, false, shallowUnmount);
// 			break;
// 		case UNKNOWN:
// 			patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			break;
// 		default:
// 			if (process.env.NODE_ENV !== 'production') {
// 				throwError('bad childrenType value specified when attempting to patchChildren.');
// 			}
// 			throwError();
// 	}
// }
// 	if (isInvalid(nextChildren)) {
// 		if (!isInvalid(lastChildren)) {
// 			if (isVNode(lastChildren)) {
// 				unmount(lastChildren, parentDom, lifecycle, true, shallowUnmount);
// 			} else { // If lastChildren ain't VNode we assume its array
// 				removeAllChildren(parentDom, lastChildren, lifecycle, shallowUnmount);
// 			}
// 		}
// 	} else if (isInvalid(lastChildren)) {
// 		if (isStringOrNumber(nextChildren)) {
// 			setTextContent(parentDom, nextChildren);
// 		} else if (!isInvalid(nextChildren)) {
// 			if (isArray(nextChildren)) {
// 				mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			} else {
// 				mount(nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 			}
// 		}
// 	} else if (isVNode(lastChildren) && isVNode(nextChildren)) {
// 		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (isStringOrNumber(nextChildren)) {
// 		if (isStringOrNumber(lastChildren)) {
// 			updateTextContent(parentDom, nextChildren);
// 		} else {
// 			setTextContent(parentDom, nextChildren);
// 		}
// 	} else if (isStringOrNumber(lastChildren)) {
// 		const child = normalise(lastChildren);
// 		child.dom = parentDom.firstChild;
// 		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (isArray(nextChildren)) {
// 		if (isArray(lastChildren)) {
// 			nextChildren.complex = lastChildren.complex;
// 			if (isKeyed(lastChildren, nextChildren)) {
// 				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, shallowUnmount);
// 			} else {
// 				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
// 			}
// 		} else {
// 			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
// 		}
// 	} else if (isArray(lastChildren)) {
// 		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null, true, shallowUnmount);
// 	} else {
// 		if (process.env.NODE_ENV !== 'production') {
// 			throwError('bad input argument called on patchChildrenWithUnknownType(). Input argument may need normalising.');
// 		}
// 		throwError();
// 	}
// }
function patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isClass) {
    var lastType = lastVNode.type;
    var nextType = nextVNode.type;
    var nextProps = nextVNode.props || EMPTY_OBJ;
    if (lastType !== nextType) {
        if (isClass) {
            replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG);
        }
        else {
            var lastInput = lastVNode.children._lastInput || lastVNode.children;
            var nextInput = createStatelessComponentInput(nextType, nextProps, context);
            patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
            var dom = nextVNode.dom = nextInput.dom;
            nextVNode.children = nextInput;
            mountStatelessComponentCallbacks(nextVNode.ref, dom, lifecycle);
            unmount(lastVNode, null, lifecycle, false, false);
        }
    }
    else {
        if (isClass) {
            var instance = lastVNode.children;
            if (instance._unmounted) {
                if (isNull(parentDom)) {
                    return true;
                }
                replaceChild(parentDom, mountComponent(nextVNode, null, lifecycle, context, isSVG, nextVNode.flags & VNodeFlags.ComponentClass), lastVNode.dom);
            }
            else {
                var defaultProps = nextType.defaultProps;
                var lastProps = instance.props;
                // if (instance._devToolsStatus.connected && !instance._devToolsId) {
                // 	componentIdMap.set(instance._devToolsId = getIncrementalId(), instance);
                // }
                if (!isUndefined(defaultProps)) {
                    copyPropsTo(lastProps, nextProps);
                    nextVNode.props = nextProps;
                }
                var lastState = instance.state;
                var nextState = instance.state;
                var childContext = instance.getChildContext();
                nextVNode.children = instance;
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
                    nextInput$1 = createVoidVNode();
                }
                else if (isArray(nextInput$1)) {
                    nextInput$1 = createFragmentVNode(nextInput$1);
                }
                else if (nextInput$1 === NO_OP) {
                    nextInput$1 = lastInput$1;
                    didUpdate = false;
                }
                instance._lastInput = nextInput$1;
                instance._vNode = nextVNode;
                if (didUpdate) {
                    patch(lastInput$1, nextInput$1, parentDom, lifecycle, childContext, isSVG);
                    instance.componentDidUpdate(lastProps, lastState);
                    componentToDOMNodeMap.set(instance, nextInput$1.dom);
                }
                nextVNode.dom = nextInput$1.dom;
            }
        }
        else {
            var shouldUpdate = true;
            var lastProps$1 = lastVNode.props;
            var nextHooks = nextVNode.ref;
            var nextHooksDefined = !isNullOrUndef(nextHooks);
            var lastInput$2 = lastVNode.children;
            nextVNode.dom = lastVNode.dom;
            nextVNode.children = lastInput$2;
            if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
                shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps$1, nextProps);
            }
            if (shouldUpdate !== false) {
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
                    nextHooks.onComponentWillUpdate(lastProps$1, nextProps);
                }
                var nextInput$2 = nextType(nextProps, context);
                if (isInvalid(nextInput$2)) {
                    nextInput$2 = createVoidVNode();
                }
                else if (isArray(nextInput$2)) {
                    nextInput$2 = createFragmentVNode(nextInput$2);
                }
                else if (nextInput$2 === NO_OP) {
                    return false;
                }
                patch(lastInput$2, nextInput$2, parentDom, lifecycle, context, isSVG);
                nextVNode.children = nextInput$2;
                if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
                    nextHooks.onComponentDidUpdate(lastProps$1, nextProps);
                }
            }
        }
    }
    return false;
}


function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG) {
    var lastChildrenLength = lastChildren.length;
    var nextChildrenLength = nextChildren.length;
    var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
    var i = 0;
    for (; i < commonLength; i++) {
        var lastChild = lastChildren[i];
        var nextChild = nextChildren[i];
        patch(lastChild, nextChild, dom, lifecycle, context, isSVG);
    }
    if (lastChildrenLength < nextChildrenLength) {
        for (i = commonLength; i < nextChildrenLength; i++) {
            var child = nextChildren[i];
            appendChild(dom, mount(child, null, lifecycle, context, isSVG));
        }
    }
    else if (lastChildrenLength > nextChildrenLength) {
        for (i = commonLength; i < lastChildrenLength; i++) {
            unmount(lastChildren[i], dom, lifecycle, false, false);
        }
    }
}
function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG) {
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
            mountArrayChildren(b, dom, lifecycle, context, isSVG);
        }
        return;
    }
    else if (bLength === 0) {
        if (aLength !== 0) {
            removeAllChildren(dom, a, lifecycle, false);
        }
        return;
    }
    // Step 1
    /* eslint no-constant-condition: 0 */
    outer: while (true) {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG);
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
            patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG);
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
            patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG);
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
            patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG);
            nextPos = bEnd + 1;
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
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
            nextNode = nextPos < b.length ? b[nextPos].dom : null;
            while (bStart <= bEnd) {
                insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), nextNode);
            }
        }
    }
    else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            unmount(a[aStart++], dom, lifecycle, false, false);
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
                            patch(aNode, bNode, dom, lifecycle, context, isSVG);
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
                        patch(aNode, bNode, dom, lifecycle, context, isSVG);
                        patched++;
                        aNullable[i] = null;
                    }
                }
            }
        }
        if (aLength === a.length && patched === 0) {
            removeAllChildren(dom, a, lifecycle, false);
            while (bStart < bLength) {
                insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), null);
            }
        }
        else {
            i = aLength - patched;
            while (i > 0) {
                aNode = aNullable[aStart++];
                if (!isNull(aNode)) {
                    unmount(aNode, dom, lifecycle, false, false);
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
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
                    }
                    else {
                        if (j < 0 || i !== seq[j]) {
                            pos = i + bStart;
                            node = b[pos];
                            nextPos = pos + 1;
                            nextNode = nextPos < b.length ? b[nextPos].dom : null;
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
                        nextNode = nextPos < b.length ? b[nextPos].dom : null;
                        insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
                    }
                }
            }
        }
    }
}
// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
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
// // returns true if a property has been applied that can't be cloned via elem.cloneNode()
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
function patchProps(lastProps, nextProps, dom, lifecycle, context, isSVG) {
    lastProps = lastProps || EMPTY_OBJ;
    nextProps = nextProps || EMPTY_OBJ;
    if (nextProps !== EMPTY_OBJ) {
        for (var prop in nextProps) {
            var nextValue = nextProps[prop];
            var lastValue = lastProps[prop];
            if (isNullOrUndef(nextValue)) {
                removeProp(prop, dom);
            }
            else {
                patchProp(prop, lastValue, nextValue, dom, isSVG);
            }
        }
    }
    if (lastProps !== EMPTY_OBJ) {
        for (var prop$1 in lastProps) {
            if (isNullOrUndef(nextProps[prop$1])) {
                removeProp(prop$1, dom);
            }
        }
    }
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
        input = createFragmentVNode(input);
    }
    else if (isInvalid(input)) {
        input = createVoidVNode();
    }
    instance._pendingSetState = false;
    instance._lastInput = input;
    return instance;
}
function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
    replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle);
}
function replaceVNode(parentDom, dom, vNode, lifecycle) {
    var shallowUnmount = false;
    // we cannot cache nodeType here as vNode might be re-assigned below
    if (vNode.flags === VNodeFlags.ComponentClass || vNode.flags === VNodeFlags.ComponentFunction) {
        // if we are accessing a stateful or stateless component, we want to access their last rendered input
        // accessing their DOM node is not useful to us here
        // #related to below: unsure about this, but this prevents the lifeycle of components from being fired twice
        unmount(vNode, null, lifecycle, false, false);
        vNode = vNode.instance._lastInput || vNode.instance;
        // #related to above: unsure about this, but this prevents the lifeycle of components from being fired twice
        if (vNode.flags !== VNodeFlags.Fragment) {
            shallowUnmount = true;
        }
    }
    if (vNode.flags === VNodeFlags.Fragment) {
        replaceFragmentWithNode(parentDom, vNode, dom, lifecycle, shallowUnmount);
    }
    else {
        replaceChild(parentDom, dom, vNode.dom);
        unmount(vNode, null, lifecycle, false, shallowUnmount);
    }
}
function createStatelessComponentInput(component, props, context) {
    var input = component(props, context);
    if (isArray(input)) {
        input = createFragmentVNode(input);
    }
    else if (isInvalid(input)) {
        input = createVoidVNode();
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
function replaceFragmentWithNode(parentDom, vFragment, dom, lifecycle, shallowUnmount) {
    var pointer = vFragment.pointer;
    unmountFragment(vFragment, parentDom, false, lifecycle, shallowUnmount);
    replaceChild(parentDom, dom, pointer);
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
function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG) {
    var lastInstance = null;
    var instanceLastNode = lastNode._lastInput;
    if (!isNullOrUndef(instanceLastNode)) {
        lastInstance = lastNode;
        lastNode = instanceLastNode;
    }
    unmount(lastNode, null, lifecycle, true, false);
    var dom = mount(nextNode, null, lifecycle, context, isSVG);
    nextNode.dom = dom;
    replaceChild(parentDom, dom, lastNode.dom);
    if (lastInstance !== null) {
        lastInstance._lasInput = nextNode;
    }
}
function replaceChild(parentDom, nextDom, lastDom) {
    if (!parentDom) {
        parentDom = lastDom.parentNode;
    }
    parentDom.replaceChild(nextDom, lastDom);
}
// export function normalise(object) {
// 	if (isStringOrNumber(object)) {
// 		return createVText(object);
// 	} else if (isInvalid(object)) {
// 		return createVPlaceholder();
// 	} else if (isArray(object)) {
// 		return createVFragment(object, null);
// 	} else if (isVNode(object) && object.dom) {
// 		return cloneVNode(object);
// 	}
// 	return object;
// }
// export function normaliseChild(children, i) {
// 	const child = children[i];
// 	children[i] = normalise(child);
// 	return children[i];
// }
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
// export function isKeyed(lastChildren, nextChildren) {
// 	if (lastChildren.complex) {
// 		return false;
// 	}
// 	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
// 		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
// }
// function formSelectValueFindOptions(dom, value, isMap) {
// 	let child = dom.firstChild;
// 	while (child) {
// 		const tagName = child.tagName;
// 		if (tagName === 'OPTION') {
// 			child.selected = !!((!isMap && child.value === value) || (isMap && value.get(child.value)));
// 		} else if (tagName === 'OPTGROUP') {
// 			formSelectValueFindOptions(child, value, isMap);
// 		}
// 		child = child.nextSibling;
// 	}
// }
// export function formSelectValue(dom, value) {
// 	let isMap = false;
// 	if (!isNullOrUndef(value)) {
// 		if (isArray(value)) {
// 			// Map vs Object v using reduce here for perf?
// 			value = value.reduce((o, v) => o.set(v, true), new Map());
// 			isMap = true;
// 		} else {
// 			// convert to string
// 			value = value + '';
// 		}
// 		formSelectValueFindOptions(dom, value, isMap);
// 	}
// }
// export function resetFormInputProperties(dom) {
// 	if (dom.checked) {
// 		dom.checked = false;
// 	}
// 	if (dom.disabled) {
// 		dom.disabled = false;
// 	}
// }

var devToolsStatus = {
    connected: false
};


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
        render(root.input, root.dom);
    }
}

function sendRoots(global) {
    sendToDevTools(global, { type: 'roots', data: roots });
}

function mount(vNode, parentDom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    if (flags & VNodeFlags.Element) {
        return mountElement(vNode, parentDom, lifecycle, context, isSVG || flags & VNodeFlags.SvgElement);
    }
    else if (flags & VNodeFlags.Component) {
        return mountComponent(vNode, parentDom, lifecycle, context, isSVG, flags & VNodeFlags.ComponentClass);
    }
    else if (flags & VNodeFlags.Void) {
        return mountVoid(vNode, parentDom);
    }
    else if (flags & VNodeFlags.Fragment) {
        return mountFragment(vNode, parentDom, lifecycle, context, isSVG);
    }
    else if (flags & VNodeFlags.Text) {
        return mountText(vNode, parentDom);
    }
    else {
        if (process.env.NODE_ENV !== 'production') {
            throwError(("mount() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode) + "\"."));
        }
        throwError();
    }
}
function mountText(vNode, parentDom) {
    var dom = document.createTextNode(vNode.children);
    vNode.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountVoid(vNode, parentDom) {
    var dom = document.createTextNode('');
    vNode.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var dom = documentCreateElement(tag, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var ref = vNode.ref;
    vNode.dom = dom;
    if (!isNull(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (!isNull(props)) {
        for (var prop in props) {
            // do not add a hasOwnProperty check here, it affects performance
            patchProp(prop, null, props[prop], dom, isSVG);
        }
    }
    if (!isNull(children)) {
        if (isString(children)) {
            setTextContent(dom, children);
        }
        else if (isArray(children)) {
            mountArrayChildren(children, dom, lifecycle, context, isSVG);
        }
        else if (isVNode(children)) {
            mount(children, dom, lifecycle, context, isSVG);
        }
    }
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountArrayChildren(children, dom, lifecycle, context, isSVG) {
    for (var i = 0; i < children.length; i++) {
        mount(children[i], dom, lifecycle, context, isSVG);
    }
}
function mountFragment(vNode, parentDom, lifecycle, context, isSVG) {
    var dom = document.createDocumentFragment();
    mountArrayChildren(vNode.children, dom, lifecycle, context, isSVG);
    vNode.dom = dom;
    if (parentDom) {
        appendChild(parentDom, dom);
    }
    return dom;
}
function mountComponent(vNode, parentDom, lifecycle, context, isSVG, isClass) {
    // 	if (recyclingEnabled) {
    // 		const dom = recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount);
    // 		if (!isNull(dom)) {
    // 			if (!isNull(parentDom)) {
    // 				appendChild(parentDom, dom);
    // 			}
    // 			return dom;
    // 		}
    // 	}
    var type = vNode.type;
    var props = vNode.props || EMPTY_OBJ;
    var ref = vNode.ref;
    var dom;
    if (isClass) {
        var defaultProps = type.defaultProps;
        if (!isUndefined(defaultProps)) {
            copyPropsTo(defaultProps, props);
            vNode.props = props;
        }
        var instance = createStatefulComponentInstance(type, props, context, isSVG, devToolsStatus);
        var input = instance._lastInput;
        instance._vNode = vNode;
        vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
        if (!isNull(parentDom)) {
            appendChild(parentDom, dom);
        }
        mountStatefulComponentCallbacks(ref, instance, lifecycle);
        componentToDOMNodeMap.set(instance, dom);
        vNode.children = instance;
    }
    else {
        var input$1 = createStatelessComponentInput(type, props, context);
        vNode.dom = dom = mount(input$1, null, lifecycle, context, isSVG);
        vNode.children = input$1;
        mountStatelessComponentCallbacks(ref, dom, lifecycle);
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
function mountStatelessComponentCallbacks(ref, dom, lifecycle) {
    if (ref) {
        if (!isNullOrUndef(ref.onComponentWillMount)) {
            ref.onComponentWillMount();
        }
        if (!isNullOrUndef(ref.onComponentDidMount)) {
            lifecycle.addListener(function () { return ref.onComponentDidMount(dom); });
        }
    }
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

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
var roots = [];
var componentToDOMNodeMap = new Map();
function findDOMNode(domNode) {
    return componentToDOMNodeMap.get(domNode) || null;
}
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
function render(input, parentDom) {
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
            }
            // if (!hydrateRoot(input, parentDom, lifecycle)) {
            mount(input, parentDom, lifecycle, {}, false);
            // }
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
            }
            patch(root.input, input, parentDom, lifecycle, {}, false);
        }
        lifecycle.trigger();
        root.input = input;
    }
    // if (devToolsStatus.connected) {
    // sendRoots(window);
    // }
}
function createRenderer() {
    var parentDom;
    return function renderer(lastInput, nextInput) {
        if (!parentDom) {
            parentDom = lastInput;
        }
        render(nextInput, parentDom);
    };
}

// import cloneVNode from '../../../src/factories/cloneVNode';
// import { disableRecycling } from '../../../src/DOM/recycling';
// import { initDevToolsHooks }  from '../../../src/DOM/devtools';

if (isBrowser) {
	window.process = {
		env: {
			NODE_ENV: 'development'
		}
	};
	// initDevToolsHooks(window);
}

if (process.env.NODE_ENV !== 'production') {
	var testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

var index = {
	// core shapes
	createVNode: createVNode,

	// cloning
	//cloneVNode,	

	// TODO do we still need this? can we remove?
	NO_OP: NO_OP,

	//DOM
	render: render,
	findDOMNode: findDOMNode,
	createRenderer: createRenderer
	// disableRecycling
};

return index;

})));
