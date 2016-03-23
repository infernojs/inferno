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

function isNumber(obj) {
	return typeof obj === 'number';
}

function isObject(obj) {
	return (typeof obj === 'undefined' ? 'undefined' : babelHelpers.typeof(obj)) === 'object';
}

function isPromise(obj) {
	return obj && obj.then;
}

function replaceInArray(array, obj, newObj) {
	array.splice(array.indexOf(obj), 1, newObj);
}

// Exported only so its easier to verify registered events
var delegatedEventsRegistry = {};

// The issue with this, is that we can't stop the bubbling as we're traversing down the node tree, rather than up it
// needs a rethink here
function scanNodeList(node, target, delegatedEvent, callbackEvent) {
	if (node.dom === target) {
		delegatedEvent.callback(callbackEvent);
		return true;
	}
	var children = node.children;

	if (children) {
		if (isArray(children)) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];

				if ((typeof child === 'undefined' ? 'undefined' : babelHelpers.typeof(child)) === 'object') {
					var result = scanNodeList(child, target, delegatedEvent, callbackEvent);

					if (result) {
						return true;
					}
				}
			}
		} else if (children.dom) {
			var _result = scanNodeList(children, target, delegatedEvent, callbackEvent);

			if (_result) {
				return true;
			}
		}
	}
}

function createEventListener(callbackEvent) {
	var delegatedEvents = delegatedEventsRegistry[callbackEvent.type];

	for (var i = delegatedEvents.length - 1; i > -1; i--) {
		var delegatedEvent = delegatedEvents[i];
		var node = delegatedEvent.node;
		var target = callbackEvent.target;

		scanNodeList(node, target, delegatedEvent, callbackEvent);
	}
}

function removeEventFromRegistry(event, callback) {
	if (isNullOrUndefined(callback)) {
		return;
	}
	var delegatedEvents = delegatedEventsRegistry[event];
	if (!isNullOrUndefined(delegatedEvents)) {
		for (var i = 0; i < delegatedEvents.length; i++) {
			var delegatedEvent = delegatedEvents[i];
			if (delegatedEvent.callback === callback) {
				delegatedEvents.splice(i, 1);
				return;
			}
		}
	}
}

function addEventToRegistry(event, node, callback) {
	var delegatedEvents = delegatedEventsRegistry[event];
	if (isNullOrUndefined(delegatedEvents)) {
		document.addEventListener(event, createEventListener, false);
		delegatedEventsRegistry[event] = [{
			callback: callback,
			node: node
		}];
	} else {
		delegatedEvents.push({
			callback: callback,
			node: node
		});
	}
}

var MathNamespace = 'http://www.w3.org/1998/Math/MathML';
var SVGNamespace = 'http://www.w3.org/2000/svg';

function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndefined(nextNode)) {
		if (newNode.append) {
			newNode.append(parentDom);
		} else {
			parentDom.appendChild(newNode);
		}
	} else {
		if (newNode.insert) {
			newNode.insert(parentDom, nextNode);
		} else if (nextNode.insert) {
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
	if (singleChild) {
		if (text !== '') {
			parentDom.textContent = text;
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

function replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance) {
	if (isStringOrNumber(nextNode)) {
		var dom = document.createTextNode(nextNode);
		parentDom.replaceChild(dom, dom);
	} else if (isStringOrNumber(lastNode)) {
		var _dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);
		nextNode.dom = _dom;
		parentDom.replaceChild(_dom, parentDom.firstChild);
	} else {
		detachNode(lastNode);
		var _dom2 = mountNode(nextNode, null, namespace, lifecycle, context, instance);
		nextNode.dom = _dom2;
		parentDom.replaceChild(_dom2, lastNode.dom);
	}
}

function detachNode(node) {
	if (isInvalidNode(node)) {
		return;
	}
	var instance = node.instance;
	if (!isNullOrUndefined(instance) && instance.render !== undefined) {
		instance.componentWillUnmount();
		instance._unmounted = true;
	}
	var hooks = node.hooks || !isNullOrUndefined(instance) && instance.hooks;
	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.willDetach)) {
			hooks.willDetach(node.dom);
		}
		if (!isNullOrUndefined(hooks.componentWillUnmount)) {
			hooks.componentWillUnmount(node.dom, hooks);
		}
	}
	var events = node.events;
	// Remove all events to free memory
	if (!isNullOrUndefined(events)) {
		for (var event in events) {
			removeEventFromRegistry(event, events[event]);
		}
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

function createEmptyTextNode() {
	return document.createTextNode('');
}

function remove(node, parentDom) {
	detachNode(node);
	var dom = node.dom;
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
		}
	}
}

