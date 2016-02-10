/*!
 * inferno-dom v0.6.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoDOM = factory());
}(this, function () { 'use strict';

	var babelHelpers = {};

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

	babelHelpers;

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

	function isArray$1(obj) {
		return obj.constructor === Array;
	}

	function isStringOrNumber(obj) {
		return typeof obj === 'string' || typeof obj === 'number';
	}

	function isNullOrUndefined(obj) {
		return obj === undefined || obj === null;
	}

	function isFunction(obj) {
		return typeof obj === 'function';
	}

	function isAttrAnEvent(attr) {
		return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	}

	var recyclingEnabled$1 = false;

	function appendText(text, parentDom, singleChild) {
		if (singleChild) {
			if (text !== '') {
				parentDom.textContent = text;
			} else {
				parentDom.appendChild(document.createTextNode(''));
			}
		} else {
			var textNode = document.createTextNode(text);

			parentDom.appendChild(textNode);
		}
	}

	function replaceNode(lastNode, nextNode, parentDom, lifecycle, context) {
		var dom = mountNode$1(nextNode, null, lifecycle, context);
		parentDom.replaceChild(dom, lastNode.dom);
		nextNode.dom = dom;
	}

	function diffNodes$1(lastNode, nextNode, parentDom, lifecycle, context, staticCheck) {
		if (nextNode === false || nextNode === null) {
			return;
		}
		if (isStringOrNumber(lastNode)) {
			if (isStringOrNumber(nextNode)) {
				parentDom.firstChild.nodeValue = nextNode;
			}
			return;
		}
		var nextTag = nextNode.tag || (staticCheck ? nextNode.static.tag : null);
		var lastTag = lastNode.tag || (staticCheck ? lastNode.static.tag : null);

		if (lastNode.events && lastNode.events.willUpdate) {
			lastNode.events.willUpdate(lastNode.dom);
		}

		if (lastTag !== nextTag) {
			if (isFunction(lastTag) && !isFunction(nextTag)) {
				if (isStatefulComponent(lastTag)) {
					diffNodes$1(lastNode.instance._lastNode, nextNode, parentDom, lifecycle, context, true);
				} else {
					diffNodes$1(lastNode.instance, nextNode, parentDom, lifecycle, context, true);
				}
			} else {
				replaceNode(lastNode, nextNode, parentDom, lifecycle, context);
			}
			return;
		}
		if (isFunction(lastTag) && isFunction(nextTag)) {
			nextNode.instance = lastNode.instance;
			nextNode.dom = lastNode.dom;
			updateComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs, nextNode.attrs, nextNode.events, nextNode.children, parentDom, lifecycle, context);
			return;
		}
		var dom = lastNode.dom;

		nextNode.dom = dom;
		diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck);
		diffAttributes(lastNode, nextNode, dom);
		diffEvents(lastNode, nextNode, dom);

		if (nextNode.events && nextNode.events.didUpdate) {
			nextNode.events.didUpdate(dom);
		}
	}

	function diffChildren(lastNode, nextNode, dom, lifecycle, context, staticCheck) {
		var nextChildren = nextNode.children;
		var lastChildren = lastNode.children;

		if (lastChildren !== nextChildren) {
			if (!isNullOrUndefined(lastChildren) && !isNullOrUndefined(nextChildren)) {
				if (isArray$1(lastChildren)) {
					if (isArray$1(nextChildren)) {
						var isKeyed = nextChildren.length && !isNullOrUndefined(nextChildren[0].key) || lastChildren.length && !isNullOrUndefined(lastChildren[0].key);

						if (!isKeyed) {
							patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, null);
						} else {
							patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, null);
						}
					} else {
						patchNonKeyedChildren(lastChildren, [nextChildren], dom, lifecycle, context, null);
					}
				} else {
					if (isArray$1(nextChildren)) {
						patchNonKeyedChildren([lastChildren], nextChildren, dom, lifecycle, context, null);
					} else if (isStringOrNumber(lastChildren)) {
						if (isStringOrNumber(nextChildren)) {
							dom.firstChild.nodeValue = nextChildren;
						}
					} else {
						diffNodes$1(lastChildren, nextChildren, dom, lifecycle, context, true);
					}
				}
			}
		}
	}

	function diffAttributes(lastNode, nextNode, dom) {
		var nextAttrs = nextNode.attrs;
		var lastAttrs = lastNode.attrs;

		if (nextAttrs) {
			for (var i = 0; i < nextAttrs.length; i++) {
				var lastAttr = lastAttrs[i];
				var nextAttr = nextAttrs[i];
				var lastAttrName = lastAttr && lastAttr.name;
				var nextAttrName = nextAttr && nextAttr.name;
				var lastAttrVal = lastAttr && lastAttr.value;
				var nextAttrVal = nextAttr && nextAttr.value;

				if (lastAttrName && lastAttrName === nextAttrName) {
					patchAttribute(lastAttrName, lastAttrVal, nextAttrVal, dom);
				}
			}
		}
	}

	function diffEvents(lastNode, nextNode, dom) {}

	function patchNode(lastNode, nextNode, parentDom, lifecycle, context) {
		if (isNullOrUndefined(lastNode)) {
			mountNode(nextNode, parentDom, lifecycle);
			return;
		}
		if (isNullOrUndefined(nextNode)) {
			remove(lastNode, parentDom);
			return;
		}
		if (lastNode.static !== nextNode.static) {
			diffNodes$1(lastNode, nextNode, parentDom, lifecycle, context, true);
			return;
		}
		diffNodes$1(lastNode, nextNode, parentDom, lifecycle, context, false);
	}

	function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
		if (lastAttrValue !== nextAttrValue) {
			if (attrName === 'className' || attrName === 'class') {
				dom.className = nextAttrValue;
			} else if (attrName === 'style') {
				if (typeof nextAttrValue === 'string') {
					dom.style.cssText = nextAttrValue;
				} else {
					for (var style in nextAttrValue) {
						var styleVal = nextAttrValue[style];
						dom.style[style] = styleVal;
					}
				}
			} else {
				if (!isAttrAnEvent(attrName)) {
					if (nextAttrValue === false || nextAttrValue == null) {
						dom.removeAttribute(attrName);
					} else if (nextAttrValue === true) {
						dom.setAttribute(attrName, attrName);
					} else {
						dom.setAttribute(attrName, nextAttrValue);
					}
				}
			}
		}
	}

	function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, nextDom) {
		var lastChildrenLength = lastChildren.length;
		var nextChildrenLength = nextChildren.length;
		var counter = 0;
		var lastDomNode;

		if (lastChildrenLength > nextChildrenLength) {
			while (lastChildrenLength !== nextChildrenLength) {
				var lastChild = lastChildren[lastChildrenLength - 1];
				dom.removeChild((lastDomNode = lastChild.dom) || lastDomNode && (lastDomNode = lastDomNode.previousSibling) || (lastDomNode = dom.lastChild));
				lastChildrenLength--;
			}
		} else if (lastChildrenLength < nextChildrenLength) {
			while (lastChildrenLength !== nextChildrenLength) {
				var nextChild = nextChildren[lastChildrenLength + counter];
				var node = mountNode(nextChild, null, lifecycle, context);
				dom.appendChild(node);
				nextChildrenLength--;
				counter++;
			}
		}
		for (var i = 0; i < nextChildrenLength; i++) {
			var lastChild = lastChildren[i];
			var nextChild = nextChildren[i];

			if (lastChild !== nextChild) {
				patchNode(lastChild, nextChild, dom, lifecycle, context);
			}
		}
	}

	function mountChildren(children, parentDom, lifecycle, context) {
		if (isArray$1(children)) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];

				if (isStringOrNumber(child)) {
					appendText(child, parentDom, false);
				} else {
					mountNode$1(child, parentDom, lifecycle, context);
				}
			}
		} else {
			if (isStringOrNumber(children)) {
				appendText(children, parentDom, true);
			} else {
				mountNode$1(children, parentDom, lifecycle, context);
			}
		}
	}

	function mountComponent(parentNode, Component, props, events, children, parentDom, lifecycle, context) {
		props = addChildrenToProps(children, props);

		if (isStatefulComponent(Component)) {
			var instance = new Component(props);
			instance._diffNodes = diffNodes;

			var childContext = instance.getChildContext();
			if (childContext) {
				context = _extends({}, context, childContext);
			}
			instance.context = context;

			instance.componentWillMount();
			var node = instance.render();
			var dom;

			if (node) {
				dom = mountNode$1(node, null, lifecycle, context);
				instance._lastNode = node;
				if (parentDom) {
					parentDom.appendChild(dom);
				}
				lifecycle.addListener(instance.componentDidMount);
			}

			parentNode.dom = dom;
			parentNode.instance = instance;
			return dom;
		} else {
			var dom;
			if (events) {
				if (events.componentWillMount) {
					events.componentWillMount(null, props);
				}
				if (events.componentDidMount) {
					lifecycle.addListener(function () {
						events.componentDidMount(dom, props);
					});
				}
			}
			var node = Component(props);
			dom = mountNode$1(node, null, lifecycle, context);

			parentNode.instance = node;
			if (parentDom) {
				parentDom.appendChild(dom);
			}
			parentNode.dom = dom;

			return dom;
		}
	}

	function mountNode$1(node, parentDom, lifecycle, context) {
		var dom;

		if (node === null) {
			return;
		}
		if (node == null || isArray$1(node)) {
			return;
		}
		if (isStringOrNumber(node)) {
			return document.createTextNode(node);
		}
		if (recyclingEnabled$1) {
			dom = recycle(node, lifecycle, context);
			if (dom) {
				if (parentDom) {
					parentDom.appendChild(dom);
				}
				return dom;
			}
		}
		if (isFunction(node.tag)) {
			return mountComponent(node, node.tag, node.attrs, node.events, node.children, parentDom, lifecycle, context);
		}
		if (node.static.dom) {
			dom = node.static.dom.cloneNode(true);
		} else {
			dom = document.createElement(node.tag);
		}
		var children = node.children;
		var attrs = node.attrs;
		var events = node.events;

		if (events) {
			if (events.click) {
				handleEvent('click', dom, events.click);
			}
			if (events.created) {
				events.created(dom);
			}
			if (events.attached) {
				lifecycle.addListener(function () {
					events.attached(dom);
				});
			}
		}
		if (attrs) {
			mountAttributes(attrs, dom);
		}

		if (!isNullOrUndefined(children)) {
			mountChildren(children, dom, lifecycle, context);
		}
		node.dom = dom;
		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
	}

	function mountAttributes(attrs, dom) {
		for (var i = 0; i < attrs.length; i++) {
			var attr = attrs[i];
			var attrName = attr && attr.name;
			var attrVal = attr && attr.value;

			if (attrName) {
				patchAttribute(attrName, null, attrVal, dom);
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

	function removeRoot(root) {
		for (var i = 0; i < roots.length; i++) {
			var root = roots[i];
			if (root === rootNode) {
				roots.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	function render(node, parentDom) {
		var root = getRoot(parentDom);
		var lifecycle = new Lifecycle();

		if (isNullOrUndefined(root)) {
			mountNode$1(node, parentDom, lifecycle, {});
			lifecycle.trigger();
			roots.push({ node: node, dom: parentDom });
		} else {
			patchNode(root.node, node, parentDom, lifecycle, {});
			lifecycle.trigger();
			if (node == null) {
				removeRoot(root);
			}
			root.node = node;
		}
	}

	var index = {
		render: render
	};

	return index;

}));