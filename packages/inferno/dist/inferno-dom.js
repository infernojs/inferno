/*!
 * inferno-dom v0.7.18
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

	var TemplaceReducers = function TemplaceReducers($keyIndex, $mount, $patch, $unmount) {
		this._keyIndex = $keyIndex;
		this._schema = null;
		this._pools = {
			nonKeyed: [],
			keyed: new Map()
		};
		this.mount = $mount;
		this.patch = $patch;
		this.unmount = $unmount;
	};

	function createTemplaceReducers(keyIndex, mount, patch, unmount) {
		return new TemplaceReducers(keyIndex, mount, patch, unmount);
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

	function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
		if (lastInput !== nextInput) {
			if (isVTemplate(nextInput)) {
				if (isVTemplate(lastInput)) {
					patchVTemplate(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
				} else {
					// debugger;
				}
			} else if (isVTemplate(lastInput)) {
				// debugger;
			} else if (isVComponent(nextInput)) {
				if (isVComponent(lastInput)) {
					patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
				} else {
					replaceChild(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVComponent(lastInput)) {
				// debugger;
			} else if (isVFragment(nextInput)) {
				if (isVFragment(lastInput)) {
					patchVFragment(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
				} else {
					replaceChild(parentDom, mountVFragment(nextInput, null), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVElement(nextInput)) {
				if (isVElement(lastInput)) {
					patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
				} else {
					replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVElement(lastInput)) {
				replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				unmount(lastInput, null);
			} else if (isVFragment(lastInput)) {
				replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG));
			} else if (isVPlaceholder(nextInput)) {
				if (isVPlaceholder(lastInput)) {
					patchVPlaceholder(lastInput, nextInput);
				} else {
					replaceChild(parentDom, mountVPlaceholder(nextInput, null), lastInput._dom);
					unmount(lastInput, null);
				}
			} else if (isVPlaceholder(lastInput)) {
				replaceChild(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
			} else if (isVText(nextInput)) {
				if (isVText(lastInput)) {
					patchVText(lastInput, nextInput);
				} else {
					replaceChild(parentDom, mountVText(nextInput, null), lastInput._dom);
					unmount(lastInput, null);
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
			removeAllChildren(parentDom, lastChildren);
		} else if (isInvalid(lastChildren)) {
			if (isStringOrNumber(nextChildren)) {
				setTextContent(parentDom, nextChildren);
			} else if (!isInvalid(nextChildren)) {
				if (isArray(nextChildren)) {
					mountChildren(nextChildren, parentDom, lifecycle, context, isSVG);
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
			// debugger;
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
			nextTemplateReducers.patch(lastVTemplate, nextVTemplate, lifecycle, context, isSVG);
		}
	}

	function patchVElement(lastVElement, nextVElement, parentDom, lifecycle, context, isSVG) {
		var nextHooks = nextVElement._hooks;
		var nextHooksDefined = !isNullOrUndef(nextHooks);

		if (nextHooksDefined && !isNullOrUndef(nextHooks.onWillUpdate)) {
			nextHooks.onWillUpdate(lastVElement._dom);
		}
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
			if (nextHooksDefined && !isNullOrUndef(nextHooks.onDidUpdate)) {
				nextHooks.onDidUpdate(dom);
			}
			setFormElementProperties(nextTag, nextVElement);
		}
	}

	function patchProps(lastVElement, nextVElement, lastProps, nextProps, dom) {
		var tag = nextVElement._tag;

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
					removeProp(tag, prop, dom);
				} else {
					patchProp(prop, lastValue, nextValue, dom);
				}
			}
		}
		for (var prop$1 in lastProps) {
			if (isUndefined(nextProps[prop$1])) {
				removeProp(tag, prop$1, dom);
			}
		}
	}

	// returns true if a property of the element has been mutated, otherwise false for an attribute
	function patchProp(prop, lastValue, nextValue, dom) {
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
			dom[prop] = nextValue;
		} else {
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

	function removeProp(tag, prop, dom) {
		if (prop === 'className') {
			dom.removeAttribute('class');
		} else if (prop === 'id') {
			dom.removeAttribute('id');
		} else {
			if (isPropertyOfElement(tag, prop)) {
				dom[prop] = null;
			} else {
				dom.removeAttribute(prop);
			}
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
				var dom = lastVComponent._dom;
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
				} else if (isNullOrUndef(nextInput)) {
					nextInput = createVPlaceholder();
				}
				patch(instance._lastInput, nextInput, parentDom, lifecycle, context, null, false);
				instance._lastInput = nextInput;
				instance.componentDidUpdate(lastProps, lastState);
				nextVComponent._dom = nextInput._dom;
				componentToDOMNodeMap.set(instance, nextInput._dom);
			} else {
				var shouldUpdate = true;
				var lastProps$1 = lastVComponent._props;
				var nextHooks = nextVComponent._hooks;
				var nextHooksDefined = !isNullOrUndef(nextHooks);

				if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
					shouldUpdate = nextHooks.onComponentShouldUpdate(lastVComponent._dom, lastProps$1, nextProps);
				}
				if (shouldUpdate !== false) {
					if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
						nextHooks.onComponentWillUpdate(lastVComponent._dom, lastProps$1, nextProps);
					}
					var nextInput$1 = nextComponent(nextProps, context);
					var lastInput = lastVComponent._instance;

					if (isInvalid(nextInput$1)) {
						nextInput$1 = createVPlaceholder();
					}
					nextVComponent._dom = lastVComponent._dom;
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

				insertOrAppend(dom, mount(child, null, lifecycle, context, isSVG), parentVList && parentVList.pointer);
			}
		} else if (lastChildrenLength > nextChildrenLength) {
			for (i = commonLength; i < lastChildrenLength; i++) {
				unmount(lastChildren[i], dom);
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

	function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, parentVList) {
		var lastChildrenLength = lastChildren.length;
		var nextChildrenLength = nextChildren.length;
		var lastEndIndex = lastChildrenLength - 1;
		var nextEndIndex = nextChildrenLength - 1;
		var lastStartIndex = 0;
		var nextStartIndex = 0;
		var lastStartNode = null;
		var nextStartNode = null;
		var nextEndNode = null;
		var lastEndNode = null;
		var nextNode;

		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextStartNode = nextChildren[nextStartIndex];
			lastStartNode = lastChildren[lastStartIndex];

			if (nextStartNode._key !== lastStartNode._key) {
				break;
			}
			patch(lastStartNode, nextStartNode, dom, lifecycle, context, isSVG, false);
			nextStartIndex++;
			lastStartIndex++;
		}
		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextEndNode = nextChildren[nextEndIndex];
			lastEndNode = lastChildren[lastEndIndex];

			if (nextEndNode._key !== lastEndNode._key) {
				break;
			}
			patch(lastEndNode, nextEndNode, dom, lifecycle, context, isSVG, false);
			nextEndIndex--;
			lastEndIndex--;
		}
		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextEndNode = nextChildren[nextEndIndex];
			lastStartNode = lastChildren[lastStartIndex];

			if (nextEndNode._key !== lastStartNode._key) {
				break;
			}
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1]._dom : null;
			patch(lastStartNode, nextEndNode, dom, lifecycle, context, isSVG, false);
			insertOrAppend(dom, nextEndNode._dom, nextNode);
			nextEndIndex--;
			lastStartIndex++;
		}
		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextStartNode = nextChildren[nextStartIndex];
			lastEndNode = lastChildren[lastEndIndex];

			if (nextStartNode._key !== lastEndNode._key) {
				break;
			}
			nextNode = lastChildren[lastStartIndex]._dom;
			patch(lastEndNode, nextStartNode, dom, lifecycle, context, isSVG, false);
			insertOrAppend(dom, nextStartNode._dom, nextNode);
			nextStartIndex++;
			lastEndIndex--;
		}

		if (lastStartIndex > lastEndIndex) {
			if (nextStartIndex <= nextEndIndex) {
				nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1]._dom : parentVList && parentVList.pointer;
				for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
					insertOrAppend(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, isSVG), nextNode);
				}
			}
		} else if (nextStartIndex > nextEndIndex) {
			while (lastStartIndex <= lastEndIndex) {
				unmount(lastChildren[lastStartIndex++], dom);
			}
		} else {
			var aLength = lastEndIndex - lastStartIndex + 1;
			var bLength = nextEndIndex - nextStartIndex + 1;
			var sources = new Array(bLength);

			// Mark all nodes as inserted.
			var i;
			for (i = 0; i < bLength; i++) {
				sources[i] = -1;
			}
			var moved = false;
			var removeOffset = 0;
			var lastTarget = 0;
			var index;

			if (aLength * bLength <= 16) {
				for (i = lastStartIndex; i <= lastEndIndex; i++) {
					var removed = true;
					lastEndNode = lastChildren[i];
					for (index = nextStartIndex; index <= nextEndIndex; index++) {
						nextEndNode = nextChildren[index];
						if (lastEndNode._key === nextEndNode._key) {
							sources[index - nextStartIndex] = i;

							if (lastTarget > index) {
								moved = true;
							} else {
								lastTarget = index;
							}
							patch(lastEndNode, nextEndNode, dom, lifecycle, context, isSVG, false);
							removed = false;
							break;
						}
					}
					if (removed) {
						unmount(lastEndNode, dom);
						removeOffset++;
					}
				}
			} else {
				var prevItemsMap = new Map();

				for (i = nextStartIndex; i <= nextEndIndex; i++) {
					prevItemsMap.set(nextChildren[i]._key, i);
				}
				for (i = lastEndIndex; i >= lastStartIndex; i--) {
					lastEndNode = lastChildren[i];
					index = prevItemsMap.get(lastEndNode._key);

					if (index === undefined) {
						unmount(lastEndNode, dom);
						removeOffset++;
					} else {

						nextEndNode = nextChildren[index];

						sources[index - nextStartIndex] = i;
						if (lastTarget > index) {
							moved = true;
						} else {
							lastTarget = index;
						}
						patch(lastEndNode, nextEndNode, dom, lifecycle, context, isSVG, false);
					}
				}
			}

			var pos;
			if (moved) {
				var seq = lis_algorithm(sources);
				index = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, isSVG), nextNode);
					} else {
						if (index < 0 || i !== seq[index]) {
							pos = i + nextStartIndex;
							nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList.pointer;
							insertOrAppend(dom, nextChildren[pos]._dom, nextNode);
						} else {
							index--;
						}
					}
				}
			} else if (aLength - removeOffset !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1]._dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, isSVG), nextNode);
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
				if (!isVNode(nextInput)) {
					nextInput = normalise(nextInput);
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

	var recyclingEnabled$1 = true;

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

	function createTemplateReducers(vNode, isRoot, offset, parentDom, isSVG, isChildren, childrenType) {
		if (!isInvalid(vNode)) {
			var keyIndex = NULL_INDEX;
			var nodeIndex = isRoot ? ROOT_INDEX : NULL_INDEX;
			var mount;
			var patch;
			var unmount;
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
				} else {
					mount = mountVariableAsExpression(vNode._pointer, isSVG);
					patch = patchVariableAsExpression(vNode._pointer, isSVG);
					unmount = unmountVariableAsExpression(vNode._pointer);
				}
			} else if (isVFragment(vNode)) {
				var children = vNode._children;

				if (isVariable(children)) {
					mount = mountVariableAsChildren(children._pointer, isSVG, childrenType);
					patch = patchVariableAsChildren(children._pointer, isSVG, childrenType);
					unmount = unmountVariableAsChildren(children._pointer, childrenType);
				} else {
					// TODO
				}
			} else if (isVText(vNode)) {
				var text = vNode._text;
				nodeIndex = offset.length++;

				if (isVariable(text)) {
					mount = combineMountTo2(nodeIndex, mountEmptyTextNode, mountVariableAsText(text._pointer));
					patch = combinePatchTo2(nodeIndex, patchVariableAsText(text._pointer));
					unmount = unmountVariableAsText(text._pointer);
				} else {
					// TODO
				}
			} else if (isVElement(vNode)) {
				var mounters = [];
				var patchers = [];
				var unmounters = [];
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
				var hooks = vNode._hooks;

				if (patchers.length > 0 && nodeIndex === NULL_INDEX) {
					nodeIndex = offset.length++;
				}
				var children$1 = vNode._children;

				if (!isInvalid(children$1)) {
					if (isStringOrNumber(children$1)) {
						// debugger;
					} else if (isArray(children$1)) {
						for (var i = 0; i < children$1.length; i++) {
							var templateReducers = createTemplateReducers(children$1[i], false, offset, dom, isSVG, false, vNode._childrenType);

							if (!isInvalid(templateReducers)) {
								mounters.push(templateReducers.mount);
								var patch$1 = templateReducers.patch;
								var unmount$1 = templateReducers.unmount;

								if (!isNull(patch$1)) {
									patchers.push(patch$1);
								}
								if (!isNull(unmount$1)) {
									unmounters.push(unmount$1);
								}
							}
						}
					} else {
						if (nodeIndex === NULL_INDEX && isVariable(children$1)) {
							nodeIndex = offset.length++;
						}
						var templateReducers$1 = createTemplateReducers(children$1, false, offset, dom, isSVG, true, vNode._childrenType);

						if (!isInvalid(templateReducers$1)) {
							mounters.push(templateReducers$1.mount);
							var patch$2 = templateReducers$1.patch;
							var unmount$2 = templateReducers$1.unmount;

							if (!isNull(patch$2)) {
								patchers.push(patch$2);
							}
							if (!isNull(unmount$2)) {
								unmounters.push(unmount$2);
							}
						}
					}
				}
				mount = combineMount(nodeIndex, mountDOMNodeFromTemplate(dom, isRoot, deepClone), mounters);
				patch = combinePatch(nodeIndex, patchers);
				unmount = combineUnmount(nodeIndex, unmounters);
			} else if (isVComponent(vNode)) {
				throw new Error('Inferno Error: templates cannot contain VComponent nodes. Pass a VComponent node into a template as a variable instead.');
			}
			return createTemplaceReducers(keyIndex, mount, patch, unmount);
		}
	}

	function combineMount(nodeIndex, mountDOMNodeFromTemplate, mounters) {
		if (nodeIndex === NULL_INDEX && mounters.length === 0) {
			return mountDOMNodeFromTemplate;
		} else if (mounters.length <= 1) {
			return combineMountTo2(nodeIndex, mountDOMNodeFromTemplate, mounters[0]);
		} else if (mounters.length <= 5) {
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

		return function combineMountToX(vTemplate, parentDom, lifecycle, instance, isSVG) {
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
		} else if (patchers.length <= 5) {
			return combinePatchTo5(nodeIndex, patchers[0], patchers[1], patchers[2], patchers[3], patchers[4]);
		} else {
			return combinePatchX(nodeIndex, patchers);
		}
	}

	function combinePatchTo2(nodeIndex, patch1) {
		var copy = (nodeIndex !== NULL_INDEX);

		return function combinePatchTo2(lastVTemplate, nextVTemplate, lifecycle, context, isSVG) {
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

		return function combinePatchTo5(lastVTemplate, nextVTemplate, lifecycle, context, isSVG) {
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

		return function combinePatchX(lastVTemplate, nextVTemplate, lifecycle, context, isSVG) {
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
			if (unmounters.length <= 5) {
				return combineUnmountTo5(nodeIndex, unmounters[0], unmounters[1], unmounters[2], unmounters[3], unmounters[4]);
			}
		}
		return null;
	}

	function combineUnmountTo5(nodeIndex, unomunt1, unomunt2, unomunt3, unomunt4, unomunt5) {
		var copy = (nodeIndex !== NULL_INDEX);

		return function combineUnmountTo5(vTemplate) {
			if (unomunt1) {
				unomunt1(vTemplate);
				if (unomunt2) {
					unomunt2(vTemplate);
					if (unomunt3) {
						unomunt3(vTemplate);
						if (unomunt4) {
							unomunt4(vTemplate);
							if (unomunt5) {
								unomunt5(vTemplate);
							}
						}
					}
				}
			}
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

	function unmount(input, parentDom, lifecycle) {
		if (isVTemplate(input)) {
			unmountVTemplate(input, parentDom);
		} else if (isVFragment(input)) {
			unmountVFragment(input, parentDom, true);
		} else if (isVElement(input)) {
			unmountVElement(input, parentDom);
		} else if (isVComponent(input)) {
			unmountVComponent(input, parentDom);
		}
	}

	function unmountVTemplate(vTemplate, parentDom) {
		var dom = vTemplate._dom;
		var templateReducers = vTemplate._tr;
		var unmount = templateReducers.unmount;

		if (!isNull(unmount)) {
			templateReducers.unmount(vTemplate);
		}
		if (!isNull(parentDom)) {
			removeChild(parentDom, dom);
		}
		if (recyclingEnabled$1) {
			poolVTemplate(vTemplate);
		}
	}

	function unmountVFragment(vFragment, parentDom, removePointer) {
		var items = vFragment._items;
		var itemsLength = items.length;
		var pointer = items._pointer;

		if (itemsLength > 0) {
			for (var i = 0; i < itemsLength; i++) {
				var item = items[i];

				if (isVFragment(item)) {
					unmountVFragment(item, parentDom, true);
				} else {
					if (parentDom) {
						removeChild(parentDom, item._dom);
					}
					unmount(item, null);
				}
			}
		}
		if (parentDom && removePointer) {
			removeChild(parentDom, pointer);
		}
	}

	function unmountVComponent(vComponent, parentDom) {
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
				unmount(instance._lastInput, null);
			}
		}
		var hooks = vComponent._hooks || instanceHooks;

		if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
				hooks.onComponentWillUnmount(vComponent._dom, hooks);
			}
		}
	}

	function unmountVElement(vElement, parentDom) {
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
					unmount(children[i], null);
				}
			} else {
				unmount(children, null);
			}
		}
		if (parentDom) {
			removeChild(parentDom, dom);
		}
	}

	function unmountVariableAsExpression(pointer) {
		return function unmountVariableAsExpression(vTemplate) {
			// TODO
		};
	}

	function unmountVariableAsChildren(pointer, childrenType) {
		return function unmountVariableAsChildren(vTemplate) {
			// TODO
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

	function isPropertyOfElement(tag, prop) {
		var propsForElement = elementsPropMap.get(tag);

		if (isUndefined(propsForElement)) {
			propsForElement = getAllPropsForElement(tag);
		}
		return propsForElement[prop];
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

	function replaceVListWithNode(parentDom, vList, dom) {
		var pointer = vList._pointer;

		unmountVFragment(vList, parentDom, false);
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
		unmount(lastNode, false);
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

	function normalise(object) {
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

		return children[i] = normalise(child);
	}

	function removeChild(parentDom, dom) {
		parentDom.removeChild(dom);
	}

	// TODO: for node we need to check if document is valid
	function getActiveNode() {
		return document.activeElement;
	}

	function removeAllChildren(dom, children) {
		if (recyclingEnabled) {
			var childrenLength = children.length;

			if (childrenLength > 5) {
				for (var i = 0; i < childrenLength; i++) {
					var child = children[i];

					if (!isInvalid(child)) {
						pool(child);
					}
				}
			}
		}
		dom.textContent = '';
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

	function handleAttachedHooks(hooks, lifecycle, dom) {
		if (!isNullOrUndef(hooks.onCreated)) {
			hooks.onCreated(dom);
		}
		if (!isNullOrUndef(hooks.onAttached)) {
			lifecycle.addListener(function () {
				hooks.onAttached(dom);
			});
		}
	}

	function setValueProperty(nextNode) {
		var value = nextNode.attrs.value;
		if (!isNullOrUndef(value)) {
			nextNode._dom.value = value;
		}
	}

	function setFormElementProperties(nextTag, nextNode) {
		if (nextTag === 'input') {
			var inputType = nextNode.attrs.type;
			if (inputType === 'text') {
				setValueProperty(nextNode);
			} else if (inputType === 'checkbox' || inputType === 'radio') {
				var checked = nextNode.attrs.checked;
				nextNode._dom.checked = !!checked;
			}
		} else if (nextTag === 'textarea') {
			setValueProperty(nextNode);
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
			throw Error('Inferno Error: Bad input argument called on mount(). Input argument may need normalising.');
		}
	}

	function mountVTemplate(vTemplate, parentDom, lifecycle, context, isSVG) {
		var templateReducers = vTemplate._tr;
		var dom = null;

		if (recyclingEnabled$1) {
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
		var hooks = vElement._hooks;

		vElement._dom = dom;
		if (!isNullOrUndef(hooks)) {
			handleAttachedHooks(hooks, lifecycle, dom);
		}
		if (!isNullOrUndef(children)) {
			mountChildren$1(vElement._childrenType, children, dom, lifecycle, context, isSVG);
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

	function mountArrayChildrenWithoutType(children, parentDom, lifecycle, context, isSVG) {
		children.complex = false;
		for (var i = 0; i < children.length; i++) {
			var child = normaliseChild(children, i);

			if (isVText(child)) {
				mountVText(child, parentDom);
				children.complex = true;
			} else if (isVPlaceholder(child)) {
				mountVPlaceholder(child, parentDom);
				children.complex = true;
			} else if (isVFragment(child)) {
				mountVFragment(child, parentDom, lifecycle, context, isSVG);
				children.complex = true;
			} else {
				mount(child, parentDom, lifecycle, context, isSVG);
			}
		}
	}

	function mountChildrenWithUnknownType(children, parentDom, lifecycle, context, isSVG) {
		if (isArray(children)) {
			mountArrayChildrenWithoutType(children, parentDom, lifecycle, context, isSVG);
		} else if (isStringOrNumber(children)) {
			setTextContent(parentDom, children);
		} else if (!isInvalid(children)) {
			mount(children, parentDom, lifecycle, context, isSVG);
		}
	}

	function mountArrayChildrenWithType(children, parentDom, lifecycle, context, isSVG) {
		for (var i = 0; i < children.length; i++) {
			mount(children[i], parentDom, lifecycle, context, isSVG);
		}
	}

	function mountChildren$1(childrenType, children, parentDom, lifecycle, context, isSVG) {
		if (isTextChildrenType(childrenType)) {
			setTextContent(parentDom, children);
		} else if (isNodeChildrenType(childrenType)) {
			mount(children, parentDom, lifecycle, context, isSVG);
		} else if (isKeyedListChildrenType(childrenType) || isNonKeyedListChildrenType(childrenType)) {
			mountArrayChildrenWithType(children, parentDom, lifecycle, context, isSVG);
		} else if (isUnknownChildrenType(childrenType)) {
			mountChildrenWithUnknownType(children, parentDom, lifecycle, context, isSVG);
		} else {
			throw new Error('Inferno Error: Bad childrenType value specified when attempting to mountChildren');
		}
	}

	function mountVComponent(vComponent, parentDom, lifecycle, context, isSVG) {
		var Component = vComponent._component;
		var props = vComponent._props;
		var hooks = vComponent._hooks;
		var dom;

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
				node = createVPlaceholder();
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
		return function mountVariableAsExpression(vTemplate, parentDom, lifecycle, context, isSVG) {
			var input = vTemplate.read(pointer);

			if (!isVNode(input)) {
				input = normalise(input);
				vTemplate.write(pointer, input);
			}
			return mount(input, parentDom, lifecycle, context, isSVG || templateIsSVG);
		};
	}

	function mountVariableAsChildren(pointer, templateIsSVG, childrenType) {
		return function mountVariableAsChildren(vTemplate, parentDom, lifecycle, context, isSVG) {
			return mountChildren$1(childrenType, vTemplate.read(pointer), parentDom, lifecycle, context, isSVG || templateIsSVG);
		};
	}


	function mountVariableAsText(pointer) {
		return function mountVariableAsText(vTemplate, textNode) {
			textNode.nodeValue = vTemplate.read(pointer);
		};
	}

	function mountDOMNodeFromTemplate(templateDomNode, isRoot, deepClone) {
		return function mountDOMNodeFromTemplate(vTemplate, parentDom, lifecycle, context) {
			var domNode = templateDomNode.cloneNode(deepClone);

			if (!isNull(parentDom)) {
				appendChild(parentDom, domNode);
			}
			return domNode;
		};
	}

	function mountEmptyTextNode(vTemplate, parentDom) {
		var textNode = document.createTextNode('');

		if (!isNull(parentDom)) {
			appendChild(parentDom, textNode);
		}
		return textNode;
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

	function hydrate(node, parentDom, lifecycle) {
		// if (parentDom && parentDom.nodeType === 1) {
		// 	const rootNode = parentDom.querySelector('[data-infernoroot]');

		// 	if (rootNode && rootNode.parentNode === parentDom) {
		// 		hydrateNode(node, rootNode, parentDom, lifecycle, {}, true);
		// 		return true;
		// 	}
		// }
		// // clear parentDom, unless it's document.body
		// if (parentDom !== documetBody) {
		// 	parentDom.textContent = '';
		// } else {
		// 	console.warn('Inferno Warning: rendering to the "document.body" is dangerous! Use a dedicated container element instead.');
		// }
		// return false;
	}

	var roots = new Map();
	var componentToDOMNodeMap = new Map();

	function findDOMNode(domNode) {
		return componentToDOMNodeMap.get(domNode) || null;
	}

	function render(input, parentDom) {
		var root = roots.get(parentDom);
		var lifecycle = new Lifecycle();

		if (isUndefined(root)) {
			if (!isInvalid(input)) {
				if (!hydrate(input, parentDom, lifecycle)) {
					mount(input, parentDom, lifecycle, {}, false);
				}
				lifecycle.trigger();
				roots.set(parentDom, { input: input });
			}
		} else {
			var activeNode = getActiveNode();

			if (isNull(input)) {
				unmount(root.input, parentDom);
				roots.delete(parentDom);
			} else {
				patch(root.input, input, parentDom, lifecycle, {}, false);
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