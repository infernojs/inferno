/*!
 * inferno-compat v0.8.0-alpha6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.InfernoCompat = global.InfernoCompat || {})));
}(this, (function (exports) { 'use strict';

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

var NO_OP = 'NO_OP';

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

// Runs only once in applications lifetime
var isBrowser = typeof window !== 'undefined' && window.document;

function isArray$1(obj) {
	return obj instanceof Array;
}

function isStatefulComponent(o) {
	return isTrue(o.isStateful);
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

var ChildrenTypes = {
	KEYED_LIST: 1,
	NON_KEYED_LIST: 2,
	TEXT: 3,
	NODE: 4,
	UNKNOWN: 5,
	STATIC_TEXT: 6
};

function isKeyedListChildrenType(o) {
	return o === ChildrenTypes.KEYED_LIST;
}

function isNonKeyedListChildrenType(o) {
	return o === ChildrenTypes.NON_KEYED_LIST;
}

function isTextChildrenType(o) {
	return o === ChildrenTypes.TEXT || o === ChildrenTypes.STATIC_TEXT;
}

function isNodeChildrenType(o) {
	return o === ChildrenTypes.NODE;
}

function isUnknownChildrenType(o) {
	return o === ChildrenTypes.UNKNOWN;
}

var NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5,
	VARIABLE: 6
};

function getTemplateValues(vTemplate) {
	var values = [];
	var v0 = vTemplate.v0;
	var v1 = vTemplate.v1;

	if (v0) {
		values.push(v0);
	}
	if (v1) {
		values.push.apply(values, v1);
	}
	return values;
}

function convertVTemplate(vTemplate) {
	return vTemplate.tr.schema.apply(null, getTemplateValues(vTemplate));
}

function createVComponent(
	component,
	props,
	key,
	hooks,
	ref
) {
	if ( props === void 0 ) props = null;
	if ( key === void 0 ) key = null;
	if ( hooks === void 0 ) hooks = null;
	if ( ref === void 0 ) ref = null;

	return {
		type: NodeTypes.COMPONENT,
		dom: null,
		component: component,
		props: props,
		hooks: hooks,
		key: key,
		ref: ref,
		isStateful: !isUndefined(component.prototype) && !isUndefined(component.prototype.render)
	};
}

function createVElement(
	tag,
	props,
	children,
	key,
	ref,
	childrenType
) {
	if ( props === void 0 ) props = null;
	if ( children === void 0 ) children = null;
	if ( key === void 0 ) key = null;
	if ( ref === void 0 ) ref = null;
	if ( childrenType === void 0 ) childrenType = null;

	return {
		type: NodeTypes.ELEMENT,
		dom: null,
		tag: tag,
		children: children,
		key: key,
		props: props,
		ref: ref,
		childrenType: childrenType || ChildrenTypes.UNKNOWN
	};
}

function createVText(text) {
	return {
		type: NodeTypes.TEXT,
		text: text,
		dom: null
	};
}

function createVPlaceholder() {
	return {
		type: NodeTypes.PLACEHOLDER,
		dom: null
	};
}

function createVFragment(
	children,
	childrenType
) {
	if ( childrenType === void 0 ) childrenType = ChildrenTypes.UNKNOWN;

	return {
		type: NodeTypes.FRAGMENT,
		dom: null,
		pointer: null,
		children: children,
		childrenType: childrenType
	};
}

function isVText(o) {
	return o.type === NodeTypes.TEXT;
}

function isVPlaceholder(o) {
	return o.type === NodeTypes.PLACEHOLDER;
}

function isVFragment(o) {
	return o.type === NodeTypes.FRAGMENT;
}

function isVElement(o) {
	return o.type === NodeTypes.ELEMENT;
}

function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}

function isVComponent(o) {
	return o.type === NodeTypes.COMPONENT;
}

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
	unmount(lastInput, null, lifecycle);
}

function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	if (lastInput !== nextInput) {
		if (isVTemplate(nextInput)) {
			if (isVTemplate(lastInput)) {
				patchVTemplate(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVTemplate(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVTemplate(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVComponent(nextInput)) {
			if (isVComponent(lastInput)) {
				patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVComponent(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVFragment(nextInput)) {
			if (isVFragment(lastInput)) {
				patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVFragment(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVElement(nextInput)) {
			if (isVElement(lastInput)) {
				patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVElement(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVElement(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVFragment(lastInput)) {
			replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG), lifecycle);
		} else if (isVPlaceholder(nextInput)) {
			if (isVPlaceholder(lastInput)) {
				patchVPlaceholder(lastInput, nextInput);
			} else {
				replaceChild(parentDom, mountVPlaceholder(nextInput, null), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVPlaceholder(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
		} else if (isVText(nextInput)) {
			if (isVText(lastInput)) {
				patchVText(lastInput, nextInput);
			} else {
				replaceChild(parentDom, mountVText(nextInput, null), lastInput.dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVText(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput.dom);
		} else {
			if ("development" !== 'production') {
				throwError('bad input argument called on patch(). Input argument may need normalising.');
			}
			throwError();
		}
	}
}

function patchChildren(childrenType, lastChildren, nextChildren, parentDom, lifecycle, context, isSVG) {
	if (isTextChildrenType(childrenType)) {
		updateTextContent(parentDom, nextChildren);
	} else if (isNodeChildrenType(childrenType)) {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	} else if (isKeyedListChildrenType(childrenType)) {
		patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
	} else if (isNonKeyedListChildrenType(childrenType)) {
		patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
	} else if (isUnknownChildrenType(childrenType)) {
		patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	} else {
		if ("development" !== 'production') {
			throwError('bad childrenType value specified when attempting to patchChildren.');
		}
		throwError();
	}
}

function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG) {
	if (isInvalid(nextChildren)) {
		if (!isInvalid(lastChildren)) {
			removeAllChildren(parentDom, lastChildren, lifecycle);
		}
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(parentDom, nextChildren);
		} else if (!isInvalid(nextChildren)) {
			if (isArray$1(nextChildren)) {
				mountArrayChildrenWithoutType(nextChildren, parentDom, lifecycle, context, isSVG);
			} else {
				mount(nextChildren, parentDom, lifecycle, context, isSVG);
			}
		}
	} else if (isStringOrNumber(nextChildren)) {
		if (isStringOrNumber(lastChildren)) {
			updateTextContent(parentDom, nextChildren);
		} else {
			setTextContent(parentDom, nextChildren);
		}
	} else if (isStringOrNumber(lastChildren)) {
		var child = normalise(lastChildren);

		child.dom = parentDom.firstChild;
		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG);
	} else if (isArray$1(nextChildren)) {
		if (isArray$1(lastChildren)) {
			nextChildren.complex = lastChildren.complex;

			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			} else {
				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			}
		} else {
			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null);
		}
	} else if (isArray$1(lastChildren)) {
		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null);
	} else {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	}
}

function patchVTemplate(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
	var dom = lastVTemplate.dom;
	var lastTemplateReducers = lastVTemplate.tr;
	var nextTemplateReducers = nextVTemplate.tr;

	if (lastTemplateReducers !== nextTemplateReducers) {
		var newDom = mountVTemplate(nextVTemplate, null, lifecycle, context, isSVG);

		replaceChild(parentDom, newDom, dom);
		unmount(lastVTemplate, null, lifecycle);
	} else {
		nextVTemplate.dom = dom;
		nextTemplateReducers.patch(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG);
	}
}

function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG) {
	var nextTag = nextVElement.tag;
	var lastTag = lastVElement.tag;

	if (nextTag === 'svg') {
		isSVG = true;
	}
	if (lastTag !== nextTag) {
		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG);
	} else {
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
				patchChildren(lastChildrenType, lastChildren, nextChildren, dom, lifecycle, context, isSVG);
			} else {
				patchChildrenWithUnknownType(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
			}
		}
		if (lastProps !== nextProps) {
			patchProps(lastVElement, nextVElement, lastProps, nextProps, dom);
		}
	}
}

function patchProps(lastVElement, nextVElement, lastProps, nextProps, dom) {
	lastProps = lastProps || {};
	nextProps = nextProps || {};
	var formValue;

	for (var prop in nextProps) {
		var nextValue = nextProps[prop];
		var lastValue = lastProps[prop];

		if (prop === 'value') {
			formValue = nextValue;
		}
		if (isNullOrUndef(nextValue)) {
			removeProp(prop, dom);
		} else {
			patchProp(prop, lastValue, nextValue, dom);
		}
	}
	for (var prop$1 in lastProps) {
		if (isNullOrUndef(nextProps[prop$1])) {
			removeProp(prop$1, dom);
		}
	}
	if (nextVElement.tag === 'select') {
		formSelectValue(dom, formValue);
	}
}

// returns true if a property has been applied that can't be cloned via elem.cloneNode()
function patchProp(prop, lastValue, nextValue, dom) {
	if (strictProps[prop]) {
		dom[prop] = isNullOrUndef(nextValue) ? '' : nextValue;
	} else if (booleanProps[prop]) {
		dom[prop] = nextValue ? true : false;
	} else {
		if (lastValue !== nextValue) {
			if (isNullOrUndef(nextValue)) {
				dom.removeAttribute(prop);
				return false;
			}
			if (prop === 'className') {
				dom.className = nextValue;
				return false;
			} else if (prop === 'style') {
				patchStyle(lastValue, nextValue, dom);
			} else if (prop === 'defaultChecked') {
				if (isNull(lastValue)) {
					dom.addAttribute('checked');
				}
				return false;
			} else if (prop === 'defaultValue') {
				if (isNull(lastValue)) {
					dom.setAttribute('value', nextValue);
				}
				return false;
			} else if (isAttrAnEvent(prop)) {
				dom[prop.toLowerCase()] = nextValue;
			} else if (prop === 'dangerouslySetInnerHTML') {
				var lastHtml = lastValue && lastValue.__html;
				var nextHtml = nextValue && nextValue.__html;

				if (isNullOrUndef(nextHtml)) {
					if ("development" !== 'production') {
						throwError('dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content.');
					}
					throwError();
				}
				if (lastHtml !== nextHtml) {
					dom.innerHTML = nextHtml;
				}
			} else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
				var ns = namespaces[prop];

				if (ns) {
					dom.setAttributeNS(ns, prop, nextValue);
				} else {
					dom.setAttribute(prop, nextValue);
				}
				return false;
			}
		}
	}
	return true;
}

function removeProp(prop, dom) {
	if (prop === 'className') {
		dom.removeAttribute('class');
	} else if (prop === 'value') {
		dom.value = '';
	} else {
		dom.removeAttribute(prop);
	}
}

function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndef(lastAttrValue)) {
		if (!isNullOrUndef(nextAttrValue)) {
			var styleKeys = Object.keys(nextAttrValue);

			for (var i = 0; i < styleKeys.length; i++) {
				var style = styleKeys[i];
				var value = nextAttrValue[style];

				if (isNumber(value) && !isUnitlessNumber[style]) {
					dom.style[style] = value + 'px';
				} else {
					dom.style[style] = value;
				}
			}
		}
	} else if (isNullOrUndef(nextAttrValue)) {
		dom.removeAttribute('style');
	} else {
		var styleKeys$1 = Object.keys(nextAttrValue);

		for (var i$1 = 0; i$1 < styleKeys$1.length; i$1++) {
			var style$1 = styleKeys$1[i$1];
			var value$1 = nextAttrValue[style$1];

			if (isNumber(value$1) && !isUnitlessNumber[style$1]) {
				dom.style[style$1] = value$1 + 'px';
			} else {
				dom.style[style$1] = value$1;
			}
		}
		var lastStyleKeys = Object.keys(lastAttrValue);

		for (var i$2 = 0; i$2 < lastStyleKeys.length; i$2++) {
			var style$2 = lastStyleKeys[i$2];
			if (isNullOrUndef(nextAttrValue[style$2])) {
				dom.style[style$2] = '';
			}
		}
	}
}

function patchVComponent(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG) {
	var lastComponent = lastVComponent.component;
	var nextComponent = nextVComponent.component;
	var nextProps = nextVComponent.props || {};

	if (lastComponent !== nextComponent) {
		replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG);
	} else {
		if (isStatefulComponent(nextVComponent)) {
			var instance = lastVComponent.instance;

			if (instance._unmounted) {
				replaceChild(parentDom, mountVComponent(nextVComponent, null, lifecycle, context, isSVG), lastVComponent.dom);
			} else {
				var lastProps = instance.props;
				var lastState = instance.state;
				var nextState = instance.state;
				var childContext = instance.getChildContext();

				nextVComponent.instance = instance;
				instance.context = context;
				if (!isNullOrUndef(childContext)) {
					context = Object.assign({}, context, childContext);
				}
				var lastInput = instance._lastInput;
				var nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps);

				if (nextInput === NO_OP) {
					nextInput = lastInput;
				} else if (isInvalid(nextInput)) {
					nextInput = createVPlaceholder();
				}
				instance._lastInput = nextInput;
				patch(lastInput, nextInput, parentDom, lifecycle, context, null, false);
				instance._vComponent = nextVComponent;
				instance._lastInput = nextInput;
				instance.componentDidUpdate(lastProps, lastState);
				nextVComponent.dom = nextInput.dom;
				componentToDOMNodeMap.set(instance, nextInput.dom);
			}
		} else {
			var shouldUpdate = true;
			var lastProps$1 = lastVComponent.props;
			var nextHooks = nextVComponent.hooks;
			var nextHooksDefined = !isNullOrUndef(nextHooks);
			var lastInput$1 = lastVComponent.instance;

			nextVComponent.dom = lastVComponent.dom;
			nextVComponent.instance = lastInput$1;
			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
				shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps$1, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
					nextHooks.onComponentWillUpdate(lastProps$1, nextProps);
				}
				var nextInput$1 = nextComponent(nextProps, context);

				if (nextInput$1 === NO_OP) {
					return;
				} else if (isInvalid(nextInput$1)) {
					nextInput$1 = createVPlaceholder();
				}
				patch(lastInput$1, nextInput$1, parentDom, lifecycle, context, null, null, false);
				nextVComponent.instance = nextInput$1;
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
					nextHooks.onComponentDidUpdate(lastProps$1, nextProps);
				}
			}
		}
	}
}

function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG) {
	var lastChildren = lastVFragment.children;
	var nextChildren = nextVFragment.children;
	var pointer = lastVFragment.pointer;

	nextVFragment.dom = lastVFragment.dom;
	nextVFragment.pointer = pointer;
	if (!lastChildren !== nextChildren) {
		var lastChildrenType = lastVFragment.childrenType;
		var nextChildrenType = nextVFragment.childrenType;

		if (lastChildrenType === nextChildrenType) {
			if (isKeyedListChildrenType(nextChildrenType)) {
				return patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
			} else if (isKeyedListChildrenType(nextChildrenType)) {
				return patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
			}
		}
		if (isKeyed(lastChildren, nextChildren)) {
			patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
		} else {
			patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, nextVFragment);
		}
	}
}

function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList) {
	var lastChildrenLength = lastChildren.length;
	var nextChildrenLength = nextChildren.length;
	var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	var i = 0;

	for (; i < commonLength; i++) {
		var lastChild = lastChildren[i];
		var nextChild = normaliseChild(nextChildren, i);

		patch(lastChild, nextChild, dom, lifecycle, context, isSVG);
	}
	if (lastChildrenLength < nextChildrenLength) {
		for (i = commonLength; i < nextChildrenLength; i++) {
			var child = normaliseChild(nextChildren, i);

			insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG), parentVList && parentVList.pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[i], dom, lifecycle);
		}
	}
}

function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
	nextVPlacholder.dom = lastVPlacholder.dom;
}

function patchVText(lastVText, nextVText) {
	var nextText = nextVText.text;
	var dom = lastVText.dom;

	nextVText.dom = dom;
	if (lastVText.text !== nextText) {
		dom.nodeValue = nextText;
	}
}

function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, parentVList) {
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
	var aNode = null;
	var bNode = null;
	var nextNode;
	var nextPos;
	var node;

	if (aLength === 0) {
		if (bLength !== 0) {
			mountArrayChildrenWithType(b, dom, lifecycle, context, isSVG);
		}
		return;
	} else if (bLength === 0) {
		if (aLength !== 0) {
			removeAllChildren(dom, a, lifecycle);
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
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), nextNode);
			}
		}
	} else if (bStart > bEnd) {
		while (aStart <= aEnd) {
			unmount(a[aStart++], dom, lifecycle);
		}
	} else {
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
							} else {
								pos = j;
							}
							patch(aNode, bNode, dom, lifecycle, context, isSVG, false);
							patched++;
							aNullable[i] = null;
							break;
						}
					}
				}
			}
		} else {
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
						} else {
							pos = j;
						}
						patch(aNode, bNode, dom, lifecycle, context, isSVG, false);
						patched++;
						aNullable[i] = null;
					}
				}
			}
		}
		if (aLength === a.length && patched === 0) {
			removeAllChildren(dom, a, lifecycle);
			while (bStart < bLength) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), null);
			}
		} else {
			i = aLength - patched;
			while (i > 0) {
				aNode = aNullable[aStart++];
				if (!isNull(aNode)) {
					unmount(aNode, dom, lifecycle);
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
						insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
					} else {
						if (j < 0 || i !== seq[j]) {
							pos = i + bStart;
							node = b[pos];
							nextPos = pos + 1;
							nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
							insertOrAppend(dom, node.dom, nextNode);
						} else {
							j--;
						}
					}
				}
			} else if (patched !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						node = b[pos];
						nextPos = pos + 1;
						nextNode = nextPos < b.length ? b[nextPos].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
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
			} else {
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

function hydrateVComponent(vComponent, dom, lifecycle, context) {
	var Component = vComponent.component;
	var props = vComponent.props;
	var hooks = vComponent.hooks;
	var ref = vComponent.ref;

	vComponent.dom = dom;
	if (isStatefulComponent(vComponent)) {
		var instance = new Component(props, context);

		instance._patch = patch;
		instance._componentToDOMNodeMap = componentToDOMNodeMap;
		var childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance._unmounted = false;
		instance._pendingSetState = true;
		instance._vComponent = vComponent;
		instance.componentWillMount();
		var input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		hydrate(input, dom, lifecycle, context);
		instance._lastInput = input;
		if (ref) {
			if (isFunction(ref)) {
				lifecycle.addListener(function () { return ref(instance); });
			} else {
				if ("development" !== 'production') {
					throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
				}
				throwError();
			}
		}
		if (!isNull(instance.componentDidMount)) {
			lifecycle.addListener(function () { return instance.componentDidMount(); });
		}
		componentToDOMNodeMap.set(instance, dom);
		vComponent.instance = instance;
	} else {
		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillMount)) {
				hooks.onComponentWillMount(null, props);
			}
			if (!isNullOrUndef(hooks.onComponentDidMount)) {
				lifecycle.addListener(function () {
					hooks.onComponentDidMount(dom, props);
				});
			}
		}

		/* eslint new-cap: 0 */
		var input$1 = Component(props, context);

		if (isInvalid(input$1)) {
			input$1 = createVPlaceholder();
		}
		hydrate(input$1, dom, lifecycle, context);
	}
}