function insertChildren(parentNode, childNodes, dom) {
	// we need to append all childNodes now
	for (var i = 0; i < childNodes.length; i++) {
		parentNode.insertBefore(childNodes[i], dom);
	}
}

function createVirtualFragment() {
	var childNodes = [];
	var dom = document.createTextNode('');
	var parentNode = null;

	var fragment = {
		childNodes: childNodes,
		appendChild: function appendChild(domNode) {
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
		}
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

function patchNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance) {
	if (isInvalidNode(lastNode)) {
		mountNode(nextNode, parentDom, namespace, lifecycle, context, instance);
		return;
	}
	if (isInvalidNode(nextNode)) {
		remove(lastNode, parentDom);
		return;
	}
	diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, lastNode.tpl !== null && nextNode.tpl !== null, instance);
}

var canBeUnitlessProperties = {
	animationIterationCount: true,
	boxFlex: true,
	boxFlexGroup: true,
	columnCount: true,
	counterIncrement: true,
	fillOpacity: true,
	flex: true,
	flexGrow: true,
	flexOrder: true,
	flexPositive: true,
	flexShrink: true,
	float: true,
	fontWeight: true,
	gridColumn: true,
	lineHeight: true,
	lineClamp: true,
	opacity: true,
	order: true,
	orphans: true,
	stopOpacity: true,
	strokeDashoffset: true,
	strokeOpacity: true,
	strokeWidth: true,
	tabSize: true,
	transform: true,
	transformOrigin: true,
	widows: true,
	zIndex: true,
	zoom: true
};

