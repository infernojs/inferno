/*!
 * inferno-compat v0.8.0-alpha3
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

// Runs only once in applications lifetime
var isBrowser = typeof window !== 'undefined' && window.document;

function isArray(obj) {
	return obj instanceof Array;
}

function isStatefulComponent(o) {
	return isTrue(o._isStateful);
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

var ChildrenTypes = {
	KEYED_LIST: 0,
	NON_KEYED_LIST: 1,
	TEXT: 2,
	NODE: 3,
	UNKNOWN: 4,
	STATIC_TEXT: 5
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

// added $ before all argument names to stop a silly Safari bug
function initProps(o) {
	if (!o._props) {
		o._props = {};
	}
}

var VElement = function VElement($tag) {
	this._type = NodeTypes.ELEMENT;
	this._dom = null;
	this._tag = $tag;
	this._children = null;
	this._key = null;
	this._props = null;
	this._ref = null;
	this._childrenType = ChildrenTypes.UNKNOWN;
};
VElement.prototype.children = function children ($children) {
	this._children = $children;
	return this;
};
VElement.prototype.key = function key ($key) {
	this._key = $key;
	return this;
};
VElement.prototype.props = function props ($props) {
	this._props = $props;
	return this;
};
VElement.prototype.ref = function ref ($ref) {
	this._ref = $ref;
	return this;
};
VElement.prototype.events = function events ($events) {
	this._events = $events;
	return this;
};
VElement.prototype.childrenType = function childrenType ($childrenType) {
	this._childrenType = $childrenType;
	return this;
};
VElement.prototype.className = function className ($className) {
	initProps(this);
	this._props.className = $className;
	return this;
};
VElement.prototype.style = function style ($style) {
	initProps(this);
	this._props.style = $style;
	return this;
};
VElement.prototype.events = function events () {
	initProps(this);
	debugger;
	return this;
};

var VComponent = function VComponent($component) {
	this._type = NodeTypes.COMPONENT;
	this._dom = null;
	this._component = $component;
	this._props = {};
	this._hooks = null;
	this._key = null;
	this._ref = null;
	this._isStateful = !isUndefined($component.prototype) && !isUndefined($component.prototype.render);
};
VComponent.prototype.key = function key ($key) {
	this._key = $key;
	return this;
};
VComponent.prototype.props = function props ($props) {
	this._props = $props;
	return this;
};
VComponent.prototype.hooks = function hooks ($hooks) {
	this._hooks = $hooks;
	return this;
};
VComponent.prototype.ref = function ref ($ref) {
	this._ref = $ref;
	return this;
};

var VText = function VText($text) {
	this._type = NodeTypes.TEXT;
	this._text = $text;
	this._dom = null;
};

var VPlaceholder = function VPlaceholder() {
	this._type = NodeTypes.PLACEHOLDER;
	this._dom = null;
};

var VFragment = function VFragment($children) {
	this._type = NodeTypes.FRAGMENT;
	this._dom = null;
	this._pointer = null;
	this._children = $children;
	this._childrenType = ChildrenTypes.UNKNOWN;
};
VFragment.prototype.childrenType = function childrenType ($childrenType) {
	this._childrenType = $childrenType;
	return this;
};

function createVComponent(component) {
	return new VComponent(component);
}

function createVElement(tag) {
	return new VElement(tag);
}

function createVText(text) {
	return new VText(text);
}

function createVPlaceholder() {
	return new VPlaceholder();
}

function createVFragment(items) {
	return new VFragment(items);
}

function isVText(o) {
	return o._type === NodeTypes.TEXT;
}

function isVPlaceholder(o) {
	return o._type === NodeTypes.PLACEHOLDER;
}

function isVFragment(o) {
	return o._type === NodeTypes.FRAGMENT;
}

function isVElement(o) {
	return o._type === NodeTypes.ELEMENT;
}

function isVTemplate(o) {
	return o._type === NodeTypes.TEMPLATE;
}

function isVComponent(o) {
	return o._type === NodeTypes.COMPONENT;
}

function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
	unmount(lastInput, null, lifecycle);
}

function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	if (lastInput !== nextInput) {
		if (isVTemplate(nextInput)) {
			if (isVTemplate(lastInput)) {
				patchVTemplate(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVTemplate(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVTemplate(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVComponent(nextInput)) {
			if (isVComponent(lastInput)) {
				patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVComponent(lastInput)) {
			replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
		} else if (isVFragment(nextInput)) {
			if (isVFragment(lastInput)) {
				patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVFragment(nextInput, null), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVElement(nextInput)) {
			if (isVElement(lastInput)) {
				patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
			} else {
				replaceChild(parentDom, mountVElement(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
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
				replaceChild(parentDom, mountVPlaceholder(nextInput, null), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVPlaceholder(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
		} else if (isVText(nextInput)) {
			if (isVText(lastInput)) {
				patchVText(lastInput, nextInput);
			} else {
				replaceChild(parentDom, mountVText(nextInput, null), lastInput._dom);
				unmount(lastInput, null, lifecycle);
			}
		} else if (isVText(lastInput)) {
			replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
		} else {
			throw Error('Inferno Error: Bad input argument called on patch(). Input argument may need normalising.');
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
		throw new Error('Inferno Error: Bad childrenType value specified when attempting to patchChildren');
	}
}

function patchChildrenWithUnknownType(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG) {
	if (isInvalid(nextChildren)) {
		removeAllChildren(parentDom, lastChildren, lifecycle);
	} else if (isInvalid(lastChildren)) {
		if (isStringOrNumber(nextChildren)) {
			setTextContent(parentDom, nextChildren);
		} else if (!isInvalid(nextChildren)) {
			if (isArray(nextChildren)) {
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
		var child = normalise$1(lastChildren);

		child._dom = parentDom.firstChild;
		patchChildrenWithUnknownType(child, nextChildren, parentDom, lifecycle, context, isSVG);
	} else if (isArray(nextChildren)) {
		if (isArray(lastChildren)) {
			nextChildren.complex = lastChildren.complex;

			if (isKeyed(lastChildren, nextChildren)) {
				patchKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			} else {
				patchNonKeyedChildren(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG, null);
			}
		} else {
			patchNonKeyedChildren([lastChildren], nextChildren, parentDom, lifecycle, context, isSVG, null);
		}
	} else if (isArray(lastChildren)) {
		patchNonKeyedChildren(lastChildren, [nextChildren], parentDom, lifecycle, context, isSVG, null);
	} else {
		patch(lastChildren, nextChildren, parentDom, lifecycle, context, isSVG);
	}
}

function patchVTemplate(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
	var dom = lastVTemplate._dom;
	var lastTemplateReducers = lastVTemplate._tr;
	var nextTemplateReducers = nextVTemplate._tr;

	if (lastTemplateReducers !== nextTemplateReducers) {
		var newDom = mountVTemplate(nextVTemplate, null, lifecycle, context, isSVG);

		replaceChild(parentDom, newDom, dom);
		unmount(lastVTemplate, null, lifecycle);
	} else {
		nextVTemplate._dom = dom;
		nextTemplateReducers.patch(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG);
	}
}

function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG) {
	var nextTag = nextVElement._tag;
	var lastTag = lastVElement._tag;

	if (nextTag === 'svg') {
		isSVG = true;
	}
	if (lastTag !== nextTag) {
		replaceWithNewNode(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG);
	} else {
		var dom = lastVElement._dom;
		var lastProps = lastVElement._props;
		var nextProps = nextVElement._props;
		var lastChildren = lastVElement._children;
		var nextChildren = nextVElement._children;

		nextVElement._dom = dom;
		if (lastChildren !== nextChildren) {
			var lastChildrenType = lastVElement._childrenType;
			var nextChildrenType = nextVElement._childrenType;

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

	if (lastVElement._tag === 'select') {
		selectValue(nextVElement);
	}
	for (var prop in nextProps) {
		var nextValue = nextProps[prop];
		var lastValue = lastProps[prop];

		if (lastValue !== nextValue) {
			if (isNullOrUndef(nextValue)) {
				removeProp(prop, dom);
			} else {
				patchProp(prop, lastValue, nextValue, dom);
			}
		}
	}
	for (var prop$1 in lastProps) {
		if (isNullOrUndef(nextProps[prop$1])) {
			removeProp(prop$1, dom);
		}
	}
}

// returns true if a property of the element has been mutated, otherwise false for an attribute
function patchProp(prop, lastValue, nextValue, dom) {
	if (isNullOrUndef(nextValue)) {
		dom.removeAttribute(prop);
		return false;
	}
	if (prop === 'className') {
		dom.className = nextValue;
		return false;
	} else if (prop === 'style') {
		patchStyle(lastValue, nextValue, dom);
	} else if (strictProps[prop]) {
		dom[prop] = nextValue === null ? '' : nextValue;
	} else if (booleanProps[prop]) {
		dom[prop] = nextValue ? true : false;
	} else if (isAttrAnEvent(prop)) {
		dom[prop.toLowerCase()] = nextValue;
	} else if (prop !== 'childrenType' && prop !== 'ref' && prop !== 'key') {
		var ns = namespaces[prop];

		if (ns) {
			dom.setAttributeNS(ns, prop, nextValue);
		} else {
			dom.setAttribute(prop, nextValue);
		}
		return false;
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
	var lastComponent = lastVComponent._component;
	var nextComponent = nextVComponent._component;
	var nextProps = nextVComponent._props || {};

	if (lastComponent !== nextComponent) {
		replaceWithNewNode(lastVComponent, nextVComponent, parentDom, lifecycle, context, isSVG);
	} else {
		if (isStatefulComponent(nextVComponent)) {
			var instance = lastVComponent._instance;
			var lastProps = instance.props;
			var lastState = instance.state;
			var nextState = instance.state;
			var childContext = instance.getChildContext();

			nextVComponent._instance = instance;
			instance.context = context;
			if (!isNullOrUndef(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			var nextInput = instance._updateComponent(lastState, nextState, lastProps, nextProps);

			if (nextInput === NO_OP) {
				nextInput = instance._lastInput;
			} else if (isInvalid(nextInput)) {
				nextInput = createVPlaceholder();
			}
			patch(instance._lastInput, nextInput, parentDom, lifecycle, context, null, false);
			instance._vComponent = nextVComponent;
			instance._lastInput = nextInput;
			instance.componentDidUpdate(lastProps, lastState);
			nextVComponent._dom = nextInput._dom;
			componentToDOMNodeMap.set(instance, nextInput._dom);
		} else {
			var shouldUpdate = true;
			var lastProps$1 = lastVComponent._props;
			var nextHooks = nextVComponent._hooks;
			var nextHooksDefined = !isNullOrUndef(nextHooks);
			var lastInput = lastVComponent._instance;

			nextVComponent._dom = lastVComponent._dom;
			nextVComponent._instance = lastInput;
			if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
				shouldUpdate = nextHooks.onComponentShouldUpdate(lastVComponent._dom, lastProps$1, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
					nextHooks.onComponentWillUpdate(lastVComponent._dom, lastProps$1, nextProps);
				}
				var nextInput$1 = nextComponent(nextProps, context);

				if (nextInput$1 === NO_OP) {
					return;
				} else if (isInvalid(nextInput$1)) {
					nextInput$1 = createVPlaceholder();
				}
				patch(lastInput, nextInput$1, parentDom, lifecycle, context, null, null, false);
				nextVComponent._instance = nextInput$1;
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
					nextHooks.onComponentDidUpdate(lastInput._dom, lastProps$1, nextProps);
				}
			}
		}
	}
}

function patchVFragment(lastVFragment, nextVFragment, parentDom, lifecycle, context, isSVG) {
	var lastChildren = lastVFragment._children;
	var nextChildren = nextVFragment._children;
	var pointer = lastVFragment._pointer;

	nextVFragment._dom = lastVFragment._dom;
	nextVFragment._pointer = pointer;
	if (!lastChildren !== nextChildren) {
		var lastChildrenType = lastVFragment._childrenType;
		var nextChildrenType = nextVFragment._childrenType;

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

			insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG), parentVList && parentVList._pointer);
		}
	} else if (lastChildrenLength > nextChildrenLength) {
		for (i = commonLength; i < lastChildrenLength; i++) {
			unmount(lastChildren[i], dom, lifecycle);
		}
	}
}

function patchVPlaceholder(lastVPlacholder, nextVPlacholder) {
	nextVPlacholder._dom = lastVPlacholder._dom;
}

function patchVText(lastVText, nextVText) {
	var nextText = nextVText._text;
	var dom = lastVText._dom;

	nextVText._dom = dom;
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
	outer: do {
		// Sync nodes with the same key at the beginning.
		while (aStartNode._key === bStartNode._key) {
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
		while (aEndNode._key === bEndNode._key) {
			patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG);
			aEnd--;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aEndNode = a[aEnd];
			bEndNode = b[bEnd];
		}

		// Move and sync nodes from left to right.
		if (aStartNode._key === bEndNode._key) {
			patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG);
			nextPos = bEnd + 1;
			nextNode = nextPos < b.length ? b[nextPos]._dom : parentVList && parentVList._pointer;
			insertOrAppend(dom, bEndNode._dom, nextNode);
			aStart++;
			bEnd--;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aStartNode = a[aStart];
			bEndNode = b[bEnd];
			// In a real-world scenarios there is a higher chance that next node after the move will be the same, so we
			// immediately jump to the start of this prefix/suffix algo.
			continue outer;
		}

		// Move and sync nodes from right to left.
		if (aEndNode._key === bStartNode._key) {
			patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG);
			insertOrAppend(dom, bStartNode._dom, aStartNode._dom);
			aEnd--;
			bStart++;
			if (aStart > aEnd || bStart > bEnd) {
				break outer;
			}
			aEndNode = a[aEnd];
			bStartNode = b[bStart];
			continue outer;
		}
	} while (false);

	if (aStart > aEnd) {
		if (bStart <= bEnd) {
			nextPos = bEnd + 1;
			nextNode = (nextPos < b.length) ? b[nextPos]._dom : parentVList && parentVList._pointer;
			while (bStart <= bEnd) {
				insertOrAppend(dom, mount(b[bStart++], null, lifecycle, context, isSVG), nextNode);
			}
		}
	} else if (bStart > bEnd) {
		while (aStart <= aEnd) {
			unmount(a[aStart++], dom, lifecycle, true);
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
						if (aNode._key === bNode._key) {
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
				keyIndex.set(b[i]._key, i);
			}
			for (i = aStart; i <= aEnd; i++) {
				aNode = a[i];

				if (patched < bLength) {
					j = keyIndex.get(aNode._key);

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
					unmount(aNode, dom, lifecycle, true);
					i--;
				}
			}
			if (moved) {
				var seq = lis_algorithm(sources);
				j = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						nextPos = pos + 1;
						nextNode = (nextPos < bLength) ? b[nextPos]._dom : parentVList && parentVList._pointer;
						insertOrAppend(dom, mount(b[pos], null, lifecycle, context, isSVG), nextNode);
					} else {
						if (j < 0 || i !== seq[j]) {
							pos = i + bStart;
							nextPos = pos + 1;
							nextNode = (nextPos < bLength) ? b[nextPos]._dom : parentVList && parentVList._pointer;
							insertOrAppend(dom, mount(b[pos], null, lifecycle, context, isSVG), nextNode);
						} else {
							j--;
						}
					}
				}
			} else if (patched !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + bStart;
						nextPos = pos + 1;
						nextNode = (nextPos < bLength) ? b[nextPos]._dom : parentVList && parentVList._pointer;
						insertOrAppend(dom, mount(b[pos], null, lifecycle, context, isSVG), nextNode);
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
	var Component = vComponent._component;
	var props = vComponent._props;
	var hooks = vComponent._hooks;

	vComponent._dom = dom;
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
		instance.componentDidMount();
		componentToDOMNodeMap.set(instance, dom);
		vComponent._instance = instance;
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
	var tag = node._tag;

	debugger;

	// if (isFunction(tag)) {
	// 	node.dom = domNode;
	// 	hydrateComponent(node, tag, node._props || {}, domNode, parentDom, lifecycle, context);
	// } else {
	// 	if (
	// 		domNode.nodeType !== 1 ||
	// 		tag !== domNode.tagName.toLowerCase()
	// 	) {
	// 		// TODO remake node
	// 	} else {
	// 		node.dom = domNode;
	// 		const hooks = node.hooks;

	// 		const children = node.children;

	// 		if (!isNullOrUndef(children)) {
	// 			if (isStringOrNumber(children)) {
	// 				if (domNode.textContent !== children) {
	// 					domNode.textContent = children;
	// 				}
	// 			} else {
	// 				const childNodes = getChildNodesWithoutComments(domNode);
	// 				const counter = { i: 0 };
	// 				let rebuild = false;

	// 				if (isArray(children)) {
	// 					for (let i = 0; i < children.length; i++) {
	// 						rebuild = hydrateChild(normaliseChild(children, i), childNodes, counter, domNode, lifecycle, context);

	// 						if (rebuild) {
	// 							break;
	// 						}
	// 					}
	// 				} else {
	// 					if (childNodes.length === 1) {
	// 						rebuild = hydrateChild(children, childNodes, counter, domNode, lifecycle, context);
	// 					} else {
	// 						rebuild = true;
	// 					}
	// 				}

	// 				if (rebuild) {
	// 					// TODO scrap children and rebuild again
	// 				}
	// 			}
	// 		}
	// 		const className = node.className;
	// 		const style = node.style;

	// 		if (!isNullOrUndef(className)) {
	// 			domNode.className = className;
	// 		}
	// 		if (!isNullOrUndef(style)) {
	// 			patchStyle(null, style, domNode);
	// 		}
	// 		if (bp && bp.hasAttrs === true) {
	// 			mountBlueprintAttrs(node, bp, domNode);
	// 		} else {
	// 			const attrs = node.attrs;

	// 			if (!isNullOrUndef(attrs)) {
	// 				handleSelects(node);
	// 				mountAttributes(node, attrs, Object.keys(attrs), domNode);
	// 			}
	// 		}
	// 		if (bp && bp.hasEvents === true) {
	// 			mountBlueprintEvents(node, bp, domNode);
	// 		} else {
	// 			const events = node.events;

	// 			if (!isNullOrUndef(events)) {
	// 				// mountEvents(events, Object.keys(events), domNode);
	// 			}
	// 		}
	// 	}
	// }
}

function hydrateVTemplate(vTemplate, dom, lifecycle, context) {
	var templateReducers = vTemplate._tr;

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
		throw Error('Inferno Error: Bad input argument called on hydrate(). Input argument may need normalising.');
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
	var templateReducers = vTemplate._tr;
	var key = vTemplate._key;
	var pool = key === null ? templateReducers._pools.nonKeyed : templateReducers._pools.keyed.get(key);

	if (!isUndefined(pool)) {
		var recycledVTemplate = pool.pop();

		if (!isNullOrUndef(recycledVTemplate)) {
			patchVTemplate(recycledVTemplate, vTemplate, null, lifecycle, context, isSVG);
			return vTemplate._dom;
		}
	}
	return null;
}

function poolVTemplate(vTemplate) {
	var templateReducers = vTemplate._tr;
	var key = vTemplate._key;
	var pools = templateReducers._pools;

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
		removeChild(parentDom, vPlaceholder._dom);
	}
}

function unmountVText(vText, parentDom) {
	if (parentDom) {
		removeChild(parentDom, vText._dom);
	}
}

function unmountVTemplate(vTemplate, parentDom, lifecycle, canRecycle) {
	var dom = vTemplate._dom;
	var templateReducers = vTemplate._tr;
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
	var children = vFragment._children;
	var childrenLength = children.length;
	var pointer = vFragment._pointer;

	if (childrenLength > 0) {
		for (var i = 0; i < childrenLength; i++) {
			var child = children[i];

			if (isVFragment(child)) {
				unmountVFragment(child, parentDom, true, lifecycle);
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
	var instance = vComponent._instance;
	var instanceHooks = null;
	var instanceChildren = null;

	if (!isNullOrUndef(instance)) {
		instanceHooks = instance._hooks;
		instanceChildren = instance._children;

		if (instance.render !== undefined) {
			instance.componentWillUnmount();
			instance._unmounted = true;
			componentToDOMNodeMap.delete(instance);
			unmount(instance._lastInput, null, lifecycle, parentDom);
		}
	}
	var hooks = vComponent._hooks || instanceHooks;

	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
			hooks.onComponentWillUnmount(vComponent._dom, hooks);
		}
	}
	if (parentDom) {
		removeChild(parentDom, vComponent._dom);
	}
}

function unmountVElement(vElement, parentDom, lifecycle) {
	var hooks = vElement._hooks;
	var dom = vElement._dom;

	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onWillDetach)) {
			hooks.onWillDetach(vElement._dom);
		}
	}
	var children = vElement._children;

	if (!isNullOrUndef(children)) {
		if (isArray(children)) {
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
	var pointer = vList._pointer;

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

	nextNode._dom = dom;
	replaceChild(parentDom, dom, lastNode._dom);
	if (lastInstance !== null) {
		lastInstance._lasInput = nextNode;
	}
}

function replaceChild(parentDom, nextDom, lastDom) {
	parentDom.replaceChild(nextDom, lastDom);
}

function normalise$1(object) {
	if (isStringOrNumber(object)) {
		return createVText(object);
	} else if (isInvalid(object)) {
		return createVPlaceholder();
	} else if (isArray(object)) {
		return createVFragment(object);
	}
	return object;
}

function normaliseChild(children, i) {
	var child = children[i];

	return children[i] = normalise$1(child);
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
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0]._key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0]._key);
}

function selectOptionValueIfNeeded(vdom, values) {
	if (vdom._tag !== 'option') {
		for (var i = 0, len = vdom._children.length; i < len; i++) {
			selectOptionValueIfNeeded(vdom._children[i], values);
		}
		// NOTE! Has to be a return here to catch optGroup elements
		return;
	}

	var value = vdom._props && vdom._props.value;

	if (values[value]) {
		vdom._props = vdom._props || {};
		vdom._props.selected = true;
		vdom._dom.selected = true;
	} else {
		vdom._dom.selected = false;
	}
}

function selectValue(vdom) {
	var value = vdom._props && vdom._props.value;
	var values = {};

	if (isArray(value)) {
		for (var i = 0, len = value.length; i < len; i++) {
			values[value[i]] = value[i];
		}
	} else {
		values[value] = value;
	}
	for (var i$1 = 0, len$1 = vdom._children.length; i$1 < len$1; i$1++) {
		selectOptionValueIfNeeded(vdom._children[i$1], values);
	}

	if (vdom._props && vdom._props[value]) {
		delete vdom._props.value; // TODO! Avoid deletion here. Set to null or undef. Not sure what you want to usev
	}
}

var refsError = 'Inferno Error: string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.';

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
		throw Error('Inferno Error: Bad input argument called on mount(). Input argument may need normalising.');
	}
}

function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
	var templateReducers = vTemplate._tr;
	var dom = null;

	if (recyclingEnabled) {
		dom = recycleVTemplate(vTemplate, lifecycle, context, isSVG);
	}
	if (isNull(dom)) {
		dom = templateReducers.mount(vTemplate, null, lifecycle, context, isSVG);
	}
	vTemplate._dom = dom;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVElement(vElement, parentDom, lifecycle, context, isSVG) {
	var tag = vElement._tag;

	if (!isString(tag)) {
		throw new Error('Inferno Error: expects VElement to have a string as the tag name');
	}
	if (tag === 'svg') {
		isSVG = true;
	}
	var dom = documentCreateElement(tag, isSVG);
	var children = vElement._children;
	var props = vElement._props;
	var ref = vElement._ref;

	vElement._dom = dom;
	if (!isNullOrUndef(ref)) {
		lifecycle.addListener(function () {
			ref(dom);
		});
	}
	if (!isNullOrUndef(children)) {
		mountChildren(vElement._childrenType, children, dom, lifecycle, context, isSVG);
	}
	if (!isNullOrUndef(props)) {
		handleSelects(vElement);
		mountProps(vElement, props, dom);
	}
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVFragment(vFragment, parentDom, lifecycle, context, isSVG) {
	var children = vFragment._children;
	var pointer = document.createTextNode('');
	var dom = document.createDocumentFragment();
	var childrenType = vFragment._childrenType;

	if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
		mountArrayChildrenWithType(children, dom, lifecycle, context, isSVG);
	} else if (isUnknownChildrenType(childrenType)) {
		mountArrayChildrenWithoutType(children, dom, lifecycle, context, isSVG);
	}
	vFragment._pointer = pointer;
	vFragment._dom = dom;
	appendChild(dom, pointer);
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVText(vText, parentDom) {
	var dom = document.createTextNode(vText._text);

	vText._dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountVPlaceholder(vPlaceholder, parentDom) {
	var dom = document.createTextNode('');

	vPlaceholder._dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function handleSelects(node) {
	if (node.tag === 'select') {
		selectValue(node);
	}
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
	if (isArray(children)) {
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
		throw new Error('Inferno Error: Bad childrenType value specified when attempting to mountChildren');
	}
}

function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG) {
	var Component = vComponent._component;
	var props = vComponent._props;
	var hooks = vComponent._hooks;
	var ref = vComponent._ref;
	var dom;

	if (isStatefulComponent(vComponent)) {
		if (hooks) {
			throw new Error('Inferno Error: "hooks" are not supported on stateful components.');
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
		instance.componentDidMount();
		if (parentDom !== null && !isInvalid(dom)) {
			appendChild(parentDom, dom);
		}
		componentToDOMNodeMap.set(instance, dom);
		vComponent._dom = dom;
		vComponent._instance = instance;
		if (ref) {
			if (isFunction(ref)) {
				lifecycle.addListener(function () { return ref(instance); });
			} else {
				throw new Error(refsError);
			}
		}
	} else {
		if (ref) {
			throw new Error('Inferno Error: "refs" are not supported on stateless components.');
		}
		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillMount)) {
				hooks.onComponentWillMount(null, props);
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
		vComponent._instance = input$1;
		if (parentDom !== null && !isInvalid(dom)) {
			appendChild(parentDom, dom);
		}
		vComponent._dom = dom;
	}
	return dom;
}

function mountProps(vElement, props, dom) {
	for (var prop in props) {
		var value = props[prop];

		patchProp(prop, null, value, dom);
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
		throw Error('Inferno Error: you cannot render() to the "document.body". Use an empty element as a container instead.');
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
		vNode._props = props;
		if (!isUndefined(children)) {
			vNode._children = children;
		}
		if (hooks) {
			vNode._hooks = hooks;
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
		vNode._props = props;
		if (hooks$1) {
			vNode._hooks = hooks$1;
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
		var parentDom = lastInput._dom.parentNode;
		var activeNode = getActiveNode$1();
		var subLifecycle = new Lifecycle();

		component._patch(lastInput, nextInput, parentDom, subLifecycle, component.context, component, null);
		component._lastInput = nextInput;
		component._vComponent._dom = nextInput._dom;
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
		throw Error('Inferno Warning: Cannot update state via setState() in componentWillUpdate()');
	}
};

Component.prototype.componentDidMount = function componentDidMount () {
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
		this._unmounted = false;
		return NO_OP;
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
	var Component = vComponent._component;
	var props = vComponent._props;

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
					} else {
						childrenResult.push('<!---->');
					}
				}
				if (isText) {
					childrenResult.push(escapeText(child));
				}
				insertComment = true;
			} else if (isArray(child)) {
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
	var tag = vElement._tag;
	var outputProps = [];
	var props = vElement._props;
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
		return ("<" + tag + (outputProps.length > 0 ? ' ' + outputProps.join(' ') : '') + ">" + (html || renderChildren(vElement._children, context)) + "</" + tag + ">");
	}
}

function getTemplateValues(vTemplate) {
	var values = [];
	var v0 = vTemplate._v0;
	var v1 = vTemplate._v1;

	if (v0) {
		values.push(v0);
	}
	if (v1) {
		values.push.apply(values, v1);
	}
	return values;
}

function renderVTemplateToString(vTemplate, isRoot, context) {
	return renderInputToString(vTemplate._tr._schema.apply(null, getTemplateValues(vTemplate)), context, isRoot);
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