function hydrateVElement(vElement, dom, lifecycle, context) {
	var tag = vElement.tag;

	if (!isString(tag)) {
		if ("development" !== 'production') {
			throwError('expects VElement to have a string as the tag name');
		}
		throwError();
	}
	var children = vElement.children;
	var props = vElement.props;
	var ref = vElement.ref;

	vElement.dom = dom;
	if (children) {
		hydrateChildren(vElement.childrenType, children, dom, lifecycle, context);
	}
}

function hydrateArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (var i = 0; i < children.length; i++) {
		debugger;
	}
}

function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
	if (isArray$1(children)) {
		debugger;
	} else if (!isInvalid(children) && !isStringOrNumber(children)) {
		hydrate(children, dom.firstChild, lifecycle, context);
	}
}

function hydrateChildren(childrenType, children, dom, lifecycle, context) {
	if (isNodeChildrenType(childrenType)) {
		hydrate(children, dom, lifecycle, context);
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		hydrateArrayChildrenWithType(childrem, dom, lifecycle, context);
	} else if (isUnknownChildrenType(childrenType)) {
		hydrateChildrenWithUnknownType(children, dom);
	} else if (!isTextChildrenType(childrenType)) {
		if ("development" !== 'production') {
			throwError('Bad childrenType value specified when attempting to hydrateChildren.');
		}
		throwError();
	}
}