function patchStyle(lastAttrValue, nextAttrValue, dom) {
	if (isString(nextAttrValue)) {
		dom.style.cssText = nextAttrValue;
	} else if (isNullOrUndefined(lastAttrValue)) {
		if (!isNullOrUndefined(nextAttrValue)) {
			var styleKeys = Object.keys(nextAttrValue);

			for (var i = 0; i < styleKeys.length; i++) {
				var style = styleKeys[i];
				var value = nextAttrValue[style];

				if (isNumber(value) && !canBeUnitlessProperties[style]) {
					value = value + 'px';
				}
				dom.style[style] = value;
			}
		}
	} else if (isNullOrUndefined(nextAttrValue)) {
		dom.removeAttribute('style');
	} else {
		var _styleKeys = Object.keys(nextAttrValue);

		for (var _i = 0; _i < _styleKeys.length; _i++) {
			var _style = _styleKeys[_i];
			var _value = nextAttrValue[_style];

			if (isNumber(_value) && !canBeUnitlessProperties[_style]) {
				_value = _value + 'px';
			}
			dom.style[_style] = _value;
		}
		var lastStyleKeys = Object.keys(lastAttrValue);

		for (var _i2 = 0; _i2 < lastStyleKeys.length; _i2++) {
			var _style2 = lastStyleKeys[_i2];
			if (isNullOrUndefined(nextAttrValue[_style2])) {
				dom.style[_style2] = '';
			}
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
			var ns = null;

			if (attrName[5] === ':' && attrName.indexOf('xlink:') !== -1) {
				ns = 'http://www.w3.org/1999/xlink';
			}
			if (ns !== null) {
				dom.setAttributeNS(ns, attrName, nextAttrValue === true ? attrName : nextAttrValue);
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
			diffNodes(lastNode, nextNode, parentDom, null, lifecycle, context, true, instance);
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
			var _nextNode = Component(nextProps);
			var dom = lastNode.dom;
			_nextNode.dom = dom;

			diffNodes(instance, _nextNode, dom, null, lifecycle, context, true, null);
			lastNode.instance = _nextNode;
			if (nextHooksDefined && !isNullOrUndefined(nextHooks.componentDidUpdate)) {
				nextHooks.componentDidUpdate(lastNode.dom, lastProps, nextProps);
			}
		}
	}
}

function isKeyed(lastChildren, nextChildren) {
	return nextChildren.length && !isNullOrUndefined(nextChildren[0]) && !isNullOrUndefined(nextChildren[0].key) || lastChildren.length && !isNullOrUndefined(lastChildren[0]) && !isNullOrUndefined(lastChildren[0].key);
}

function patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren, namespace, lifecycle, context, instance, domChildrenIndex) {
	var isVirtualFragment = !isNullOrUndefined(dom.append);
	var lastChildrenLength = lastChildren.length;
	var nextChildrenLength = nextChildren.length;
	var sameLength = lastChildrenLength === nextChildrenLength;

	if (sameLength === false) {
		if (lastChildrenLength > nextChildrenLength) {
			while (lastChildrenLength !== nextChildrenLength) {
				var lastChild = lastChildren[lastChildrenLength - 1];

				if (!isInvalidNode(lastChild)) {
					dom.removeChild(domChildren[lastChildrenLength - 1 + domChildrenIndex]);
				}
				lastChildrenLength--;
			}
		} else if (lastChildrenLength < nextChildrenLength) {
			while (lastChildrenLength !== nextChildrenLength) {
				var nextChild = nextChildren[lastChildrenLength];
				var domNode = mountNode(nextChild, null, namespace, lifecycle, context, instance);

				insertOrAppend(dom, domNode);
				!isVirtualFragment && domChildren.push(domNode);
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
					var childNode = domChildren[index];

					if (!isNullOrUndefined(childNode)) {
						if (isStringOrNumber(_lastChild)) {
							childNode.nodeValue = '';
						} else if (sameLength === true) {
							var textNode = createEmptyTextNode();

							if (isArray(_lastChild) && _lastChild.length === 0) {
								insertOrAppend(dom, textNode);
								!isVirtualFragment && domChildren.splice(index, 0, textNode);
							} else {
								dom.replaceChild(textNode, domChildren[index]);
								!isVirtualFragment && domChildren.splice(index, 1, textNode);
							}
						}
					}
				}
			} else {
				if (isInvalidNode(_lastChild)) {
					if (isStringOrNumber(_nextChild)) {
						var _textNode = document.createTextNode(_nextChild);

						dom.replaceChild(_textNode, domChildren[index]);
						!isVirtualFragment && domChildren.splice(index, 1, _textNode);
					} else if (sameLength === true) {
						var _domNode = mountNode(_nextChild, null, namespace, lifecycle, context, instance);

						dom.replaceChild(_domNode, domChildren[index]);
						!isVirtualFragment && domChildren.splice(index, 1, _domNode);
					}
				} else if (isObject(_nextChild)) {
					if (isArray(_nextChild)) {
						if (isKeyed(_lastChild, _nextChild)) {
							patchKeyedChildren(_lastChild, _nextChild, domChildren[index], namespace, lifecycle, context, instance);
						} else {
							if (isArray(_lastChild)) {
								patchNonKeyedChildren(_lastChild, _nextChild, domChildren[index], domChildren[index].childNodes, namespace, lifecycle, context, instance, 0);
							} else {
								patchNonKeyedChildren([_lastChild], _nextChild, dom, domChildren, namespace, lifecycle, context, instance, i);
							}
						}
					} else {
						if (isArray(_lastChild)) {
							patchNonKeyedChildren(_lastChild, [_nextChild], domChildren, domChildren[index].childNodes, namespace, lifecycle, context, instance, 0);
						} else {
							patchNode(_lastChild, _nextChild, dom, namespace, lifecycle, context, instance);
						}
					}
				} else {
					var _childNode = domChildren[index];

					if (isNullOrUndefined(_childNode)) {
						var _textNode2 = document.createTextNode(_nextChild);

						nextChildren.push(_textNode2);
						dom.appendChild(_textNode2);
					} else {
						if (isStringOrNumber(_lastChild)) {
							_childNode.nodeValue = _nextChild;
						} else {
							_childNode.textContent = _nextChild;
						}
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
		dom.textContent = '';
		return;
	}
	var oldItem = void 0;
	var stop = false;
	var startIndex = 0;
	var oldStartIndex = 0;
	var endIndex = nextChildrenLength - 1;
	var oldEndIndex = lastChildrenLength - 1;
	var oldStartItem = lastChildrenLength > 0 ? lastChildren[oldStartIndex] : null;
	var startItem = nextChildrenLength > 0 ? nextChildren[startIndex] : null;
	var endItem = void 0;
	var oldEndItem = void 0;
	var nextNode = void 0;

	// TODO don't read key too often
	outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
		stop = true;
		while (startItem.key === oldStartItem.key) {
			diffNodes(oldStartItem, startItem, dom, namespace, lifecycle, context, true, instance);
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
			diffNodes(oldEndItem, endItem, dom, namespace, lifecycle, context, true, instance);
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
			diffNodes(oldStartItem, endItem, dom, namespace, lifecycle, context, true, instance);
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
			diffNodes(oldEndItem, startItem, dom, namespace, lifecycle, context, true, instance);
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
		var oldItemsMap = [];

		for (var _i3 = oldStartIndex; _i3 <= oldEndIndex; _i3++) {
			oldItem = lastChildren[_i3];
			oldItemsMap[oldItem.key] = oldItem;
		}
		nextNode = endIndex + 1 < nextChildrenLength ? nextChildren[endIndex + 1] : null;

		for (var _i4 = endIndex; _i4 >= startIndex; _i4--) {
			var item = nextChildren[_i4];
			var key = item.key;
			oldItem = oldItemsMap[key];
			nextNode = isNullOrUndefined(nextNode) ? undefined : nextNode.dom; // Default to undefined instead null, because nextSibling in DOM is null
			if (oldItem === undefined) {
				insertOrAppend(dom, mountNode(item, null, namespace, lifecycle, context, instance), nextNode);
			} else {
				oldItemsMap[key] = null;
				diffNodes(oldItem, item, dom, namespace, lifecycle, context, true, instance);

				if (item.dom.nextSibling !== nextNode) {
					insertOrAppend(dom, item.dom, nextNode);
				}
			}
			nextNode = item;
		}
		for (var _i5 = oldStartIndex; _i5 <= oldEndIndex; _i5++) {
			oldItem = lastChildren[_i5];
			if (oldItemsMap[oldItem.key] !== null) {
				remove(oldItem, dom);
			}
		}
	}
}

function updateTextNode(dom, lastChildren, nextChildren) {
	if (isStringOrNumber(lastChildren)) {
		dom.firstChild.nodeValue = nextChildren;
	} else {
		dom.textContent = nextChildren;
	}
}

function diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck, instance) {
	var nextChildren = nextNode.children;
	var lastChildren = lastNode.children;
	var domChildren = null;

	if (lastChildren === nextChildren) {
		return;
	}
	if (!isNullOrUndefined(lastNode.domChildren)) {
		domChildren = nextNode.domChildren = lastNode.domChildren;
	}
	if (!isInvalidNode(lastChildren)) {
		if (!isInvalidNode(nextChildren)) {
			if (isArray(lastChildren)) {
				if (isArray(nextChildren)) {
					if (domChildren === null) {
						patchKeyedChildren(lastChildren, nextChildren, dom, namespace, lifecycle, context, instance);
					} else {
						patchNonKeyedChildren(lastChildren, nextChildren, dom, domChildren || [], namespace, lifecycle, context, instance, 0);
					}
				} else {
					patchNonKeyedChildren(lastChildren, [nextChildren], dom, domChildren || [], namespace, lifecycle, context, instance, 0);
				}
			} else {
				if (isArray(nextChildren)) {
					patchNonKeyedChildren([lastChildren], nextChildren, dom, domChildren || [], namespace, lifecycle, context, instance, 0);
				} else if (isStringOrNumber(nextChildren)) {
					updateTextNode(dom, lastChildren, nextChildren);
				} else {
					diffNodes(lastChildren, nextChildren, dom, namespace, lifecycle, context, staticCheck, instance);
				}
			}
		} else {
			dom.textContent = '';
		}
	} else {
		if (isStringOrNumber(nextChildren)) {
			updateTextNode(dom, lastChildren, nextChildren);
		} else if (!isNullOrUndefined(nextChildren)) {
			if ((typeof nextChildren === 'undefined' ? 'undefined' : babelHelpers.typeof(nextChildren)) === 'object') {
				if (isArray(nextChildren)) {
					mountChildren(nextNode, nextChildren, dom, namespace, lifecycle, context, instance);
				} else {
					mountNode(nextChildren, dom, namespace, lifecycle, context, instance);
				}
			}
		}
	}
}

function diffRef(instance, lastValue, nextValue, dom) {
	if (!isNullOrUndefined(instance)) {
		if (isString(lastValue)) {
			delete instance.refs[lastValue];
		}
		if (isString(nextValue)) {
			instance.refs[nextValue] = dom;
		}
	}
}

function diffAttributes(lastNode, nextNode, dom, instance) {
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

function diffEvents(lastNode, nextNode, dom) {
	var lastEvents = lastNode.events;

	if (!isNullOrUndefined(lastEvents)) {
		var nextEvents = nextNode.events;
		if (!isNullOrUndefined(nextEvents)) {
			var lastEventsKeys = Object.keys(lastEvents);
			// const nextEventsKeys = Object.keys(nextEvents);

			for (var i = 0; i < lastEventsKeys.length; i++) {
				var event = lastEventsKeys[i];
				var nextEvent = nextEvents[event];
				var lastEvent = lastEvents[event];

				if (isNullOrUndefined(nextEvent)) {
					removeEventFromRegistry(event, lastEvent);
				} else if (nextEvent !== lastEvent) {
					// TODO: feels lot of looping here, but also this is real edge case
					// Callback has changed and is not same as before
					removeEventFromRegistry(event, lastEvent); // remove old
					addEventToRegistry(event, nextNode, nextEvent); // add new
				}
			}
		}
	}
}

function diffNodes(lastNode, nextNode, parentDom, namespace, lifecycle, context, staticCheck, instance) {
	if (nextNode === false || nextNode === null) {
		return;
	}
	if (!isNullOrUndefined(nextNode.then)) {
		nextNode.then(function (node) {
			diffNodes(lastNode, node, parentDom, namespace, lifecycle, context, staticCheck, instance);
		});
		return;
	}
	if (isStringOrNumber(lastNode)) {
		if (isStringOrNumber(nextNode)) {
			parentDom.firstChild.nodeValue = nextNode;
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
		}
		return;
	}
	var nextHooks = nextNode.hooks;
	if (!isNullOrUndefined(nextHooks) && !isNullOrUndefined(nextHooks.willUpdate)) {
		nextHooks.willUpdate(lastNode.dom);
	}
	var nextTag = nextNode.tag || (staticCheck && !isNullOrUndefined(nextNode.tpl) ? nextNode.tpl.tag : null);
	var lastTag = lastNode.tag || (staticCheck && !isNullOrUndefined(lastNode.tpl) ? lastNode.tpl.tag : null);

	namespace = namespace || nextTag === 'svg' ? SVGNamespace : nextTag === 'math' ? MathNamespace : null;
	if (lastTag !== nextTag) {
		if (isFunction(lastTag) && !isFunction(nextTag)) {
			if (isStatefulComponent(lastTag)) {
				diffNodes(lastNode.instance._lastNode, nextNode, parentDom, namespace, lifecycle, context, true, instance);
			} else {
				diffNodes(lastNode.instance, nextNode, parentDom, namespace, lifecycle, context, true, instance);
			}
		} else {
			replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance);
		}
		return;
	} else if (isNullOrUndefined(lastTag)) {
		nextNode.dom = lastNode.dom;
		return;
	}
	if (isFunction(lastTag) && isFunction(nextTag)) {
		nextNode.instance = lastNode.instance;
		nextNode.dom = lastNode.dom;
		patchComponent(nextNode, nextNode.tag, nextNode.instance, lastNode.attrs || {}, nextNode.attrs || {}, nextNode.hooks, nextNode.children, parentDom, lifecycle, context);
		return;
	}
	var dom = lastNode.dom;
	var nextClassName = nextNode.className;
	var nextStyle = nextNode.style;

	nextNode.dom = dom;
	diffChildren(lastNode, nextNode, dom, namespace, lifecycle, context, staticCheck, instance);

	// node.domTextNodes

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
	diffAttributes(lastNode, nextNode, dom, instance);
	diffEvents(lastNode, nextNode, dom);
	if (!isNullOrUndefined(nextHooks) && !isNullOrUndefined(nextHooks.didUpdate)) {
		nextHooks.didUpdate(dom);
	}
}

var recyclingEnabled = true;

function recycle(node, lifecycle, context) {
	var tpl = node.tpl;

	if (!isNullOrUndefined(tpl)) {
		var key = node.key;
		var recycledNode = void 0;

		if (key !== null) {
			var keyPool = tpl.pools.keyed[key];
			recycledNode = keyPool && keyPool.pop();
		} else {
			var _keyPool = tpl.pools.nonKeyed;
			recycledNode = _keyPool && _keyPool.pop();
		}
		if (!isNullOrUndefined(recycledNode)) {
			diffNodes(recycledNode, node, null, null, lifecycle, context, true);
			return node.dom;
		}
	}
}

function pool(node) {
	var tpl = node.tpl;

	if (!isNullOrUndefined(tpl)) {
		var key = node.key;
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

function mountChildren(node, children, parentDom, namespace, lifecycle, context, instance) {
	var domChildren = [];
	var isNonKeyed = false;
	var hasKeyedAssumption = false;

	if (isArray(children)) {
		for (var i = 0; i < children.length; i++) {
			var child = children[i];

			if (isStringOrNumber(child)) {

				isNonKeyed = true;
				domChildren.push(appendText(child, parentDom, false));
			} else if (!isNullOrUndefined(child) && isArray(child)) {
				var virtualFragment = createVirtualFragment();

				isNonKeyed = true;
				mountChildren(node, child, virtualFragment, namespace, lifecycle, context, instance);
				insertOrAppend(parentDom, virtualFragment);
				domChildren.push(virtualFragment);
			} else if (isPromise(child)) {
				appendPromise(child, parentDom, domChildren, namespace, lifecycle, context, instance);
			} else {
				var domNode = mountNode(child, parentDom, namespace, lifecycle, context, instance);

				if (isNonKeyed || !hasKeyedAssumption && child && isNullOrUndefined(child.key)) {
					isNonKeyed = true;
					domChildren.push(domNode);
				} else if (isInvalidNode(child)) {
					isNonKeyed = true;
					domChildren.push(domNode);
				} else if (hasKeyedAssumption === false) {
					// this will be true if a single node comes back with a key, if it does, we assume the rest have keys for a perf boost
					hasKeyedAssumption = true;
				}
			}
		}
	} else {
		if (isStringOrNumber(children)) {
			appendText(children, parentDom, true);
		} else if (isPromise(children)) {
			appendPromise(children, parentDom, null, namespace, lifecycle, context, instance);
		} else {
			mountNode(children, parentDom, namespace, lifecycle, context, instance);
		}
	}
	if (domChildren.length > 1 && isNonKeyed === true) {
		node.domChildren = domChildren;
	}
}

function mountRef(instance, value, dom) {
	if (!isNullOrUndefined(instance) && isString(value)) {
		instance.refs[value] = dom;
	}
}

function mountComponent(parentNode, Component, props, hooks, children, parentDom, lifecycle, context) {
	props = addChildrenToProps(children, props);

	var dom = void 0;
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
		// avoid DEOPT
		parentDom.appendChild(dom);
	}
	parentNode.dom = dom;
	return dom;
}

function mountEvents(events, node) {
	var allEvents = Object.keys(events);

	for (var i = 0; i < allEvents.length; i++) {
		var event = allEvents[i];
		if (isString(event)) {
			addEventToRegistry(event, node, events[event]);
		}
	}
}

function placeholder(node, parentDom) {
	var dom = createEmptyTextNode();

	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	if (!isNullOrUndefined(node)) {
		node.dom = dom;
	}
	return dom;
}

function mountNode(node, parentDom, namespace, lifecycle, context, instance) {
	if (isInvalidNode(node) || isArray(node)) {
		return placeholder(node, parentDom);
	}

	var dom = void 0;
	if (isStringOrNumber(node)) {
		dom = document.createTextNode(node);

		if (parentDom !== null) {
			parentDom.appendChild(dom);
		}
		return dom;
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
	var tag = node.tag;

	if (tag === null) {
		return placeholder(node, parentDom);
	}
	if (isFunction(tag)) {
		return mountComponent(node, tag, node.attrs || {}, node.hooks, node.children, parentDom, lifecycle, context);
	}
	namespace = namespace || tag === 'svg' ? SVGNamespace : tag === 'math' ? MathNamespace : null;

	var tpl = node.tpl;
	if (!isNullOrUndefined(tpl) && !isNullOrUndefined(tpl.dom)) {
		dom = tpl.dom.cloneNode(true);
	} else {
		if (!isString(tag) || tag === '') {
			throw Error('Inferno Error: Expected function or string for element tag type');
		}
		dom = createElement(tag, namespace);
	}
	var children = node.children;
	var attrs = node.attrs;
	var events = node.events;
	var hooks = node.hooks;
	var className = node.className;
	var style = node.style;

	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.created)) {
			hooks.created(dom);
		}
		if (!isNullOrUndefined(hooks.attached)) {
			lifecycle.addListener(function () {
				hooks.attached(dom);
			});
		}
	}
	if (!isNullOrUndefined(events)) {
		mountEvents(events, node);
	}
	if (!isInvalidNode(children)) {
		mountChildren(node, children, dom, namespace, lifecycle, context, instance);
	}
	if (!isNullOrUndefined(attrs)) {
		mountAttributes(attrs, dom, instance);
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

function mountAttributes(attrs, dom, instance) {
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
		patchNode(root.node, node, parentDom, null, lifecycle, {}, null);
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