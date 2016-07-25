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

	var recyclingEnabled = true;

	function pool(node) {
		// const bp = node.bp;

		// if (!isNullOrUndef(bp)) {
		// 	const key = node._key;
		// 	const pools = bp.pools;

		// 	if (key === null) {
		// 		const pool = pools.nonKeyed;
		// 		pool && pool.push(node);
		// 	} else {
		// 		const pool = pools._keyed;
		// 		(pool[key] || (pool[key] = [])).push(node);
		// 	}
		// 	return true;
		// }
		return false;
	}

	var NodeTypes = {
		ELEMENT: 0,
		COMPONENT: 1,
		TEMPLATE: 2,
		TEXT: 3,
		PLACEHOLDER: 4,
		FRAGMENT: 5
	};

	function VText(text) {
		this._type = NodeTypes.TEXT;
		this._text = text;
		this._dom = null;
	}

	function VPlaceholder() {
		this._type = NodeTypes.PLACEHOLDER;
		this._dom = null;
	}

	function VFragment(items) {
		this._type = NodeTypes.FRAGMENT;
		this._dom = null;
		this._pointer = null;
		this._items = items;
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

	function isVComponent(o) {
		return o._type === NodeTypes.COMPONENT;
	}

	function unmount(input, parentDom) {
		if (isVFragment(input)) {
			unmountVFragment(input, parentDom, true);
		} else if (isVElement(input)) {
			unmountVElement(input, parentDom);
		} else if (isVComponent(input)) {
			unmountVComponent(input, parentDom);
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

	var elementsPropMap = new Map();

	// pre-populate with common tags
	getAllPropsForElement('div');
	getAllPropsForElement('span');
	getAllPropsForElement('table');
	getAllPropsForElement('tr');
	getAllPropsForElement('td');
	getAllPropsForElement('a');
	getAllPropsForElement('p');

	function getAllPropsForElement(tag) {
		var elem = document.createElement(tag);
		var props = {};

		for (var prop in elem) {
			props[prop] = true;
		}
		elementsPropMap.set(tag, props);
		return props;
	}

	function setTextContent(dom, lastChildren, nextChildren) {
		if (isStringOrNumber(lastChildren)) {
			dom.firstChild.nodeValue = nextChildren;
		} else {
			dom.textContent = nextChildren;
		}
	}

	function isPropertyOfElement(tag, prop) {
		var propsForElement = elementsPropMap.get(tag);

		if (isUndefined(propsForElement)) {
			propsForElement = getAllPropsForElement(tag);
		}
		return propsForElement[prop];
	}

	function insertOrAppend(parentDom, newNode, nextNode) {
		if (isNullOrUndef(nextNode)) {
			parentDom.appendChild(newNode);
		} else {
			parentDom.insertBefore(newNode, nextNode);
		}
	}

	function replaceVListWithNode(parentDom, vList, dom) {
		var pointer = vList._pointer;

		unmountVFragment(vList, parentDom, false);
		replaceNode(parentDom, dom, pointer);
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

	function appendText(text, parentDom, singleChild) {
		if (parentDom === null) {
			return document.createTextNode(text);
		} else {
			if (singleChild) {
				if (text !== '') {
					parentDom.textContent = text;
					return parentDom.firstChild;
				} else {
					var textNode = document.createTextNode('');

					parentDom.appendChild(textNode);
					return textNode;
				}
			} else {
				var textNode$1 = document.createTextNode(text);

				parentDom.appendChild(textNode$1);
				return textNode$1;
			}
		}
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
		replaceNode(parentDom, dom, lastNode._dom);
		if (lastInstance !== null) {
			lastInstance._lasInput = nextNode;
		}
	}

	function replaceNode(parentDom, nextDom, lastDom) {
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

	function remove(node, parentDom) {
		var dom = node._dom;
		if (dom === parentDom) {
			dom.innerHTML = '';
		} else {
			removeChild(parentDom, dom);
			if (recyclingEnabled) {
				pool(node);
			}
		}
		unmount(node, false);
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
		if (isVPlaceholder(input)) {
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
			throw Error('Bad Input!');
		}
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
			mountChildren(vElement, children, dom, lifecycle, context, isSVG);
		}
		if (!isNullOrUndef(props)) {
			handleSelects(vElement);
			mountProps(vElement, props, dom);
		}
		if (!isNull(parentDom)) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function mountVFragment(vList, parentDom, lifecycle, context, isSVG) {
		var items = vList._items;
		var pointer = document.createTextNode('');
		var dom = document.createDocumentFragment();

		mountArrayChildren(items, dom, lifecycle, context, isSVG);
		vList._pointer = pointer;
		vList._dom = dom;
		dom.appendChild(pointer);
		if (parentDom) {
			insertOrAppend(parentDom, dom);
		}
		return dom;
	}

	function mountVText(vText, parentDom) {
		var dom = document.createTextNode(vText._text);

		vText._dom = dom;
		if (parentDom) {
			insertOrAppend(parentDom, dom);
		}
		return dom;
	}

	function mountVPlaceholder(vPlaceholder, parentDom) {
		var dom = document.createTextNode('');

		vPlaceholder._dom = dom;
		if (parentDom) {
			insertOrAppend(parentDom, dom);
		}
		return dom;
	}

	function handleSelects(node) {
		if (node.tag === 'select') {
			selectValue(node);
		}
	}

	function mountArrayChildren(children, parentDom, lifecycle, context, isSVG) {
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

	function mountChildren(node, children, parentDom, lifecycle, context, isSVG) {
		if (isArray(children)) {
			mountArrayChildren(children, parentDom, lifecycle, context, isSVG);
		} else if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (!isInvalid(children)) {
			mount(children, parentDom, lifecycle, context, isSVG);
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
				parentDom.appendChild(dom);
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
				parentDom.appendChild(dom);
			}
			vComponent._dom = dom;
		}
		return dom;
	}

	function mountProps(vElement, props, dom) {
		for (var prop in props) {
			var value = props[prop];

			if (!isNullOrUndef(value)) {
				if (prop === 'style') {
					patchStyle(null, value, dom);
				} else if (isPropertyOfElement(vElement._tag, prop)) {
					dom[prop] = value;
				} else {
					var namespace = namespaces[prop];

					if (namespace) {
						dom.setAttributeNS(namespace, prop, value);
					} else {
						dom.setAttribute(prop, value);
					}
				}
			}
		}
	}

	function patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
		if (lastInput !== nextInput) {
			if (isInvalid(lastInput)) {
				mount(nextInput, parentDom, lifecycle, context, isSVG);
			} else if (isInvalid(nextInput)) {
				remove(lastInput, parentDom);
			} else if (isStringOrNumber(lastInput)) {
				if (isStringOrNumber(nextInput)) {
					parentDom.firstChild.nodeValue = nextInput;
				} else {
					var dom = mount(nextInput, null, lifecycle, context, isSVG);

					nextInput._dom = dom;
					replaceNode(parentDom, dom, parentDom.firstChild);
				}
			} else if (isStringOrNumber(nextInput)) {
				replaceNode(parentDom, document.createTextNode(nextInput), lastInput._dom);
			} else {
				if (isVComponent(nextInput)) {
					if (isVComponent(lastInput)) {
						patchVComponent(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
					} else {
						replaceNode(parentDom, mountVComponent(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
						unmount(lastInput, null);
					}
				} else if (isVComponent(lastInput)) {
					// debugger;
				} else if (isVFragment(nextInput)) {
					if (isVFragment(lastInput)) {
						patchVList(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
					} else {
						replaceNode(parentDom, mountVFragment(nextInput, null), lastInput._dom);
						unmount(lastInput, null);
					}
				} else if (isVElement(nextInput)) {
					if (isVElement(lastInput)) {
						patchVElement(lastInput, nextInput, parentDom, lifecycle, context, isSVG);
					} else {
						replaceNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
						unmount(lastInput, null);
					}
				} else if (isVElement(lastInput)) {
					replaceNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
					unmount(lastInput, null);
				} else if (isVFragment(lastInput)) {
					replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, isSVG));
				} else if (isVPlaceholder(nextInput)) {
					if (isVPlaceholder(lastInput)) {
						patchVFragment(lastInput, nextInput);
					} else {
						replaceNode(parentDom, mountVPlaceholder(nextInput, null), lastInput._dom);
						unmount(lastInput, null);
					}
				} else if (isVPlaceholder(lastInput)) {
					replaceNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				} else if (isVText(nextInput)) {
					if (isVText(lastInput)) {
						patchVText(lastInput, nextInput);
					} else {
						replaceNode(parentDom, mountVText(nextInput, null), lastInput._dom);
						unmount(lastInput, null);
					}
				} else if (isVText(lastInput)) {
					replaceNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput._dom);
				} else {
					throw Error('Bad Input!');
				}
			}
		}
	}

	function patchChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG) {
		if (isInvalid(nextChildren)) {
			removeAllChildren(dom, lastChildren);
		} else if (isInvalid(lastChildren)) {
			if (isStringOrNumber(nextChildren)) {
				setTextContent(dom, lastChildren, nextChildren);
			} else if (!isInvalid(nextChildren)) {
				if (isArray(nextChildren)) {
					mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
				} else {
					mount(nextChildren, dom, lifecycle, context, isSVG);
				}
			}
		} else if (isArray(nextChildren)) {
			if (isArray(lastChildren)) {
				nextChildren.complex = lastChildren.complex;

				if (isKeyed(lastChildren, nextChildren)) {
					patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, null);
				} else {
					patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, null);
				}
			} else {
				patchNonKeyedChildren([lastChildren], nextChildren, dom, lifecycle, context, isSVG, null);
			}
		} else if (isArray(lastChildren)) {
			patchNonKeyedChildren(lastChildren, [nextChildren], dom, lifecycle, context, isSVG, null);
		} else {
			patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
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
				patchChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG);
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
					if (prop === 'style') {
						patchStyle(lastValue, nextValue, dom);
					} else if (isPropertyOfElement(tag, prop)) {
						dom[prop] = nextValue;
					} else {
						var namespace = namespaces[prop];

						if (namespace) {
							dom.setAttributeNS(namespace, prop, nextValue);
						} else {
							dom.setAttribute(prop, nextValue);
						}
					}
				}
			}
		}
		for (var prop$1 in lastProps) {
			if (isUndefined(nextProps[prop$1])) {
				removeProp(tag, prop$1, dom);
			}
		}
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

	// export function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	// 	if (attrName === 'dangerouslySetInnerHTML') {
	// 		const lastHtml = lastAttrValue && lastAttrValue.__html;
	// 		const nextHtml = nextAttrValue && nextAttrValue.__html;

	// 		if (isNullOrUndef(nextHtml)) {
	// 			throw new Error('Inferno Error: dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content');
	// 		}
	// 		if (lastHtml !== nextHtml) {
	// 			dom.innerHTML = nextHtml;
	// 		}
	// 	} else if (strictProps[attrName]) {
	// 		dom[attrName] = nextAttrValue === null ? '' : nextAttrValue;
	// 	} else {
	// 		if (booleanProps[attrName]) {
	// 			dom[attrName] = nextAttrValue ? true : false;
	// 		} else {
	// 			const ns = namespaces[attrName];

	// 			if (nextAttrValue === false || isNullOrUndef(nextAttrValue)) {
	// 				if (ns !== undefined) {
	// 					dom.removeAttributeNS(ns, attrName);
	// 				} else {
	// 					dom.removeAttribute(attrName);
	// 				}
	// 			} else {
	// 				if (ns !== undefined) {
	// 					dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
	// 				} else {
	// 					dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
	// 				}
	// 			}
	// 		}
	// 	}
	// }

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

	function patchVList(lastVList, nextVList, parentDom, lifecycle, context, isSVG) {
		var lastItems = lastVList._items;
		var nextItems = nextVList._items;
		var pointer = lastVList._pointer;

		nextVList._dom = lastVList._dom;
		nextVList._pointer = pointer;
		if (!lastItems !== nextItems) {
			if (isKeyed(lastItems, nextItems)) {
				patchKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, isSVG, nextVList);
			} else {
				patchNonKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, isSVG, nextVList);
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
				remove(lastChildren[i], dom);
			}
		}
	}

	function patchVFragment(lastVFragment, nextVFragment) {
		nextVFragment._dom = lastVFragment._dom;
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
				remove(lastChildren[lastStartIndex++], dom);
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
						remove(lastEndNode, dom);
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
						remove(lastEndNode, dom);
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

	var screenWidth = isBrowser && window.screen.width;
	var screenHeight = isBrowser && window.screen.height;
	var scrollX = 0;
	var scrollY = 0;
	var lastScrollTime = 0;

	if (isBrowser) {
		window.onscroll = function () {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
			lastScrollTime = performance.now();
		};

		window.resize = function () {
			scrollX = window.scrollX;
			scrollY = window.scrollY;
			screenWidth = window.screen.width;
			screenHeight = window.screen.height;
			lastScrollTime = performance.now();
		};
	}

	function Lifecycle() {
		this._listeners = [];
		this.scrollX = null;
		this.scrollY = null;
		this.screenHeight = screenHeight;
		this.screenWidth = screenWidth;
	}

	Lifecycle.prototype = {
		refresh: function refresh() {
			this.scrollX = isBrowser && window.scrollX;
			this.scrollY = isBrowser && window.scrollY;
		},
		addListener: function addListener(callback) {
			this._listeners.push(callback);
		},
		trigger: function trigger() {
			var this$1 = this;

			for (var i = 0; i < this._listeners.length; i++) {
				this$1._listeners[i]();
			}
		}
	};

	var documetBody = isBrowser ? document.body : null;

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
					mount(input, parentDom, lifecycle, {}, null, false);
				}
				lifecycle.trigger();
				roots.set(parentDom, { input: input });
			}
		} else {
			var activeNode = getActiveNode();
			patch(root.input, input, parentDom, lifecycle, {}, null, false);

			lifecycle.trigger();
			if (isNull(input)) {
				roots.delete(parentDom);
			}
			root.input = input;
			resetActiveNode(activeNode);
		}
	}

	var index = {
		render: render,
		findDOMNode: findDOMNode,
		mount: mount,
		patch: patch,
		unmount: unmount
	};

	return index;

}));