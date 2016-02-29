/*!
 * inferno-dom v0.6.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
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
	return obj.constructor === Array;
}

function isStatefulComponent(obj) {
	return !isNullOrUndefined(obj) && obj.prototype && obj.prototype.render;
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

function isNumber(obj) {
	return typeof obj === 'number';
}

var MathNamespace = 'http://www.w3.org/1998/Math/MathML';
var SVGNamespace = 'http://www.w3.org/2000/svg';

function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndefined(nextNode)) {
		parentDom.appendChild(newNode);
	} else {
		parentDom.insertBefore(newNode, nextNode);
	}
}

function createElement(tag, namespace) {
	if (namespace) {
		return document.createElementNS(namespace, tag);
	} else {
		return document.createElement(tag);
	}
}

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

function replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context) {
	var dom = undefined;

	if (isStringOrNumber(nextNode)) {
		dom = document.createTextNode(nextNode);
		parentDom.replaceChild(dom, dom);
	} else if (isStringOrNumber(lastNode)) {
		dom = mountNode(nextNode, null, namespace, lifecycle, context);
		nextNode.dom = dom;
		parentDom.replaceChild(dom, parentDom.firstChild);
	} else {
		dom = mountNode(nextNode, null, namespace, lifecycle, context);
		nextNode.dom = dom;
		parentDom.replaceChild(dom, lastNode.dom);
	}
}

function detachNode(node) {
	if (isInvalidNode(node)) {
		return;
	}
	var instance = node.instance;
	if (instance && instance.render !== undefined) {
		instance.componentWillUnmount();
		instance._unmounted = true;
	}
	var events = node.events;
	if (events && !isNullOrUndefined(events.willDetach)) {
		events.willDetach(node.dom);
	}
	if (events && !isNullOrUndefined(events.componentWillUnmount)) {
		events.componentWillUnmount(node.dom, events);
	}
	var children = node.children;

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

function remove(node, parentDom) {
	var dom = node.dom;

	detachNode(node);
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
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

function patchNode(lastNode, nextNode, parentDom, namespace, lifecycle, context) {
	if (isInvalidNode(lastNode)) {
		mountNode(nextNode, parentDom, namespace, lifecycle);
		return;
	}
	if (isInvalidNode(nextNode)) {
		remove(lastNode, parentDom);
		return;
	}
	diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, lastNode.tpl !== null && nextNode.tpl !== null);
}

function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else {
		if (!isNullOrUndefined(lastAttrValue)) {
			if (isNullOrUndefined(nextAttrValue)) {
				dom.removeAttribute('style');
			} else {
				var styleKeys = Object.keys(nextAttrValue);

				for (var i = 0; i < styleKeys.length; i++) {
					var style = styleKeys[i];
					var value = nextAttrValue[style];

					if (isNumber(value)) {
						value = value + 'px';
					}
					dom.style[style] = value;
				}
				var lastStyleKeys = Object.keys(lastAttrValue);

				for (var i = 0; i < lastStyleKeys.length; i++) {
					var style = lastStyleKeys[i];

					if (!nextAttrValue[style]) {
						dom.style[style] = '';
					}
				}
			}
		} else if (!isNullOrUndefined(nextAttrValue)) {
			var styleKeys = Object.keys(nextAttrValue);

			for (var i = 0; i < styleKeys.length; i++) {
				var style = styleKeys[i];
				var value = nextAttrValue[style];

				if (isNumber(value)) {
					value = value + 'px';
				}
				dom.style[style] = value;
			}
		}
	}
}

function patchAttribute(attrName, lastAttrValue, nextAttrValue, dom) {
	if (!isAttrAnEvent(attrName)) {
		if (booleanProps(attrName)) {
			dom[attrName] = nextAttrValue;
			return;
		}
		var ns = null;

		if (attrName[5] === ':' && attrName.indexOf('xlink:') !== -1) {
			ns = 'http://www.w3.org/1999/xlink';
		}
		if (nextAttrValue === false || isNullOrUndefined(nextAttrValue)) {
			dom.removeAttribute(attrName);
		} else {
			if (ns) {
				dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
			} else {
				dom.setAttribute(attrName, nextAttrValue === true ? attrName : nextAttrValue);
			}
		}
	}
}

function patchComponent(lastNode, Component, instance, lastProps, nextProps, nextEvents, nextChildren, parentDom, lifecycle, context) {
	nextProps = addChildrenToProps(nextChildren, nextProps);

	if (isStatefulComponent(Component)) {
		var prevProps = instance.props;
		var prevState = instance.state;
		var nextState = instance.state;

		var childContext = instance.getChildContext();
		if (childContext) {
			context = babelHelpers.extends({}, context, childContext); // Todo Fix! Too slow!!
		}
		instance.context = context;
		var nextNode = instance._updateComponent(prevState, nextState, prevProps, nextProps);

		if (nextNode) {
			diffNodes(lastNode, nextNode, parentDom, null, lifecycle, context, true);
			lastNode.dom = nextNode.dom;
			instance._lastNode = nextNode;
		}
	} else {
		var shouldUpdate = true;

		if (nextEvents && nextEvents.componentShouldUpdate) {
			shouldUpdate = nextEvents.componentShouldUpdate(lastNode.dom, lastProps, nextProps);
		}
		if (shouldUpdate !== false) {
			if (nextEvents && nextEvents.componentWillUpdate) {
				nextEvents.componentWillUpdate(lastNode.dom, lastProps, nextProps);
			}
			var nextNode = Component(nextProps);
			var dom = lastNode.dom;
			nextNode.dom = dom;

			diffNodes(instance, nextNode, dom, null, lifecycle, context, true);
			lastNode.instance = nextNode;
			if (nextEvents && nextEvents.componentDidUpdate) {
				nextEvents.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

function patchNonKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, offset) {
	var lastChildrenLength = lastChildren.length;
	var nextChildrenLength = nextChildren.length;

	if (lastChildrenLength > nextChildrenLength) {
		var lastDomNode = undefined;
		while (lastChildrenLength !== nextChildrenLength) {
			var lastChild = lastChildren[lastChildrenLength - 1];

			if (!isInvalidNode(lastChild)) {
				dom.removeChild((lastDomNode = lastChild.dom) || lastDomNode && (lastDomNode = lastDomNode.previousSibling) || (lastDomNode = dom.lastChild));
			}
			lastChildrenLength--;
		}
	} else if (lastChildrenLength < nextChildrenLength) {
		var counter = 0;
		while (lastChildrenLength !== nextChildrenLength) {
			var nextChild = nextChildren[lastChildrenLength + counter];

			if (isInvalidNode(nextChild)) {
				// debugger;
				// TODO implement
			} else {
					var node = mountNode(nextChild, null, namespace, namespace, lifecycle, context);
					dom.appendChild(node);
				}
			nextChildrenLength--;
			counter++;
		}
	}
	var childNodes = undefined;

	for (var i = 0; i < nextChildrenLength; i++) {
		var lastChild = lastChildren[i];
		var nextChild = nextChildren[i];

		if (lastChild !== nextChild) {
			if (isInvalidNode(nextChild)) {
				if (!isInvalidNode(lastChild)) {
					childNodes = childNodes || dom.childNodes;
					childNodes[i + offset].textContent = '';
					// TODO implement remove child
				}
			} else {
					if (isInvalidNode(lastChild)) {
						if (isStringOrNumber(nextChild)) {
							childNodes = childNodes || dom.childNodes;
							childNodes[i + offset].textContent = nextChild;
						} else {
							var node = mountNode(nextChild, null, namespace, lifecycle, context);
							dom.replaceChild(node, dom.childNodes[i]);
						}
					} else if ((typeof nextChild === 'undefined' ? 'undefined' : babelHelpers.typeof(nextChild)) === 'object') {
						if (isArray(nextChild)) {
							if (isArray(lastChild)) {
								patchNonKeyedChildren(lastChild, nextChild, dom, namespace, lifecycle, context, i);
							} else {
								patchNonKeyedChildren([lastChild], nextChild, dom, namespace, lifecycle, context, i);
							}
						} else {
							patchNode(lastChild, nextChild, dom, namespace, lifecycle, context);
						}
					} else {
						childNodes = childNodes || dom.childNodes;
						childNodes[i + offset].textContent = nextChild;
					}
				}
		}
	}
}

function patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, nextDom) {
	var stop = false;
	var startIndex = 0;
	var oldStartIndex = 0;
	var nextChildrenLength = nextChildren.length;
	var lastChildrenLength = lastChildren.length;
	var oldItem = undefined;

	if (nextChildrenLength === 0 && lastChildrenLength >= 5) {
		if (recyclingEnabled) {
			for (var i = 0; i < lastChildrenLength; i++) {
				pool(lastChildren[i]);
			}
		}
		dom.textContent = '';
		return;
	}

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
			diffNodes(oldStartItem, startItem, dom, namespace, lifecycle, context, true);
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
			diffNodes(oldEndItem, endItem, dom, namespace, lifecycle, context, true);
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
			nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1].dom : nextDom;
			diffNodes(oldStartItem, endItem, dom, namespace, lifecycle, context, true);
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
			diffNodes(oldEndItem, startItem, dom, namespace, lifecycle, context, true);
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
			nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1].dom : nextDom;
			for (; startIndex <= endIndex; startIndex++) {
				insertOrAppend(dom, mountNode(nextChildren[startIndex], null, namespace, lifecycle, context), nextNode);
			}
		}
	} else if (startIndex > endIndex) {
		for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
			oldItem = lastChildren[oldStartIndex];
			remove(oldItem, dom);
		}
	} else {
		var oldItemsMap = {};

		for (var i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			oldItemsMap[oldItem.key] = oldItem;
		}
		nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1] : null;

		for (var i = endIndex; i >= startIndex; i--) {
			var item = nextChildren[i];
			var key = item.key;
			oldItem = oldItemsMap[key];
			if (oldItem !== undefined) {
				oldItemsMap[key] = null;
				diffNodes(oldItem, item, dom, namespace, lifecycle, context, true);

				if (item.dom.nextSibling !== nextNode) {
					nextNode = nextNode && nextNode.dom || nextDom;
					insertOrAppend(dom, item.dom, nextNode);
				}
				nextNode = item;
			} else {
				nextNode = nextNode && nextNode.dom || nextDom;
				insertOrAppend(dom, mountNode(item, null, namespace, lifecycle, context), nextNode);
			}
			nextNode = item;
		}
		for (var i = oldStartIndex; i <= oldEndIndex; i++) {
			oldItem = lastChildren[i];
			if (oldItemsMap[oldItem.key] !== null) {
				remove(oldItem, dom);
			}
		}
	}
}

function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, staticCheck) {
	if (nextNode === false || nextNode === null) {
		return;
	}
	if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context);
		}
		return;
	}
	var nextTag = nextNode.tag || (staticCheck && nextNode.tpl ? nextNode.tpl.tag : null);
	var lastTag = lastNode.tag || (staticCheck && lastNode.tpl ? lastNode.tpl.tag : null);
	var nextEvents = nextNode.events;

	if (!isNullOrUndefined(nextEvents) && nextEvents.willUpdate) {
		nextEvents.willUpdate(lastNode.dom);
	}
	namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;
	if (lastTag !== nextTag) {
		if (isFunction(lastTag) && !isFunction(nextTag)) {
			if (isStatefulComponent(lastTag)) {
				diffNodes(lastNode.instance._lastNode, nextNode, parentDom, namespace, lifecycle, context, true);
			} else {
				diffNodes(lastNode.instance, nextNode, parentDom, namespace, lifecycle, context, true);
			}
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context);
		}
		return;
	} else if (isNullOrUndefined(lastTag)) {
		nextNode.dom = lastNode.dom;
		return;
	}
	if (isFunction(lastTag) && isFunction(nextTag)) {
		nextNode.instance = lastNode.instance;
		nextNode.dom = lastNode.dom;
		patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.events, nextNode.children, parentDom, lifecycle, context);
		return;
	}
	var dom = lastNode.dom;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck);
	var nextClassName = nextNode.className;
	var nextStyle = nextNode.style;

	// EPIC FAILURE!!!

	// TODO!! Fix SVG issue, and remove className NOT class !!!
	// TODO!! Remove of className has to be set to empty string, not a boolean etc.
	if (lastNode.className !== nextClassName) {
		if (isNullOrUndefined(nextClassName)) {
			dom.removeAttribute('class');
		} else {
			dom.className = nextClassName;
		}
	}
	// TODO Should check for null & undefined BEFORE calling this function?
	if (lastNode.style !== nextStyle) {
		patchStyle(lastNode.style, nextStyle, dom);
	}

	// TODO Take this out!! Split it!
	// NOTE!! - maybe someone doesnt use events, only attrs, but still they are forced to survive a diff on both attr and events? Perf slow down!
	diffAttributes(lastNode, nextNode, dom);
	diffEvents(lastNode, nextNode, dom);
	if (!isNullOrUndefined(nextEvents) && nextEvents.didUpdate) {
		nextEvents.didUpdate(dom);
	}
}

function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck) {
	var nextChildren = nextNode.children;
	var lastChildren = lastNode.children;

	// HEEEELP!! Man, this is too deeply nested! Can you simplify this? Break it down? Avoid all this 'if'??
	// TODO! Do not use ternary!!

	if (lastChildren === nextChildren) {
		return;
	}

	if (!isInvalidNode(lastChildren)) {
		if (!isInvalidNode(nextChildren)) {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					var isKeyed = nextChildren.length && nextChildren[0] && !isNullOrUndefined(nextChildren[0].key) || lastChildren.length && lastChildren[0] && !isNullOrUndefined(lastChildren[0].key);

					if (!isKeyed) {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, null);
					} else {
						patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, null);
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, namespace, lifecycle, context, null);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, namespace, lifecycle, context, null);
				} else {
					diffNodes(lastChildren, nextChildren, dom, namespace, lifecycle, context, staticCheck);
				}
			}
		} else {
			// Remove node, do not use textContent to set to empty node!! See jsPerf for this
			dom.textContent = '';
		}
	} else {
		if (isStringOrNumber(nextChildren)) {
			dom.textContent = nextChildren;
		} else if (!isNullOrUndefined(nextChildren)) {
			if ((typeof nextChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(nextChildren)) === 'object') {
				if (isArray(nextChildren)) {
					mountChildren(nextChildren, dom, namespace, lifecycle, context);
				} else {
					mountNode(nextChildren, dom, namespace, lifecycle, context);
				}
			}
		}
	}
}

function diffAttributes(lastNode, nextNode, dom) {
	var nextAttrs = nextNode.attrs;
	var lastAttrs = lastNode.attrs;

	if (!isNullOrUndefined(nextAttrs)) {
		var nextAttrsKeys = Object.keys(nextAttrs);
		var attrKeysLength = nextAttrsKeys.length;

		for (var i = 0; i < attrKeysLength; i++) {
			var attr = nextAttrsKeys[i];
			var lastAttrVal = lastAttrs && lastAttrs[attr];
			var nextAttrVal = nextAttrs[attr];

			if (lastAttrVal !== nextAttrVal) {
				patchAttribute(attr, lastAttrVal, nextAttrVal, dom, lastNode.tag === null);
			}
		}
	}
	if (!isNullOrUndefined(lastAttrs)) {
		var lastAttrsKeys = Object.keys(lastAttrs);
		var attrKeysLength = lastAttrsKeys.length;

		for (var i = 0; i < attrKeysLength; i++) {
			var attr = lastAttrsKeys[i];

			if (!nextAttrs || isNullOrUndefined(nextAttrs[attr])) {
				dom.removeAttribute(attr);
			}
		}
	}
}

function diffEvents(lastNode, nextNode, dom) {
	// TODO Implement updating events
}

var recyclingEnabled = true;

function recycle(node, lifecycle, context) {
	var key = node.key;
	var tpl = node.tpl;
	var recycledNode = undefined;

	if (tpl) {
		if (key !== null) {
			var keyPool = tpl.pools.keyed[key];
			recycledNode = keyPool && keyPool.pop();
		} else {
			var keyPool = tpl.pools.nonKeyed;
			recycledNode = keyPool && keyPool.pop();
		}
		if (recycledNode) {
			diffNodes(recycledNode, node, null, null, lifecycle, context, true);
			return node.dom;
		}
	}
}

function pool(node) {
	var key = node.key;
	var tpl = node.tpl;

	if (!isNullOrUndefined(tpl)) {
		var pools = tpl.pools;

		if (key === null) {
			var _pool = pools.nonKeyed;
			_pool && _pool.push(node);
		} else {
			var _pool2 = pools.keyed;
			(_pool2[key] || (_pool2[key] = [])).push(node);
		}
	}
}

var delegatedEventsRegistry = {};

// TODO This will give issues server side ( nodeJS). Need a fix
// TODO Rewrite - delegated events like this is no good for performance (jsperf?)
// Mercury also uses DOM delegator to handle events. is there perf comparison somewhere which way is better?

function handleEvent(event, dom, callback) {
	if (!delegatedEventsRegistry[event]) {
		document.addEventListener(event, function (callbackEvent) {
			var delegatedEvents = delegatedEventsRegistry[event];

			for (var i = delegatedEvents.length - 1; i > -1; i--) {
				var delegatedEvent = delegatedEvents[i];

				if (delegatedEvent.target === callbackEvent.target) {
					delegatedEvent.callback(callbackEvent);
				}
			}
		}, false);
		delegatedEventsRegistry[event] = [];
	} else {
		var delegatedEvents = delegatedEventsRegistry[event];

		/* for (let i = 0; i < delegatedEvents.length; i++) {
  	const delegatedEvent = delegatedEvents[i];
  		if (delegatedEvent.target === dom) {
  		delegatedEvents.splice(i, 1);
  		break;
  	}
  } */
		delegatedEvents.push({
			callback: callback,
			target: dom
		});
	}
}

