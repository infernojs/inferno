/*!
 * inferno-dom v0.8.0-alpha2
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoDOM = factory());
}(this, function () { 'use strict';

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

	var TemplaceReducers = function TemplaceReducers($keyIndex, $mount, $patch, $unmount, $hydrate) {
		this._keyIndex = $keyIndex;
		this._schema = null;
		this._pools = {
			nonKeyed: [],
			keyed: new Map()
		};
		this.mount = $mount;
		this.patch = $patch;
		this.unmount = $unmount;
		this.hydrate = $hydrate;
	};

	function createTemplaceReducers(keyIndex, mount, patch, unmount, hydrate) {
		return new TemplaceReducers(keyIndex, mount, patch, unmount, hydrate);
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

	function isVariable(o) {
		return o._type === NodeTypes.VARIABLE;
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

	function isVNode(o) {
		return o._type !== undefined;
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

				nextVComponent._dom = lastVComponent._dom;
				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
					shouldUpdate = nextHooks.onComponentShouldUpdate(lastVComponent._dom, lastProps$1, nextProps);
				}
				if (shouldUpdate !== false) {
					if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
						nextHooks.onComponentWillUpdate(lastVComponent._dom, lastProps$1, nextProps);
					}
					var nextInput$1 = nextComponent(nextProps, context);
					var lastInput = lastVComponent._instance;

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

	function patchVariableAsExpression(pointer, templateIsSVG) {
		return function patchVariableAsExpression(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
			var lastInput = lastVTemplate.read(pointer);
			var nextInput = nextVTemplate.read(pointer);

			if (lastInput !== nextInput) {
				if (isNullOrUndef(nextInput) || !isVNode(nextInput)) {
					nextInput = normalise$1(nextInput);
					nextVTemplate.write(pointer, nextInput);
				}
				patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG || templateIsSVG);
			}
		};
	}

	function patchVariableAsChildren(pointer, templateIsSVG, childrenType) {
		return function patchVariableAsChildren(lastVTemplate, nextVTemplate, parentDom, lifecycle, context, isSVG) {
			var lastInput = lastVTemplate.read(pointer);
			var nextInput = nextVTemplate.read(pointer);

			if (lastInput !== nextInput) {
				patchChildren(childrenType, lastInput, nextInput, parentDom, lifecycle, context, isSVG || templateIsSVG);
			}
		};
	}

	function patchVariableAsText(pointer) {
		return function patchVariableAsText(lastVTemplate, nextVTemplate, textNode) {
			var nextInput = nextVTemplate.read(pointer);

			if (lastVTemplate.read(pointer) !== nextInput) {
				textNode.nodeValue = nextInput;
			}
		};
	}

	function patchTemplateClassName(pointer) {
		return function patchTemplateClassName(lastVTemplate, nextVTemplate, dom) {
			var nextClassName = nextVTemplate.read(pointer);

			if (lastVTemplate.read(pointer) !== nextClassName) {
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
			var lastStyle = lastVTemplate.read(pointer);
			var nextStyle = nextVTemplate.read(pointer);

			if (lastStyle !== nextStyle) {
				patchStyle(lastStyle, nextStyle, dom);
			}
		};
	}

	function patchTemplateProps(propsToPatch) {
		return function patchTemplateProps(lastVTemplate, nextVTemplate, dom) {
			resetStatefulDomProperties(dom);

			for (var i = 0; i < propsToPatch.length; i += 2) {
				var prop = propsToPatch[i];
				var pointer = propsToPatch[i + 1];
				var lastValue = lastVTemplate.read(pointer);
				var nextValue = nextVTemplate.read(pointer);

				if (lastValue !== nextValue) {
					patchProp(prop, lastValue, nextValue, dom);
				}
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

	// const childNodes = normaliseChildNodes(dom);

	function hydrateArrayChildrenWithType(children, dom, lifecycle, context, isSVG) {
		for (var i = 0; i < children.length; i++) {
			debugger;
		}
	}

	function hydrateChildrenWithUnknownType(children, dom, lifecycle, context) {
		if (isArray(children)) {
			debugger;
		} else if (isStringOrNumber(children)) {
			debugger;
		} else if (!isInvalid(children)) {
			hydrate(children, dom.firstChild, lifecycle, context);
		}
	}

	function hydrateChildren(childrenType, children, dom, lifecycle, context) {
		if (isTextChildrenType(childrenType)) {
			debugger;
		} else if (isNodeChildrenType(childrenType)) {
			debugger;
		} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
			hydrateArrayChildrenWithType(childrem, dom, lifecycle, context);
		} else if (isUnknownChildrenType(childrenType)) {
			hydrateChildrenWithUnknownType(children, dom);
		} else {
			throw new Error('Inferno Error: Bad childrenType value specified when attempting to hydrateChildren');
		}
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

	function hydrateVariableAsChildren(pointer, childrenType) {
		return function hydrateVariableAsChildren(vTemplate, dom, lifecycle, context) {
			hydrateChildren(childrenType, vTemplate.read(pointer), dom, lifecycle, context);
		};
	}

	function hydrateVariableAsExpression(pointer) {
		return function hydrateVariableAsExpression(vTemplate, dom, lifecycle, context) {
			var input = vTemplate.read(pointer);

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
		var value = oldItem.read(index);

		item.write(index, value);
		return value;
	}

	function copyTemplate(nodeIndex) {
		return function copyTemplate(oldItem, item) {
			return copyValue(oldItem, item, nodeIndex);
		};
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
					mount = mountVariableAsChildren(vNode._pointer, isSVG, childrenType);
					if (childrenType === ChildrenTypes.STATIC_TEXT) {
						patch = null;
					} else {
						patch = patchVariableAsChildren(vNode._pointer, isSVG, childrenType);
					}
					unmount = unmountVariableAsChildren(vNode._pointer, childrenType);
					hydrate = hydrateVariableAsChildren(vNode._pointer, childrenType);
				} else {
					mount = mountVariableAsExpression(vNode._pointer, isSVG);
					patch = patchVariableAsExpression(vNode._pointer, isSVG);
					unmount = unmountVariableAsExpression(vNode._pointer);
					hydrate = hydrateVariableAsExpression(vNode._pointer);
				}
			} else if (isVFragment(vNode)) {
				var children = vNode._children;

				if (isVariable(children)) {
					mount = mountVariableAsChildren(children._pointer, isSVG, childrenType);
					patch = patchVariableAsChildren(children._pointer, isSVG, childrenType);
					unmount = unmountVariableAsChildren(children._pointer, childrenType);
				} else {
					debugger;
				}
			} else if (isVText(vNode)) {
				var text = vNode._text;
				nodeIndex = offset.length++;

				if (isVariable(text)) {
					mount = combineMountTo2(nodeIndex, mountEmptyTextNode, mountVariableAsText(text._pointer));
					patch = combinePatchTo2(nodeIndex, patchVariableAsText(text._pointer));
					unmount = unmountVariableAsText(text._pointer);
					hydrate = hydrateVariableAsText(text._pointer);
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
				var tag = vNode._tag;

				if (tag === 'svg') {
					isSVG = true;
				}
				var dom = documentCreateElement(tag, isSVG);
				var key = vNode._key;

				if (!isNull(key) && isVariable(key)) {
					keyIndex = key._pointer;
				}
				var props = vNode._props;

				if (!isNull(props)) {
					if (isVariable(props)) {
						mounters.push(mountSpreadPropsFromTemplate(props._pointer));
					} else {
						var propsToMount = [];
						var propsToPatch = [];

						for (var prop in props) {
							var value = props[prop];

							if (isVariable(value)) {
								if (prop === 'className') {
									mounters.push(mountTemplateClassName(value._pointer));
									patchers.push(patchTemplateClassName(value._pointer));
								} else if (prop === 'style') {
									mounters.push(mountTemplateStyle(value._pointer));
									patchers.push(patchTemplateStyle(value._pointer));
								} else {
									propsToMount.push(prop, value);
									propsToPatch.push(prop, value._pointer);
								}
							} else {
								var shouldMountProp = patchProp(prop, null, value, dom);

								if (shouldMountProp) {
									propsToMount.push(prop, value);
								}
							}
						}
						if (propsToMount.length > 0) {
							mounters.push(mountTemplateProps(propsToMount));
						}
						if (propsToPatch.length > 0) {
							patchers.push(patchTemplateProps(propsToPatch));
						}
					}
				}
				var ref = vNode._ref;

				if (!isNullOrUndef(ref)) {
					mounters.push(mountRefFromTemplate(ref));
				}
				if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
					nodeIndex = offset.length++;
				}
				var children$1 = vNode._children;

				if (!isInvalid(children$1)) {
					if (isStringOrNumber(children$1)) {
						setTextContent(dom, children$1);
						deepClone = true;
					} else if (isArray(children$1)) {
						for (var i = 0; i < children$1.length; i++) {
							var child = children$1[i];

							if (nodeIndex === NULL_INDEX && isVariable(child)) {
								nodeIndex = offset.length++;
							}
							var templateReducers = createTemplateReducers(normalise$1(child), false, offset, dom, isSVG, false, vNode._childrenType, path + ',' + i);

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
						var templateReducers$1 = createTemplateReducers(normalise$1(children$1), false, offset, dom, isSVG, true, vNode._childrenType, path + ',0');

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
				mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(dom, deepClone), mounters);
				patch = combinePatch(nodeIndex, patchers);
				unmount = combineUnmount(nodeIndex, unmounters);
				hydrate = combineHydrate(nodeIndex, path, hydraters);
			} else if (isVComponent(vNode)) {
				throw new Error('Inferno Error: templates cannot contain VComponent nodes. Pass a VComponent node into a template as a variable instead.');
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
				vTemplate.write(nodeIndex, dom);
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
				vTemplate.write(nodeIndex, dom);
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
				vTemplate.write(nodeIndex, dom);
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
				vTemplate.write(nodeIndex, dom);
			}
			if (hydrate1) {
				if (!dom) {
					dom = getDomFromTemplatePath(rootDom, path);
				}
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

	function combineHydrateX() {
		return function combineHydrateX() {
			debugger;
		};
	}

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

	function unmountTemplateValue(value, lifecycle) {
		if (isArray(value)) {
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
			unmountTemplateValue(vTemplate.read(pointer), lifecycle);
		};
	}

	function unmountVariableAsChildren(pointer, childrenType) {
		return function unmountVariableAsChildren(vTemplate, lifecycle) {
			unmountTemplateValue(vTemplate.read(pointer), lifecycle);
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

	function resetStatefulDomProperties(dom) {
		var tagName = dom.tagName;

		if (tagName === 'INPUT') {
			if (dom.checked) {
				dom.checked = false;
			}
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

	function mountVariableAsExpression(pointer, templateIsSVG) {
		return function mountVariableAsExpression(vTemplate, dom, lifecycle, context, isSVG) {
			var input = vTemplate.read(pointer);

			if (isNullOrUndef(input) || !isVNode(input)) {
				input = normalise$1(input);
				vTemplate.write(pointer, input);
			}
			return mount(input, dom, lifecycle, context, isSVG || templateIsSVG);
		};
	}

	function mountVariableAsChildren(pointer, templateIsSVG, childrenType) {
		return function mountVariableAsChildren(vTemplate, dom, lifecycle, context, isSVG) {
			return mountChildren(childrenType, vTemplate.read(pointer), dom, lifecycle, context, isSVG || templateIsSVG);
		};
	}


	function mountVariableAsText(pointer) {
		return function mountVariableAsText(vTemplate, textNode) {
			textNode.nodeValue = vTemplate.read(pointer);
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
				value = vTemplate.read(ref._pointer);
			}
			if (isFunction(value)) {
				lifecycle.addListener(function () { return value(dom); });
			} else {
				throw new Error(refsError);
			}
		};
	}

	function mountSpreadPropsFromTemplate(pointer) {
		return function mountSpreadPropsFromTemplate(vTemplate, dom) {
			var props = vTemplate.read(pointer);

			for (var prop in props) {
				var value = props[prop];

				if (prop === 'key') {
					debugger;
				} else if (prop === 'ref') {
					debugger;
				} else {
					patchProp(prop, null, value, dom);
				}
			}
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
			var className = vTemplate.read(pointer);

			if (!isNullOrUndef(className)) {
				dom.className = className;
			}
		};
	}

	function mountTemplateStyle(pointer) {
		return function mountTemplateStyle(vTemplate, dom) {
			patchStyle(null, vTemplate.read(pointer), dom);
		};
	}

	function mountTemplateProps(propsToMount) {
		return function mountTemplateProps(vTemplate, dom) {
			for (var i = 0; i < propsToMount.length; i += 2) {
				var prop = propsToMount[i];
				var value = propsToMount[i + 1];

				if (isVariable(value)) {
					value = vTemplate.read(value._pointer);
				}
				patchProp(prop, null, value, dom);
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

	var index = {
		render: render,
		findDOMNode: findDOMNode,
		mount: mount,
		patch: patch,
		unmount: unmount,
		createTemplateReducers: createTemplateReducers
	};

	return index;

}));