function hydrateVTemplate(vTemplate, dom, lifecycle, context) {
	var templateReducers = vTemplate.tr;

	templateReducers.hydrate(vTemplate, dom, lifecycle, context);
}

function hydrate(input, dom, lifecycle, context) {
	if (isVTemplate(input)) {
		hydrateVTemplate(input, dom, lifecycle, context);
	} else if (isVElement(input)) {
		hydrateVElement(input, dom, lifecycle, context);
	} else if (isVComponent(input)) {
		hydrateVComponent(input, dom, lifecycle, context);
	} else {
		if ("development" !== 'production') {
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

function recycleVTemplate(vTemplate, lifecycle, context, isSVG) {
	var templateReducers = vTemplate.tr;
	var key = vTemplate.key;
	var pool = key === null ? templateReducers.pools.nonKeyed : templateReducers.pools.keyed.get(key);

	if (!isUndefined(pool)) {
		var recycledVTemplate = pool.pop();

		if (!isNullOrUndef(recycledVTemplate)) {
			patchVTemplate(recycledVTemplate, vTemplate, null, lifecycle, context, isSVG);
			return vTemplate.dom;
		}
	}
	return null;
}

function poolVTemplate(vTemplate) {
	var templateReducers = vTemplate.tr;
	var key = vTemplate.key;
	var pools = templateReducers.pools;

	if (key === null) {
		var pool = pools.nonKeyed;

		pool && pool.push(vTemplate);
	} else {
		var pool$1 = pools.keyed.get(key);

		if (isUndefined(pool$1)) {
			pool$1 = [];
			pools.keyed.set(key, pool$1);
		}
		pool$1.push(vTemplate);
	}
	return true;
}

function unmount(input, parentDom, lifecycle, canRecycle) {
	if (!isInvalid(input)) {
		if (isVTemplate(input)) {
			unmountVTemplate(input, parentDom, lifecycle, canRecycle);
		} else if (isVFragment(input)) {
			unmountVFragment(input, parentDom, true, lifecycle);
		} else if (isVElement(input)) {
			unmountVElement(input, parentDom, lifecycle);
		} else if (isVComponent(input)) {
			unmountVComponent(input, parentDom, lifecycle);
		} else if (isVText(input)) {
			unmountVText(input, parentDom);
		} else if (isVPlaceholder(input)) {
			unmountVPlaceholder(input, parentDom);
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

function unmountVTemplate(vTemplate, parentDom, lifecycle, canRecycle) {
	var dom = vTemplate.dom;
	var templateReducers = vTemplate.tr;
	var unmount = templateReducers.unmount;

	if (!isNull(unmount)) {
		templateReducers.unmount(vTemplate, lifecycle);
	}
	if (!isNull(parentDom)) {
		removeChild(parentDom, dom);
	}
	if (recyclingEnabled && (parentDom || canRecycle)) {
		poolVTemplate(vTemplate);
	}
}

function unmountVFragment(vFragment, parentDom, removePointer, lifecycle) {
	var children = vFragment.children;
	var childrenLength = children.length;
	var pointer = vFragment.pointer;

	if (childrenLength > 0) {
		for (var i = 0; i < childrenLength; i++) {
			var child = children[i];

			if (isVFragment(child)) {
				unmountVFragment(child, parentDom, true, lifecycle, false);
			} else {
				unmount(child, parentDom, lifecycle, false);
			}
		}
	}
	if (parentDom && removePointer) {
		removeChild(parentDom, pointer);
	}
}

function unmountVComponent(vComponent, parentDom, lifecycle) {
	var instance = vComponent.instance;
	var instanceHooks = null;
	var instanceChildren = null;

	if (!isNullOrUndef(instance)) {
		var ref = vComponent.ref;

		if (ref) {
			ref(null);
		}
		instanceHooks = instance.hooks;
		instanceChildren = instance.children;
		if (instance.render !== undefined) {
			instance.componentWillUnmount();
			instance._unmounted = true;
			componentToDOMNodeMap.delete(instance);
			unmount(instance._lastInput, null, lifecycle, false);
		} else {
			unmount(instance, null, lifecycle, false);
		}
	}
	var hooks = vComponent.hooks || instanceHooks;

	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
			hooks.onComponentWillUnmount(hooks);
		}
	}
	if (parentDom) {
		removeChild(parentDom, vComponent.dom);
	}
}

function unmountVElement(vElement, parentDom, lifecycle) {
	var hooks = vElement.hooks;
	var dom = vElement.dom;
	var ref = vElement.ref;

	if (ref) {
		ref(null);
	}
	var children = vElement.children;

	if (!isNullOrUndef(children)) {
		if (isArray$1(children)) {
			for (var i = 0; i < children.length; i++) {
				unmount(children[i], null, lifecycle, false);
			}
		} else {
			unmount(children, null, lifecycle, false);
		}
	}
	if (parentDom) {
		removeChild(parentDom, dom);
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

constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
constructDefaults('volume,value', strictProps, true);
constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

function setTextContent(dom, text) {
	if (text !== '') {
		dom.textContent = text;
	} else {
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
	} else {
		parentDom.insertBefore(newNode, nextNode);
	}
}

function replaceVListWithNode(parentDom, vList, dom, lifecycle) {
	var pointer = vList.pointer;

	unmountVFragment(vList, parentDom, false, lifecycle);
	replaceChild(parentDom, dom, pointer);
}

function documentCreateElement(tag, isSVG) {
	var dom;

	if (isSVG === true) {
		dom = document.createElementNS('http://www.w3.org/2000/svg', tag);
	} else {
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
	unmount(lastNode, null, lifecycle, true);
	var dom = mount(nextNode, null, lifecycle, context, isSVG);

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
	} else if (isInvalid(object)) {
		return createVPlaceholder();
	} else if (isArray$1(object)) {
		return createVFragment(object);
	}
	return object;
}

function normaliseChild(children, i) {
	var child = children[i];

	return children[i] = normalise(child);
}

function removeChild(parentDom, dom) {
	parentDom.removeChild(dom);
}

// TODO: for node we need to check if document is valid
function getActiveNode() {
	return document.activeElement;
}

function removeAllChildren(dom, children, lifecycle) {
	dom.textContent = '';
	for (var i = 0; i < children.length; i++) {
		var child = children[i];

		if (!isInvalid(child)) {
			unmount(child, null, lifecycle, true);
		}
	}
}

function resetActiveNode(activeNode) {
	if (activeNode !== null && activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
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
			if ((!isMap && child.value === value) || (isMap && value.get(child.value))) {
				child.selected = true;
			} else {
				child.selected = false;
			}
		} else if (tagName === 'OPTGROUP') {
			formSelectValueFindOptions(child, value, isMap);
		}
		child = child.nextSibling;
	}
}

function formSelectValue(dom, value) {
	var isMap = false;

	if (!isNullOrUndef(value)) {
		if (isArray$1(value)) {
			// Map vs Object v using reduce here for perf?
			value = value.reduce(function (o, v) { return o.set(v, true); }, new Map());
			isMap = true;
		} else {
			// convert to string
			value = value + '';
		}
		formSelectValueFindOptions(dom, value, isMap);
	}
}

function mount(input, parentDom, lifecycle, context, isSVG) {
	if (isVTemplate(input)) {
		return mountVTemplate(input, parentDom, lifecycle, context, isSVG);
	} else if (isVPlaceholder(input)) {
		return mountVPlaceholder(input, parentDom);
	} else if (isVText(input)) {
		return mountVText(input, parentDom);
	} else if (isVFragment(input)) {
		return mountVFragment(input, parentDom, lifecycle, context, isSVG);
	} else if (isVElement(input)) {
		return mountVElement(input, parentDom, lifecycle, context, isSVG);
	} else if (isVComponent(input)) {
		return mountVComponent(input, parentDom, lifecycle, context, isSVG);
	} else {
		if ("development" !== 'production') {
			throwError('bad input argument called on mount(). Input argument may need normalising.');
		}
		throwError();
	}
}

function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
	var templateReducers = vTemplate.tr;
	var dom = null;

	if (recyclingEnabled) {
		dom = recycleVTemplate(vTemplate, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = templateReducers.mount(vTemplate, null, lifecycle, context, isSVG);
	}
	vTemplate.dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVElement(vElement, parentDom, lifecycle, context, isSVG) {
	var tag = vElement.tag;

	if (!isString(tag)) {
		if ("development" !== 'production') {
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

	vElement.dom = dom;
	if (!isNullOrUndef(ref)) {
		lifecycle.addListener(function () {
			ref(dom);
		});
	}
	if (tag === 'select' && hasProps && isTrue(props.multiple)) {
		patchProp('multiple', null, true, dom);
	}
	if (!isNullOrUndef(children)) {
		mountChildren(vElement.childrenType, children, dom, lifecycle, context, isSVG);
	}
	if (hasProps) {
		mountProps(vElement, props, dom);
	}
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG) {
	var children = vFragment.children;
	var pointer = document.createTextNode('');
	var dom = document.createDocumentFragment();
	var childrenType = vFragment.childrenType;

	if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
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
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVPlaceholder(vPlaceholder, parentDom) {
	var dom = document.createTextNode('');

	vPlaceholder.dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG) {
	children.complex = false;
	for (var i = 0; i < children.length; i++) {
		var child = normaliseChild(children, i);

		if (isVText(child)) {
			mountVText(child, dom);
			children.complex = true;
		} else if (isVPlaceholder(child)) {
			mountVPlaceholder(child, dom);
			children.complex = true;
		} else if (isVFragment(child)) {
			mountVFragment(child, dom, lifecycle, context, isSVG);
			children.complex = true;
		} else {
			mount(child, dom, lifecycle, context, isSVG);
		}
	}
}

function mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG) {
	if (isArray$1(children)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	} else if (isStringOrNumber(children)) {
		setTextContent(dom, children);
	} else if (!isInvalid(children)) {
		mount(children, dom, lifecycle, context, isSVG);
	}
}

function mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
	for (var i = 0; i < children.length; i++) {
		mount(children[i], dom, lifecycle, context, isSVG);
	}
}

function mountChildren(childrenType, children, dom, lifecycle, context, isSVG) {
	if (isTextChildrenType(childrenType)) {
		setTextContent(dom, children);
	} else if (isNodeChildrenType(childrenType)) {
		mount(children, dom, lifecycle, context, isSVG);
	} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountChildrenWithUnknownType(children, dom, lifecycle, context, isSVG);
	} else {
		if ("development" !== 'production') {
			throwError('bad childrenType value specified when attempting to mountChildren.');
		}
		throwError();
	}
}

function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG) {
	var Component = vComponent.component;
	var props = vComponent.props;
	var hooks = vComponent.hooks;
	var ref = vComponent.ref;
	var dom;

	if (isStatefulComponent(vComponent)) {
		if (hooks) {
			if ("development" !== 'production') {
				throwError('"hooks" are not supported on stateful components.');
			}
			throwError();
		}
		var instance = new Component(props, context);

		instance._patch = patch;
		instance._componentToDOMNodeMap = componentToDOMNodeMap;
		var childContext = instance.getChildContext();

		if (!isNullOrUndef(childContext)) {
			context = Object.assign({}, context, childContext);
		}
		instance._unmounted = false;
		instance._pendingSetState = true;
		instance._vComponent = vComponent;
		instance.componentWillMount();
		var input = instance.render();

		if (isInvalid(input)) {
			input = createVPlaceholder();
		}
		instance._pendingSetState = false;
		dom = mount(input, null, lifecycle, context, false);
		instance._lastInput = input;
		if (parentDom !== null && !isInvalid(dom)) {
			appendChild(parentDom, dom);
		}
		if (ref) {
			if (isFunction(ref)) {
				lifecycle.addListener(function () { return ref(instance); });
			} else {
				if ("development" !== 'production') {
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
		componentToDOMNodeMap.set(instance, dom);
		vComponent.dom = dom;
		vComponent.instance = instance;
	} else {
		if (ref) {
			if ("development" !== 'production') {
				throwError('"refs" are not supported on stateless components.');
			}
			throwError();
		}
		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillMount)) {
				hooks.onComponentWillMount(props);
			}
			if (!isNullOrUndef(hooks.onComponentDidMount)) {
				lifecycle.addListener(function () { return hooks.onComponentDidMount(dom, props); });
			}
		}

		/* eslint new-cap: 0 */
		var input$1 = Component(props, context);

		if (isInvalid(input$1)) {
			input$1 = createVPlaceholder();
		}
		dom = mount(input$1, null, lifecycle, context, null, false);
		vComponent.instance = input$1;
		if (parentDom !== null && !isInvalid(dom)) {
			appendChild(parentDom, dom);
		}
		vComponent.dom = dom;
	}
	return dom;
}

function mountProps(vElement, props, dom) {
	var formValue;

	for (var prop in props) {
		var value = props[prop];

		if (prop === 'value') {
			formValue = value;
		}
		patchProp(prop, null, value, dom);
	}
	if (vElement.tag === 'select') {
		formSelectValue(vElement.dom, formValue);
	}
}

var roots = new Map();
var componentToDOMNodeMap = new Map();

function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
}

var documetBody = isBrowser ? document.body : null;

function render(input, parentDom) {
	var root = roots.get(parentDom);
	var lifecycle = new Lifecycle();

	if (documetBody === parentDom) {
		if ("development" !== 'production') {
			throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
		}
		throwError();
	}

	if (isUndefined(root)) {
		if (!isInvalid(input)) {
			if (!hydrateRoot(input, parentDom, lifecycle)) {
				mountChildrenWithUnknownType(input, parentDom, lifecycle, {}, false);
			}
			lifecycle.trigger();
			roots.set(parentDom, { input: input });
		}
	} else {
		var activeNode = getActiveNode();

		if (isNull(input)) {
			unmount(root.input, parentDom, lifecycle, true);
			roots.delete(parentDom);
		} else {
			patchChildrenWithUnknownType(root.input, input, parentDom, lifecycle, {}, false);
		}
		lifecycle.trigger();
		root.input = input;
		resetActiveNode(activeNode);
	}
}

var elementHooks = {
	onCreated: true,
	onAttached: true,
	onWillUpdate: true,
	onDidUpdate: true,
	onWillDetach: true
};

var componentHooks = {
	onComponentWillMount: true,
	onComponentDidMount: true,
	onComponentWillUnmount: true,
	onComponentShouldUpdate: true,
	onComponentWillUpdate: true,
	onComponentDidUpdate: true
};

function createElement(name, props) {
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
		} else if (_children.length === 0) {
			children = undefined;
		}
	}
	if (isString(name)) {
		var hooks;
		vNode = createVElement(name);

		for (var prop in props) {
			if (prop === 'key') {
				vNode.key = props.key;
				delete props.key;
			} else if (elementHooks[prop]) {
				if (!hooks) {
					hooks = {};
				}
				hooks[prop] = props[prop];
				delete props[prop];
			} else if (isAttrAnEvent(prop)) {
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
		if (hooks) {
			vNode.hooks = hooks;
		}
	} else {
		var hooks$1;
		vNode = createVComponent(name);

		if (!isUndefined(children)) {
			if (!props) {
				props = {};
			}
			props.children = children;
		}
		for (var prop$1 in props) {
			if (componentHooks[prop$1]) {
				if (!hooks$1) {
					hooks$1 = {};
				}
				hooks$1[prop$1] = props[prop$1];
			} else if (prop$1 === 'key') {
				vNode.key = props.key;
				delete props.key;
			}
		}
		vNode.props = props;
		if (hooks$1) {
			vNode.hooks = hooks$1;
		}
	}
	return vNode;
}

var noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';

// Copy of the util from dom/util, otherwise it makes massive bundles
function getActiveNode$1() {
	return document.activeElement;
}

// Copy of the util from dom/util, otherwise it makes massive bundles
function resetActiveNode$1(activeNode) {
	if (activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
	}
}

function queueStateChanges(component, newState, callback) {
	for (var stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (!component._pendingSetState) {
		component._pendingSetState = true;
		applyState(component, false, callback);
	} else {
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

		component._pendingState = {};
		var nextInput = component._updateComponent(prevState, nextState, props, props, force);

		if (nextInput === NO_OP) {
			nextInput = component._lastInput;
		} else if (isNullOrUndef(nextInput)) {
			nextInput = createVPlaceholder();
		}
		var lastInput = component._lastInput;
		var parentDom = lastInput.dom.parentNode;
		var activeNode = getActiveNode$1();
		var subLifecycle = new Lifecycle();

		component._patch(lastInput, nextInput, parentDom, subLifecycle, component.context, component, null);
		component._lastInput = nextInput;
		component._vComponent.dom = nextInput.dom;
		component._componentToDOMNodeMap.set(component, nextInput.dom);
		component.componentDidUpdate(props, prevState);
		subLifecycle.trigger();
		if (!isNullOrUndef(callback)) {
			callback();
		}
		resetActiveNode$1(activeNode);
	}
}

var Component = function Component(props, context) {
	/** @type {object} */
	this.props = props || {};

	/** @type {object} */
	this.state = {};

	/** @type {object} */
	this.refs = {};
	this._blockRender = false;
	this._blockSetState = false;
	this._deferSetState = false;
	this._pendingSetState = false;
	this._pendingState = {};
	this._lastInput = null;
	this._vComponent = null;
	this._unmounted = true;
	this.context = context || {};
	this._patch = null;
	this._parentComponent = null;
	this._componentToDOMNodeMap = null;
	if (!this.componentDidMount) {
		this.componentDidMount = null;
	}
};

Component.prototype.render = function render () {
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
	} else {
		if ("development" !== 'production') {
			throwError('cannot update state via setState() in componentWillUpdate().');
		}
		throwError();
	}
};

Component.prototype.componentWillMount = function componentWillMount () {
};

Component.prototype.componentWillUnmount = function componentWillUnmount () {
};

Component.prototype.componentDidUpdate = function componentDidUpdate () {
};

Component.prototype.shouldComponentUpdate = function shouldComponentUpdate () {
	return true;
};

Component.prototype.componentWillReceiveProps = function componentWillReceiveProps () {
};

Component.prototype.componentWillUpdate = function componentWillUpdate () {
};

Component.prototype.getChildContext = function getChildContext () {
};

Component.prototype._updateComponent = function _updateComponent (prevState, nextState, prevProps, nextProps, force) {
	if (this._unmounted === true) {
		throw new Error('You can\'t update an unmounted component!');
	}
	if (!isNullOrUndef(nextProps) && isNullOrUndef(nextProps.children)) {
		nextProps.children = prevProps.children;
	}
	if (prevProps !== nextProps || prevState !== nextState || force) {
		if (prevProps !== nextProps) {
			this._blockRender = true;
			this.componentWillReceiveProps(nextProps);
			this._blockRender = false;
			if (this._pendingSetState) {
				nextState = Object.assign({}, nextState, this._pendingState);
				this._pendingSetState = false;
				this._pendingState = {};
			}
		}
		var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

		if (shouldUpdate !== false || force) {
			this._blockSetState = true;
			this.componentWillUpdate(nextProps, nextState);
			this._blockSetState = false;
			this.props = nextProps;
			this.state = nextState;
			return this.render();
		}
	}
	return NO_OP;
};

// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = {
	constructor: 1,
	render: 1,
	shouldComponentUpdate: 1,
	componentWillRecieveProps: 1,
	componentWillUpdate: 1,
	componentDidUpdate: 1,
	componentWillMount: 1,
	componentDidMount: 1,
	componentWillUnmount: 1,
	componentDidUnmount: 1
};

function F() {
}

function extend(base, props, all) {
	for (var key in props) {
		if (all === true || !isNullOrUndef(props[key])) {
			base[key] = props[key];
		}
	}
	return base;
}

function bindAll(ctx) {
	for (var i in ctx) {
		var v = ctx[i];
		if (typeof v === 'function' && !v.__bound && !AUTOBIND_BLACKLIST.hasOwnProperty(i)) {
			(ctx[i] = v.bind(ctx)).__bound = true;
		}
	}
}

function createClass(obj) {
	function Cl(props) {
		extend(this, obj);
		Component.call(this, props);
		bindAll(this);
		if (this.getInitialState) {
			this.state = this.getInitialState();
		}
	}

	F.prototype = Component.prototype;
	Cl.prototype = new F();
	Cl.prototype.constructor = Cl;
	Cl.displayName = obj.displayName || 'Component';
	return Cl;
}

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
		var node = instance.render();

		instance._pendingSetState = false;
		return renderInputToString(node, context, isRoot);
	} else {
		return renderInputToString(Component(props), context, isRoot);
	}
}

function renderChildren(children, context) {
	if (children && isArray$1(children)) {
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
					} else {
						childrenResult.push('<!---->');
					}
				}
				if (isText) {
					childrenResult.push(escapeText(child));
				}
				insertComment = true;
			} else if (isArray$1(child)) {
				childrenResult.push('<!---->');
				childrenResult.push(renderChildren(child));
				childrenResult.push('<!--!-->');
				insertComment = true;
			} else {
				insertComment = false;
				childrenResult.push(renderInputToString(child, context, false));
			}
		}
		return childrenResult.join('');
	} else if (!isInvalid(children)) {
		if (isStringOrNumber(children)) {
			return escapeText(children);
		} else {
			return renderInputToString(children, context, false) || '';
		}
	}
	return '';
}

