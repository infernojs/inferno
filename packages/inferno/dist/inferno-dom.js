/*!
 * inferno-dom v0.7.21
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoDOM = factory());
}(this, function () { 'use strict';

	function addChildrenToProps(children, props) {
		if (!isNullOrUndefined(children)) {
			var isChildrenArray = isArray(children);
			if (isChildrenArray && children.length > 0 || !isChildrenArray) {
				if (props) {
					props = Object.assign({}, props, { children: children });
				} else {
					props = {
						children: children
					};
				}
			}
		}
		return props;
	}

	var NO_RENDER = 'NO_RENDER';

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(obj) {
		return obj.prototype.render !== undefined;
	}

	function isStringOrNumber(obj) {
		return isString(obj) || isNumber(obj);
	}

	function isNullOrUndefined(obj) {
		return isUndefined(obj) || isNull(obj);
	}

	function isInvalidNode(obj) {
		return isNull(obj) || obj === false || obj === true || isUndefined(obj);
	}

	function isFunction(obj) {
		return typeof obj === 'function';
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

	function deepScanChildrenForNode(children, node) {
		if (!isInvalidNode(children)) {
			if (isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					var child = children[i];

					if (!isInvalidNode(child)) {
						if (child === node) {
							return true;
						} else if (child.children) {
							return deepScanChildrenForNode(child.children, node);
						}
					}
				}
			} else {
				if (children === node) {
					return true;
				} else if (children.children) {
					return deepScanChildrenForNode(children.children, node);
				}
			}
		}
		return false;
	}

	function getRefInstance$1(node, instance) {
		var children = instance.props.children;

		if (deepScanChildrenForNode(children, node)) {
			return getRefInstance$1(node, instance._parentComponent);
		}
		return instance;
	}

	var recyclingEnabled = true;

	function recycle(node, bp, lifecycle, context, instance) {
		if (bp !== undefined) {
			var key = node.key;
			var pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed[key];
			if (!isNullOrUndefined(pool)) {
				var recycledNode = pool.pop();
				if (!isNullOrUndefined(recycledNode)) {
					patch(recycledNode, node, null, lifecycle, context, instance, true, bp.isSVG);
					return node.dom;
				}
			}
		}
		return null;
	}

	function pool(node) {
		var bp = node.bp;

		if (!isNullOrUndefined(bp)) {
			var key = node.key;
			var pools = bp.pools;

			if (key === null) {
				var pool = pools.nonKeyed;
				pool && pool.push(node);
			} else {
				var pool$1 = pools.keyed;
				(pool$1[key] || (pool$1[key] = [])).push(node);
			}
			return true;
		}
		return false;
	}

	function unmount(input, parentDom) {
		if (isVList(input)) {
			unmountVList(input, parentDom, true);
		} else if (isVNode(input)) {
			unmountVNode(input, parentDom, false);
		}
	}

	function unmountVList(vList, parentDom, removePointer) {
		var items = vList.items;
		var itemsLength = items.length;
		var pointer = items.pointer;

		if (itemsLength > 0) {
			for (var i = 0; i < itemsLength; i++) {
				var item = items[i];

				if (isVList(item)) {
					unmountVList(item, parentDom, true);
				} else {
					if (parentDom) {
						removeChild(parentDom, item.dom);
					}
					unmount(item, null);
				}
			}
		}
		if (parentDom && removePointer) {
			removeChild(parentDom, pointer);
		}
	}

	function unmountVNode(node, parentDom, shallow) {
		var instance = node.instance;
		var instanceHooks = null;
		var instanceChildren = null;

		if (!isNullOrUndefined(instance)) {
			instanceHooks = instance.hooks;
			instanceChildren = instance.children;

			if (instance.render !== undefined) {
				instance.componentWillUnmount();
				instance._unmounted = true;
				componentToDOMNodeMap.delete(instance);
				!shallow && unmount(instance._lastNode, null);
			}
		}
		var hooks = node.hooks || instanceHooks;

		if (!isNullOrUndefined(hooks)) {
			if (!isNullOrUndefined(hooks.willDetach)) {
				hooks.willDetach(node.dom);
			}
			if (!isNullOrUndefined(hooks.componentWillUnmount)) {
				hooks.componentWillUnmount(node.dom, hooks);
			}
		}
		var children = (isNullOrUndefined(instance) ? node.children : null) || instanceChildren;

		if (!isNullOrUndefined(children)) {
			if (isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					unmount(children[i], null);
				}
			} else {
				unmount(children, null);
			}
		}
	}

	function VText(text) {
		this.text = text;
		this.dom = null;
	}

	function VPlaceholder() {
		this.placeholder = true;
		this.dom = null;
	}

	function VList(items) {
		this.dom = null;
		this.pointer = null;
		this.items = items;
	}

	function createVText(text) {
		return new VText(text);
	}

	function createVPlaceholder() {
		return new VPlaceholder();
	}

	function createVList(items) {
		return new VList(items);
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

	function isVText(o) {
		return o.text !== undefined;
	}

	function isVPlaceholder(o) {
		return o.placeholder === true;
	}

	function isVList(o) {
		return o.items !== undefined;
	}

	function isVNode(o) {
		return o.tag !== undefined || o.bp !== undefined;
	}

	function insertOrAppend(parentDom, newNode, nextNode) {
		if (isNullOrUndefined(nextNode)) {
			parentDom.appendChild(newNode);
		} else {
			parentDom.insertBefore(newNode, nextNode);
		}
	}

	function replaceVListWithNode(parentDom, vList, dom) {
		var pointer = vList.pointer;

		unmountVList(vList, parentDom, false);
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

	function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
		var lastInstance = null;
		var instanceLastNode = lastNode._lastNode;

		if (!isNullOrUndefined(instanceLastNode)) {
			lastInstance = lastNode;
			lastNode = instanceLastNode;
		}
		unmount(lastNode, false);
		var dom = mount(nextNode, null, lifecycle, context, instance, isSVG);

		nextNode.dom = dom;
		replaceNode(parentDom, dom, lastNode.dom);
		if (lastInstance !== null) {
			lastInstance._lastNode = nextNode;
		}
	}

	function replaceNode(parentDom, nextDom, lastDom) {
		parentDom.replaceChild(nextDom, lastDom);
	}

	function normalise$1(object) {
		if (isStringOrNumber(object)) {
			return createVText(object);
		} else if (isInvalidNode(object)) {
			return createVPlaceholder();
		} else if (isArray(object)) {
			return createVList(object);
		}
		return object;
	}

	function normaliseChild(children, i) {
		var child = children[i];

		return children[i] = normalise$1(child);
	}

	function remove(node, parentDom) {
		var dom = node.dom;
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

	function removeEvents(events, lastEventKeys, dom) {
		var eventKeys = lastEventKeys || Object.keys(events);

		for (var i = 0; i < eventKeys.length; i++) {
			var event = eventKeys[i];

			dom[event] = null;
		}
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

					if (!isInvalidNode(child)) {
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
		return nextChildren.length && !isNullOrUndefined(nextChildren[0]) && !isNullOrUndefined(nextChildren[0].key)
			&& lastChildren.length && !isNullOrUndefined(lastChildren[0]) && !isNullOrUndefined(lastChildren[0].key);
	}

	function selectOptionValueIfNeeded(vdom, values) {
		if (vdom.tag !== 'option') {
			for (var i = 0, len = vdom.children.length; i < len; i++) {
				selectOptionValueIfNeeded(vdom.children[i], values);
			}
			// NOTE! Has to be a return here to catch optGroup elements
			return;
		}

		var value = vdom.attrs && vdom.attrs.value;

		if (values[value]) {
			vdom.attrs = vdom.attrs || {};
			vdom.attrs.selected = 'selected';
			vdom.dom.selected = true;
		} else {
			vdom.dom.selected = false;
		}
	}

	function selectValue(vdom) {
		var value = vdom.attrs && vdom.attrs.value;

		var values = {};
		if (isArray(value)) {
			for (var i = 0, len = value.length; i < len; i++) {
				values[value[i]] = value[i];
			}
		} else {
			values[value] = value;
		}
		for (var i$1 = 0, len$1 = vdom.children.length; i$1 < len$1; i$1++) {
			selectOptionValueIfNeeded(vdom.children[i$1], values);
		}

		if (vdom.attrs && vdom.attrs[value]) {
			delete vdom.attrs.value; // TODO! Avoid deletion here. Set to null or undef. Not sure what you want to usev
		}
	}

	function handleAttachedHooks(hooks, lifecycle, dom) {
		if (!isNullOrUndefined(hooks.created)) {
			hooks.created(dom);
		}
		if (!isNullOrUndefined(hooks.attached)) {
			lifecycle.addListener(function () {
				hooks.attached(dom);
			});
		}
	}

	function setValueProperty(nextNode) {
		var value = nextNode.attrs.value;
		if (!isNullOrUndefined(value)) {
			nextNode.dom.value = value;
		}
	}

	function setFormElementProperties(nextTag, nextNode) {
		if (nextTag === 'input') {
			var inputType = nextNode.attrs.type;
			if (inputType === 'text') {
				setValueProperty(nextNode);
			} else if (inputType === 'checkbox' || inputType === 'radio') {
				var checked = nextNode.attrs.checked;
				nextNode.dom.checked = !!checked;
			}
		} else if (nextTag === 'textarea') {
			setValueProperty(nextNode);
		}
	}

	function mount(input, parentDom, lifecycle, context, instance, isSVG) {
		if (isVPlaceholder(input)) {
			return mountVPlaceholder(input, parentDom);
		} else if (isVText(input)) {
			return mountVText(input, parentDom);
		} else if (isVList(input)) {
			return mountVList(input, parentDom, lifecycle, context, instance, isSVG);
		} else if (isVNode(input)) {
			return mountVNode$1(input, parentDom, lifecycle, context, instance, isSVG);
		} else {
			mount(normalise$1(input), parentDom, lifecycle, context, instance, isSVG);
		}
	}

	function mountVNode$1(vNode, parentDom, lifecycle, context, instance, isSVG) {
		var bp = vNode.bp;

		if (isUndefined(bp)) {
			return mountVNodeWithoutBlueprint(vNode, parentDom, lifecycle, context, instance, isSVG);
		} else {
			if (recyclingEnabled) {
				var dom = recycle(vNode, bp, lifecycle, context, instance);

				if (!isNull(dom)) {
					if (!isNull(parentDom)) {
						parentDom.appendChild(dom);
					}
					return dom;
				}
			}
			return mountVNodeWithBlueprint(vNode, bp, parentDom, lifecycle, context, instance);
		}
	}

	function mountVList(vList, parentDom, lifecycle, context, instance, isSVG) {
		var items = vList.items;
		var pointer = document.createTextNode('');
		var dom = document.createDocumentFragment();

		mountArrayChildren(items, dom, lifecycle, context, instance, isSVG);
		vList.pointer = pointer;
		vList.dom = dom;
		dom.appendChild(pointer);
		if (parentDom) {
			insertOrAppend(parentDom, dom);
		}
		return dom;
	}

	function mountVText(vText, parentDom) {
		var dom = document.createTextNode(vText.text);

		vText.dom = dom;
		if (parentDom) {
			insertOrAppend(parentDom, dom);
		}
		return dom;
	}

	function mountVPlaceholder(vPlaceholder, parentDom) {
		var dom = document.createTextNode('');

		vPlaceholder.dom = dom;
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

	function mountBlueprintAttrs(node, bp, dom, instance) {
		handleSelects(node);
		var attrs = node.attrs;

		if (isNull(bp.attrKeys)) {
			var newKeys = Object.keys(attrs);
			bp.attrKeys = bp.attrKeys ? bp.attrKeys.concat(newKeys) : newKeys;
		}
		var attrKeys = bp.attrKeys;

		mountAttributes(node, attrs, attrKeys, dom, instance);
	}

	function mountBlueprintEvents(node, bp, dom) {
		var events = node.events;

		if (isNull(bp.eventKeys)) {
			bp.eventKeys = Object.keys(events);
		}
		var eventKeys = bp.eventKeys;

		mountEvents$1(events, eventKeys, dom);
	}

	function mountVNodeWithBlueprint(node, bp, parentDom, lifecycle, context, instance) {
		var tag = node.tag;

		if (isTrue(bp.isComponent)) {
			return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, instance, parentDom, lifecycle, context);
		}
		var dom = documentCreateElement(bp.tag, bp.isSVG);

		node.dom = dom;
		if (isTrue(bp.hasHooks)) {
			handleAttachedHooks(node.hooks, lifecycle, dom);
		}
		if (isTrue(bp.lazy)) {
			handleLazyAttached(node, lifecycle, dom);
		}
		var children = node.children;
		// bp.childrenType:
		// 0: no children
		// 1: text node
		// 2: single child
		// 3: multiple children
		// 4: multiple children (keyed)
		// 5: variable children (defaults to no optimisation)

		switch (bp.childrenType) {
			case 1:
				appendText(children, dom, true);
				break;
			case 2:
				mount(node.children, dom, lifecycle, context, instance, bp.isSVG);
				break;
			case 3:
				mountArrayChildren(children, dom, lifecycle, context, instance, bp.isSVG);
				break;
			case 4:
				for (var i = 0; i < children.length; i++) {
					mount(children[i], dom, lifecycle, context, instance, bp.isSVG);
				}
				break;
			case 5:
				mountChildren(node, children, dom, lifecycle, context, instance, bp.isSVG);
				break;
			default:
				break;
		}

		if (isTrue(bp.hasAttrs)) {
			mountBlueprintAttrs(node, bp, dom, instance);
		}
		if (isTrue(bp.hasClassName)) {
			dom.className = node.className;
		}
		if (isTrue(bp.hasStyle)) {
			patchStyle(null, node.style, dom);
		}
		if (isTrue(bp.hasEvents)) {
			mountBlueprintEvents(node, bp, dom);
		}
		if (!isNull(parentDom)) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function mountVNodeWithoutBlueprint(node, parentDom, lifecycle, context, instance, isSVG) {
		var tag = node.tag;

		if (isFunction(tag)) {
			return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, instance, parentDom, lifecycle, context);
		}
		if (!isString(tag) || tag === '') {
			throw Error('Inferno Error: Expected function or string for element tag type');
		}
		if (tag === 'svg') {
			isSVG = true;
		}
		var dom = documentCreateElement(tag, isSVG);
		var children = node.children;
		var attrs = node.attrs;
		var events = node.events;
		var hooks = node.hooks;
		var className = node.className;
		var style = node.style;

		node.dom = dom;
		if (!isNullOrUndefined(hooks)) {
			handleAttachedHooks(hooks, lifecycle, dom);
		}
		if (!isInvalidNode(children)) {
			mountChildren(node, children, dom, lifecycle, context, instance, isSVG);
		}
		if (!isNullOrUndefined(attrs)) {
			handleSelects(node);
			mountAttributes(node, attrs, Object.keys(attrs), dom, instance);
		}
		if (!isNullOrUndefined(className)) {
			dom.className = className;
		}
		if (!isNullOrUndefined(style)) {
			patchStyle(null, style, dom);
		}
		if (!isNullOrUndefined(events)) {
			mountEvents$1(events, Object.keys(events), dom);
		}
		if (!isNull(parentDom)) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function mountArrayChildren(children, parentDom, lifecycle, context, instance, isSVG) {
		children.complex = false;
		for (var i = 0; i < children.length; i++) {
			var child = normaliseChild(children, i);

			if (isVText(child)) {
				mountVText(child, parentDom);
				children.complex = true;
			} else if (isVPlaceholder(child)) {
				mountVPlaceholder(child, parentDom);
				children.complex = true;
			} else if (isVList(child)) {
				mountVList(child, parentDom, lifecycle, context, instance, isSVG);
				children.complex = true;
			} else {
				mount(child, parentDom, lifecycle, context, instance, isSVG);
			}
		}
	}

	function mountChildren(node, children, parentDom, lifecycle, context, instance, isSVG) {
		if (isArray(children)) {
			mountArrayChildren(children, parentDom, lifecycle, context, instance, isSVG);
		} else if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (!isInvalidNode(children)) {
			mount(children, parentDom, lifecycle, context, instance, isSVG);
		}
	}

	function mountRef(instance, value, refValue) {
		if (!isInvalidNode(instance) && isString(value)) {
			instance.refs[value] = refValue;
		}
	}

	function mountEvents$1(events, eventKeys, dom) {
		for (var i = 0; i < eventKeys.length; i++) {
			var event = eventKeys[i];

			dom[event] = events[event];
		}
	}

	function mountComponent(parentNode, Component, props, hooks, children, lastInstance, parentDom, lifecycle, context) {
		props = addChildrenToProps(children, props);

		var dom;
		if (isStatefulComponent(Component)) {
			var instance = new Component(props);

			instance._patch = patch;
			instance._componentToDOMNodeMap = componentToDOMNodeMap;
			if (!isNullOrUndefined(lastInstance) && props.ref) {
				mountRef(lastInstance, props.ref, instance);
			}
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			instance._unmounted = false;
			instance._parentNode = parentNode;
			if (lastInstance) {
				instance._parentComponent = lastInstance;
			}
			instance._pendingSetState = true;
			instance.componentWillMount();
			var node = instance.render();

			if (isInvalidNode(node)) {
				node = createVPlaceholder();
			}
			instance._pendingSetState = false;
			dom = mount(node, null, lifecycle, context, instance, false);
			instance._lastNode = node;
			instance.componentDidMount();
			if (parentDom !== null && !isInvalidNode(dom)) {
				parentDom.appendChild(dom);
			}
			componentToDOMNodeMap.set(instance, dom);
			parentNode.dom = dom;
			parentNode.instance = instance;
		} else {
			if (!isNullOrUndefined(hooks)) {
				if (!isNullOrUndefined(hooks.componentWillMount)) {
					hooks.componentWillMount(null, props);
				}
				if (!isNullOrUndefined(hooks.componentDidMount)) {
					lifecycle.addListener(function () {
						hooks.componentDidMount(dom, props);
					});
				}
			}

			/* eslint new-cap: 0 */
			var node$1 = Component(props, context);

			if (isInvalidNode(node$1)) {
				node$1 = createVPlaceholder();
			}
			dom = mount(node$1, null, lifecycle, context, null, false);

			parentNode.instance = node$1;

			if (parentDom !== null && !isInvalidNode(dom)) {
				parentDom.appendChild(dom);
			}
			parentNode.dom = dom;
		}
		return dom;
	}

	function mountAttributes(node, attrs, attrKeys, dom, instance) {
		for (var i = 0; i < attrKeys.length; i++) {
			var attr = attrKeys[i];

			if (attr === 'ref') {
				mountRef(getRefInstance$1(node, instance), attrs[attr], dom);
			} else {
				patchAttribute(attr, null, attrs[attr], dom);
			}
		}
	}

	function patch(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG) {
		if (lastInput !== nextInput) {
			if (isInvalidNode(lastInput)) {
				mount(nextInput, parentDom, lifecycle, context, instance, isSVG);
			} else if (isInvalidNode(nextInput)) {
				remove(lastInput, parentDom);
			} else if (isStringOrNumber(lastInput)) {
				if (isStringOrNumber(nextInput)) {
					parentDom.firstChild.nodeValue = nextInput;
				} else {
					var dom = mount(nextInput, null, lifecycle, context, instance, isSVG);

					nextInput.dom = dom;
					replaceNode(parentDom, dom, parentDom.firstChild);
				}
			} else if (isStringOrNumber(nextInput)) {
				replaceNode(parentDom, document.createTextNode(nextInput), lastInput.dom);
			} else {
				if (isVList(nextInput)) {
					if (isVList(lastInput)) {
						patchVList(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG);
					} else {
						replaceNode(parentDom, mountVList(nextInput, null), lastInput.dom);
						unmount(lastInput, null);
					}
				} else if (isVList(lastInput)) {
					replaceVListWithNode(parentDom, lastInput, mount(nextInput, null, lifecycle, context, instance, isSVG));
				} else if (isVPlaceholder(nextInput)) {
					if (isVPlaceholder(lastInput)) {
						patchVFragment(lastInput, nextInput);
					} else {
						replaceNode(parentDom, mountVPlaceholder(nextInput, null), lastInput.dom);
						unmount(lastInput, null);
					}
				} else if (isVPlaceholder(lastInput)) {
					replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
				} else if (isVText(nextInput)) {
					if (isVText(lastInput)) {
						patchVText(lastInput, nextInput);
					} else {
						replaceNode(parentDom, mountVText(nextInput, null), lastInput.dom);
						unmount(lastInput, null);
					}
				} else if (isVText(lastInput)) {
					replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
				} else if (isVNode(nextInput)) {
					if (isVNode(lastInput)) {
						patchVNode(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG, false);
					} else {
						replaceNode(parentDom, mountVNode(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
						unmount(lastInput, null);
					}
				} else if (isVNode(lastInput)) {
					replaceNode(parentDom, mount(nextInput, null, lifecycle, context, instance, isSVG), lastInput.dom);
					unmount(lastInput, null);
				} else {
					return patch(lastInput, normalise(nextInput),parentDomdom, lifecycle, context, instance, isSVG);
				}
			}
		}
		return nextInput;
	}

	function patchTextNode(dom, lastChildren, nextChildren) {
		if (isStringOrNumber(lastChildren)) {
			dom.firstChild.nodeValue = nextChildren;
		} else {
			dom.textContent = nextChildren;
		}
	}

	function patchRef(instance, lastValue, nextValue, dom) {
		if (instance) {
			if (isString(lastValue)) {
				delete instance.refs[lastValue];
			}
			if (isString(nextValue)) {
				instance.refs[nextValue] = dom;
			}
		}
	}

	function patchChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG) {
		var nextChildren = nextNode.children;
		var lastChildren = lastNode.children;

		if (lastChildren === nextChildren) {
			return;
		}
		if (isInvalidNode(lastChildren)) {
			if (isStringOrNumber(nextChildren)) {
				patchTextNode(dom, lastChildren, nextChildren);
			} else if (!isInvalidNode(nextChildren)) {
				if (isArray(nextChildren)) {
					mountArrayChildren(nextChildren, dom, lifecycle, context, instance, isSVG);
				} else {
					mount(nextChildren, dom, lifecycle, context, instance, isSVG);
				}
			}
		} else {
			if (isInvalidNode(nextChildren)) {
				removeAllChildren(dom, lastChildren);
			} else {
				if (isArray(lastChildren)) {
					if (isArray(nextChildren)) {
						nextChildren.complex = lastChildren.complex;
						if (isKeyed(lastChildren, nextChildren)) {
							patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, null);
						} else {
							patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, null);
						}
					} else {
						patchNonKeyedChildren(lastChildren, [nextChildren], dom, lifecycle, context, instance, isSVG, null);
					}
				} else {
					if (isArray(nextChildren)) {
						var lastChild = lastChildren;

						if (isStringOrNumber(lastChildren)) {
							lastChild = createVText(lastChild);
							lastChild.dom = dom.firstChild;
						}
						patchNonKeyedChildren([lastChild], nextChildren, dom, lifecycle, context, instance, isSVG, null);
					} else if (isStringOrNumber(nextChildren)) {
						patchTextNode(dom, lastChildren, nextChildren);
					} else if (isStringOrNumber(lastChildren)) {
						patch(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
					} else {
						patchVNode(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, false);
					}
				}
			}
		}
	}

	function patchVNode(lastVNode, nextVNode, parentDom, lifecycle, context, instance, isSVG, skipLazyCheck) {
		var lastBp = lastVNode.bp;
		var nextBp = nextVNode.bp;

		if (lastBp === undefined || nextBp === undefined) {
			patchVNodeWithoutBlueprint(lastVNode, nextVNode, parentDom, lifecycle, context, instance, isSVG);
		} else {
			patchVNodeWithBlueprint(lastVNode, nextVNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck);
		}
	}

	function patchVNodeWithBlueprint(lastVNode, nextVNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck) {
		var nextHooks;

		if (nextBp.hasHooks === true) {
			nextHooks = nextVNode.hooks;
			if (nextHooks && !isNullOrUndefined(nextHooks.willUpdate)) {
				nextHooks.willUpdate(lastVNode.dom);
			}
		}
		var nextTag = nextVNode.tag || nextBp.tag;
		var lastTag = lastVNode.tag || lastBp.tag;

		if (lastTag !== nextTag) {
			if (lastBp.isComponent === true) {
				var lastNodeInstance = lastVNode.instance;

				if (nextBp.isComponent === true) {
					replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, instance, false);
				} else if (isStatefulComponent(lastTag)) {
					unmountVNode(lastVNode, null, true);
					var lastNode = lastNodeInstance._lastNode;
					patchVNodeWithBlueprint(lastNode, nextVNode, lastNode.bp, nextBp, parentDom, lifecycle, context, instance, nextBp.isSVG);
				} else {
					unmountVNode(lastVNode, null, true);
					patchVNodeWithBlueprint(lastNodeInstance, nextVNode, lastNodeInstance.bp, nextBp, parentDom, lifecycle, context, instance, nextBp.isSVG);
				}
			} else {
				replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
			}
		} else if (isNullOrUndefined(lastTag)) {
			nextVNode.dom = lastVNode.dom;
		} else {
			if (lastBp.isComponent === true) {
				if (nextBp.isComponent === true) {
					var instance$1 = lastVNode.instance;

					if (!isNullOrUndefined(instance$1) && instance$1._unmounted) {
						var newDom = mountComponent(nextVNode, lastTag, nextVNode.attrs || {}, nextVNode.hooks, nextVNode.children, instance$1, parentDom, lifecycle, context);
						if (parentDom !== null) {
							replaceNode(parentDom, newDom, lastVNode.dom);
						}
					} else {
						nextVNode.instance = instance$1;
						nextVNode.dom = lastVNode.dom;
						patchComponent(true, nextVNode, nextVNode.tag, lastBp, nextBp, instance$1, lastVNode.attrs || {}, nextVNode.attrs || {}, nextVNode.hooks, nextVNode.children, parentDom, lifecycle, context);
					}
				}
			} else {
				var dom = lastVNode.dom;
				var lastChildrenType = lastBp.childrenType;
				var nextChildrenType = nextBp.childrenType;
				nextVNode.dom = dom;

				if (nextBp.lazy === true && skipLazyCheck === false) {
					var clipData = lastVNode.clipData;

					if (lifecycle.scrollY === null) {
						lifecycle.refresh();
					}

					nextVNode.clipData = clipData;
					if (clipData.pending === true || clipData.top - lifecycle.scrollY > lifecycle.screenHeight) {
						if (setClipNode(clipData, dom, lastVNode, nextVNode, parentDom, lifecycle, context, instance, lastBp.isSVG)) {
							return;
						}
					}
					if (clipData.bottom < lifecycle.scrollY) {
						if (setClipNode(clipData, dom, lastVNode, nextVNode, parentDom, lifecycle, context, instance, lastBp.isSVG)) {
							return;
						}
					}
				}

				if (lastChildrenType > 0 || nextChildrenType > 0) {
					if (nextChildrenType === 5 || lastChildrenType === 5) {
						patchChildren(lastVNode, nextVNode, dom, lifecycle, context, instance);
					} else {
						var lastChildren = lastVNode.children;
						var nextChildren = nextVNode.children;

						if (lastChildrenType === 0 || isInvalidNode(lastChildren)) {
							if (nextChildrenType > 2) {
								mountArrayChildren(nextChildren, dom, lifecycle, context, instance);
							} else {
								mount(nextChildren, dom, lifecycle, context, instance);
							}
						} else if (nextChildrenType === 0 || isInvalidNode(nextChildren)) {
							if (lastChildrenType > 2) {
								removeAllChildren(dom, lastChildren);
							} else {
								remove(lastChildren, dom);
							}
						} else {
							if (lastChildren !== nextChildren) {
								if (lastChildrenType === 4 && nextChildrenType === 4) {
									patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, nextBp.isSVG, null);
								} else if (lastChildrenType === 2 && nextChildrenType === 2) {
									patch(lastChildren, nextChildren, dom, lifecycle, context, instance, true, nextBp.isSVG);
								} else if (lastChildrenType === 1 && nextChildrenType === 1) {
									patchTextNode(dom, lastChildren, nextChildren);
								} else {
									patchChildren(lastVNode, nextVNode, dom, lifecycle, context, instance, nextBp.isSVG);
								}
							}
						}
					}
				}
				if (lastBp.hasAttrs === true || nextBp.hasAttrs === true) {
					patchAttributes(lastVNode, nextVNode, lastBp.attrKeys, nextBp.attrKeys, dom, instance);
				}
				if (lastBp.hasEvents === true || nextBp.hasEvents === true) {
					patchEvents(lastVNode.events, nextVNode.events, lastBp.eventKeys, nextBp.eventKeys, dom);
				}
				if (lastBp.hasClassName === true || nextBp.hasClassName === true) {
					var nextClassName = nextVNode.className;

					if (lastVNode.className !== nextClassName) {
						if (isNullOrUndefined(nextClassName)) {
							dom.removeAttribute('class');
						} else {
							dom.className = nextClassName;
						}
					}
				}
				if (lastBp.hasStyle === true || nextBp.hasStyle === true) {
					var nextStyle = nextVNode.style;
					var lastStyle = lastVNode.style;

					if (lastStyle !== nextStyle) {
						patchStyle(lastStyle, nextStyle, dom);
					}
				}
				if (nextBp.hasHooks === true && !isNullOrUndefined(nextHooks.didUpdate)) {
					nextHooks.didUpdate(dom);
				}
				setFormElementProperties(nextTag, nextVNode);
			}
		}
	}

	function patchVNodeWithoutBlueprint(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
		var nextHooks = nextNode.hooks;
		var nextHooksDefined = !isNullOrUndefined(nextHooks);

		if (nextHooksDefined && !isNullOrUndefined(nextHooks.willUpdate)) {
			nextHooks.willUpdate(lastNode.dom);
		}
		var nextTag = nextNode.tag || ((isNullOrUndefined(nextNode.bp)) ? null : nextNode.bp.tag);
		var lastTag = lastNode.tag || ((isNullOrUndefined(lastNode.bp)) ? null : lastNode.bp.tag);

		if (nextTag === 'svg') {
			isSVG = true;
		}
		if (lastTag !== nextTag) {
			var lastNodeInstance = lastNode.instance;

			if (isFunction(lastTag)) {
				if (isFunction(nextTag)) {
					replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
				} else if (isStatefulComponent(lastTag)) {
					unmountVNode(lastNode, null, true);
					patchVNodeWithoutBlueprint(lastNodeInstance._lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
				} else {
					unmountVNode(lastNode, null, true);
					patchVNodeWithoutBlueprint(lastNodeInstance, nextNode, parentDom, lifecycle, context, instance, isSVG);
				}
			} else {
				replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
			}
		} else if (isNullOrUndefined(lastTag)) {
			nextNode.dom = lastNode.dom;
		} else {
			if (isFunction(lastTag)) {
				if (isFunction(nextTag)) {
					var instance$1 = lastNode._instance;

					if (!isNullOrUndefined(instance$1) && instance$1._unmounted) {
						var newDom = mountComponent(nextNode, lastTag, nextNode.attrs || {}, nextNode.hooks, nextNode.children, instance$1, parentDom, lifecycle, context);
						if (parentDom !== null) {
							replaceNode(parentDom, newDom, lastNode.dom);
						}
					} else {
						nextNode.instance = lastNode.instance;
						nextNode.dom = lastNode.dom;
						patchComponent(false, nextNode, nextNode.tag, null, null, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
					}
				}
			} else {
				var dom = lastNode.dom;
				var nextClassName = nextNode.className;
				var nextStyle = nextNode.style;

				nextNode.dom = dom;

				patchChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG);
				patchAttributes(lastNode, nextNode, null, null, dom, instance);
				patchEvents(lastNode.events, nextNode.events, null, null, dom);

				if (lastNode.className !== nextClassName) {
					if (isNullOrUndefined(nextClassName)) {
						dom.removeAttribute('class');
					} else {
						dom.className = nextClassName;
					}
				}
				if (lastNode.style !== nextStyle) {
					patchStyle(lastNode.style, nextStyle, dom);
				}
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.didUpdate)) {
					nextHooks.didUpdate(dom);
				}
				setFormElementProperties(nextTag, nextNode);
			}
		}
	}

	function patchAttributes(lastNode, nextNode, lastAttrKeys, nextAttrKeys, dom, instance) {
		if (lastNode.tag === 'select') {
			selectValue(nextNode);
		}
		var nextAttrs = nextNode.attrs;
		var lastAttrs = lastNode.attrs;
		var nextAttrsIsUndef = isNullOrUndefined(nextAttrs);
		var lastAttrsIsNotUndef = !isNullOrUndefined(lastAttrs);

		if (!nextAttrsIsUndef) {
			var nextAttrsKeys = nextAttrKeys || Object.keys(nextAttrs);
			var attrKeysLength = nextAttrsKeys.length;

			for (var i = 0; i < attrKeysLength; i++) {
				var attr = nextAttrsKeys[i];
				var lastAttrVal = lastAttrsIsNotUndef && lastAttrs[attr];
				var nextAttrVal = nextAttrs[attr];

				if (lastAttrVal !== nextAttrVal) {
					if (attr === 'ref') {
						patchRef(instance, lastAttrVal, nextAttrVal, dom);
					} else {
						patchAttribute(attr, lastAttrVal, nextAttrVal, dom);
					}
				}
			}
		}
		if (lastAttrsIsNotUndef) {
			var lastAttrsKeys = lastAttrKeys || Object.keys(lastAttrs);
			var attrKeysLength$1 = lastAttrsKeys.length;

			for (var i$1 = 0; i$1 < attrKeysLength$1; i$1++) {
				var attr$1 = lastAttrsKeys[i$1];

				if (nextAttrsIsUndef || isNullOrUndefined(nextAttrs[attr$1])) {
					if (attr$1 === 'ref') {
						patchRef(getRefInstance(node, instance), lastAttrs[attr$1], null, dom);
					} else {
						dom.removeAttribute(attr$1);
					}
				}
			}
		}
	}


	function patchStyle(lastAttrValue, nextAttrValue, dom) {
		if (isString(nextAttrValue)) {
			dom.style.cssText = nextAttrValue;
		} else if (isNullOrUndefined(lastAttrValue)) {
			if (!isNullOrUndefined(nextAttrValue)) {
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
		} else if (isNullOrUndefined(nextAttrValue)) {
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
				if (isNullOrUndefined(nextAttrValue[style$2])) {
					dom.style[style$2] = '';
				}
			}
		}
	}

	function patchEvents(lastEvents, nextEvents, _lastEventKeys, _nextEventKeys, dom) {
		var nextEventsDefined = !isNullOrUndefined(nextEvents);
		var lastEventsDefined = !isNullOrUndefined(lastEvents);

		if (nextEventsDefined) {
			if (lastEventsDefined) {
				var nextEventKeys = _nextEventKeys || Object.keys(nextEvents);

				for (var i = 0; i < nextEventKeys.length; i++) {
					var event = nextEventKeys[i];
					var lastEvent = lastEvents[event];
					var nextEvent = nextEvents[event];

					if (lastEvent !== nextEvent) {
						dom[event] = nextEvent;
					}
				}
				var lastEventKeys = _lastEventKeys || Object.keys(lastEvents);

				for (var i$1 = 0; i$1 < lastEventKeys.length; i$1++) {
					var event$1 = lastEventKeys[i$1];

					if (isNullOrUndefined(nextEvents[event$1])) {
						dom[event$1] = null;
					}
				}
			} else {
				mountEvents(nextEvents, _nextEventKeys, dom);
			}
		} else if (lastEventsDefined) {
			removeEvents(lastEvents, _nextEventKeys, dom);
		}
	}

	function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
		if (attrName === 'dangerouslySetInnerHTML') {
			var lastHtml = lastAttrValue && lastAttrValue.__html;
			var nextHtml = nextAttrValue && nextAttrValue.__html;

			if (isNullOrUndefined(nextHtml)) {
				throw new Error('Inferno Error: dangerouslySetInnerHTML requires an object with a __html propety containing the innerHTML content');
			}
			if (lastHtml !== nextHtml) {
				dom.innerHTML = nextHtml;
			}
		} else if (strictProps[attrName]) {
			dom[attrName] = nextAttrValue === null ? '' : nextAttrValue;
		} else {
			if (booleanProps[attrName]) {
				dom[attrName] = nextAttrValue ? true : false;
			} else {
				var ns = namespaces[attrName];

				if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
					if (ns !== undefined) {
						dom.removeAttributeNS(ns, attrName);
					} else {
						dom.removeAttribute(attrName);
					}
				} else {
					if (ns !== undefined) {
						dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
					} else {
						dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
					}
				}
			}
		}
	}

	function patchComponent(hasBlueprint, lastNode, Component, lastBp, nextBp, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
		nextProps = addChildrenToProps(nextChildren, nextProps);

		if (isStatefulComponent(Component)) {
			var prevProps = instance.props;
			var prevState = instance.state;
			var nextState = instance.state;

			var childContext = instance.getChildContext();
			if (!isNullOrUndefined(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			var nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

			if (nextNode === NO_RENDER) {
				nextNode = instance._lastNode;
			} else if (isNullOrUndefined(nextNode)) {
				nextNode = createVPlaceholder();
			}
			patch(instance._lastNode, nextNode, parentDom, lifecycle, context, instance, null, false);
			lastNode.dom = nextNode.dom;
			instance._lastNode = nextNode;
			instance.componentDidUpdate(prevProps, prevState);
			componentToDOMNodeMap.set(instance, nextNode.dom);
		} else {
			var shouldUpdate = true;
			var nextHooksDefined = (hasBlueprint && nextBp.hasHooks === true) || !isNullOrUndefined(nextHooks);

			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
				shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
					nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
				}
				var nextNode$1 = Component(nextProps, context);

				if (isInvalidNode(nextNode$1)) {
					nextNode$1 = createVPlaceholder();
				}
				nextNode$1.dom = lastNode.dom;
				patch(instance, nextNode$1, parentDom, lifecycle, context, null, null, false);
				lastNode.instance = nextNode$1;
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
					nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
				}
			}
		}
	}

	function patchVList(lastVList, nextVList, parentDom, lifecycle, context, instance, isSVG) {
		var lastItems = lastVList.items;
		var nextItems = nextVList.items;
		var pointer = lastVList.pointer;

		nextVList.dom = lastVList.dom;
		nextVList.pointer = pointer;
		if (!lastItems !== nextItems) {
			if (isKeyed(lastItems, nextItems)) {
				patchKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, instance, isSVG, nextVList);
			} else {
				patchNonKeyedChildren(lastItems, nextItems, parentDom, lifecycle, context, instance, isSVG, nextVList);
			}
		}
	}

	function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
		var lastChildrenLength = lastChildren.length;
		var nextChildrenLength = nextChildren.length;
		var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
		var i = 0;

		for (; i < commonLength; i++) {
			var lastChild = lastChildren[i];
			var nextChild = normaliseChild(nextChildren, i);

			patch(lastChild, nextChild, dom, lifecycle, context, instance, isSVG);
		}
		if (lastChildrenLength < nextChildrenLength) {
			for (i = commonLength; i < nextChildrenLength; i++) {
				var child = normaliseChild(nextChildren, i);

				insertOrAppend(dom, mount(child, null, lifecycle, context, instance, isSVG), parentVList && parentVList.pointer);
			}
		} else if (lastChildrenLength > nextChildrenLength) {
			for (i = commonLength; i < lastChildrenLength; i++) {
				remove(lastChildren[i], dom);
			}
		}
	}

	function patchVFragment(lastVFragment, nextVFragment) {
		nextVFragment.dom = lastVFragment.dom;
	}

	function patchVText(lastVText, nextVText) {
		var nextText = nextVText.text;
		var dom = lastVText.dom;

		nextVText.dom = dom;
		if (lastVText.text !== nextText) {
			dom.nodeValue = nextText;
		}
	}

	function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG, parentVList) {
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

			if (nextStartNode.key !== lastStartNode.key) {
				break;
			}
			patchVNode(lastStartNode, nextStartNode, dom, lifecycle, context, instance, isSVG, false);
			nextStartIndex++;
			lastStartIndex++;
		}
		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextEndNode = nextChildren[nextEndIndex];
			lastEndNode = lastChildren[lastEndIndex];

			if (nextEndNode.key !== lastEndNode.key) {
				break;
			}
			patchVNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
			nextEndIndex--;
			lastEndIndex--;
		}
		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextEndNode = nextChildren[nextEndIndex];
			lastStartNode = lastChildren[lastStartIndex];

			if (nextEndNode.key !== lastStartNode.key) {
				break;
			}
			nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : null;
			patchVNode(lastStartNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
			insertOrAppend(dom, nextEndNode.dom, nextNode);
			nextEndIndex--;
			lastStartIndex++;
		}
		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextStartNode = nextChildren[nextStartIndex];
			lastEndNode = lastChildren[lastEndIndex];

			if (nextStartNode.key !== lastEndNode.key) {
				break;
			}
			nextNode = lastChildren[lastStartIndex].dom;
			patchVNode(lastEndNode, nextStartNode, dom, lifecycle, context, instance, isSVG, false);
			insertOrAppend(dom, nextStartNode.dom, nextNode);
			nextStartIndex++;
			lastEndIndex--;
		}

		if (lastStartIndex > lastEndIndex) {
			if (nextStartIndex <= nextEndIndex) {
				nextNode = (nextEndIndex + 1 < nextChildrenLength) ? nextChildren[nextEndIndex + 1].dom : parentVList && parentVList.pointer;
				for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
					insertOrAppend(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, instance, isSVG), nextNode);
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
						if (lastEndNode.key === nextEndNode.key) {
							sources[index - nextStartIndex] = i;

							if (lastTarget > index) {
								moved = true;
							} else {
								lastTarget = index;
							}
							patchVNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
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
					prevItemsMap.set(nextChildren[i].key, i);
				}
				for (i = lastEndIndex; i >= lastStartIndex; i--) {
					lastEndNode = lastChildren[i];
					index = prevItemsMap.get(lastEndNode.key);

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
						patchVNode(lastEndNode, nextEndNode, dom, lifecycle, context, instance, isSVG, false);
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
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
					} else {
						if (index < 0 || i !== seq[index]) {
							pos = i + nextStartIndex;
							nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
							insertOrAppend(dom, nextChildren[pos].dom, nextNode);
						} else {
							index--;
						}
					}
				}
			} else if (aLength - removeOffset !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + nextStartIndex;
						nextNode = (pos + 1 < nextChildrenLength) ? nextChildren[pos + 1].dom : parentVList && parentVList.pointer;
						insertOrAppend(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
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

	function handleLazyAttached(node, lifecycle, dom) {
		lifecycle.addListener(function () {
			var rect = dom.getBoundingClientRect();

			if (lifecycle.scrollY === null) {
				lifecycle.refresh();
			}
			node.clipData = {
				top: rect.top + lifecycle.scrollY,
				left: rect.left + lifecycle.scrollX,
				bottom: rect.bottom + lifecycle.scrollY,
				right: rect.right + lifecycle.scrollX,
				pending: false
			};
		});
	}

	function hydrateChild(child, childNodes, counter, parentDom, lifecycle, context, instance) {
		var domNode = childNodes[counter.i];

		if (isVText(child)) {
			var text = child.text;

			child.dom = domNode;
			if (domNode.nodeType === 3 && text !== '') {
				domNode.nodeValue = text;
			} else {
				var newDomNode = mountVText(text);

				replaceNode(parentDom, newDomNode, domNode);
				childNodes.splice(childNodes.indexOf(domNode), 1, newDomNode);
				child.dom = newDomNode;
			}
		} else if (isVPlaceholder(child)) {
			child.dom = domNode;
		} else if (isVList(child)) {
			var items = child.items;

			// this doesn't really matter, as it won't be used again, but it's what it should be given the purpose of VList
			child.dom = document.createDocumentFragment();
			for (var i = 0; i < items.length; i++) {
				var rebuild = hydrateChild(normaliseChild(items, i), childNodes, counter, parentDom, lifecycle, context, instance);

				if (rebuild) {
					return true;
				}
			}
			// at the end of every VList, there should be a "pointer". It's an empty TextNode used for tracking the VList
			var pointer = childNodes[counter.i++];

			if (pointer && pointer.nodeType === 3) {
				child.pointer = pointer;
			} else {
				// there is a problem, we need to rebuild this tree
				return true;
			}
		} else {
			var rebuild$1 = hydrateNode(child, domNode, parentDom, lifecycle, context, instance, false);

			if (rebuild$1) {
				return true;
			}
		}
		counter.i++;
	}

	function getChildNodesWithoutComments(domNode) {
		var childNodes = [];
		var rawChildNodes = domNode.childNodes;
		var length = rawChildNodes.length;
		var i = 0;

		while (i < length) {
			var rawChild = rawChildNodes[i];

			if (rawChild.nodeType === 8) {
				if (rawChild.data === '!') {
					var placeholder = document.createTextNode('');

					domNode.replaceChild(placeholder, rawChild);
					childNodes.push(placeholder);
					i++;
				} else {
					domNode.removeChild(rawChild);
					length--;
				}
			} else {
				childNodes.push(rawChild);
				i++;
			}
		}
		return childNodes;
	}

	function hydrateComponent(node, Component, props, hooks, children, domNode, parentDom, lifecycle, context, lastInstance, isRoot) {
		props = addChildrenToProps(children, props);

		if (isStatefulComponent(Component)) {
			var instance = node.instance = new Component(props);

			instance._patch = patch;
			if (!isNullOrUndefined(lastInstance) && props.ref) {
				mountRef(lastInstance, props.ref, instance);
			}
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = Object.assign({}, context, childContext);
			}
			instance.context = context;
			instance._unmounted = false;
			instance._parentNode = node;
			if (lastInstance) {
				instance._parentComponent = lastInstance;
			}
			instance._pendingSetState = true;
			instance.componentWillMount();
			var nextNode = instance.render();

			instance._pendingSetState = false;
			if (isInvalidNode(nextNode)) {
				nextNode = createVPlaceholder();
			}
			hydrateNode(nextNode, domNode, parentDom, lifecycle, context, instance, isRoot);
			instance._lastNode = nextNode;
			instance.componentDidMount();

		} else {
			var instance$1 = node.instance = Component(props);

			if (!isNullOrUndefined(hooks)) {
				if (!isNullOrUndefined(hooks.componentWillMount)) {
					hooks.componentWillMount(null, props);
				}
				if (!isNullOrUndefined(hooks.componentDidMount)) {
					lifecycle.addListener(function () {
						hooks.componentDidMount(domNode, props);
					});
				}
			}
			return hydrateNode(instance$1, domNode, parentDom, lifecycle, context, instance$1, isRoot);
		}
	}

	function hydrateNode(node, domNode, parentDom, lifecycle, context, instance, isRoot) {
		var bp = node.bp;
		var tag = node.tag || bp.tag;

		if (isFunction(tag)) {
			node.dom = domNode;
			hydrateComponent(node, tag, node.attrs || {}, node.hooks, node.children, domNode, parentDom, lifecycle, context, instance, isRoot);
		} else {
			if (
				domNode.nodeType !== 1 ||
				tag !== domNode.tagName.toLowerCase()
			) {
				// TODO remake node
			} else {
				node.dom = domNode;
				var hooks = node.hooks;

				if ((bp && bp.hasHooks === true) || !isNullOrUndefined(hooks)) {
					handleAttachedHooks(hooks, lifecycle, domNode);
				}
				var children = node.children;

				if (!isNullOrUndefined(children)) {
					if (isStringOrNumber(children)) {
						if (domNode.textContent !== children) {
							domNode.textContent = children;
						}
					} else {
						var childNodes = getChildNodesWithoutComments(domNode);
						var counter = { i: 0 };
						var rebuild = false;

						if (isArray(children)) {
							for (var i = 0; i < children.length; i++) {
								rebuild = hydrateChild(normaliseChild(children, i), childNodes, counter, domNode, lifecycle, context, instance);

								if (rebuild) {
									break;
								}
							}
						} else {
							if (childNodes.length === 1) {
								rebuild = hydrateChild(children, childNodes, counter, domNode, lifecycle, context, instance);
							} else {
								rebuild = true;
							}
						}

						if (rebuild) {
							// TODO scrap children and rebuild again
						}
					}
				}
				var className = node.className;
				var style = node.style;

				if (!isNullOrUndefined(className)) {
					domNode.className = className;
				}
				if (!isNullOrUndefined(style)) {
					patchStyle(null, style, domNode);
				}
				if (bp && bp.hasAttrs === true) {
					mountBlueprintAttrs(node, bp, domNode, instance);
				} else {
					var attrs = node.attrs;

					if (!isNullOrUndefined(attrs)) {
						handleSelects(node);
						mountAttributes(node, attrs, Object.keys(attrs), domNode, instance);
					}
				}
				if (bp && bp.hasEvents === true) {
					mountBlueprintEvents(node, bp, domNode);
				} else {
					var events = node.events;

					if (!isNullOrUndefined(events)) {
						mountEvents$1(events, Object.keys(events), domNode);
					}
				}
			}
		}
	}
	var documetBody = isBrowser ? document.body : null;

	function hydrate(node, parentDom, lifecycle) {
		if (parentDom && parentDom.nodeType === 1) {
			var rootNode = parentDom.querySelector('[data-infernoroot]');

			if (rootNode && rootNode.parentNode === parentDom) {
				hydrateNode(node, rootNode, parentDom, lifecycle, {}, true);
				return true;
			}
		}
		// clear parentDom, unless it's document.body
		if (parentDom !== documetBody) {
			parentDom.textContent = '';
		} else {
			console.warn('Inferno Warning: rendering to the "document.body" is dangerous! Use a dedicated container element instead.');
		}
		return false;
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
			if (!isInvalidNode(input)) {
				if (!hydrate(input, parentDom, lifecycle)) {
					mount(input, parentDom, lifecycle, {}, null, false);
				}
				lifecycle.trigger();
				roots.set(parentDom, { input: input });
			}
		} else {
			var activeNode = getActiveNode();
			var nextInput = patch(root.input, input, parentDom, lifecycle, {}, null, false);

			lifecycle.trigger();
			if (isNull(input)) {
				roots.delete(parentDom);
			}
			root.input = nextInput;
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