// TODO!  Need to be re-written to gain bette performance. I can't do it. K.F
function mountChildren(children, parentDom, namespace, lifecycle, context) {
	if (isArray(children)) {
		for (var i = 0; i < children.length; i++) {
			var child = children[i];

			if (isStringOrNumber(child)) {
				appendText(child, parentDom, false);
			} else if (child && isArray(child)) {
				mountChildren(child, parentDom, namespace, lifecycle, context);
			} else {
				mountNode(child, parentDom, namespace, lifecycle, context);
			}
		}
	} else {
		if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else {
			mountNode(children, parentDom, namespace, lifecycle, context);
		}
	}
}

function mountComponent(parentNode, Component, props, events, children, parentDom, lifecycle, context) {
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

		instance.componentWillMount();
		var _node = instance.render();

		if (!isNullOrUndefined(_node)) {
			dom = mountNode(_node, null, null, lifecycle, context);
			instance._lastNode = _node;
			if (parentDom !== null) {
				// avoid DEOPT
				parentDom.appendChild(dom);
			}
			lifecycle.addListener(instance.componentDidMount);
		}

		parentNode.dom = dom;
		parentNode.instance = instance;
		return dom;
	}
	if (!isNullOrUndefined(events)) {
		if (events.componentWillMount) {
			events.componentWillMount(null, props);
		}
		if (events.componentDidMount) {
			lifecycle.addListener(function () {
				events.componentDidMount(dom, props);
			});
		}
	}

	/* eslint new-cap: 0 */
	var node = Component(props);
	dom = mountNode(node, null, null, lifecycle, context);

	parentNode.instance = node;

	if (parentDom !== null) {
		// avoid DEOPT
		parentDom.appendChild(dom);
	}
	parentNode.dom = dom;
	return dom;
}