function renderStyleToString(style) {
	if (isStringOrNumber(style)) {
		return style;
	} else {
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
		} else if (prop === 'style') {
			outputProps.push('style="' + renderStyleToString(props.style) + '"');
		} else if (prop === 'className') {
			outputProps.push('class="' + value + '"');
		} else {
			if (isStringOrNumber(value)) {
				outputProps.push(escapeAttr(prop) + '="' + escapeAttr(value) + '"');
			} else if (isTrue(value)) {
				outputProps.push(escapeAttr(prop));
			}
		}
	}
	if (isRoot) {
		outputProps.push('data-infernoroot');
	}
	if (isVoidElement(tag)) {
		return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">");
	} else {
		return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">" + (html || renderChildren(vElement.children, context)) + "</" + tag + ">");
	}
}

function renderVTemplateToString(vTemplate, isRoot, context) {
	return renderInputToString(convertVTemplate(vTemplate), context, isRoot);
}

function renderInputToString(input, context, isRoot) {
	if (!isInvalid(input)) {
		if (isVTemplate(input)) {
			return renderVTemplateToString(input, isRoot, context);
		} else if (isVElement(input)) {
			return renderVElementToString(input, isRoot, context);
		} else if (isVComponent(input)) {
			return renderComponentToString(input, isRoot, context);
		}
	}
	throw Error('Inferno Error: Bad input argument called on renderInputToString(). Input argument may need normalising.');
}

