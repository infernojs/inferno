/*!
 * inferno-dom v0.6.5
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

	// TODO! Use object literal or at least prototype? --- class is prototype (jsperf needed for perf verification)

	var Lifecycle = function () {
		function Lifecycle() {
			babelHelpers.classCallCheck(this, Lifecycle);

			this._listeners = [];
		}

		babelHelpers.createClass(Lifecycle, [{
			key: "addListener",
			value: function addListener(callback) {
				this._listeners.push(callback);
			}
		}, {
			key: "trigger",
			value: function trigger() {
				for (var i = 0; i < this._listeners.length; i++) {
					this._listeners[i]();
				}
			}
		}]);
		return Lifecycle;
	}();

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
		return !isNullOrUndefined(obj) && !isNullOrUndefined(obj.prototype.render);
	}

	function isStringOrNumber(obj) {
		return typeof obj === 'string' || typeof obj === 'number';
	}

	function isNullOrUndefined(obj) {
		return obj === undefined || obj === null;
	}

	function isInvalidNode(obj) {
		return obj === undefined || obj === null || obj === false;
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

	function isPromise(obj) {
		return obj instanceof Promise;
	}

	function replaceInArray(array, obj, newObj) {
		array.splice(array.indexOf(obj), 1, newObj);
	}

	/*
	export function removeInArray(array, obj) {
		array.splice(array.indexOf(obj), 1);
	}
	*/

	var MathNamespace = 'http://www.w3.org/1998/Math/MathML';
	var SVGNamespace = 'http://www.w3.org/2000/svg';

	function isVirtualFragment(obj) {
		return !isNullOrUndefined(obj.append);
	}

	function insertOrAppend(parentDom, newNode, nextNode) {
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
				parentDom.insertBefore(newNode, nextNode.childNodes[0]);
			} else {
				parentDom.insertBefore(newNode, nextNode);
			}
		}
	}

	function createElement(tag, namespace) {
		if (isNullOrUndefined(namespace)) {
			return document.createElement(tag);
		} else {
			return document.createElementNS(namespace, tag);
		}
	}

	function appendText(text, parentDom, singleChild) {
		if (parentDom) {
			if (singleChild) {
				if (text !== '') {
					parentDom.textContent = text;
				} else {
					var textNode = document.createTextNode('');

					parentDom.appendChild(textNode);
					return textNode;
				}
			} else {
				var textNode = document.createTextNode(text);

				parentDom.appendChild(textNode);
				return textNode;
			}
		} else {
			return document.createTextNode(text);
		}
	}

	function replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance) {
		var lastInstance = null;
		var instanceLastNode = lastNode._lastNode;

		if (!isNullOrUndefined(instanceLastNode)) {
			lastInstance = lastNode;
			lastNode = instanceLastNode;
		}
		var dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);

		nextNode.dom = dom;
		parentDom.replaceChild(dom, lastNode.dom);
		if (lastInstance !== null) {
			lastInstance._lastNode = nextNode;
		}
		detachNode(lastNode);
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

			if (instance.render !== undefined) {
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

	function removeEvents(lastEvents, dom) {
		for (var event in lastEvents) {
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

	function isKeyed(lastChildren, nextChildren) {
		return nextChildren.length && !isNullOrUndefined(nextChildren[0]) && !isNullOrUndefined(nextChildren[0].key) || lastChildren.length && !isNullOrUndefined(lastChildren[0]) && !isNullOrUndefined(lastChildren[0].key);
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
		}
	}

	function selectValue(vdom) {
		if (vdom.tag !== 'select') {
			return;
		}
		var value = vdom.attrs && vdom.attrs.value;

		if (isNullOrUndefined(value)) {
			return;
		}

		var values = {};
		if (!isArray(value)) {
			values[value] = value;
		} else {
			for (var i = 0, len = value.length; i < len; i++) {
				values[value[i]] = value[i];
			}
		}
		selectOptionValueIfNeeded(vdom, values);

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

	function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, staticCheck) {
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
					mountArrayChildren(nextNode, nextChildren, dom, namespace, lifecycle, context, instance);
				} else {
					mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
				}
			}
		} else {
			if (isInvalidNode(nextChildren)) {
				dom.textContent = '';
			} else {
				if (isArray(lastChildren)) {
					if (isArray(nextChildren)) {
						if (domChildren === null && lastChildren.length > 1) {
							patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
						} else {
							if (isKeyed(lastChildren, nextChildren)) {
								patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
							} else {
								patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren || (nextNode.domChildren = []), namespace, lifecycle, context, instance, 0);
							}
						}
					} else {
						patchNonKeyedChildren(lastChildren, [nextChildren], dom, domChildren || [], namespace, lifecycle, context, instance, 0);
					}
				} else {
					if (isArray(nextChildren)) {
						patchNonKeyedChildren([lastChildren], nextChildren, dom, domChildren || (nextNode.domChildren = [dom.firstChild]), namespace, lifecycle, context, instance, 0);
					} else if (isStringOrNumber(nextChildren)) {
						updateTextNode(dom, lastChildren, nextChildren);
					} else if (isStringOrNumber(lastChildren)) {
						patchNode(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance, null);
					} else {
						patchNode(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance, staticCheck);
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

	function diffEvents(lastNode, nextNode, dom) {
		var nextEvents = nextNode.events;
		var lastEvents = lastNode.events;
		var nextEventsDefined = !isNullOrUndefined(nextEvents);
		var lastEventsDefined = !isNullOrUndefined(lastEvents);

		if (nextEventsDefined) {
			if (lastEventsDefined) {
				patchEvents(lastEvents, nextEvents, dom);
			} else {
				mountEvents(nextEvents, dom);
			}
		} else if (lastEventsDefined) {
			removeEvents(lastEvents, dom);
		}
	}

	function diffAttributes(lastNode, nextNode, dom, instance) {
		if (lastNode.tag === 'select') {
			selectValue(nextNode);
		}
		var nextAttrs = nextNode.attrs;
		var lastAttrs = lastNode.attrs;
		var nextAttrsIsUndef = isNullOrUndefined(nextAttrs);
		var lastAttrsIsUndef = isNullOrUndefined(lastAttrs);

		if (!nextAttrsIsUndef) {
			var nextAttrsKeys = Object.keys(nextAttrs);
			var attrKeysLength = nextAttrsKeys.length;

			for (var i = 0; i < attrKeysLength; i++) {
				var attr = nextAttrsKeys[i];
				var lastAttrVal = !lastAttrsIsUndef && lastAttrs[attr];
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
		if (!lastAttrsIsUndef) {
			var lastAttrsKeys = Object.keys(lastAttrs);
			var attrKeysLength = lastAttrsKeys.length;

			for (var i = 0; i < attrKeysLength; i++) {
				var attr = lastAttrsKeys[i];

				if (nextAttrsIsUndef || isNullOrUndefined(nextAttrs[attr])) {
					if (attr === 'ref') {
						diffRef(instance, lastAttrs[attr], null, dom);
					} else {
						dom.removeAttribute(attr);
					}
				}
			}
		}
	}

	function diffNodesWithTemplate(lastNode, nextNode, lastTpl, nextTpl, parentDom, namespace, lifecycle, context, instance, deepCheck) {
		var nextHooks = undefined;

		if (nextNode.hasHooks === true && (nextHooks = nextNode.hooks && !isNullOrUndefined(nextHooks.willUpdate))) {
			nextHooks.willUpdate(lastNode.dom);
		}
		var nextTag = nextNode.tag || deepCheck && lastTpl.tag;
		var lastTag = lastNode.tag || deepCheck && nextTpl.tag;

		if (lastTag !== nextTag) {
			if (lastNode.tpl.isComponent === true) {
				var lastNodeInstance = lastNode.instance;

				if (nextTpl.isComponent === true) {
					replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
				} else if (isStatefulComponent(lastTag)) {
					diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, true);
				} else {
					diffNodes(lastNodeInstance, nextNode, parentDom, namespace, lifecycle, context, instance, true);
				}
			} else {
				replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
			}
		} else if (isNullOrUndefined(lastTag)) {
			nextNode.dom = lastNode.dom;
		} else {
			if (lastTpl.isComponent === true) {
				if (nextTpl.isComponent === true) {
					nextNode.instance = lastNode.instance;
					nextNode.dom = lastNode.dom;
					patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
				}
			} else {
				var dom = lastNode.dom;
				nextNode.dom = dom;

				if (lastTpl.childrenType > 0) {
					diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, deepCheck);
				}
				if (lastTpl.hasAttrs === true) {
					diffAttributes(lastNode, nextNode, dom, instance);
				}
				if (lastTpl.hasEvents === true) {
					diffEvents(lastNode, nextNode, dom);
				}
				if (lastTpl.hasClassName === true) {
					var nextClassName = nextNode.className;

					if (lastNode.className !== nextClassName) {
						if (isNullOrUndefined(nextClassName)) {
							dom.removeAttribute('class');
						} else {
							dom.className = nextClassName;
						}
					}
				}
				if (lastTpl.hasStyle === true) {
					var nextStyle = nextNode.style;

					if (lastNode.style !== nextStyle) {
						patchStyle(lastNode.style, nextStyle, dom);
					}
				}
				if (nextNode.hasHooks === true && !isNullOrUndefined(nextHooks.didUpdate)) {
					nextHooks.didUpdate(dom);
				}
			}
		}
	}

	function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, deepCheck) {
		if (isPromise(nextNode)) {
			nextNode.then(function (node) {
				diffNodes(lastNode, node, parentDom, namespace, lifecycle, context, deepCheck, instance);
			});
		} else {
			var nextHooks = nextNode.hooks;
			var nextHooksDefined = !isNullOrUndefined(nextHooks);

			if (nextHooksDefined && !isNullOrUndefined(nextHooks.willUpdate)) {
				nextHooks.willUpdate(lastNode.dom);
			}
			var nextTag = nextNode.tag || (deepCheck && !isNullOrUndefined(nextNode.tpl) ? nextNode.tpl.tag : null);
			var lastTag = lastNode.tag || (deepCheck && !isNullOrUndefined(lastNode.tpl) ? lastNode.tpl.tag : null);

			namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;

			if (lastTag !== nextTag) {
				var lastNodeInstance = lastNode.instance;

				if (isFunction(lastTag)) {
					if (isFunction(nextTag)) {
						replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
					} else if (isStatefulComponent(lastTag)) {
						diffNodes(lastNodeInstance._lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, true);
					} else {
						diffNodes(lastNodeInstance, nextNode, parentDom, namespace, lifecycle, context, instance, true);
					}
				} else {
					replaceNode(lastNodeInstance || lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
				}
			} else if (isNullOrUndefined(lastTag)) {
				nextNode.dom = lastNode.dom;
			} else {
				if (isFunction(lastTag)) {
					// Firefox doesn't like && too much
					if (isFunction(nextTag)) {
						nextNode.instance = lastNode.instance;
						nextNode.dom = lastNode.dom;
						patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
					}
				} else {
					var dom = lastNode.dom;
					var nextClassName = nextNode.className;
					var nextStyle = nextNode.style;

					nextNode.dom = dom;

					diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, instance, deepCheck);
					diffAttributes(lastNode, nextNode, dom, instance);
					diffEvents(lastNode, nextNode, dom);

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
				}
			}
		}
	}

	// Checks if property is boolean type
	function booleanProps(prop) {
		switch (prop.length) {
			case 5:
				return prop === 'value';
			case 7:
				return prop === 'checked';
			case 8:
				return prop === 'disabled' || prop === 'selected';
			default:
				return false;
		}
	}

	function updateTextNode(dom, lastChildren, nextChildren) {
		if (isStringOrNumber(lastChildren)) {
			dom.firstChild.nodeValue = nextChildren;
		} else {
			dom.textContent = nextChildren;
		}
	}

	function patchNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, deepCheck) {
		if (deepCheck !== null) {
			var lastTpl = lastNode.tpl;
			var nextTpl = nextNode.tpl;

			if (lastTpl === undefined) {
				diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, true);
			} else {
				diffNodesWithTemplate(lastNode, nextNode, lastTpl, nextTpl, parentDom, namespace, lifecycle, context, instance, true);
			}
		} else if (isInvalidNode(lastNode)) {
			mountNode(nextNode, parentDom, namespace, lifecycle, context, instance);
		} else if (isInvalidNode(nextNode)) {
			remove(lastNode, parentDom);
		} else if (isStringOrNumber(lastNode)) {
			if (isStringOrNumber(nextNode)) {
				parentDom.firstChild.nodeValue = nextNode;
			} else {
				var dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);
				nextNode.dom = dom;
				parentDom.replaceChild(dom, parentDom.firstChild);
			}
		} else if (isStringOrNumber(nextNode)) {
			var textNode = document.createTextNode(nextNode);
			parentDom.replaceChild(textNode, lastNode.dom);
		} else {
			var lastTpl = lastNode.tpl;
			var nextTpl = nextNode.tpl;
			var _deepCheck = lastTpl !== nextTpl;

			if (lastTpl === undefined) {
				diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance, _deepCheck);
			} else {
				diffNodesWithTemplate(lastNode, nextNode, lastTpl, nextTpl, parentDom, namespace, lifecycle, context, instance, _deepCheck);
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

					dom.style[style] = value;
				}
			}
		} else if (isNullOrUndefined(nextAttrValue)) {
			dom.removeAttribute('style');
		} else {
			var styleKeys = Object.keys(nextAttrValue);

			for (var i = 0; i < styleKeys.length; i++) {
				var style = styleKeys[i];
				var value = nextAttrValue[style];

				dom.style[style] = value;
			}
			// TODO: possible optimization could be we remove all and add all from nextKeys then we can skip this obj loop
			// TODO: needs performance benchmark
			var lastStyleKeys = Object.keys(lastAttrValue);

			for (var i = 0; i < lastStyleKeys.length; i++) {
				var style = lastStyleKeys[i];
				if (isNullOrUndefined(nextAttrValue[style])) {
					dom.style[style] = '';
				}
			}
		}
	}

	function patchEvents(lastEvents, nextEvents, dom) {
		var nextEventKeys = Object.keys(nextEvents);

		for (var i = 0; i < nextEventKeys.length; i++) {
			var event = nextEventKeys[i];
			var lastEvent = lastEvents[event];
			var nextEvent = nextEvents[event];

			if (lastEvent !== nextEvent) {
				dom[event] = nextEvent;
			}
		}
		var lastEventKeys = Object.keys(lastEvents);

		for (var i = 0; i < lastEventKeys.length; i++) {
			var event = lastEventKeys[i];

			if (isNullOrUndefined(nextEvents[event])) {
				dom[event] = null;
			}
		}
	}

	function patchAttribute(attrName, nextAttrValue, dom) {
		if (!isAttrAnEvent(attrName)) {
			if (booleanProps(attrName)) {
				dom[attrName] = nextAttrValue;
				return;
			}
			if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
				dom.removeAttribute(attrName);
			} else {
				if (attrName[5] === ':' && attrName.indexOf('xlink:') !== -1) {
					dom.setAttributeNS('http://www.w3.org/1999/xlink', attrName, nextAttrValue === true ? attrName : nextAttrValue);
				} else if (attrName[4] === ':' && attrName.indexOf('xml:') !== -1) {
					dom.setAttributeNS('http://www.w3.org/XML/1998/namespace', attrName, nextAttrValue === true ? attrName : nextAttrValue);
				} else {
					dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
				}
			}
		}
	}

	function patchComponent(lastNode, Component, instance, lastProps, nextProps, nextHooks, nextChildren, parentDom, lifecycle, context) {
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

			if (!isNullOrUndefined(nextNode)) {
				diffNodes(lastNode, nextNode, parentDom, null, lifecycle, context, instance, true);
				lastNode.dom = nextNode.dom;
				instance._lastNode = nextNode;
			}
		} else {
			var shouldUpdate = true;
			var nextHooksDefined = !isNullOrUndefined(nextHooks);

			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentShouldUpdate)) {
				shouldUpdate = nextHooks.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
			}
			if (shouldUpdate !== false) {
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentWillUpdate)) {
					nextHooks.componentWillUpdate(lastNode.dom, lastProps, nextProps);
				}
				var nextNode = Component(nextProps);
				var dom = lastNode.dom;
				nextNode.dom = dom;

				diffNodes(instance, nextNode, dom, null, lifecycle, context, null, true);
				lastNode.instance = nextNode;
				if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
					nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
				}
			}
		}
	}

	function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, namespace, lifecycle, context, instance, domChildrenIndex) {
		var isNotVirtualFragment = dom.append === undefined;
		var lastChildrenLength = lastChildren.length;
		var nextChildrenLength = nextChildren.length;
		var sameLength = lastChildrenLength === nextChildrenLength;

		if (sameLength === false) {
			if (lastChildrenLength > nextChildrenLength) {
				while (lastChildrenLength !== nextChildrenLength) {
					var lastChild = lastChildren[lastChildrenLength - 1];

					if (!isInvalidNode(lastChild)) {
						dom.removeChild(domChildren[lastChildrenLength - 1 + domChildrenIndex]);
						detachNode(lastChild);
					}
					lastChildrenLength--;
				}
			} else {
				while (lastChildrenLength !== nextChildrenLength) {
					var nextChild = nextChildren[lastChildrenLength];
					var domNode = undefined;

					if (isStringOrNumber(nextChild)) {
						domNode = document.createTextNode(nextChild);
					} else {
						domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);
					}

					insertOrAppend(dom, domNode);
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
			var lastChild = lastChildren[i];
			var nextChild = nextChildren[i];
			var index = i + domChildrenIndex;

			if (lastChild !== nextChild) {
				if (isInvalidNode(nextChild)) {
					if (!isInvalidNode(lastChild)) {
						var childNode = domChildren[index];

						if (!isNullOrUndefined(childNode)) {
							if (isStringOrNumber(lastChild)) {
								childNode.nodeValue = '';
							} else if (sameLength === true) {
								var textNode = createEmptyTextNode();

								if (isArray(lastChild) && lastChild.length === 0) {
									insertOrAppend(dom, textNode);
									isNotVirtualFragment && domChildren.splice(index, 0, textNode);
								} else {
									dom.replaceChild(textNode, domChildren[index]);
									isNotVirtualFragment && domChildren.splice(index, 1, textNode);
									detachNode(lastChild);
								}
							}
						}
					}
				} else {
					if (isInvalidNode(lastChild)) {
						if (isStringOrNumber(nextChild)) {
							var textNode = document.createTextNode(nextChild);
							dom.replaceChild(textNode, domChildren[index]);
							isNotVirtualFragment && domChildren.splice(index, 1, textNode);
						} else if (sameLength === true) {
							var domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);
							dom.replaceChild(domNode, domChildren[index]);
							isNotVirtualFragment && domChildren.splice(index, 1, domNode);
						}
					} else if (isStringOrNumber(nextChild)) {
						if (lastChildrenLength === 1) {
							if (isStringOrNumber(lastChild)) {
								if (dom.getElementsByTagName !== undefined) {
									dom.firstChild.nodeValue = nextChild;
								} else {
									dom.nodeValue = nextChild;
								}
							} else {
								detachNode(lastChild);
								dom.textContent = nextChild;
							}
						} else {
							var textNode = document.createTextNode(nextChild);
							var child = domChildren[index];

							if (isNullOrUndefined(child)) {
								dom.nodeValue = textNode.nodeValue;
							} else {
								// Next is single string so remove all children
								if (child.append === undefined) {
									isNotVirtualFragment && domChildren.splice(index, 1, textNode);
									dom.replaceChild(textNode, child);
								} else {
									// If previous child is virtual fragment remove all its content and replace with textNode
									dom.insertBefore(textNode, child.firstChild);
									child.remove();
									domChildren.splice(0, domChildren.length, textNode);
								}
							}
							detachNode(lastChild);
						}
					} else if (isArray(nextChild)) {
						if (isKeyed(lastChild, nextChild)) {
							patchKeyedChildren(lastChild, nextChild, domChildren[index], namespace, lifecycle, context, instance);
						} else {
							if (isArray(lastChild)) {
								var domChild = domChildren[index];

								if (domChild.append === undefined) {
									if (nextChild.length > 1 && lastChild.length === 1) {
										var virtualFragment = createVirtualFragment();

										virtualFragment.insert(dom, domChild);
										virtualFragment.appendChild(domChild);
										isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
										patchNonKeyedChildren(lastChild, nextChild, virtualFragment, virtualFragment.childNodes, namespace, lifecycle, context, instance, 0);
									} else {
										patchNonKeyedChildren(lastChild, nextChild, dom, domChildren, namespace, lifecycle, context, instance, 0);
									}
								} else {
									patchNonKeyedChildren(lastChild, nextChild, domChildren[index], domChildren[index].childNodes, namespace, lifecycle, context, instance, 0);
								}
							} else {
								if (nextChild.length > 1) {
									var virtualFragment = createVirtualFragment();
									virtualFragment.appendChild(dom.firstChild);
									insertOrAppend(dom, virtualFragment, dom.firstChild);
									isNotVirtualFragment && domChildren.splice(index, 1, virtualFragment);
									patchNonKeyedChildren([lastChild], nextChild, virtualFragment, virtualFragment.childNodes, namespace, lifecycle, context, instance, i);
								} else {
									patchNonKeyedChildren([lastChild], nextChild, dom, domChildren, namespace, lifecycle, context, instance, i);
								}
							}
						}
					} else {
						if (isArray(lastChild)) {
							patchNonKeyedChildren(lastChild, [nextChild], domChildren, domChildren[index].childNodes, namespace, lifecycle, context, instance, 0);
						} else {
							patchNode(lastChild, nextChild, dom, namespace, lifecycle, context, instance, null);
						}
					}
				}
			}
		}
	}

	function patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance) {
		var nextChildrenLength = nextChildren.length;
		var lastChildrenLength = lastChildren.length;
		if (nextChildrenLength === 0 && lastChildrenLength >= 5) {
			if (recyclingEnabled) {
				for (var i = 0; i < lastChildrenLength; i++) {
					pool(lastChildren[i]);
				}
			}
			// TODO can we improve the removal all nodes vs textContent = ''?
			dom.textContent = '';
			return;
		}
		var oldItem = undefined;
		var stop = false;
		var startIndex = 0;
		var oldStartIndex = 0;
		var endIndex = nextChildrenLength - 1;
		var oldEndIndex = lastChildrenLength - 1;
		var oldStartItem = lastChildrenLength > 0 ? lastChildren[oldStartIndex] : null;
		var startItem = nextChildrenLength > 0 ? nextChildren[startIndex] : null;
		var endItem = undefined;
		var oldEndItem = undefined;
		var nextNode = undefined;

		// TODO don't read key too often
		outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
			stop = true;
			while (startItem.key === oldStartItem.key) {
				patchNode(oldStartItem, startItem, dom, namespace, lifecycle, context, instance, true);
				startIndex++;
				oldStartIndex++;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					startItem = nextChildren[startIndex];
					oldStartItem = lastChildren[oldStartIndex];
					stop = false;
				}
			}
			endItem = nextChildren[endIndex];
			oldEndItem = lastChildren[oldEndIndex];
			while (endItem.key === oldEndItem.key) {
				patchNode(oldEndItem, endItem, dom, namespace, lifecycle, context, instance, true);
				endIndex--;
				oldEndIndex--;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					endItem = nextChildren[endIndex];
					oldEndItem = lastChildren[oldEndIndex];
					stop = false;
				}
			}
			while (endItem.key === oldStartItem.key) {
				nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1].dom : null;
				patchNode(oldStartItem, endItem, dom, namespace, lifecycle, context, instance, true);
				insertOrAppend(dom, endItem.dom, nextNode);
				endIndex--;
				oldStartIndex++;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					endItem = nextChildren[endIndex];
					oldStartItem = lastChildren[oldStartIndex];
					stop = false;
				}
			}
			while (startItem.key === oldEndItem.key) {
				nextNode = lastChildren[oldStartIndex].dom;
				patchNode(oldEndItem, startItem, dom, namespace, lifecycle, context, instance, true);
				insertOrAppend(dom, startItem.dom, nextNode);
				startIndex++;
				oldEndIndex--;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					startItem = nextChildren[startIndex];
					oldEndItem = lastChildren[oldEndIndex];
					stop = false;
				}
			}
		}

		if (oldStartIndex > oldEndIndex) {
			if (startIndex <= endIndex) {
				nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1].dom : null;
				for (; startIndex <= endIndex; startIndex++) {
					insertOrAppend(dom, mountNode(nextChildren[startIndex], null, namespace, lifecycle, context, instance), nextNode);
				}
			}
		} else if (startIndex > endIndex) {
			for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
				oldItem = lastChildren[oldStartIndex];
				remove(oldItem, dom);
			}
		} else {
			var oldItemsMap = new Map();

			for (var i = oldStartIndex; i <= oldEndIndex; i++) {
				oldItem = lastChildren[i];
				oldItemsMap.set(oldItem.key, oldItem);
			}
			nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1] : null;

			for (var i = endIndex; i >= startIndex; i--) {
				var item = nextChildren[i];
				var key = item.key;
				oldItem = oldItemsMap.get(key);
				nextNode = isNullOrUndefined(nextNode) ? undefined : nextNode.dom; // Default to undefined instead null, because nextSibling in DOM is null
				if (oldItem === undefined) {
					insertOrAppend(dom, mountNode(item, null, namespace, lifecycle, context, instance), nextNode);
				} else {
					oldItemsMap.delete(key);
					patchNode(oldItem, item, dom, namespace, lifecycle, context, instance, true);

					if (item.dom.nextSibling !== nextNode) {
						insertOrAppend(dom, item.dom, nextNode);
					}
				}
				nextNode = item;
			}
			for (var i = oldStartIndex; i <= oldEndIndex; i++) {
				oldItem = lastChildren[i];
				if (oldItemsMap.has(oldItem.key)) {
					remove(oldItem, dom);
				}
			}
		}
	}

	var recyclingEnabled = true;

	function recycle(node, tpl, lifecycle, context, instance) {
		if (tpl !== undefined) {
			var key = node.key;
			var _pool = key === null ? tpl.pools.nonKeyed : tpl.pools.keyed[key];
			if (!isNullOrUndefined(_pool)) {
				var recycledNode = _pool.pop();
				if (!isNullOrUndefined(recycledNode)) {
					patchNode(recycledNode, node, null, null, lifecycle, context, instance, true);
					return node.dom;
				}
			}
		}
		return null;
	}

	function pool(node) {
		var tpl = node.tpl;

		if (!isNullOrUndefined(tpl)) {
			var key = node.key;
			var pools = tpl.pools;

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

	function mountNode(node, parentDom, namespace, lifecycle, context, instance) {
		if (isInvalidNode(node) || isArray(node)) {
			return placeholder(node, parentDom);
		}

		var tpl = node.tpl;

		if (recyclingEnabled) {
			var dom = recycle(node, tpl, lifecycle, context, instance);

			if (dom !== null) {
				if (parentDom !== null) {
					parentDom.appendChild(dom);
				}
				return dom;
			}
		}

		if (tpl === undefined) {
			return appendNode(node, parentDom, namespace, lifecycle, context, instance);
		} else {
			return appendNodeWithTemplate(node, tpl, parentDom, namespace, lifecycle, context, instance);
		}
	}

	function appendNodeWithTemplate(node, tpl, parentDom, namespace, lifecycle, context, instance) {
		var tag = node.tag;

		if (tpl.isComponent === true) {
			return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, parentDom, lifecycle, context);
		}
		var dom = tpl.dom.cloneNode(true);

		node.dom = dom;
		if (tpl.hasHooks === true) {
			handleAttachedHooks(node.hooks, lifecycle, dom);
		}
		// tpl.childrenType:
		// 0: no children
		// 1: text node
		// 2: single child
		// 3: multiple children
		// 4: variable children (defaults to no optimisation)

		switch (tpl.childrenType) {
			case 1:
				appendText(node.children, dom, true);
				break;
			case 2:
				mountNode(node.children, dom, namespace, lifecycle, context, instance);
				break;
			case 3:
				mountArrayChildren(node, node.children, dom, namespace, lifecycle, context, instance);
				break;
			case 4:
				mountChildren(node, node.children, dom, namespace, lifecycle, context, instance);
				break;
			default:
				break;
		}

		if (tpl.hasAttrs === true) {
			mountAttributes(node, node.attrs, dom, instance);
		}
		if (tpl.hasClassName === true) {
			dom.className = node.className;
		}
		if (tpl.hasStyle === true) {
			patchStyle(null, node.style, dom);
		}
		if (tpl.hasEvents === true) {
			mountEvents(node.events, dom);
		}
		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function appendNode(node, parentDom, namespace, lifecycle, context, instance) {
		var tag = node.tag;

		if (tag === null) {
			return placeholder(node, parentDom);
		}
		if (isFunction(tag)) {
			return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, parentDom, lifecycle, context);
		}
		namespace = namespace || tag === 'svg' ? SVGNamespace : tag === 'math' ? MathNamespace : null;
		if (!isString(tag) || tag === '') {
			throw Error('Inferno Error: Expected function or string for element tag type');
		}
		var dom = createElement(tag, namespace);
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
			mountChildren(node, children, dom, namespace, lifecycle, context, instance);
		}
		if (!isNullOrUndefined(attrs)) {
			mountAttributes(node, attrs, dom, instance);
		}
		if (!isNullOrUndefined(className)) {
			dom.className = className;
		}
		if (!isNullOrUndefined(style)) {
			patchStyle(null, style, dom);
		}
		if (!isNullOrUndefined(events)) {
			mountEvents(events, dom);
		}
		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function appendPromise(child, parentDom, domChildren, namespace, lifecycle, context, instance) {
		var placeholder = createEmptyTextNode();
		domChildren && domChildren.push(placeholder);

		child.then(function (node) {
			// TODO check for text nodes and arrays
			var dom = mountNode(node, null, namespace, lifecycle, context, instance);

			parentDom.replaceChild(dom, placeholder);
			domChildren && replaceInArray(domChildren, placeholder, dom);
		});
		parentDom.appendChild(placeholder);
	}

	function mountArrayChildren(node, children, parentDom, namespace, lifecycle, context, instance) {
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
				mountArrayChildren(node, child, virtualFragment, namespace, lifecycle, context, instance);
				insertOrAppend(parentDom, virtualFragment);
				domChildren = domChildren || [];
				domChildren.push(virtualFragment);
			} else if (isPromise(child)) {
				appendPromise(child, parentDom, domChildren, namespace, lifecycle, context, instance);
			} else {
				var domNode = mountNode(child, parentDom, namespace, lifecycle, context, instance);

				if (isNonKeyed || !hasKeyedAssumption && child && isNullOrUndefined(child.key)) {
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

	function mountChildren(node, children, parentDom, namespace, lifecycle, context, instance) {
		if (isArray(children)) {
			mountArrayChildren(node, children, parentDom, namespace, lifecycle, context, instance);
		} else if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (isPromise(children)) {
			appendPromise(children, parentDom, null, namespace, lifecycle, context, instance);
		} else {
			mountNode(children, parentDom, namespace, lifecycle, context, instance);
		}
	}

	function mountRef(instance, value, dom) {
		if (!isInvalidNode(instance) && isString(value)) {
			instance.refs[value] = dom;
		}
	}

	function mountEvents(events, dom) {
		var eventKeys = Object.keys(events);

		for (var i = 0; i < eventKeys.length; i++) {
			var event = eventKeys[i];

			dom[event] = events[event];
		}
	}

	function mountComponent(parentNode, Component, props, hooks, children, parentDom, lifecycle, context) {
		props = addChildrenToProps(children, props);

		var dom = undefined;
		if (isStatefulComponent(Component)) {
			var instance = new Component(props);
			instance._diffNodes = diffNodes;

			var childContext = instance.getChildContext();
			if (!isNullOrUndefined(childContext)) {
				context = babelHelpers.extends({}, context, childContext);
			}
			instance.context = context;

			// Block setting state - we should render only once, using latest state
			instance._pendingSetState = true;
			instance.componentWillMount();
			var shouldUpdate = instance.shouldComponentUpdate();
			if (shouldUpdate) {
				instance.componentWillUpdate();
				var pendingState = instance._pendingState;
				var oldState = instance.state;
				instance.state = babelHelpers.extends({}, oldState, pendingState);
			}
			var _node = instance.render();
			instance._pendingSetState = false;

			if (!isNullOrUndefined(_node)) {
				dom = mountNode(_node, null, null, lifecycle, context, instance);
				instance._lastNode = _node;
				if (parentDom !== null) {
					// avoid DEOPT
					parentDom.appendChild(dom);
				}
				instance.componentDidMount();
				instance.componentDidUpdate();
			}

			parentNode.dom = dom;
			parentNode.instance = instance;
			return dom;
		}
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
		var node = Component(props);
		dom = mountNode(node, null, null, lifecycle, context, null);

		parentNode.instance = node;

		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		parentNode.dom = dom;
		return dom;
	}

	function mountAttributes(node, attrs, dom, instance) {
		if (node.tag === 'select') {
			selectValue(node);
		}
		var attrsKeys = Object.keys(attrs);

		for (var i = 0; i < attrsKeys.length; i++) {
			var attr = attrsKeys[i];

			if (attr === 'ref') {
				mountRef(instance, attrs[attr], dom);
			} else {
				patchAttribute(attr, attrs[attr], dom);
			}
		}
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
			mountNode(node, parentDom, null, lifecycle, {}, null);
			lifecycle.trigger();
			roots.push({ node: node, dom: parentDom });
		} else {
			var activeNode = getActiveNode();

			patchNode(root.node, node, parentDom, null, lifecycle, {}, null, null);
			lifecycle.trigger();
			if (node === null) {
				removeRoot(root);
			}
			root.node = node;
			resetActiveNode(activeNode);
		}
	}

	var index = {
		render: render
	};

	return index;

}));