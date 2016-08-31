/*!
 * inferno-dom v0.8.0-alpha6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoDOM = factory());
}(this, (function () { 'use strict';

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

var NULL_INDEX = -1;
var ROOT_INDEX = -2;

var NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5,
	VARIABLE: 6
};

function createTemplaceReducers(
	keyIndex,
	mount,
	patch,
	unmount,
	hydrate
) {
	return {
		keyIndex: keyIndex,
		schema: null,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		},
		mount: mount,
		patch: patch,
		unmount: unmount,
		hydrate: hydrate
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

function isVariable(o) {
	return o.type === NodeTypes.VARIABLE;
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

function isVNode(o) {
	return o.type !== undefined;
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

function patchVariableAsExpression(pointer, templateIsSVG) {
	return function patchVariableAsExpression(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		var lastInput = readFromVTemplate(lastVTemplate, pointer);
		var nextInput = readFromVTemplate(nextVTemplate, pointer);

		if (lastInput !== nextInput) {
			if (isNullOrUndef(nextInput) || !isVNode(nextInput)) {
				nextInput = normalise(nextInput);
				writeToVTemplate(nextVTemplate, pointer, nextInput);
			}
			patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG || templateIsSVG);
		}
	};
}

function patchVariableAsChildren(pointer, templateIsSVG, childrenType) {
	return function patchVariableAsChildren(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		var lastInput = readFromVTemplate(lastVTemplate, pointer);
		var nextInput = readFromVTemplate(nextVTemplate, pointer);

		if (lastInput !== nextInput) {
			patchChildren(childrenType, lastInput, nextInput, parentDom, lifecycle, context, isSVG || templateIsSVG);
		}
	};
}

function patchVariableAsText(pointer) {
	return function patchVariableAsText(lastVTemplate, nextVTemplate, textNode) {
		var nextInput = readFromVTemplate(nextVTemplate, pointer);

		if (readFromVTemplate(lastVTemplate, pointer) !== nextInput) {
			textNode.nodeValue = nextInput;
		}
	};
}

function patchTemplateClassName(pointer) {
	return function patchTemplateClassName(lastVTemplate, nextVTemplate, dom) {
		var nextClassName = readFromVTemplate(nextVTemplate, pointer);

		if (readFromVTemplate(lastVTemplate, pointer) !== nextClassName) {
			if (isNullOrUndef(nextClassName)) {
				dom.removeAttribute('class');
			} else {
				dom.className = nextClassName;
			}
		}
	};
}

function patchTemplateStyle(pointer) {
	return function patchTemplateClassName(lastVTemplate, nextVTemplate, dom) {
		var lastStyle = readFromVTemplate(lastVTemplate, pointer);
		var nextStyle = readFromVTemplate(nextVTemplate, pointer);

		if (lastStyle !== nextStyle) {
			patchStyle(lastStyle, nextStyle, dom);
		}
	};
}

function patchTemplateProps(propsToPatch, tag) {
	return function patchTemplateProps(lastVTemplate, nextVTemplate, dom) {
		// used for form values only
		var formValue;

		if (tag === 'input') {
			resetFormInputProperties(dom);
		}
		for (var i = 0; i < propsToPatch.length; i += 2) {
			var prop = propsToPatch[i];
			var value = propsToPatch[i + 1];
			var lastValue = value;
			var nextValue = value;

			if (isVariable(value)) {
				lastValue = readFromVTemplate(lastVTemplate, value.pointer);
				nextValue = readFromVTemplate(nextVTemplate, value.pointer);
			}
			if (prop === 'value') {
				formValue = nextValue;
			}
			patchProp(prop, lastValue, nextValue, dom);
		}
		if (tag === 'select') {
			formSelectValue(dom, formValue);
		}
	};
}

function patchSpreadPropsFromTemplate(pointer, templateIsSVG, tag) {
	return function patchSpreadPropsFromTemplate(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG) {
		var lastProps = readFromVTemplate(lastVTemplate, pointer) || {};
		var nextProps = readFromVTemplate(nextVTemplate, pointer) || {};
		// used for form values only
		var formValue;

		for (var prop in nextProps) {
			var lastValue = nextProps[prop];
			var nextValue = nextProps[prop];

			if (prop === 'key') {
				nextVTemplate.key = nextValue;
			} else if (prop === 'children') {
				if (lastValue !== nextValue) {
					patchChildrenWithUnknownType(lastValue, nextValue, dom, lifecycle, context, isSVG || templateIsSVG);
				}
			} else {
				if (isNullOrUndef(nextValue)) {
					removeProp(prop, dom);
				} else {
					patchProp(prop, lastValue, nextValue, dom);
				}
			}
			if (prop === 'value') {
				formValue = nextValue;
			}
		}
		for (var prop$1 in lastProps) {
			if (isNullOrUndef(nextProps[prop$1])) {
				removeProp(prop$1, dom);
			}
		}
		if (tag === 'select') {
			formSelectValue(dom, formValue);
		}
	};
}

function normaliseChildNodes(dom) {
	var childNodes = [];
	var rawChildNodes = dom.childNodes;
	var length = rawChildNodes.length;
	var i = 0;

	while (i < length) {
		var rawChild = rawChildNodes[i];

		if (rawChild.nodeType === 8) {
			if (rawChild.data === '!') {
				var placeholder = document.createTextNode('');

				dom.replaceChild(placeholder, rawChild);
				childNodes.push(placeholder);
				i++;
			} else {
				dom.removeChild(rawChild);
				length--;
			}
		} else {
			childNodes.push(rawChild);
			i++;
		}
	}
	return childNodes;
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

function hydrateVariableAsChildren(pointer, childrenType) {
	return function hydrateVariableAsChildren(vTemplate, dom, lifecycle, context) {
		hydrateChildren(childrenType, readFromVTemplate(vTemplate, pointer), dom, lifecycle, context);
	};
}

function hydrateVariableAsExpression(pointer) {
	return function hydrateVariableAsExpression(vTemplate, dom, lifecycle, context) {
		var input = readFromVTemplate(vTemplate, pointer);

		if (isNullOrUndef(input) || !isVNode(input)) {
			input = normalise(input);
			vTemplate.write(pointer, input);
		}
		return hydrate(input, dom, lifecycle, context);
	};
}

function hydrateVariableAsText() {
	return function hydrateVariableAsText() {
		debugger;
	};
}

var recyclingEnabled = true;

function copyValue(oldItem, item, index) {
	var value = readFromVTemplate(oldItem, index);

	writeToVTemplate(item, index, value);
	return value;
}

function copyTemplate(nodeIndex) {
	return function copyTemplate(oldItem, item) {
		return copyValue(oldItem, item, nodeIndex);
	};
}

function readFromVTemplate(vTemplate, index) {
	var value;
	if (index === ROOT_INDEX) {
		value = vTemplate.dom;
	} else if (index === 0) {
		value = vTemplate.v0;
	} else {
		value = vTemplate.v1[index - 1];
	}
	return value;
}

function writeToVTemplate(vTemplate, index, value) {
	if (index === ROOT_INDEX) {
		vTemplate.dom = value;
	} else if (index === 0) {
		vTemplate.v0 = value;
	} else {
		var array = vTemplate.v1;
		if (!array) {
			vTemplate.v1 = [value];
		} else {
			array[index - 1] = value;
		}
	}
}

function createTemplateReducers(vNode, isRoot, offset, parentDom, isSVG, isChildren, childrenType, path) {
	if (!isInvalid(vNode)) {
		var keyIndex = NULL_INDEX;
		var nodeIndex = isRoot ? ROOT_INDEX : NULL_INDEX;
		var mount;
		var patch;
		var unmount;
		var hydrate;
		var deepClone = false;

		if (isVariable(vNode)) {
			if (isChildren) {
				mount = mountVariableAsChildren(vNode.pointer, isSVG, childrenType);
				if (childrenType === ChildrenTypes.STATIC_TEXT) {
					patch = null;
				} else {
					patch = patchVariableAsChildren(vNode.pointer, isSVG, childrenType);
				}
				unmount = unmountVariableAsChildren(vNode.pointer, childrenType);
				hydrate = hydrateVariableAsChildren(vNode.pointer, childrenType);
			} else {
				mount = mountVariableAsExpression(vNode.pointer, isSVG);
				patch = patchVariableAsExpression(vNode.pointer, isSVG);
				unmount = unmountVariableAsExpression(vNode.pointer);
				hydrate = hydrateVariableAsExpression(vNode.pointer);
			}
		} else if (isVFragment(vNode)) {
			var children = vNode.children;

			if (isVariable(children)) {
				mount = mountVariableAsChildren(children.pointer, isSVG, childrenType);
				patch = patchVariableAsChildren(children.pointer, isSVG, childrenType);
				unmount = unmountVariableAsChildren(children.pointer, childrenType);
			} else {
				// debugger;
			}
		} else if (isVText(vNode)) {
			var text = vNode.text;

			if (nodeIndex !== NULL_INDEX) {
				nodeIndex = offset.length++;
			}
			if (isVariable(text)) {
				mount = combineMountTo2(nodeIndex, mountEmptyTextNode, mountVariableAsText(text.pointer));
				patch = combinePatchTo2(nodeIndex, patchVariableAsText(text.pointer));
				unmount = unmountVariableAsText(text.pointer);
				hydrate = hydrateVariableAsText(text.pointer);
			} else {
				mount = mountDOMNodeFromTemplate(document.createTextNode(text), true);
				patch = null;
				unmount = null;
			}
		} else if (isVElement(vNode)) {
			var mounters = [];
			var patchers = [];
			var unmounters = [];
			var hydraters = [];
			var tag = vNode.tag;

			if (tag === 'svg') {
				isSVG = true;
			}
			var dom = documentCreateElement(tag, isSVG);
			var key = vNode.key;

			if (!isNull(key) && isVariable(key)) {
				keyIndex = key.pointer;
			}
			var children$1 = vNode.children;

			if (!isInvalid(children$1)) {
				if (isStringOrNumber(children$1)) {
					setTextContent(dom, children$1);
					deepClone = true;
				} else if (isArray$1(children$1)) {
					for (var i = 0; i < children$1.length; i++) {
						var child = children$1[i];

						if (nodeIndex === NULL_INDEX && isVariable(child)) {
							nodeIndex = offset.length++;
						}
						var templateReducers = createTemplateReducers(normalise(child), false, offset, dom, isSVG, false, vNode.childrenType, path + ',' + i);

						if (!isInvalid(templateReducers)) {
							mounters.push(templateReducers.mount);
							var patch$1 = templateReducers.patch;
							var unmount$1 = templateReducers.unmount;
							var hydrate$1 = templateReducers.hydrate;

							if (!isNull(patch$1)) {
								patchers.push(patch$1);
							}
							if (!isNull(unmount$1)) {
								unmounters.push(unmount$1);
							}
							if (!isNull(hydrate$1)) {
								hydraters.push(hydrate$1);
							}
						}
					}
				} else {
					if (nodeIndex === NULL_INDEX && isVariable(children$1)) {
						nodeIndex = offset.length++;
					}
					var templateReducers$1 = createTemplateReducers(normalise(children$1), false, offset, dom, isSVG, true, vNode.childrenType, path + ',0');

					if (!isInvalid(templateReducers$1)) {
						mounters.push(templateReducers$1.mount);
						var patch$2 = templateReducers$1.patch;
						var unmount$2 = templateReducers$1.unmount;
						var hydrate$2 = templateReducers$1.hydrate;

						if (!isNull(patch$2)) {
							patchers.push(patch$2);
						}
						if (!isNull(unmount$2)) {
							unmounters.push(unmount$2);
						}
						if (!isNull(hydrate$2)) {
							hydraters.push(hydrate$2);
						}
					}
				}
			}
			var props = vNode.props;
			var staticPropCount = 0;

			if (!isNull(props)) {
				if (isVariable(props)) {
					mounters.push(mountSpreadPropsFromTemplate(props.pointer, isSVG));
					patchers.push(patchSpreadPropsFromTemplate(props.pointer, isSVG));
				} else {
					var propsToMount = [];
					var propsToPatch = [];

					for (var prop in props) {
						var value = props[prop];

						if (isVariable(value)) {
							if (prop === 'className') {
								mounters.push(mountTemplateClassName(value.pointer));
								patchers.push(patchTemplateClassName(value.pointer));
							} else if (prop === 'style') {
								mounters.push(mountTemplateStyle(value.pointer));
								patchers.push(patchTemplateStyle(value.pointer));
							} else {
								propsToMount.push(prop, value);
								propsToPatch.push(prop, value);
							}
						} else {
							var shouldMountProp = patchProp(prop, null, value, dom);

							if (shouldMountProp) {
								propsToMount.push(prop, value);
								propsToPatch.push(prop, value);
								staticPropCount++;
							}
						}
					}
					if (propsToMount.length > 0) {
						mounters.push(mountTemplateProps(propsToMount, tag));
					}
					if (propsToPatch.length > 0) {
						patchers.push(patchTemplateProps(propsToPatch, tag));
					}
				}
			}
			var ref = vNode.ref;

			if (!isNullOrUndef(ref)) {
				mounters.push(mountRefFromTemplate(ref));
			}
			if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
				if (staticPropCount === patchers.length) {
					nodeIndex = offset.length + 1;
				} else {
					nodeIndex = offset.length++;
				}
			}
			mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(dom, deepClone), mounters);
			patch = combinePatch(nodeIndex, patchers);
			unmount = combineUnmount(nodeIndex, unmounters);
			hydrate = combineHydrate(nodeIndex, path, hydraters);
		} else if (isVComponent(vNode)) {
			if ("development" !== 'production') {
				throwError('templates cannot contain VComponent nodes. Pass a VComponent node into a template as a variable instead.');
			}
			throwError();
		}
		return createTemplaceReducers(keyIndex, mount, patch, unmount, hydrate);
	}
}

function combineMount(nodeIndex, mountDOMNodeFromTemplate, mounters) {
	if (nodeIndex === NULL_INDEX && mounters.length === 0) {
		return mountDOMNodeFromTemplate;
	} else if (mounters.length <= 1) {
		return combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounters[0]);
	} else if (mounters.length <= 4) {
		return combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounters[0], mounters[1], mounters[2], mounters[3]);
	} else {
		return combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters);
	}
}

function combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounter1) {
	var write = (nodeIndex !== NULL_INDEX);

	return function combineMountTo2(vTemplate, parentDom, lifecycle, context, isSVG) {
		var dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context, isSVG);

		if (write) {
			writeToVTemplate(vTemplate, nodeIndex, dom);
		}
		if (mounter1) {
			mounter1(vTemplate, dom, lifecycle, context, isSVG);
		}
		return dom;
	};
}

function combineMountTo5(nodeIndex, mountDOMNodeFromTemplate, mounter1, mounter2, mounter3, mounter4) {
	var write = (nodeIndex !== NULL_INDEX);

	return function combineMountTo5(vTemplate, parentDom, lifecycle, context, isSVG) {
		var dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context, isSVG);

		if (write) {
			writeToVTemplate(vTemplate, nodeIndex, dom);
		}
		if (mounter1) {
			mounter1(vTemplate, dom, lifecycle, context, isSVG);
			if (mounter2) {
				mounter2(vTemplate, dom, lifecycle, context, isSVG);
				if (mounter3) {
					mounter3(vTemplate, dom, lifecycle, context, isSVG);
					if (mounter4) {
						mounter4(vTemplate, dom, lifecycle, context, isSVG);
					}
				}
			}
		}
		return dom;
	};
}

function combineMountToX(nodeIndex, mountDOMNodeFromTemplate, mounters) {
	var write = (nodeIndex !== NULL_INDEX);

	return function combineMountToX(vTemplate, parentDom, lifecycle, context, isSVG) {
		var dom = mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context);

		if (write) {
			writeToVTemplate(vTemplate, nodeIndex, dom);
		}
		for (var i = 0; i < mounters.length; i++) {
			mounters[i](vTemplate, dom, lifecycle, context, isSVG);
		}
		return dom;
	};
}

function combinePatch(nodeIndex, patchers) {
	if (patchers.length === 0) {
		if (nodeIndex !== NULL_INDEX) {
			return copyTemplate(nodeIndex);
		} else {
			return null;
		}
	} else if (patchers.length <= 1) {
		return combinePatchTo2(nodeIndex, patchers[0]);
	} else if (patchers.length <= 4) {
		return combinePatchTo5(nodeIndex, patchers[0], patchers[1], patchers[2], patchers[3], patchers[4]);
	} else {
		return combinePatchX(nodeIndex, patchers);
	}
}

function combinePatchTo2(nodeIndex, patch1) {
	var copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchTo2(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		var dom;

		if (copy) {
			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		if (patch1) {
			patch1(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
		}
	};
}

function combinePatchTo5(nodeIndex, patch1, patch2, patch3, patch4, patch5) {
	var copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchTo5(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		var dom;

		if (copy) {
			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		if (patch1) {
			patch1(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
			if (patch2) {
				patch2(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
				if (patch3) {
					patch3(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
					if (patch4) {
						patch4(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
						if (patch5) {
							patch5(lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
						}
					}
				}
			}
		}
	};
}

function combinePatchX(nodeIndex, patchers) {
	var copy = (nodeIndex !== NULL_INDEX);

	return function combinePatchX(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
		var dom;

		if (copy) {
			dom = copyValue(lastVTemplate, nextVTemplate, nodeIndex);
		}
		for (var i = 0; i < patchers.length; i++) {
			patchers[i](lastVTemplate, nextVTemplate, dom, lifecycle, context, isSVG);
		}
	};
}

function combineUnmount(nodeIndex, unmounters) {
	if (unmounters.length > 0) {
		if (unmounters.length <= 4) {
			return combineUnmountTo5(nodeIndex, unmounters[0], unmounters[1], unmounters[2], unmounters[3], unmounters[4]);
		}
	}
	return null;
}

function combineUnmountTo5(nodeIndex, unomunt1, unomunt2, unomunt3, unomunt4, unomunt5) {
	return function combineUnmountTo5(vTemplate, lifecycle) {
		if (unomunt1) {
			unomunt1(vTemplate, lifecycle);
			if (unomunt2) {
				unomunt2(vTemplate, lifecycle);
				if (unomunt3) {
					unomunt3(vTemplate, lifecycle);
					if (unomunt4) {
						unomunt4(vTemplate, lifecycle);
						if (unomunt5) {
							unomunt5(vTemplate, lifecycle);
						}
					}
				}
			}
		}
	};
}

function combineHydrate(nodeIndex, path, hydraters) {
	if (hydraters.length <= 4) {
		return combineHydrateTo5(nodeIndex, path, hydraters[0], hydraters[1], hydraters[2], hydraters[3], hydraters[4]);
	} else {
		return combineHydrateX(nodeIndex, path, hydraters);
	}
}

function combineHydrateTo5(nodeIndex, path, hydrate1, hydrate2, hydrate3, hydrate4, hydrate5) {
	var write = (nodeIndex !== NULL_INDEX);

	return function combineHydrateTo5(vTemplate, rootDom, lifecycle, context) {
		var dom;

		if (write) {
			dom = getDomFromTemplatePath(rootDom, path);
			writeToVTemplate(vTemplate, nodeIndex, dom);
		}
		if (hydrate1) {
			hydrate1(vTemplate, dom, lifecycle, context);
			if (hydrate2) {
				hydrate2(vTemplate, dom, lifecycle, context);
				if (hydrate3) {
					hydrate3(vTemplate, dom, lifecycle, context);
					if (hydrate4) {
						hydrate4(vTemplate, dom, lifecycle, context);
						if (hydrate5) {
							hydrate5(vTemplate, dom, lifecycle, context);
						}
					}
				}
			}
		}
	};
}

function combineHydrateX(nodeIndex, unmounters) {
	return function combineHydrateX() {
		var write = (nodeIndex !== NULL_INDEX);

		return function combineHydrateX(vTemplate, rootDom, lifecycle, context) {
			var dom;

			if (write) {
				dom = getDomFromTemplatePath(rootDom, path);
				writeToVTemplate(vTemplate, nodeIndex, dom);
			}
			for (var i = 0; i < unmounters.length; i++) {
				unmounters[i](vTemplate, dom, lifecycle, context);
			}
		};
	};
}

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

function getDomFromTemplatePath(rootDom, path) {
	if (path === '') {
		normaliseChildNodes(rootDom);
		return rootDom;
	} else {
		var routes = path.split(',');
		var dom = rootDom;

		for (var i = 0; i < routes.length; i++) {
			var route = routes[i];

			if (route !== '') {
				var childNodes = normaliseChildNodes(dom);

				dom = childNodes[route];
			}
		}
		return dom;
	}
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

function unmountTemplateValue(value, lifecycle) {
	if (isArray$1(value)) {
		for (var i = 0; i < value.length; i++) {
			unmount(value[i], null, lifecycle, false);
		}
	} else {
		unmount(value, null, lifecycle, false);
	}
}

// TODO we can probably combine the below two functions, depends on if we can optimise with childrenType?
function unmountVariableAsExpression(pointer) {
	return function unmountVariableAsExpression(vTemplate, lifecycle) {
		unmountTemplateValue(readFromVTemplate(vTemplate, pointer), lifecycle);
	};
}

function unmountVariableAsChildren(pointer, childrenType) {
	return function unmountVariableAsChildren(vTemplate, lifecycle) {
		unmountTemplateValue(readFromVTemplate(vTemplate, pointer), lifecycle);
	};
}

function unmountVariableAsText(pointer) {
	return function unmountVariableAsText(vTemplate, parentDom) {
		debugger;
	};
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

function resetFormInputProperties(dom) {
	if (dom.checked) {
		dom.checked = false;
	}
	if (dom.disabled) {
		dom.disabled = false;
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

function mountVariableAsExpression(pointer, templateIsSVG) {
	return function mountVariableAsExpression(vTemplate, dom, lifecycle, context, isSVG) {
		var input = readFromVTemplate(vTemplate, pointer);

		if (isNullOrUndef(input) || !isVNode(input)) {
			input = normalise(input);
			writeToVTemplate(vTemplate, pointer, input);
		}
		return mount(input, dom, lifecycle, context, isSVG || templateIsSVG);
	};
}

function mountVariableAsChildren(pointer, templateIsSVG, childrenType) {
	return function mountVariableAsChildren(vTemplate, dom, lifecycle, context, isSVG) {
		return mountChildren(
			childrenType,
			readFromVTemplate(vTemplate, pointer),
			dom,
			lifecycle,
			context,
			isSVG || templateIsSVG);
	};
}


function mountVariableAsText(pointer) {
	return function mountVariableAsText(vTemplate, textNode) {
		textNode.nodeValue = readFromVTemplate(vTemplate, pointer);
	};
}

function mountDOMNodeFromTemplate(templateDomNode, deepClone) {
	return function mountDOMNodeFromTemplate(vTemplate, dom) {
		var domNode = templateDomNode.cloneNode(deepClone);

		if (!isNull(dom)) {
			appendChild(dom, domNode);
		}
		return domNode;
	};
}

function mountRefFromTemplate(ref) {
	return function mountRefFromTemplate(vTemplate, dom, lifecycle) {
		var value = ref;

		if (isVariable(ref)) {
			value = readFromVTemplate(vTemplate, ref.pointer);
		}
		if (isFunction(value)) {
			lifecycle.addListener(function () { return value(dom); });
		} else {
			if ("development" !== 'production') {
				throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
			}
			throwError();
		}
	};
}

function mountSpreadPropsFromTemplate(pointer, templateIsSVG) {
	return function mountSpreadPropsFromTemplate(vTemplate, dom, lifecycle, context, isSVG) {
		var props = readFromVTemplate(vTemplate, pointer);

		var loop = function ( prop ) {
			var value = props[prop];

			if (prop === 'key') {
				vTemplate.key = value;
			} else if (prop === 'ref') {
				if (isFunction(value)) {
					lifecycle.addListener(function () { return value(dom); });
				} else {
					if ("development" !== 'production') {
						throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
					}
					throwError();
				}
			} else if (prop === 'children') {
				mountChildrenWithUnknownType(value, dom, lifecycle, context, isSVG || templateIsSVG);
			} else {
				patchProp(prop, null, value, dom);
			}
		};

		for (var prop in props) loop( prop );
	};
}

function mountEmptyTextNode(vTemplate, parentDom) {
	var dom = document.createTextNode('');

	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

function mountTemplateClassName(pointer) {
	return function mountTemplateClassName(vTemplate, dom) {
		var className = readFromVTemplate(vTemplate, pointer);

		if (!isNullOrUndef(className)) {
			dom.className = className;
		}
	};
}

function mountTemplateStyle(pointer) {
	return function mountTemplateStyle(vTemplate, dom) {
		patchStyle(null, readFromVTemplate(vTemplate, pointer), dom);
	};
}

function mountTemplateProps(propsToMount, tag) {
	return function mountTemplateProps(vTemplate, dom) {
		// used for form values only
		var formValue;

		for (var i = 0; i < propsToMount.length; i += 2) {
			var prop = propsToMount[i];
			var value = propsToMount[i + 1];

			if (isVariable(value)) {
				value = readFromVTemplate(vTemplate, value.pointer);
			}
			if (prop === 'value') {
				formValue = value;
			}
			patchProp(prop, null, value, dom);
		}
		if (tag === 'select') {
			formSelectValue(dom, formValue);
		}
	};
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

var index = {
	render: render,
	findDOMNode: findDOMNode,
	mount: mount,
	patch: patch,
	unmount: unmount,
	createTemplateReducers: createTemplateReducers
};

return index;

})));