function renderToString(input) {
	return renderInputToString(input, null, false);
}

function renderToStaticMarkup(input) {
	return renderInputToString(input, null, true);
}

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {}

function interopDefault(ex) {
	return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var index$1 = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define('PropTypes', ['exports', 'module'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod);
    global.PropTypes = mod.exports;
  }
})(commonjsGlobal, function (exports, module) {

  'use strict';

  var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element') || 0xeac7;

  var ReactElement = {};

  ReactElement.isValidElement = function (object) {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  };

  var ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };

  var emptyFunction = {
    thatReturns: function thatReturns(what) {
      return function () {
        return what;
      };
    }
  };

  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  var ANONYMOUS = '<<anonymous>>';

  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  function createChainableTypeChecker(validate) {
    function checkType(isRequired, props, propName, componentName, location, propFullName) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;
      if (props[propName] == null) {
        var locationName = ReactPropTypeLocationNames[location];
        if (isRequired) {
          return new Error('Required ' + locationName + ' `' + propFullName + '` was not specified in ' + ('`' + componentName + '`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        var locationName = ReactPropTypeLocationNames[location];

        var preciseType = getPreciseType(propValue);

        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturns(null));
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var locationName = ReactPropTypeLocationNames[location];
        var propType = getPropType(propValue);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']');
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!ReactElement.isValidElement(props[propName])) {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var locationName = ReactPropTypeLocationNames[location];
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      return createChainableTypeChecker(function () {
        return new Error('Invalid argument supplied to oneOf, expected an instance of array.');
      });
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (propValue === expectedValues[i]) {
          return null;
        }
      }

      var locationName = ReactPropTypeLocationNames[location];
      var valuesString = JSON.stringify(expectedValues);
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      return createChainableTypeChecker(function () {
        return new Error('Invalid argument supplied to oneOfType, expected an instance of array.');
      });
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName) == null) {
          return null;
        }
      }

      var locationName = ReactPropTypeLocationNames[location];
      return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        var locationName = ReactPropTypeLocationNames[location];
        return new Error('Invalid ' + locationName + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || ReactElement.isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      return 'object';
    }
    return propType;
  }

  function getPreciseType(propValue) {
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  module.exports = ReactPropTypes;
});

});

