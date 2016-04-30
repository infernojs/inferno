/*!
 * inferno-dom v0.7.4
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoDOM = factory());
}(this, function () { 'use strict';

	var babelHelpers = {};
	babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	babelHelpers.extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	babelHelpers;

	function addChildrenToProps(children, props) {
		if (!isNullOrUndefined(children)) {
			var isChildrenArray = isArray(children);
			if (isChildrenArray && children.length > 0 || !isChildrenArray) {
				if (props) {
					props.children = children;
				} else {
					props = {
						children: children
					};
				}
			}
		}
		return props;
	}

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStatefulComponent(obj) {
		return obj.prototype.render !== void 0;
	}

	function isStringOrNumber(obj) {
		return typeof obj === 'string' || typeof obj === 'number';
	}

	function isNullOrUndefined(obj) {
		return obj === void 0 || obj === null;
	}

	function isInvalidNode(obj) {
		return obj === null || obj === false || obj === void 0;
	}

	function isFunction(obj) {
		return typeof obj === 'function';
	}

	function isString(obj) {
		return typeof obj === 'string';
	}

	function isPromise(obj) {
		return obj instanceof Promise;
	}

	function replaceInArray(array, obj, newObj) {
		array.splice(array.indexOf(obj), 1, newObj);
	}

	var recyclingEnabled = true;

	function recycle(node, bp, lifecycle, context, instance) {
		if (bp !== void 0) {
			var key = node.key;
			var _pool = key === null ? bp.pools.nonKeyed : bp.pools.keyed[key];
			if (!isNullOrUndefined(_pool)) {
				var recycledNode = _pool.pop();
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
				var _pool2 = pools.nonKeyed;
				_pool2 && _pool2.push(node);
			} else {
				var _pool3 = pools.keyed;
				(_pool3[key] || (_pool3[key] = [])).push(node);
			}
			return true;
		}
		return false;
	}

	function mount(input, parentDom, lifecycle, context, instance, isSVG) {
		if (isArray(input)) {
			return placeholder(input, parentDom);
		}
		if (isInvalidNode(input)) {
			return null;
		}

		var bp = input.bp;

		if (recyclingEnabled) {
			var dom = recycle(input, bp, lifecycle, context, instance);

			if (dom !== null) {
				if (parentDom !== null) {
					parentDom.appendChild(dom);
				}
				return dom;
			}
		}

		if (bp === void 0) {
			return appendNode(input, parentDom, lifecycle, context, instance, isSVG);
		} else {
			return appendNodeWithTemplate(input, bp, parentDom, lifecycle, context, instance);
		}
	}

	function handleSelects(node) {
		if (node.tag === 'select') {
			selectValue(node);
		}
	}

	function appendNodeWithTemplate(node, bp, parentDom, lifecycle, context, instance) {
		var tag = node.tag;

		if (bp.isComponent === true) {
			return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, instance, parentDom, lifecycle, context);
		}
		var dom = documentCreateElement(bp.tag, bp.isSVG);

		node.dom = dom;
		if (bp.hasHooks === true) {
			handleAttachedHooks(node.hooks, lifecycle, dom);
		}
		if (bp.lazy === true) {
			handleLazyAttached(node, lifecycle, dom);
		}
		// bp.childrenType:
		// 0: no children
		// 1: text node
		// 2: single child
		// 3: multiple children
		// 4: multiple children (keyed)
		// 5: variable children (defaults to no optimisation)

		switch (bp.childrenType) {
			case 1:
				appendText(node.children, dom, true);
				break;
			case 2:
				mount(node.children, dom, lifecycle, context, instance);
				break;
			case 3:
				mountArrayChildren(node, node.children, dom, lifecycle, context, instance);
				break;
			case 4:
				mountArrayChildrenWithKeys(node.children, dom, lifecycle, context, instance);
				break;
			case 5:
				mountChildren(node, node.children, dom, lifecycle, context, instance);
				break;
			default:
				break;
		}

		if (bp.hasAttrs === true) {
			handleSelects(node);
			var attrs = node.attrs;

			if (bp.attrKeys === null) {
				var newKeys = Object.keys(attrs);
				bp.attrKeys = bp.attrKeys ? bp.attrKeys.concat(newKeys) : newKeys;
			}
			var attrKeys = bp.attrKeys;

			mountAttributes(attrs, attrKeys, dom, instance);
		}
		if (bp.hasClassName === true) {
			dom.className = node.className;
		}
		if (bp.hasStyle === true) {
			patchStyle(null, node.style, dom);
		}
		if (bp.hasEvents === true) {
			var events = node.events;

			if (bp.eventKeys === null) {
				bp.eventKeys = Object.keys(events);
			}
			var eventKeys = bp.eventKeys;

			mountEvents(events, eventKeys, dom);
		}
		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function appendNode(node, parentDom, lifecycle, context, instance, isSVG) {
		var tag = node.tag;

		if (tag === null) {
			return placeholder(node, parentDom);
		}
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
			mountAttributes(attrs, Object.keys(attrs), dom, instance);
		}
		if (!isNullOrUndefined(className)) {
			dom.className = className;
		}
		if (!isNullOrUndefined(style)) {
			patchStyle(null, style, dom);
		}
		if (!isNullOrUndefined(events)) {
			mountEvents(events, Object.keys(events), dom);
		}
		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function appendPromise(child, parentDom, domChildren, lifecycle, context, instance, isSVG) {
		var placeholder = createEmptyTextNode();
		domChildren && domChildren.push(placeholder);

		child.then(function (node) {
			// TODO check for text nodes and arrays
			var dom = mount(node, null, lifecycle, context, instance, isSVG);
			if (parentDom !== null && !isInvalidNode(dom)) {
				parentDom.replaceChild(dom, placeholder);
			}
			domChildren && replaceInArray(domChildren, placeholder, dom);
		});
		parentDom.appendChild(placeholder);
	}

	function mountArrayChildrenWithKeys(children, parentDom, lifecycle, context, instance) {
		for (var i = 0; i < children.length; i++) {
			mount(children[i], parentDom, lifecycle, context, instance);
		}
	}

	function mountArrayChildren(node, children, parentDom, lifecycle, context, instance, isSVG) {
		var domChildren = null;
		var isNonKeyed = false;
		var hasKeyedAssumption = false;

		for (var i = 0; i < children.length; i++) {
			var child = children[i];

			if (isStringOrNumber(child)) {
				isNonKeyed = true;
				domChildren = domChildren || [];
				domChildren.push(appendText(child, parentDom, false));
			} else if (!isNullOrUndefined(child) && isArray(child)) {
				var virtualFragment = createVirtualFragment();

				isNonKeyed = true;
				mountArrayChildren(node, child, virtualFragment, lifecycle, context, instance, isSVG);
				insertOrAppendNonKeyed(parentDom, virtualFragment);
				domChildren = domChildren || [];
				domChildren.push(virtualFragment);
			} else if (isPromise(child)) {
				appendPromise(child, parentDom, domChildren, lifecycle, context, instance, isSVG);
			} else {
				var domNode = mount(child, parentDom, lifecycle, context, instance, isSVG);

				if (isNonKeyed || !hasKeyedAssumption && !isNullOrUndefined(child) && isNullOrUndefined(child.key)) {
					isNonKeyed = true;
					domChildren = domChildren || [];
					domChildren.push(domNode);
				} else if (isInvalidNode(child)) {
					isNonKeyed = true;
					domChildren = domChildren || [];
					domChildren.push(domNode);
				} else if (hasKeyedAssumption === false) {
					hasKeyedAssumption = true;
				}
			}
		}
		if (domChildren !== null && domChildren.length > 1 && isNonKeyed === true) {
			node.domChildren = domChildren;
		}
	}

	function mountChildren(node, children, parentDom, lifecycle, context, instance, isSVG) {
		if (isArray(children)) {
			mountArrayChildren(node, children, parentDom, lifecycle, context, instance, isSVG);
		} else if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (isPromise(children)) {
			appendPromise(children, parentDom, null, lifecycle, context, instance, isSVG);
		} else {
			mount(children, parentDom, lifecycle, context, instance, isSVG);
		}
	}

	function mountRef(instance, value, refValue) {
		if (!isInvalidNode(instance) && isString(value)) {
			instance.refs[value] = refValue;
		}
	}

	function mountEvents(events, eventKeys, dom) {
		for (var i = 0; i < eventKeys.length; i++) {
			var event = eventKeys[i];

			dom[event] = events[event];
		}
	}

	function mountComponent(parentNode, Component, props, hooks, children, lastInstance, parentDom, lifecycle, context) {
		props = addChildrenToProps(children, props);

		var dom = void 0;
		if (isStatefulComponent(Component)) {
			var instance = new Component(props);

			instance._patch = patch;
			if (!isNullOrUndefined(lastInstance) && props.ref) {
				mountRef(lastInstance, props.ref, instance);
			}
			var childContext = instance.getChildContext();

			if (!isNullOrUndefined(childContext)) {
				context = babelHelpers.extends({}, context, childContext);
			}
			instance.context = context;
			instance._unmounted = false;

			instance._pendingSetState = true;
			instance.componentWillMount();
			var node = instance.render();
			instance._pendingSetState = false;

			if (!isInvalidNode(node)) {
				dom = mount(node, null, lifecycle, context, instance, false);
				instance._lastNode = node;
				if (parentDom !== null && !isInvalidNode(dom)) {
					parentDom.appendChild(dom);
				}
				instance.componentDidMount();
			}
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
			var _node = Component(props);
			dom = mount(_node, null, lifecycle, context, null);

			parentNode.instance = _node;

			if (parentDom !== null && !isInvalidNode(dom)) {
				parentDom.appendChild(dom);
			}
			parentNode.dom = dom;
		}
		return dom;
	}

	function mountAttributes(attrs, attrKeys, dom, instance) {
		for (var i = 0; i < attrKeys.length; i++) {
			var attr = attrKeys[i];

			if (attr === 'ref') {
				mountRef(instance, attrs[attr], dom);
			} else {
				patchAttribute(attr, attrs[attr], dom);
			}
		}
	}

	function isVirtualFragment(obj) {
		return !isNullOrUndefined(obj.append);
	}

	function insertOrAppendNonKeyed(parentDom, newNode, nextNode) {
		if (isNullOrUndefined(nextNode)) {
			if (isVirtualFragment(newNode)) {
				newNode.append(parentDom);
			} else {
				parentDom.appendChild(newNode);
			}
		} else {
			if (isVirtualFragment(newNode)) {
				newNode.insert(parentDom, nextNode);
			} else if (isVirtualFragment(nextNode)) {
				parentDom.insertBefore(newNode, nextNode.childNodes[0] || nextNode.dom);
			} else {
				parentDom.insertBefore(newNode, nextNode);
			}
		}
	}

	function insertOrAppendKeyed(parentDom, newNode, nextNode) {
		if (isNullOrUndefined(nextNode)) {
			parentDom.appendChild(newNode);
		} else {
			parentDom.insertBefore(newNode, nextNode);
		}
	}

	function documentCreateElement(tag, isSVG) {
		var dom = void 0;

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
				var _textNode = document.createTextNode(text);

				parentDom.appendChild(_textNode);
				return _textNode;
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
		var dom = mount(nextNode, null, lifecycle, context, instance, isSVG);

		nextNode.dom = dom;
		replaceNode(parentDom, dom, lastNode.dom);
		if (lastInstance !== null) {
			lastInstance._lastNode = nextNode;
		}
		detachNode(lastNode);
	}

	function replaceNode(parentDom, nextDom, lastDom) {
		if (isVirtualFragment(lastDom)) {
			lastDom.replaceWith(nextDom);
		} else {
			parentDom.replaceChild(nextDom, lastDom);
		}
	}

	function detachNode(node) {
		if (isInvalidNode(node) || isStringOrNumber(node)) {
			return;
		}
		var instance = node.instance;

		var instanceHooks = null;
		var instanceChildren = null;
		if (!isNullOrUndefined(instance)) {
			instanceHooks = instance.hooks;
			instanceChildren = instance.children;

			if (instance.render !== void 0) {
				instance.componentWillUnmount();
				instance._unmounted = true;
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
		var children = node.children || instanceChildren;
		if (!isNullOrUndefined(children)) {
			if (isArray(children)) {
				for (var i = 0; i < children.length; i++) {
					detachNode(children[i]);
				}
			} else {
				detachNode(children);
			}
		}
	}

	function createEmptyTextNode() {
		return document.createTextNode('');
	}

	function remove(node, parentDom) {
		var dom = node.dom;
		if (dom === parentDom) {
			dom.innerHTML = '';
		} else {
			parentDom.removeChild(dom);
			if (recyclingEnabled) {
				pool(node);
			}
		}
		detachNode(node);
	}

	function removeEvents(events, lastEventKeys, dom) {
		var eventKeys = lastEventKeys || Object.keys(events);

		for (var i = 0; i < eventKeys.length; i++) {
			var event = eventKeys[i];

			dom[event] = null;
		}
	}

	function insertChildren(parentNode, childNodes, dom) {
		// we need to append all childNodes now
		for (var i = 0; i < childNodes.length; i++) {
			parentNode.insertBefore(childNodes[i], dom);
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
		if (activeNode !== document.body && document.activeElement !== activeNode) {
			activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
		}
	}

	function createVirtualFragment() {
		var childNodes = [];
		var dom = document.createTextNode('');
		var parentNode = null;

		var fragment = {
			dom: dom,
			childNodes: childNodes,
			appendChild: function appendChild(domNode) {
				// TODO we need to check if the domNode already has a parentNode of VirtualFragment so we can remove it
				childNodes.push(domNode);
				if (parentNode) {
					parentNode.insertBefore(domNode, dom);
				}
			},
			removeChild: function removeChild(domNode) {
				if (parentNode) {
					parentNode.removeChild(domNode);
				}
				childNodes.splice(childNodes.indexOf(domNode), 1);
			},
			insertBefore: function insertBefore(domNode, refNode) {
				if (parentNode) {
					parentNode.insertBefore(domNode, refNode);
				}
				childNodes.splice(childNodes.indexOf(refNode), 0, domNode);
			},
			replaceChild: function replaceChild(domNode, refNode) {
				parentNode.replaceChild(domNode, refNode);
				replaceInArray(childNodes, refNode, domNode);
			},
			append: function append(parentDom) {
				parentDom.appendChild(dom);
				parentNode = parentDom;
				insertChildren(parentNode, childNodes, dom);
			},
			insert: function insert(parentDom, refNode) {
				parentDom.insertBefore(dom, refNode);
				parentNode = parentDom;
				insertChildren(parentNode, childNodes, dom);
			},
			remove: function remove() {
				parentNode.removeChild(dom);
				for (var i = 0; i < childNodes.length; i++) {
					parentNode.removeChild(childNodes[i]);
				}
				parentNode = null;
			},
			replaceWith: function replaceWith(newNode) {
				parentNode.replaceChild(newNode, dom);
				for (var i = 0; i < childNodes.length; i++) {
					parentNode.removeChild(childNodes[i]);
				}
				parentNode = null;
			},

			// here to emulate not being a TextNode
			getElementsByTagName: null
		};

		Object.defineProperty(fragment, 'parentNode', {
			get: function get() {
				return parentNode;
			}
		});
		Object.defineProperty(fragment, 'firstChild', {
			get: function get() {
				return childNodes[0];
			}
		});

		return fragment;
	}

	function isKeyed(nextChildren) {
		return nextChildren.length && !isNullOrUndefined(nextChildren[0]) && !isNullOrUndefined(nextChildren[0].key);
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
		for (var _i = 0, _len = vdom.children.length; _i < _len; _i++) {
			selectOptionValueIfNeeded(vdom.children[_i], values);
		}

		if (vdom.attrs && vdom.attrs[value]) {
			delete vdom.attrs.value; // TODO! Avoid deletion here. Set to null or undef. Not sure what you want to usev
		}
	}
	function placeholder(node, parentDom) {
		var dom = createEmptyTextNode();

		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		if (!isInvalidNode(node)) {
			node.dom = dom;
		}
		return dom;
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

	function diffChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG) {
		var nextChildren = nextNode.children;
		var lastChildren = lastNode.children;

		if (lastChildren === nextChildren) {
			return;
		}

		var domChildren = null;

		if (lastNode.domChildren) {
			domChildren = nextNode.domChildren = lastNode.domChildren;
		}
		if (isInvalidNode(lastChildren)) {
			if (isStringOrNumber(nextChildren)) {
				updateTextNode(dom, lastChildren, nextChildren);
			} else if (!isNullOrUndefined(nextChildren)) {
				if (isArray(nextChildren)) {
					mountArrayChildren(nextNode, nextChildren, dom, lifecycle, context, instance, isSVG);
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
						if (domChildren === null && lastChildren.length > 1) {
							patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
						} else {
							if (isKeyed(nextChildren)) {
								patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG);
							} else {
								patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren || (nextNode.domChildren = []), lifecycle, context, instance, 0, isSVG);
							}
						}
					} else {
						patchNonKeyedChildren(lastChildren, [nextChildren], dom, domChildren || [], lifecycle, context, instance, 0);
					}
				} else {
					if (isArray(nextChildren)) {
						patchNonKeyedChildren([lastChildren], nextChildren, dom, domChildren || (nextNode.domChildren = [dom.firstChild]), lifecycle, context, instance, 0, isSVG);
					} else if (isStringOrNumber(nextChildren)) {
						updateTextNode(dom, lastChildren, nextChildren);
					} else if (isStringOrNumber(lastChildren)) {
						patch(lastChildren, nextChildren, dom, lifecycle, context, instance, null, isSVG);
					} else {
						patch(lastChildren, nextChildren, dom, lifecycle, context, instance, true, isSVG);
					}
				}
			}
		}
	}

	function diffRef(instance, lastValue, nextValue, dom) {
		if (instance) {
			if (isString(lastValue)) {
				delete instance.refs[lastValue];
			}
			if (isString(nextValue)) {
				instance.refs[nextValue] = dom;
			}
		}
	}

	function diffEvents(lastNode, nextNode, lastEventKeys, nextEventKeys, dom) {
		var nextEvents = nextNode.events;
		var lastEvents = lastNode.events;
		var nextEventsDefined = !isNullOrUndefined(nextEvents);
		var lastEventsDefined = !isNullOrUndefined(lastEvents);

		if (nextEventsDefined) {
			if (lastEventsDefined) {
				patchEvents(lastEvents, nextEvents, lastEventKeys, nextEventKeys, dom);
			} else {
				mountEvents(nextEvents, nextEventKeys, dom);
			}
		} else if (lastEventsDefined) {
			removeEvents(lastEvents, lastEventKeys, dom);
		}
	}

	function diffAttributes(lastNode, nextNode, lastAttrKeys, nextAttrKeys, dom, instance) {
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
						diffRef(instance, lastAttrVal, nextAttrVal, dom);
					} else {
						patchAttribute(attr, nextAttrVal, dom);
					}
				}
			}
		}
		if (lastAttrsIsNotUndef) {
			var lastAttrsKeys = lastAttrKeys || Object.keys(lastAttrs);
			var _attrKeysLength = lastAttrsKeys.length;

			for (var _i = 0; _i < _attrKeysLength; _i++) {
				var _attr = lastAttrsKeys[_i];

				if (nextAttrsIsUndef || isNullOrUndefined(nextAttrs[_attr])) {
					if (_attr === 'ref') {
						diffRef(instance, lastAttrs[_attr], null, dom);
					} else {
						dom.removeAttribute(_attr);
					}
				}
			}
		}
	}

	function diffNodesWithTemplate(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck) {
		var nextHooks = void 0;

		if (nextNode.hasHooks === true) {
			/* eslint no-cond-assign:0 */
			if (nextHooks = nextNode.hooks && !isNullOrUndefined(nextHooks.willUpdate)) {
				nextHooks.willUpdate(lastNode.dom);
			}
		}
		var nextTag = nextNode.tag || nextBp.tag;
		var lastTag = lastNode.tag || lastBp.tag;

		if (lastTag !== nextTag) {
			if (lastBp.isComponent === true) {
				var lastNodeInstance = lastNode.instance;

				if (nextBp.isComponent === true) {
					replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, false);
					detachNode(lastNode);
				} else if (isStatefulComponent(lastTag)) {
					diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
				} else {
					diffNodes(lastNodeInstance, nextNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
				}
			} else {
				replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, instance, nextBp.isSVG);
			}
		} else if (isNullOrUndefined(lastTag)) {
			nextNode.dom = lastNode.dom;
		} else {
			if (lastBp.isComponent === true) {
				if (nextBp.isComponent === true) {
					var _instance = lastNode.instance;

					if (!isNullOrUndefined(_instance) && _instance._unmounted) {
						var newDom = mountComponent(nextNode, lastTag, nextNode.attrs || {}, nextNode.hooks, nextNode.children, _instance, parentDom, lifecycle, context);
						if (parentDom !== null) {
							replaceNode(parentDom, newDom, lastNode.dom);
						}
					} else {
						nextNode.instance = _instance;
						nextNode.dom = lastNode.dom;
						patchComponent(true, nextNode, nextNode.tag, lastBp, nextBp, _instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
					}
				}
			} else {
				var dom = lastNode.dom;
				var lastChildrenType = lastBp.childrenType;
				var nextChildrenType = nextBp.childrenType;
				nextNode.dom = dom;

				if (nextBp.lazy === true && skipLazyCheck === false) {
					var clipData = lastNode.clipData;

					if (lifecycle.scrollY === null) {
						lifecycle.refresh();
					}

					nextNode.clipData = clipData;
					if (clipData.pending === true || clipData.top - lifecycle.scrollY > lifecycle.screenHeight) {
						if (setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle)) {
							return;
						}
					}
					if (clipData.bottom < lifecycle.scrollY) {
						if (setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle)) {
							return;
						}
					}
				}

				if (lastChildrenType > 0 || nextChildrenType > 0) {
					if (nextChildrenType === 5 || lastChildrenType === 5) {
						diffChildren(lastNode, nextNode, dom, lifecycle, context, instance);
					} else {
						var lastChildren = lastNode.children;
						var nextChildren = nextNode.children;

						if (lastChildrenType === 0 || isInvalidNode(lastChildren)) {
							if (nextChildrenType > 2) {
								mountArrayChildren(nextNode, nextChildren, dom, lifecycle, context, instance);
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
									patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance);
								} else if (lastChildrenType === 2 && nextChildrenType === 2) {
									patch(lastChildren, nextChildren, dom, lifecycle, context, instance, true, false);
								} else if (lastChildrenType === 1 && nextChildrenType === 1) {
									updateTextNode(dom, lastChildren, nextChildren);
								} else {
									diffChildren(lastNode, nextNode, dom, lifecycle, context, instance);
								}
							}
						}
					}
				}
				if (lastBp.hasAttrs === true || nextBp.hasAttrs === true) {
					diffAttributes(lastNode, nextNode, lastBp.attrKeys, nextBp.attrKeys, dom, instance);
				}
				if (lastBp.hasEvents === true || nextBp.hasEvents === true) {
					diffEvents(lastNode, nextNode, lastBp.eventKeys, nextBp.eventKeys, dom);
				}
				if (lastBp.hasClassName === true || nextBp.hasClassName === true) {
					var nextClassName = nextNode.className;

					if (lastNode.className !== nextClassName) {
						if (isNullOrUndefined(nextClassName)) {
							dom.removeAttribute('class');
						} else {
							dom.className = nextClassName;
						}
					}
				}
				if (lastBp.hasStyle === true || nextBp.hasStyle === true) {
					var nextStyle = nextNode.style;

					if (lastNode.style !== nextStyle) {
						patchStyle(lastNode.style, nextStyle, dom);
					}
				}
				if (nextNode.hasHooks === true && !isNullOrUndefined(nextHooks.didUpdate)) {
					nextHooks.didUpdate(dom);
				}
				setFormElementProperties(nextTag, nextNode);
			}
		}
	}

	function diffNodes(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG) {
		if (isPromise(nextNode)) {
			nextNode.then(function (node) {
				patch(lastNode, node, parentDom, lifecycle, context, instance, null, false);
			});
		} else {
			var nextHooks = nextNode.hooks;
			var nextHooksDefined = !isNullOrUndefined(nextHooks);

			if (nextHooksDefined && !isNullOrUndefined(nextHooks.willUpdate)) {
				nextHooks.willUpdate(lastNode.dom);
			}
			var nextTag = nextNode.tag || (isNullOrUndefined(nextNode.bp) ? null : nextNode.bp.tag);
			var lastTag = lastNode.tag || (isNullOrUndefined(lastNode.bp) ? null : lastNode.bp.tag);

			if (nextTag === 'svg') {
				isSVG = true;
			}

			if (lastTag !== nextTag) {
				var lastNodeInstance = lastNode.instance;

				if (isFunction(lastTag)) {
					if (isFunction(nextTag)) {
						replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
					} else if (isStatefulComponent(lastTag)) {
						diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
					} else {
						diffNodes(lastNodeInstance, nextNode, parentDom, lifecycle, context, instance, isSVG);
					}
				} else {
					replaceWithNewNode(lastNodeInstance || lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
				}
			} else if (isNullOrUndefined(lastTag)) {
				nextNode.dom = lastNode.dom;
			} else {
				if (isFunction(lastTag)) {
					if (isFunction(nextTag)) {
						var _instance2 = lastNode._instance;

						if (!isNullOrUndefined(_instance2) && _instance2._unmounted) {
							var newDom = mountComponent(nextNode, lastTag, nextNode.attrs || {}, nextNode.hooks, nextNode.children, _instance2, parentDom, lifecycle, context);
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

					diffChildren(lastNode, nextNode, dom, lifecycle, context, instance, isSVG);
					diffAttributes(lastNode, nextNode, null, null, dom, instance);
					diffEvents(lastNode, nextNode, null, null, dom);

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
	}

	function constructDefaults(string, object, value) {
		/* eslint no-return-assign: 0 */
		string.split(',').forEach(function (i) {
			return object[i] = value;
		});
	}

	var xlinkNS = 'http://www.w3.org/1999/xlink';
	var xmlNS = 'http://www.w3.org/XML/1998/namespace';
	var strictProps = {};
	var booleanProps = {};
	var namespaces = {};

	constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
	constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
	constructDefaults('volume,value', strictProps, true);
	constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);

	function updateTextNode(dom, lastChildren, nextChildren) {
		if (isStringOrNumber(lastChildren)) {
			dom.firstChild.nodeValue = nextChildren;
		} else {
			dom.textContent = nextChildren;
		}
	}

	function patchNode(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG, skipLazyCheck) {
		var lastBp = lastNode.bp;
		var nextBp = nextNode.bp;

		if (lastBp === void 0 || nextBp === void 0) {
			diffNodes(lastNode, nextNode, parentDom, lifecycle, context, instance, isSVG);
		} else {
			diffNodesWithTemplate(lastNode, nextNode, lastBp, nextBp, parentDom, lifecycle, context, instance, skipLazyCheck);
		}
	}

	function patch(lastInput, nextInput, parentDom, lifecycle, context, instance, isNode, isSVG) {
		if (isNode !== null) {
			patchNode(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG, false);
		} else if (isInvalidNode(lastInput)) {
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
			var textNode = document.createTextNode(nextInput);
			replaceNode(parentDom, textNode, lastInput.dom);
		} else {
			patchNode(lastInput, nextInput, parentDom, lifecycle, context, instance, isSVG, false);
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

					dom.style[style] = nextAttrValue[style];
				}
			}
		} else if (isNullOrUndefined(nextAttrValue)) {
			dom.removeAttribute('style');
		} else {
			var _styleKeys = Object.keys(nextAttrValue);

			for (var _i = 0; _i < _styleKeys.length; _i++) {
				var _style = _styleKeys[_i];

				dom.style[_style] = nextAttrValue[_style];
			}
			// TODO: possible optimization could be we remove all and add all from nextKeys then we can skip this obj loop
			// TODO: needs performance benchmark
			var lastStyleKeys = Object.keys(lastAttrValue);

			for (var _i2 = 0; _i2 < lastStyleKeys.length; _i2++) {
				var _style2 = lastStyleKeys[_i2];
				if (isNullOrUndefined(nextAttrValue[_style2])) {
					dom.style[_style2] = '';
				}
			}
		}
	}

	function patchEvents(lastEvents, nextEvents, _lastEventKeys, _nextEventKeys, dom) {
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

		for (var _i3 = 0; _i3 < lastEventKeys.length; _i3++) {
			var _event = lastEventKeys[_i3];

			if (isNullOrUndefined(nextEvents[_event])) {
				dom[_event] = null;
			}
		}
	}

	function patchAttribute(attrName, nextAttrValue, dom) {
		if (strictProps[attrName]) {
			dom[attrName] = nextAttrValue === null ? '' : nextAttrValue;
		} else {
			if (booleanProps[attrName]) {
				dom[attrName] = nextAttrValue ? true : false;
			} else {
				var ns = namespaces[attrName];

				if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
					if (ns !== void 0) {
						dom.removeAttributeNS(ns, attrName);
					} else {
						dom.removeAttribute(attrName);
					}
				} else {
					if (ns !== void 0) {
						dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
					} else {
						dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
					}
				}
			}
		}
	}

	function patchComponent(hasTemplate, lastNode, Component, lastBp, nextBp, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
		nextProps = addChildrenToProps(nextChildren, nextProps);

		if (isStatefulComponent(Component)) {
			var prevProps = instance.props;
			var prevState = instance.state;
			var nextState = instance.state;

			var childContext = instance.getChildContext();
			if (!isNullOrUndefined(childContext)) {
				context = babelHelpers.extends({}, context, childContext);
			}
			instance.context = context;
			var nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

			if (!isInvalidNode(nextNode)) {
				patch(instance._lastNode, nextNode, parentDom, lifecycle, context, instance, null, false);
				lastNode.dom = nextNode.dom;
				instance._lastNode = nextNode;
			}
		} else {
			var shouldUpdate = true;
			var nextHooksDefined = hasTemplate && nextBp.hasHooks === true || !isNullOrUndefined(nextHooks);

			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
				shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
					nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
				}

				var _nextNode = Component(nextProps);

				if (!isInvalidNode(_nextNode)) {
					var dom = lastNode.dom;

					_nextNode.dom = dom;
					patch(instance, _nextNode, parentDom, lifecycle, context, null, null, false);
					lastNode.instance = _nextNode;
					if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
						nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
					}
				}
			}
		}
	}

	function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, lifecycle, context, instance, domChildrenIndex, isSVG) {
		var isNotVirtualFragment = dom.append === void 0;
		var lastChildrenLength = lastChildren.length;
		var nextChildrenLength = nextChildren.length;
		var sameLength = lastChildrenLength === nextChildrenLength;

		if (sameLength === false) {
			if (lastChildrenLength > nextChildrenLength) {
				while (lastChildrenLength !== nextChildrenLength) {
					var lastChild = lastChildren[lastChildrenLength - 1];

					if (!isInvalidNode(lastChild)) {
						dom.removeChild(domChildren[lastChildrenLength - 1 + domChildrenIndex]);
						if (isNotVirtualFragment) {
							domChildren.splice(lastChildrenLength - 1 + domChildrenIndex, 1);
						}
						detachNode(lastChild);
						lastChildrenLength--;
						lastChildren.pop();
					}
				}
			} else {
				while (lastChildrenLength !== nextChildrenLength) {
					var nextChild = nextChildren[lastChildrenLength];
					var domNode = void 0;

					lastChildren.push(nextChild);
					if (isStringOrNumber(nextChild)) {
						domNode = document.createTextNode(nextChild);
					} else {
						domNode = mount(nextChild, null, context, instance, isSVG);
					}

					if (!isInvalidNode(domNode)) {
						insertOrAppendNonKeyed(dom, domNode);
					}
					if (isNotVirtualFragment) {
						if (lastChildrenLength === 1) {
							domChildren.push(dom.firstChild);
						}
						isNotVirtualFragment && domChildren.splice(lastChildrenLength + domChildrenIndex, 0, domNode);
					}
					lastChildrenLength++;
				}
			}
		}
		for (var i = 0; i < nextChildrenLength; i++) {
			var _lastChild = lastChildren[i];
			var _nextChild = nextChildren[i];
			var index = i + domChildrenIndex;

			if (_lastChild !== _nextChild) {
				if (isInvalidNode(_nextChild)) {
					if (!isInvalidNode(_lastChild)) {
						if (isArray(_lastChild) && _lastChild.length === 0) {
							for (var j = 0; j < _lastChild.length; j++) {
								remove(_lastChild[j], dom);
							}
						} else {
							var childNode = domChildren[index];

							if (isNullOrUndefined(childNode)) {
								index--;
							}
							dom.removeChild(domChildren[index]);
							if (isNotVirtualFragment) {
								domChildren.splice(index, 1);
								domChildrenIndex--;
							}
							detachNode(_lastChild);
						}
					}
				} else {
					if (isInvalidNode(_lastChild)) {
						if (isStringOrNumber(_nextChild)) {
							var textNode = document.createTextNode(_nextChild);
							var domChild = domChildren[index];

							if (isNullOrUndefined(domChild)) {
								// TODO move to next node if need be
								var _nextChild2 = domChildren[index + 1];
								insertOrAppendNonKeyed(dom, textNode, _nextChild2);
								isNotVirtualFragment && domChildren.splice(index, 1, textNode);
							} else {
								insertOrAppendNonKeyed(dom, textNode, domChild);
								isNotVirtualFragment && domChildren.splice(index, 0, textNode);
							}
						} else {
							var _domNode = mount(_nextChild, null, lifecycle, context, instance, isSVG);
							var _domChild = domChildren[index];

							if (isNullOrUndefined(_domChild)) {
								// TODO move to next node if need be
								var _nextChild3 = domChildren[index + 1];
								insertOrAppendNonKeyed(dom, _domNode, _nextChild3);
								isNotVirtualFragment && domChildren.splice(index, 1, _domNode);
							} else {
								insertOrAppendNonKeyed(dom, _domNode, _domChild);
								isNotVirtualFragment && domChildren.splice(index, 0, _domNode);
							}
						}
					} else if (isStringOrNumber(_nextChild)) {
						if (lastChildrenLength === 1) {
							if (isStringOrNumber(_lastChild)) {
								if (dom.getElementsByTagName === void 0) {
									dom.nodeValue = _nextChild;
								} else {
									dom.firstChild.nodeValue = _nextChild;
								}
							} else {
								detachNode(_lastChild);
								dom.textContent = _nextChild;
							}
						} else {
							var _textNode = document.createTextNode(_nextChild);
							var child = domChildren[index];

							if (isNullOrUndefined(child)) {
								dom.nodeValue = _textNode.nodeValue;
							} else {
								if (isStringOrNumber(_lastChild)) {
									child.nodeValue = _nextChild;
								} else {
									// Next is single string so remove all children
									if (child.append === void 0) {
										isNotVirtualFragment && domChildren.splice(index, 1, _textNode);
										replaceNode(dom, _textNode, child);
									} else {
										// If previous child is virtual fragment remove all its content and replace with textNode
										insertOrAppendNonKeyed(dom, _textNode, child.firstChild);
										child.remove();
										domChildren.splice(0, domChildren.length, _textNode);
									}
								}
							}
							detachNode(_lastChild);
						}
					} else if (isArray(_nextChild)) {
						if (isKeyed(_nextChild)) {
							patchKeyedChildren(_lastChild, _nextChild, domChildren[index], lifecycle, context, instance, isSVG);
						} else {
							if (isArray(_lastChild)) {
								var _domChild2 = domChildren[index];

								if (_domChild2.append === void 0) {
									if (_nextChild.length > 1 && _lastChild.length === 1) {
										var virtualFragment = createVirtualFragment();

										virtualFragment.insert(dom, _domChild2);
										virtualFragment.appendChild(_domChild2);
										isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
										patchNonKeyedChildren(_lastChild, _nextChild, virtualFragment, virtualFragment.childNodes, lifecycle, context, instance, 0, isSVG);
									} else {
										patchNonKeyedChildren(_lastChild, _nextChild, dom, domChildren, lifecycle, context, instance, 0, isSVG);
									}
								} else {
									patchNonKeyedChildren(_lastChild, _nextChild, domChildren[index], domChildren[index].childNodes, lifecycle, context, instance, 0, isSVG);
								}
							} else {
								if (_nextChild.length > 1) {
									var _virtualFragment = createVirtualFragment();
									_virtualFragment.appendChild(dom.firstChild);
									insertOrAppendNonKeyed(dom, _virtualFragment, dom.firstChild);
									isNotVirtualFragment && domChildren.splice(index, 1, _virtualFragment);
									patchNonKeyedChildren([_lastChild], _nextChild, _virtualFragment, _virtualFragment.childNodes, lifecycle, context, instance, i, isSVG);
								} else {
									patchNonKeyedChildren([_lastChild], _nextChild, dom, domChildren, lifecycle, context, instance, i, isSVG);
								}
							}
						}
					} else {
						if (isArray(_lastChild)) {
							patchNonKeyedChildren(_lastChild, [_nextChild], domChildren, domChildren[index].childNodes, lifecycle, context, instance, 0, isSVG);
						} else {
							patch(_lastChild, _nextChild, dom, lifecycle, context, instance, null, isSVG);
						}
					}
				}
			}
		}
	}

	function patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, instance, isSVG) {
		var lastChildrenLength = lastChildren.length;
		var nextChildrenLength = nextChildren.length;
		var i = void 0;
		var lastEndIndex = lastChildrenLength - 1;
		var nextEndIndex = nextChildrenLength - 1;
		var lastStartIndex = 0;
		var nextStartIndex = 0;
		var lastStartNode = null;
		var nextStartNode = null;
		var nextEndNode = null;
		var lastEndNode = null;
		var index = void 0;
		var nextNode = void 0;
		var lastTarget = 0;
		var pos = void 0;
		var prevItem = void 0;

		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextStartNode = nextChildren[nextStartIndex];
			lastStartNode = lastChildren[lastStartIndex];

			if (nextStartNode.key !== lastStartNode.key) {
				break;
			}

			patch(lastStartNode, nextStartNode, dom, lifecycle, context, instance, true, isSVG);
			nextStartIndex++;
			lastStartIndex++;
		}

		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextEndNode = nextChildren[nextEndIndex];
			lastEndNode = lastChildren[lastEndIndex];

			if (nextEndNode.key !== lastEndNode.key) {
				break;
			}

			patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
			nextEndIndex--;
			lastEndIndex--;
		}

		while (lastStartIndex <= lastEndIndex && nextStartIndex <= nextEndIndex) {
			nextEndNode = nextChildren[nextEndIndex];
			lastStartNode = lastChildren[lastStartIndex];

			if (nextEndNode.key !== lastStartNode.key) {
				break;
			}

			nextNode = nextEndIndex + 1 < nextChildrenLength ? nextChildren[nextEndIndex + 1].dom : null;
			patch(lastStartNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
			insertOrAppendKeyed(dom, nextEndNode.dom, nextNode);
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
			patch(lastEndNode, nextStartNode, dom, lifecycle, context, instance, true, isSVG);
			insertOrAppendKeyed(dom, nextStartNode.dom, nextNode);
			nextStartIndex++;
			lastEndIndex--;
		}

		if (lastStartIndex > lastEndIndex) {
			if (nextStartIndex <= nextEndIndex) {
				nextNode = nextEndIndex + 1 < nextChildrenLength ? nextChildren[nextEndIndex + 1].dom : null;
				for (; nextStartIndex <= nextEndIndex; nextStartIndex++) {
					insertOrAppendKeyed(dom, mount(nextChildren[nextStartIndex], null, lifecycle, context, instance, isSVG), nextNode);
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
			for (i = 0; i < bLength; i++) {
				sources[i] = -1;
			}

			var moved = false;
			var removeOffset = 0;

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
							patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
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
					prevItem = nextChildren[i];
					prevItemsMap.set(prevItem.key, i);
				}

				for (i = lastEndIndex; i >= lastStartIndex; i--) {
					lastEndNode = lastChildren[i];
					index = prevItemsMap.get(lastEndNode.key);

					if (index === void 0) {
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
						patch(lastEndNode, nextEndNode, dom, lifecycle, context, instance, true, isSVG);
					}
				}
			}

			if (moved) {
				var seq = lis_algorithm(sources);
				index = seq.length - 1;
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + nextStartIndex;
						nextNode = pos + 1 < nextChildrenLength ? nextChildren[pos + 1].dom : null;
						insertOrAppendKeyed(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
					} else {
						if (index < 0 || i !== seq[index]) {
							pos = i + nextStartIndex;
							nextNode = pos + 1 < nextChildrenLength ? nextChildren[pos + 1].dom : null;
							insertOrAppendKeyed(dom, nextChildren[pos].dom, nextNode);
						} else {
							index--;
						}
					}
				}
			} else if (aLength - removeOffset !== bLength) {
				for (i = bLength - 1; i >= 0; i--) {
					if (sources[i] === -1) {
						pos = i + nextStartIndex;
						nextNode = pos + 1 < nextChildrenLength ? nextChildren[pos + 1].dom : null;
						insertOrAppendKeyed(dom, mount(nextChildren[pos], null, lifecycle, context, instance, isSVG), nextNode);
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
		var i = void 0;
		var j = void 0;
		var u = void 0;
		var v = void 0;
		var c = void 0;

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
				c = (u + v) / 2 | 0;
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

	var screenWidth = window.screen.width;
	var screenHeight = window.screen.height;
	var scrollX = 0;
	var scrollY = 0;
	var lastScrollTime = 0;

	window.onscroll = function (e) {
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		lastScrollTime = performance.now();
	};

	window.resize = function (e) {
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		screenWidth = window.screen.width;
		screenHeight = window.screen.height;
		lastScrollTime = performance.now();
	};

	function Lifecycle() {
		this._listeners = [];
		this.scrollX = null;
		this.scrollY = null;
		this.screenHeight = screenHeight;
		this.screenWidth = screenWidth;
	}

	Lifecycle.prototype = {
		refresh: function refresh() {
			this.scrollX = window.scrollX;
			this.scrollY = window.scrollY;
		},
		addListener: function addListener(callback) {
			this._listeners.push(callback);
		},
		trigger: function trigger() {
			for (var i = 0; i < this._listeners.length; i++) {
				this._listeners[i]();
			}
		}
	};

	var lazyNodeMap = new Map();
	var lazyCheckRunning = false;

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

	function patchLazyNode(value) {
		patchNode(value.lastNode, value.nextNode, value.parentDom, value.lifecycle, null, null, false, true);
		value.clipData.pending = false;
	}

	function runPatchLazyNodes() {
		lazyCheckRunning = true;
		setTimeout(patchLazyNodes, 100);
	}

	function patchLazyNodes() {
		lazyNodeMap.forEach(patchLazyNode);
		lazyNodeMap.clear();
		lazyCheckRunning = false;
	}

	function setClipNode(clipData, dom, lastNode, nextNode, parentDom, lifecycle) {
		if (performance.now() > lastScrollTime + 2000) {
			var lazyNodeEntry = lazyNodeMap.get(dom);

			if (lazyNodeEntry === void 0) {
				lazyNodeMap.set(dom, { lastNode: lastNode, nextNode: nextNode, parentDom: parentDom, clipData: clipData, lifecycle: lifecycle });
			} else {
				lazyNodeEntry.nextNode = nextNode;
			}
			clipData.pending = true;
			if (lazyCheckRunning === false) {
				runPatchLazyNodes();
			}
			return true;
		} else {
			patchLazyNodes();
		}
		return false;
	}

	var roots = [];

	function getRoot(parentDom) {
		for (var i = 0; i < roots.length; i++) {
			var root = roots[i];

			if (root.dom === parentDom) {
				return root;
			}
		}
		return null;
	}

	function removeRoot(rootNode) {
		for (var i = 0; i < roots.length; i++) {
			var root = roots[i];

			if (root === rootNode) {
				roots.splice(i, 1);
				return;
			}
		}
	}

	function render(node, parentDom) {
		var root = getRoot(parentDom);
		var lifecycle = new Lifecycle();

		if (root === null) {
			mount(node, parentDom, lifecycle, {}, null, false);
			lifecycle.trigger();
			roots.push({ node: node, dom: parentDom });
		} else {
			var activeNode = getActiveNode();

			patch(root.node, node, parentDom, lifecycle, {}, null, null, false);
			lifecycle.trigger();
			if (node === null) {
				removeRoot(root);
			}
			root.node = node;
			window.node = node;
			resetActiveNode(activeNode);
		}
	}

	var index = {
		render: render
	};

	return index;

}));