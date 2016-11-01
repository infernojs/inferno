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
    VNodeFlags[VNodeFlags["SvgElement"] = 4] = "SvgElement";
    VNodeFlags[VNodeFlags["MediaElement"] = 8] = "MediaElement";
    VNodeFlags[VNodeFlags["InputElement"] = 16] = "InputElement";
    VNodeFlags[VNodeFlags["TextAreaElement"] = 32] = "TextAreaElement";
    VNodeFlags[VNodeFlags["Fragment"] = 64] = "Fragment";
    VNodeFlags[VNodeFlags["Void"] = 128] = "Void";
    VNodeFlags[VNodeFlags["ComponentClass"] = 256] = "ComponentClass";
    VNodeFlags[VNodeFlags["ComponentFunction"] = 512] = "ComponentFunction";
})(VNodeFlags || (VNodeFlags = {}));
function createVNode(type, props, children, flags, key, ref) {
    return {
        children: children,
        dom: null,
        flags: flags,
        key: key,
        props: props,
        ref: ref,
        type: type
    };
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
function isInvalid$1(obj) {
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

// export function createStatefulComponentInstance(Component, props, context, isSVG, devToolsStatus) {
// 	const instance = new Component(props, context);
// 	instance.context = context;
// 	instance._patch = patch;
// 	instance._devToolsStatus = devToolsStatus;
// 	instance._componentToDOMNodeMap = componentToDOMNodeMap;
// 	const childContext = instance.getChildContext();
// 	if (!isNullOrUndef(childContext)) {
// 		instance._childContext = Object.assign({}, context, childContext);
// 	} else {
// 		instance._childContext = context;
// 	}
// 	instance._unmounted = false;
// 	instance._pendingSetState = true;
// 	instance._isSVG = isSVG;
// 	instance.componentWillMount();
// 	instance.beforeRender && instance.beforeRender();
// 	let input = instance.render(props, context);
// 	instance.afterRender && instance.afterRender();
// 	if (isArray(input)) {
// 		input = createVFragment(input, null);
// 	} else if (isInvalid(input)) {
// 		input = createVPlaceholder();
// 	}
// 	instance._pendingSetState = false;
// 	instance._lastInput = input;
// 	return instance;
// }
// export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG, shallowUnmount), lastInput, shallowUnmount, lifecycle);
// }
// export function replaceVNode(parentDom, dom, vNode, shallowUnmount, lifecycle) {
// 	// we cannot cache nodeType here as vNode might be re-assigned below
// 	if (vNode.nodeType === COMPONENT) {
// 		// if we are accessing a stateful or stateless component, we want to access their last rendered input
// 		// accessing their DOM node is not useful to us here
// 		// #related to below: unsure about this, but this prevents the lifeycle of components from being fired twice
// 		unmount(vNode, null, lifecycle, false, false);
// 		vNode = vNode.instance._lastInput || vNode.instance;
// 		// #related to above: unsure about this, but this prevents the lifeycle of components from being fired twice
// 		if (vNode.nodeType !== FRAGMENT) {
// 			shallowUnmount = true;
// 		}
// 	}
// 	if (vNode.nodeType === FRAGMENT) {
// 		replaceVFragmentWithNode(parentDom, vNode, dom, lifecycle, shallowUnmount);
// 	} else {
// 		replaceChild(parentDom, dom, vNode.dom);
// 		unmount(vNode, null, lifecycle, false, shallowUnmount);
// 	}
// }
// export function createStatelessComponentInput(component, props, context) {
// 	let input = component(props, context);
// 	if (isArray(input)) {
// 		input = createVFragment(input, null);
// 	} else if (isInvalid(input)) {
// 		input = createVPlaceholder();
// 	}
// 	return input;
// }
function setTextContent(dom, text) {
    if (text !== '') {
        dom.textContent = text;
    }
    else {
        dom.appendChild(document.createTextNode(''));
    }
}

function appendChild(parentDom, dom) {
    parentDom.appendChild(dom);
}

// export function replaceVFragmentWithNode(parentDom, vFragment, dom, lifecycle, shallowUnmount) {
// 	const pointer = vFragment.pointer;
// 	unmountVFragment(vFragment, parentDom, false, lifecycle, shallowUnmount);
// 	replaceChild(parentDom, dom, pointer);
// }
// export function getPropFromOptElement(optVElement, valueType) {
// 	const bp = optVElement.bp;
// 	// TODO check "prop" and "spread"
// 	if (!isNull(bp.v0)) {
// 		if (bp.v0 === valueType) {
// 			return optVElement.v0;
// 		}
// 		if (!isNull(bp.v1)) {
// 			if (bp.v1 === valueType) {
// 				return optVElement.v1;
// 			}
// 			if (!isNull(bp.v2)) {
// 				if (bp.v2 === valueType) {
// 					return optVElement.v2;
// 				}
// 			}
// 		}
// 	}
// }
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
// export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	let lastInstance: any = null;
// 	const instanceLastNode = lastNode._lastInput;
// 	if (!isNullOrUndef(instanceLastNode)) {
// 		lastInstance = lastNode;
// 		lastNode = instanceLastNode;
// 	}
// 	unmount(lastNode, null, lifecycle, true, shallowUnmount);
// 	const dom = mount(nextNode, null, lifecycle, context, isSVG, shallowUnmount);
// 	nextNode.dom = dom;
// 	replaceChild(parentDom, dom, lastNode.dom);
// 	if (lastInstance !== null) {
// 		lastInstance._lasInput = nextNode;
// 	}
// }
// export function replaceChild(parentDom, nextDom, lastDom) {
// 	if (!parentDom) {
// 		parentDom = lastDom.parentNode;
// 	}
// 	parentDom.replaceChild(nextDom, lastDom);
// }
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
// export function removeChild(parentDom, dom) {
// 	parentDom.removeChild(dom);
// }
// export function removeAllChildren(dom, children, lifecycle, shallowUnmount) {
// 	dom.textContent = '';
// 	for (let i = 0; i < children.length; i++) {
// 		const child = children[i];
// 		if (!isInvalid(child)) {
// 			unmount(child, null, lifecycle, true, shallowUnmount);
// 		}
// 	}
// }
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

// import {
// 	getIncrementalId,
// 	componentIdMap
// } from './devtools';

// function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	const nextTag = nextVElement.tag;
// 	const lastTag = lastVElement.tag;
// 	if (nextTag === 'svg') {
// 		isSVG = true;
// 	}
// 	if (lastTag !== nextTag) {
// 		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 	} else {
// 		const dom = lastVElement.dom;
// 		const lastProps = lastVElement.props;
// 		const nextProps = nextVElement.props;
// 		const lastChildren = lastVElement.children;
// 		const nextChildren = nextVElement.children;
// 		nextVElement.dom = dom;
// 		if (lastChildren !== nextChildren) {
// 			const lastChildrenType = lastVElement.childrenType;
// 			const nextChildrenType = nextVElement.childrenType;
// 			if (lastChildrenType === nextChildrenType) {
// 				patchChildren(lastChildrenType, lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
// 			} else {
// 				patchChildrenWithUnknownType(lastChildren, nextChildren, dom, lifecycle, context, isSVG, shallowUnmount);
// 			}
// 		}
// 		if (lastProps !== nextProps) {
// 			const formValue = patchProps(nextVElement, lastProps, nextProps, dom, shallowUnmount, false, isSVG, lifecycle, context);
// 			if (nextTag === 'select') {
// 				formSelectValue(dom, formValue);
// 			}
// 		}
// 	}
// }
// export function patchOptVElement(lastOptVElement, nextOptVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	const dom = lastOptVElement.dom;
// 	const lastBp = lastOptVElement.bp;
// 	const nextBp = nextOptVElement.bp;
// 	nextOptVElement.dom = dom;
// 	if (lastBp !== nextBp) {
// 		const newDom = mountOptVElement(nextOptVElement, null, lifecycle, context, isSVG, shallowUnmount);
// 		replaceChild(parentDom, newDom, dom);
// 		unmount(lastOptVElement, null, lifecycle, true, shallowUnmount);
// 	} else {
// 		const bp0 = nextBp.v0;
// 		const tag = nextBp.staticVElement.tag;
// 		let ignoreDiff = false;
// 		if (tag === 'svg') {
// 			isSVG = true;
// 		} else if (tag === 'input') {
// 			// input elements are problematic due to the large amount of internal state that hold
// 			// so instead of making lots of assumptions, we instead reset common values and re-apply
// 			// the the patching each time
// 			resetFormInputProperties(dom);
// 			ignoreDiff = true;
// 		} else if (tag === 'textarea') {
// 			// textarea elements are like input elements, except they have sligthly less internal state to
// 			// worry about
// 			ignoreDiff = true;
// 		}
// 		if (!isNull(bp0)) {
// 			const lastV0 = lastOptVElement.v0;
// 			const nextV0 = nextOptVElement.v0;
// 			const bp1 = nextBp.v1;
// 			if (lastV0 !== nextV0 || ignoreDiff) {
// 				patchOptVElementValue(nextOptVElement, bp0, lastV0, nextV0, nextBp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
// 			}
// 			if (!isNull(bp1)) {
// 				const lastV1 = lastOptVElement.v1;
// 				const nextV1 = nextOptVElement.v1;
// 				const bp2 = nextBp.v2;
// 				if (lastV1 !== nextV1 || ignoreDiff) {
// 					patchOptVElementValue(nextOptVElement, bp1, lastV1, nextV1, nextBp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
// 				}
// 				if (!isNull(bp2)) {
// 					const lastV2 = lastOptVElement.v2;
// 					const nextV2 = nextOptVElement.v2;
// 					const bp3 = nextBp.v3;
// 					if (lastV2 !== nextV2 || ignoreDiff) {
// 						patchOptVElementValue(nextOptVElement, bp2, lastV2, nextV2, nextBp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
// 					}
// 					if (!isNull(bp3)) {
// 						const d3 = nextBp.d3;
// 						const lastV3s = lastOptVElement.v3;
// 						const nextV3s = nextOptVElement.v3;
// 						for (let i = 0; i < lastV3s.length; i++) {
// 							const lastV3 = lastV3s[i];
// 							const nextV3 = nextV3s[i];
// 							if (lastV3 !== nextV3 || ignoreDiff) {
// 								patchOptVElementValue(nextOptVElement, bp3[i], lastV3, nextV3, d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
// 							}
// 						}
// 					}
// 				}
// 			}
// 		}
// 		if (tag === 'select') {
// 			formSelectValue(dom, getPropFromOptElement(nextOptVElement, PROP_VALUE));
// 		}
// 	}
// }
// function patchOptVElementValue(optVElement, valueType, lastValue, nextValue, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
// 	switch (valueType) {
// 		case CHILDREN:
// 			patchChildren(descriptor, lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
// 			break;
// 		case PROP_CLASS_NAME:
// 			if (isNullOrUndef(nextValue)) {
// 				dom.removeAttribute('class');
// 			} else {
// 				if (isSVG) {
// 					dom.setAttribute('class', nextValue);
// 				} else {
// 					dom.className = nextValue;
// 				}
// 			}
// 			break;
// 		case PROP_DATA:
// 			dom.dataset[descriptor] = nextValue;
// 			break;
// 		case PROP_STYLE:
// 			patchStyle(lastValue, nextValue, dom);
// 			break;
// 		case PROP_VALUE:
// 			dom.value = isNullOrUndef(nextValue) ? '' : nextValue;
// 			break;
// 		case PROP:
// 			patchProp(descriptor, lastValue, nextValue, dom, isSVG);
// 			break;
// 		case PROP_SPREAD:
// 			patchProps(optVElement, lastValue, nextValue, dom, shallowUnmount, true, isSVG, lifecycle, context);
// 			break;
// 		default:
// 			// TODO
// 	}
// }
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
// export function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	const lastType = lastVComponent.type;
// 	const nextType = nextVComponent.type;
// 	const nextProps = nextVComponent.props || {};
// 	if (lastType !== nextType) {
// 		if (isStatefulComponent(nextVComponent)) {
// 			replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 		} else {
// 			const lastInput = lastVComponent.instance._lastInput || lastVComponent.instance;
// 			const nextInput = createStatelessComponentInput(nextType, nextProps, context);
// 			patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, true);
// 			const dom = nextVComponent.dom = nextInput.dom;
// 			nextVComponent.instance = nextInput;
// 			mountStatelessComponentCallbacks(nextVComponent.hooks, dom, lifecycle);
// 			unmount(lastVComponent, null, lifecycle, false, shallowUnmount);
// 		}
// 	} else {
// 		if (isStatefulComponent(nextVComponent)) {
// 			const instance = lastVComponent.instance;
// 			if (instance._unmounted) {
// 				if (isNull(parentDom)) {
// 					return true;
// 				}
// 				replaceChild(parentDom, mountVComponent(nextVComponent, null, lifecycle, context, isSVG, shallowUnmount), lastVComponent.dom);
// 			} else {
// 				const defaultProps = nextType.defaultProps;
// 				const lastProps = instance.props;
// 				if (instance._devToolsStatus.connected && !instance._devToolsId) {
// 					componentIdMap.set(instance._devToolsId = getIncrementalId(), instance);
// 				}
// 				if (!isUndefined(defaultProps)) {
// 					copyPropsTo(lastProps, nextProps);
// 					nextVComponent.props = nextProps;
// 				}
// 				const lastState = instance.state;
// 				const nextState = instance.state;
// 				let childContext = instance.getChildContext();
// 				nextVComponent.instance = instance;
// 				instance._isSVG = isSVG;
// 				if (!isNullOrUndef(childContext)) {
// 					childContext = Object.assign({}, context, childContext);
// 				} else {
// 					childContext = context;
// 				}
// 				const lastInput = instance._lastInput;
// 				let nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false);
// 				let didUpdate = true;
// 				instance._childContext = childContext;
// 				if (isInvalid(nextInput)) {
// 					nextInput = createVPlaceholder();
// 				} else if (isArray(nextInput)) {
// 					nextInput = createVFragment(nextInput, null);
// 				} else if (nextInput === NO_OP) {
// 					nextInput = lastInput;
// 					didUpdate = false;
// 				}
// 				instance._lastInput = nextInput;
// 				instance._vComponent = nextVComponent;
// 				if (didUpdate) {
// 					patch(lastInput, nextInput, parentDom, lifecycle, childContext, isSVG, shallowUnmount);
// 					instance.componentDidUpdate(lastProps, lastState);
// 					componentToDOMNodeMap.set(instance, nextInput.dom);
// 				}
// 				nextVComponent.dom = nextInput.dom;
// 			}
// 		} else {
// 			let shouldUpdate = true;
// 			const lastProps = lastVComponent.props;
// 			const nextHooks = nextVComponent.hooks;
// 			const nextHooksDefined = !isNullOrUndef(nextHooks);
// 			const lastInput = lastVComponent.instance;
// 			nextVComponent.dom = lastVComponent.dom;
// 			nextVComponent.instance = lastInput;
// 			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
// 				shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps, nextProps);
// 			}
// 			if (shouldUpdate !== false) {
// 				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
// 					nextHooks.onComponentWillUpdate(lastProps, nextProps);
// 				}
// 				let nextInput = nextType(nextProps, context);
// 				if (isInvalid(nextInput)) {
// 					nextInput = createVPlaceholder();
// 				} else if (isArray(nextInput)) {
// 					nextInput = createVFragment(nextInput, null);
// 				} else if (nextInput === NO_OP) {
// 					return false;
// 				}
// 				patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, shallowUnmount);
// 				nextVComponent.instance = nextInput;
// 				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
// 					nextHooks.onComponentDidUpdate(lastProps, nextProps);
// 				}
// 			}
// 		}
// 	}
// 	return false;
// }
// export function patchVText(lastVText, nextVText) {
// 	const nextText = nextVText.text;
// 	const dom = lastVText.dom;
// 	nextVText.dom = dom;
// 	if (lastVText.text !== nextText) {
// 		dom.nodeValue = nextText;
// 	}
// }
// export function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
// 	nextVPlacholder.dom = lastVPlacholder.dom;
// }
// function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	const lastChildren = lastVFragment.children;
// 	const nextChildren = nextVFragment.children;
// 	const pointer = lastVFragment.pointer;
// 	nextVFragment.dom = lastVFragment.dom;
// 	nextVFragment.pointer = pointer;
// 	if (!lastChildren !== nextChildren) {
// 		const lastChildrenType = lastVFragment.childrenType;
// 		const nextChildrenType = nextVFragment.childrenType;
// 		if (lastChildrenType === nextChildrenType) {
// 			if (nextChildrenType === KEYED) {
// 				return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
// 			} else if (nextChildrenType === NON_KEYED) {
// 				return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, false, shallowUnmount);
// 			}
// 		}
// 		if (isKeyed(lastChildren, nextChildren)) {
// 			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, shallowUnmount);
// 		} else {
// 			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment, true, shallowUnmount);
// 		}
// 	}
// }
// export function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList, shouldNormalise, shallowUnmount) {
// 	let lastChildrenLength = lastChildren.length;
// 	let nextChildrenLength = nextChildren.length;
// 	let commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
// 	let i = 0;
// 	for (; i < commonLength; i++) {
// 		const lastChild = lastChildren[i];
// 		const nextChild = shouldNormalise ? normaliseChild(nextChildren, i) : nextChildren[i];
// 		patch(lastChild, nextChild, dom, lifecycle, context, isSVG, shallowUnmount);
// 	}
// 	if (lastChildrenLength < nextChildrenLength) {
// 		for (i = commonLength; i < nextChildrenLength; i++) {
// 			const child = normaliseChild(nextChildren, i);
// 			insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG, shallowUnmount), parentVList && parentVList.pointer);
// 		}
// 	} else if (lastChildrenLength > nextChildrenLength) {
// 		for (i = commonLength; i < lastChildrenLength; i++) {
// 			unmount(lastChildren[i], dom, lifecycle, false, shallowUnmount);
// 		}
// 	}
// }
// export function patchKeyedChildren(
// 	a: Array<VComponent | OptVElement | VElement>,
// 	b: Array<VComponent | OptVElement | VElement>,
// 	dom,
// 	lifecycle,
// 	context,
// 	isSVG,
// 	parentVList,
// 	shallowUnmount
// ) {
// 	let aLength = a.length;
// 	let bLength = b.length;
// 	let aEnd = aLength - 1;
// 	let bEnd = bLength - 1;
// 	let aStart = 0;
// 	let bStart = 0;
// 	let i;
// 	let j;
// 	let aStartNode = a[aStart];
// 	let bStartNode = b[bStart];
// 	let aEndNode = a[aEnd];
// 	let bEndNode = b[bEnd];
// 	let aNode;
// 	let bNode;
// 	let nextNode;
// 	let nextPos;
// 	let node;
// 	if (aLength === 0) {
// 		if (bLength !== 0) {
// 			mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG, shallowUnmount);
// 		}
// 		return;
// 	} else if (bLength === 0) {
// 		if (aLength !== 0) {
// 			removeAllChildren(dom, a, lifecycle, shallowUnmount);
// 		}
// 		return;
// 	}
// 	// Step 1
// 	/* eslint no-constant-condition: 0 */
// 	outer: while (true) {
// 		// Sync nodes with the same key at the beginning.
// 		while (aStartNode.key === bStartNode.key) {
// 			patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			aStart++;
// 			bStart++;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break outer;
// 			}
// 			aStartNode = a[aStart];
// 			bStartNode = b[bStart];
// 		}
// 		// Sync nodes with the same key at the end.
// 		while (aEndNode.key === bEndNode.key) {
// 			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			aEnd--;
// 			bEnd--;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break outer;
// 			}
// 			aEndNode = a[aEnd];
// 			bEndNode = b[bEnd];
// 		}
// 		// Move and sync nodes from right to left.
// 		if (aEndNode.key === bStartNode.key) {
// 			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
// 			aEnd--;
// 			bStart++;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break;
// 			}
// 			aEndNode = a[aEnd];
// 			bStartNode = b[bStart];
// 			// In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
// 			// immediately jump to the start of this prefix/suffix algo.
// 			continue;
// 		}
// 		// Move and sync nodes from left to right.
// 		if (aStartNode.key === bEndNode.key) {
// 			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 			nextPos = bEnd + 1;
// 			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 			insertOrAppend(dom, bEndNode.dom, nextNode);
// 			aStart++;
// 			bEnd--;
// 			if (aStart > aEnd || bStart > bEnd) {
// 				break;
// 			}
// 			aStartNode = a[aStart];
// 			bEndNode = b[bEnd];
// 			continue;
// 		}
// 		break;
// 	}
// 	if (aStart > aEnd) {
// 		if (bStart <= bEnd) {
// 			nextPos = bEnd + 1;
// 			nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 			while (bStart <= bEnd) {
// 				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), nextNode);
// 			}
// 		}
// 	} else if (bStart > bEnd) {
// 		while (aStart <= aEnd) {
// 			unmount(a[aStart++], dom, lifecycle, false, shallowUnmount);
// 		}
// 	} else {
// 		aLength = aEnd - aStart + 1;
// 		bLength = bEnd - bStart + 1;
// 		const aNullable: Array<VComponent | OptVElement | VElement | null> = a;
// 		const sources = new Array(bLength);
// 		// Mark all nodes as inserted.
// 		for (i = 0; i < bLength; i++) {
// 			sources[i] = -1;
// 		}
// 		let moved = false;
// 		let pos = 0;
// 		let patched = 0;
// 		if ((bLength <= 4) || (aLength * bLength <= 16)) {
// 			for (i = aStart; i <= aEnd; i++) {
// 				aNode = a[i];
// 				if (patched < bLength) {
// 					for (j = bStart; j <= bEnd; j++) {
// 						bNode = b[j];
// 						if (aNode.key === bNode.key) {
// 							sources[j - bStart] = i;
// 							if (pos > j) {
// 								moved = true;
// 							} else {
// 								pos = j;
// 							}
// 							patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 							patched++;
// 							aNullable[i] = null;
// 							break;
// 						}
// 					}
// 				}
// 			}
// 		} else {
// 			const keyIndex = new Map();
// 			for (i = bStart; i <= bEnd; i++) {
// 				node = b[i];
// 				keyIndex.set(node.key, i);
// 			}
// 			for (i = aStart; i <= aEnd; i++) {
// 				aNode = a[i];
// 				if (patched < bLength) {
// 					j = keyIndex.get(aNode.key);
// 					if (!isUndefined(j)) {
// 						bNode = b[j];
// 						sources[j - bStart] = i;
// 						if (pos > j) {
// 							moved = true;
// 						} else {
// 							pos = j;
// 						}
// 						patch(aNode, bNode, dom, lifecycle, context, isSVG, shallowUnmount);
// 						patched++;
// 						aNullable[i] = null;
// 					}
// 				}
// 			}
// 		}
// 		if (aLength === a.length && patched === 0) {
// 			removeAllChildren(dom, a, lifecycle, shallowUnmount);
// 			while (bStart < bLength) {
// 				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG, shallowUnmount), null);
// 			}
// 		} else {
// 			i = aLength - patched;
// 			while (i > 0) {
// 				aNode = aNullable[aStart++];
// 				if (!isNull(aNode)) {
// 					unmount(aNode, dom, lifecycle, false, shallowUnmount);
// 					i--;
// 				}
// 			}
// 			if (moved) {
// 				let seq = lis_algorithm(sources);
// 				j = seq.length - 1;
// 				for (i = bLength - 1; i >= 0; i--) {
// 					if (sources[i] === -1) {
// 						pos = i + bStart;
// 						node = b[pos];
// 						nextPos = pos + 1;
// 						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG, shallowUnmount), nextNode);
// 					} else {
// 						if (j < 0 || i !== seq[j]) {
// 							pos = i + bStart;
// 							node = b[pos];
// 							nextPos = pos + 1;
// 							nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 							insertOrAppend(dom, node.dom, nextNode);
// 						} else {
// 							j--;
// 						}
// 					}
// 				}
// 			} else if (patched !== bLength) {
// 				for (i = bLength - 1; i >= 0; i--) {
// 					if (sources[i] === -1) {
// 						pos = i + bStart;
// 						node = b[pos];
// 						nextPos = pos + 1;
// 						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
// 						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG, shallowUnmount), nextNode);
// 					}
// 				}
// 			}
// 		}
// 	}
// }
// // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
// function lis_algorithm(a) {
// 	let p = a.slice(0);
// 	let result: Array<any> = [];
// 	result.push(0);
// 	let i;
// 	let j;
// 	let u;
// 	let v;
// 	let c;
// 	for (i = 0; i < a.length; i++) {
// 		if (a[i] === -1) {
// 			continue;
// 		}
// 		j = result[result.length - 1];
// 		if (a[j] < a[i]) {
// 			p[i] = j;
// 			result.push(i);
// 			continue;
// 		}
// 		u = 0;
// 		v = result.length - 1;
// 		while (u < v) {
// 			c = ((u + v) / 2) | 0;
// 			if (a[result[c]] < a[i]) {
// 				u = c + 1;
// 			} else {
// 				v = c;
// 			}
// 		}
// 		if (a[i] < a[result[u]]) {
// 			if (u > 0) {
// 				p[i] = result[u - 1];
// 			}
// 			result[u] = i;
// 		}
// 	}
// 	u = result.length;
// 	v = result[u - 1];
// 	while (u-- > 0) {
// 		result[u] = v;
// 		v = p[v];
// 	}
// 	return result;
// }
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
// function patchProps(vNode, lastProps, nextProps, dom, shallowUnmount, isSpread, isSVG, lifecycle, context) {
// 	lastProps = lastProps || {};
// 	nextProps = nextProps || {};
// 	let formValue;
// 	for (let prop in nextProps) {
// 		if (!nextProps.hasOwnProperty(prop)) {
// 			continue;
// 		}
// 		const nextValue = nextProps[prop];
// 		const lastValue = lastProps[prop];
// 		if (prop === 'value') {
// 			formValue = nextValue;
// 		}
// 		if (isNullOrUndef(nextValue)) {
// 			removeProp(prop, dom);
// 		} else if (prop === 'children') {
// 			if (isSpread) {
// 				patchChildrenWithUnknownType(lastValue, nextValue, dom, lifecycle, context, isSVG, shallowUnmount);
// 			} else if (vNode === ELEMENT) {
// 				vNode.children = nextValue;
// 			}
// 		} else {
// 			patchProp(prop, lastValue, nextValue, dom, isSVG);
// 		}
// 	}
// 	for (let prop in lastProps) {
// 		if (isNullOrUndef(nextProps[prop])) {
// 			removeProp(prop, dom);
// 		}
// 	}
// 	return formValue;
// }
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
// function removeProp(prop, dom) {
// 	if (prop === 'className') {
// 		dom.removeAttribute('class');
// 	} else if (prop === 'value') {
// 		dom.value = '';
// 	} else {
// 		dom.removeAttribute(prop);
// 	}
// }

function mount(vNode, parentDom, lifecycle, context, isSVG) {
    var flags = vNode.flags;
    switch (flags) {
        case VNodeFlags.HtmlElement:
        case VNodeFlags.SvgElement:
            return mountElement(vNode, parentDom, lifecycle, context, flags === VNodeFlags.SvgElement || isSVG);
        // case COMPONENT:
        // 	return mountComponent(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
        // case PLACEHOLDER:
        // 	return mountVPlaceholder(input, parentDom);
        // case FRAGMENT:
        // 	return mountVFragment(input, parentDom, lifecycle, context, isSVG, shallowUnmount);
        case VNodeFlags.Text:
        // return mountVText(vNode, parentDom);
        default:
            if (process.env.NODE_ENV !== 'production') {
                throwError('bad VNode passed to mount(). The value needs to be a valid VNode object.');
            }
            throwError();
    }
}
// export function mountVPlaceholder(vPlaceholder, parentDom) {
// 	const dom = document.createTextNode('');
// 	vPlaceholder.dom = dom;
// 	if (parentDom) {
// 		appendChild(parentDom, dom);
// 	}
// 	return dom;
// }
function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
    var tag = vNode.type;
    var dom = documentCreateElement(tag, isSVG);
    var children = vNode.children;
    var props = vNode.props;
    var ref = vNode.ref;
    var hasProps = !isNullOrUndef(props);
    vNode.dom = dom;
    if (!isNullOrUndef(ref)) {
        mountRef(dom, ref, lifecycle);
    }
    if (hasProps) {
        // do not add a hasOwnProperty check here, it affects performance
        for (var prop in props) {
            patchProp(prop, null, props[prop], dom, isSVG);
        }
    }
    if (!isNull(children)) {
        if (isString(children)) {
            setTextContent(dom, children);
        }
        else if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                mount(children[i], dom, lifecycle, context, isSVG);
            }
        }
        else if (isVNode(children)) {
            mount(children, dom, lifecycle, context, isSVG);
        }
        else {
            if (process.env.NODE_ENV !== 'production') {
                throwError('bad "children" set on VNode during mountElement(). VNode "children" needs to be a VNode, Array<VNode> or string.');
            }
            throwError();
        }
    }
    if (!isNull(parentDom)) {
        appendChild(parentDom, dom);
    }
    return dom;
}
// export function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	const children = vFragment.children;
// 	const pointer = document.createTextNode('');
// 	const dom = document.createDocumentFragment();
// 	const childrenType = vFragment.childrenType;
// 	if (childrenType === KEYED || childrenType === NON_KEYED) {
// 		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (childrenType === UNKNOWN) {
// 		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	}
// 	vFragment.pointer = pointer;
// 	vFragment.dom = dom;
// 	appendChild(dom, pointer);
// 	if (parentDom) {
// 		appendChild(parentDom, dom);
// 	}
// 	return dom;
// }
// export function mountVText(vText, parentDom) {
// 	const dom = document.createTextNode(vText.text);
// 	vText.dom = dom;
// 	if (!isNull(parentDom)) {
// 		appendChild(parentDom, dom);
// 	}
// 	return dom;
// }
// export function mountOptVElement(optVElement, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	const bp = optVElement.bp;
// 	let dom = null;
// 	if (recyclingEnabled) {
// 		dom = recycleOptVElement(optVElement, lifecycle, context, isSVG, shallowUnmount);
// 	}
// 	const tag = bp.staticVElement.tag;
// 	if (isNull(dom)) {
// 		if (isSVG || tag === 'svg') {
// 			isSVG = true;
// 			dom = (bp.svgClone && bp.svgClone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
// 		} else {
// 			dom = (bp.clone && bp.clone.cloneNode(true)) || createStaticVElementClone(bp, isSVG);
// 		}
// 		optVElement.dom = dom;
// 		const bp0 = bp.v0;
// 		if (!isNull(bp0)) {
// 			mountOptVElementValue(optVElement, bp0, optVElement.v0, bp.d0, dom, lifecycle, context, isSVG, shallowUnmount);
// 			const bp1 = bp.v1;
// 			if (!isNull(bp1)) {
// 				mountOptVElementValue(optVElement, bp1, optVElement.v1, bp.d1, dom, lifecycle, context, isSVG, shallowUnmount);
// 				const bp2 = bp.v2;
// 				if (!isNull(bp2)) {
// 					mountOptVElementValue(optVElement, bp2, optVElement.v2, bp.d2, dom, lifecycle, context, isSVG, shallowUnmount);
// 					const bp3 = bp.v3;
// 					if (!isNull(bp3)) {
// 						const v3 = optVElement.v3;
// 						const d3 = bp.d3;
// 						const bp3 = bp.v3;
// 						for (let i = 0; i < bp3.length; i++) {
// 							mountOptVElementValue(optVElement, bp3[i], v3[i], d3[i], dom, lifecycle, context, isSVG, shallowUnmount);
// 						}
// 					}
// 				}
// 			}
// 		}
// 		if (tag === 'select') {
// 			formSelectValue(dom, getPropFromOptElement(optVElement, PROP_VALUE));
// 		}
// 	}
// 	if (!isNull(parentDom)) {
// 		parentDom.appendChild(dom);
// 	}
// 	return dom;
// }
// function mountOptVElementValue(optVElement, valueType, value, descriptor, dom, lifecycle, context, isSVG, shallowUnmount) {
// 	switch (valueType) {
// 		case CHILDREN:
// 			mountChildren(descriptor, value, dom, lifecycle, context, isSVG, shallowUnmount);
// 			break;
// 		case PROP_CLASS_NAME:
// 			if (!isNullOrUndef(value)) {
// 				if (isSVG) {
// 					dom.setAttribute('class', value);
// 				} else {
// 					dom.className = value;
// 				}
// 			}
// 			break;
// 		case PROP_DATA:
// 			dom.dataset[descriptor] = value;
// 			break;
// 		case PROP_STYLE:
// 			patchStyle(null, value, dom);
// 			break;
// 		case PROP_VALUE:
// 			dom.value = isNullOrUndef(value) ? '' : value;
// 			break;
// 		case PROP:
// 			patchProp(descriptor, null, value, dom, isSVG);
// 			break;
// 		case PROP_REF:
// 			mountRef(dom, value, lifecycle);
// 			break;
// 		case PROP_SPREAD:
// 			mountProps(optVElement, value, dom, lifecycle, context, isSVG, true, shallowUnmount);
// 			break;
// 		default:
// 			// TODO
// 	}
// }
// export function mountChildren(childrenType, children, dom, lifecycle, context, isSVG, shallowUnmount) {
// 	if (childrenType === CHILDREN_TEXT) {
// 		setTextContent(dom, children);
// 	} else if (childrenType === NODE) {
// 		mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (childrenType === KEYED || childrenType === NON_KEYED) {
// 		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (childrenType === UNKNOWN) {
// 		mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	} else {
// 		if (process.env.NODE_ENV !== 'production') {
// 			throwError('bad childrenType value specified when attempting to mountChildren.');
// 		}
// 		throwError();
// 	}
// }
// export function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
// 	for (let i = 0; i < children.length; i++) {
// 		mount(children[i], dom, lifecycle, context, isSVG, shallowUnmount);
// 	}
// }
// export function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
// 	if (isArray(children)) {
// 		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	} else if (isStringOrNumber(children)) {
// 		setTextContent(dom, children);
// 	} else if (!isInvalid(children)) {
// 		mount(children, dom, lifecycle, context, isSVG, shallowUnmount);
// 	}
// }
// export function mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG, shallowUnmount) {
// 	children.complex = false;
// 	for (let i = 0; i < children.length; i++) {
// 		const child = normaliseChild(children, i);
// 		if (child === TEXT) {
// 			mountVText(child, dom);
// 			children.complex = true;
// 		} else if (child === PLACEHOLDER) {
// 			mountVPlaceholder(child, dom);
// 			children.complex = true;
// 		} else if (child === FRAGMENT) {
// 			mountVFragment(child, dom, lifecycle, context, isSVG, shallowUnmount);
// 			children.complex = true;
// 		} else {
// 			mount(child, dom, lifecycle, context, isSVG, shallowUnmount);
// 		}
// 	}
// }
// export function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG, shallowUnmount) {
// 	if (recyclingEnabled) {
// 		const dom = recycleVComponent(vComponent, lifecycle, context, isSVG, shallowUnmount);
// 		if (!isNull(dom)) {
// 			if (!isNull(parentDom)) {
// 				appendChild(parentDom, dom);
// 			}
// 			return dom;
// 		}
// 	}
// 	const type = vComponent.type;
// 	const props = vComponent.props || EMPTY_OBJ;
// 	const hooks = vComponent.hooks;
// 	const ref = vComponent.ref;
// 	let dom;
// 	if (isStatefulComponent(vComponent)) {
// 		const defaultProps = type.defaultProps;
// 		if (!isUndefined(defaultProps)) {
// 			copyPropsTo(defaultProps, props);
// 			vComponent.props = props;
// 		}
// 		if (hooks) {
// 			if (process.env.NODE_ENV !== 'production') {
// 				throwError('"hooks" are not supported on stateful components.');
// 			}
// 			throwError();
// 		}
// 		const instance = createStatefulComponentInstance(type, props, context, isSVG, devToolsStatus);
// 		const input = instance._lastInput;
// 		instance._vComponent = vComponent;
// 		vComponent.dom = dom = mount(input, null, lifecycle, instance._childContext, false, shallowUnmount);
// 		if (!isNull(parentDom)) {
// 			appendChild(parentDom, dom);
// 		}
// 		mountStatefulComponentCallbacks(ref, instance, lifecycle);
// 		componentToDOMNodeMap.set(instance, dom);
// 		vComponent.instance = instance;
// 	} else {
// 		if (ref) {
// 			if (process.env.NODE_ENV !== 'production') {
// 				throwError('"refs" are not supported on stateless components.');
// 			}
// 			throwError();
// 		}
// 		const input = createStatelessComponentInput(type, props, context);
// 		vComponent.dom = dom = mount(input, null, lifecycle, context, isSVG, shallowUnmount);
// 		vComponent.instance = input;
// 		mountStatelessComponentCallbacks(hooks, dom, lifecycle);
// 		if (!isNull(parentDom)) {
// 			appendChild(parentDom, dom);
// 		}
// 	}
// 	return dom;
// }
// export function mountStatefulComponentCallbacks(ref, instance, lifecycle) {
// 	if (ref) {
// 		if (isFunction(ref)) {
// 			lifecycle.addListener(() => ref(instance));
// 		} else {
// 			if (process.env.NODE_ENV !== 'production') {
// 				throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
// 			}
// 			throwError();
// 		}
// 	}
// 	if (!isNull(instance.componentDidMount)) {
// 		lifecycle.addListener(() => {
// 			instance.componentDidMount();
// 		});
// 	}
// }
// export function mountStatelessComponentCallbacks(hooks, dom, lifecycle) {
// 	if (!isNullOrUndef(hooks)) {
// 		if (!isNullOrUndef(hooks.onComponentWillMount)) {
// 			hooks.onComponentWillMount();
// 		}
// 		if (!isNullOrUndef(hooks.onComponentDidMount)) {
// 			lifecycle.addListener(() => hooks.onComponentDidMount(dom));
// 		}
// 	}
// }
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
        if (!isInvalid$1(input)) {
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
            // unmount(root.input, parentDom, lifecycle, false, false);
            removeRoot(root);
        }
        else {
            if (input.dom) {
            }
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