function mountEvents(events, allEvents, dom) {
	for (var i = 0; i < allEvents.length; i++) {
		var event = allEvents[i];
		if (isString(event)) {
			handleEvent(event, dom, events[event]);
		}
	}
}

function placeholder(node, parentDom) {
	var dom = document.createTextNode('');

	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	if (node) {
		node.dom = dom;
	}
	return dom;
}

function mountNode(node, parentDom, namespace, lifecycle, context) {
	var dom = undefined;

	if (isInvalidNode(node) || isArray(node)) {
		return placeholder(node, parentDom);
	}
	if (isStringOrNumber(node)) {
		var _dom = document.createTextNode(node);

		if (parentDom !== null) {
			parentDom.appendChild(_dom);
		}
		return _dom;
	}
	if (recyclingEnabled) {
		dom = recycle(node, lifecycle, context);
		if (dom) {
			if (parentDom) {
				parentDom.appendChild(dom);
			}
			return dom;
		}
	}
	var tpl = node.tpl;
	var tag = node.tag;

	if (tag === null) {
		return placeholder(node, parentDom);
	}

	if (isFunction(tag)) {
		return mountComponent(node, tag, node.attrs || {}, node.events, node.children, parentDom, lifecycle, context);
	}

	namespace = namespace || tag === 'svg' ? SVGNamespace : tag === 'math' ? MathNamespace : null;

	if (tpl && tpl.dom) {
		dom = tpl.dom.cloneNode(true);
	} else {
		if (!isString(tag)) {
			throw Error('Inferno Error: Expected function or string for element tag type');
		}
		dom = createElement(tag, namespace);
	}
	var children = node.children;
	var attrs = node.attrs;
	var events = node.events;
	var className = node.className;
	var style = node.style;

	if (!isNullOrUndefined(events)) {
		var allEvents = Object.keys(events);
		var eventsCount = allEvents.length;

		if (events.click) {
			handleEvent('click', dom, events.click);
			eventsCount--;
		}
		if (events.created) {
			events.created(dom);
			eventsCount--;
		}
		if (events.attached) {
			lifecycle.addListener(function () {
				events.attached(dom);
			});
			eventsCount--;
		}
		if (eventsCount > 0) {
			mountEvents(events, allEvents, dom);
		}
	}
	if (!isInvalidNode(children)) {
		mountChildren(children, dom, namespace, lifecycle, context);
	}
	if (!isNullOrUndefined(attrs)) {
		mountAttributes(attrs, dom);
	}
	if (!isNullOrUndefined(className)) {
		dom.className = className;
	}
	if (!isNullOrUndefined(style)) {
		patchStyle(null, style, dom);
	}
	node.dom = dom;
	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	return dom;
}

function mountAttributes(attrs, dom) {
	var attrsKeys = Object.keys(attrs);

	for (var i = 0; i < attrsKeys.length; i++) {
		var attr = attrsKeys[i];
		patchAttribute(attr, null, attrs[attr], dom);
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
			return true;
		}
	}
	return false;
}

function render(node, parentDom) {
	var root = getRoot(parentDom);
	var lifecycle = new Lifecycle();

	if (isNullOrUndefined(root)) {
		mountNode(node, parentDom, null, lifecycle, {});
		lifecycle.trigger();
		roots.push({ node: node, dom: parentDom });
	} else {
		patchNode(root.node, node, parentDom, null, lifecycle, {});
		lifecycle.trigger();
		if (node === null) {
			removeRoot(root);
		}
		root.node = node;
	}
}

var index = {
	render: render
};

export default index;