var PropTypes = interopDefault(index$1);

function unmountComponentAtNode(container) {
	render(null, container);
	return true;
}

function cloneElement(element, props) {
	var children = [], len = arguments.length - 2;
	while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

	return createElement.apply(
		void 0, [ element.tag,
		Object.assign({},
			element.attrs || {},
			props || {},
			element.className ? { className: element.className } : {},
			element.style ? { style: element.style } : {},
			element.key ? { key: element.key } : {},
			element.hooks || {},
			element.events || {}
		) ].concat( children )
	);
}

var ARR = [];

var Children = {
	map: function map(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) fn = fn.bind(ctx);
		return children.map(fn);
	},
	forEach: function forEach(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) fn = fn.bind(ctx);
		children.forEach(fn);
	},
	count: function count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only: function only(children) {
		children = Children.toArray(children);
		if (children.length!==1) throw new Error('Children.only() expects only one child.');
		return children[0];
	},
	toArray: function toArray(children) {
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

Component.prototype.isReactComponent = {};

var index = {
	render: render,
	createElement: createElement,
	Component: Component,
	unmountComponentAtNode: unmountComponentAtNode,
	cloneElement: cloneElement,
	PropTypes: PropTypes,
	createClass: createClass,
	findDOMNode: findDOMNode,
	renderToString: renderToString,
	renderToStaticMarkup: renderToStaticMarkup,
	createVElement: createVElement,
	Children: Children
};

exports.render = render;
exports.createElement = createElement;
exports.Component = Component;
exports.unmountComponentAtNode = unmountComponentAtNode;
exports.cloneElement = cloneElement;
exports.PropTypes = PropTypes;
exports.createClass = createClass;
exports.findDOMNode = findDOMNode;
exports.renderToString = renderToString;
exports.renderToStaticMarkup = renderToStaticMarkup;
exports.createVElement = createVElement;
exports.Children = Children;
exports['default'] = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));