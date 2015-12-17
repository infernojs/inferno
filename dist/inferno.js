(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Inferno"] = factory();
	else
		root["Inferno"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _createTemplate = __webpack_require__(46);

	var _createTemplate2 = _interopRequireDefault(_createTemplate);

	var _rendering = __webpack_require__(48);

	var _Component = __webpack_require__(43);

	var _Component2 = _interopRequireDefault(_Component);

	var _TemplateFactory = __webpack_require__(44);

	var _TemplateFactory2 = _interopRequireDefault(_TemplateFactory);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
		Component: _Component2.default,
		createTemplate: _createTemplate2.default,
		TemplateFactory: _TemplateFactory2.default,
		render: _rendering.render,
		renderToString: _rendering.renderToString,
		unmountComponentsAtNode: _rendering.unmountComponentsAtNode
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.ValueTypes = exports.ObjectTypes = undefined;
	exports.createVariable = createVariable;
	exports.getValueWithIndex = getValueWithIndex;
	exports.getTypeFromValue = getTypeFromValue;
	exports.getValueForProps = getValueForProps;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	var ObjectTypes = exports.ObjectTypes = {
		VARIABLE: 1
	};

	var ValueTypes = exports.ValueTypes = {
		TEXT: 0,
		ARRAY: 1,
		TREE: 21
	};

	function createVariable(index) {
		return {
			index: index,
			type: ObjectTypes.VARIABLE
		};
	}

	function getValueWithIndex(item, index) {
		return index < 2 ? index === 0 ? item.v0 : item.v1 : item.values[index - 2];
	}

	function getTypeFromValue(value) {
		if (typeof value === 'string' || typeof value === 'number' || value === undefined) {
			return ValueTypes.TEXT;
		} else if ((0, _isArray2.default)(value)) {
			return ValueTypes.ARRAY;
		} else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.create) {
			return ValueTypes.TREE;
		}
	}

	function getValueForProps(props, item) {
		var newProps = {};

		for (var name in props) {
			var val = props[name];

			if (val && val.index) {
				newProps[name] = getValueWithIndex(item, val.index);
			} else {
				newProps[name] = val;
			}
		}
		return newProps;
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports.default = function (x) {
	  return x.constructor === Array;
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.addDOMStaticAttributes = addDOMStaticAttributes;
	exports.addDOMDynamicAttributes = addDOMDynamicAttributes;
	exports.updateDOMDynamicAttributes = updateDOMDynamicAttributes;

	var _ = __webpack_require__(23);

	var _2 = _interopRequireDefault(_);

	var _eventMapping = __webpack_require__(14);

	var _eventMapping2 = _interopRequireDefault(_eventMapping);

	var _addListener = __webpack_require__(18);

	var _addListener2 = _interopRequireDefault(_addListener);

	var _setValueForStyles = __webpack_require__(26);

	var _setValueForStyles2 = _interopRequireDefault(_setValueForStyles);

	var _variables = __webpack_require__(1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Set HTML attributes on the template
	 * @param{ HTMLElement } node
	 * @param{ Object } attrs
	 */
	function addDOMStaticAttributes(vNode, domNode, attrs) {

		var styleUpdates = undefined;

		for (var attrName in attrs) {
			var _attrVal = attrs[attrName];

			if (_attrVal) {
				if (attrName === 'style') {

					styleUpdates = _attrVal;
				} else {
					_2.default.setProperty(vNode, domNode, attrName, _attrVal, false);
				}
			}
		}

		if (styleUpdates) {
			(0, _setValueForStyles2.default)(vNode, domNode, styleUpdates);
		}
	}

	// A fast className setter as its the most common property to regularly change
	function fastPropSet(attrName, attrVal, domNode) {
		if (attrName === 'class' || attrName === 'className') {
			if (attrVal != null) {
				domNode.className = attrVal;
			}
			return true;
		}
		return false;
	}

	function addDOMDynamicAttributes(item, domNode, dynamicAttrs) {
		if (dynamicAttrs.index !== undefined) {
			dynamicAttrs = (0, _variables.getValueWithIndex)(item, dynamicAttrs.index);
			addDOMStaticAttributes(item, domNode, dynamicAttrs);
			return;
		}

		var styleUpdates = undefined;

		for (var attrName in dynamicAttrs) {
			var _attrVal2 = (0, _variables.getValueWithIndex)(item, dynamicAttrs[attrName]);

			if (_attrVal2 !== undefined) {

				if (attrName === 'style') {

					styleUpdates = _attrVal2;
				} else {

					if (fastPropSet(attrName, _attrVal2, domNode) === false) {
						if (_eventMapping2.default[attrName]) {
							(0, _addListener2.default)(item, domNode, _eventMapping2.default[attrName], _attrVal2);
						} else {
							_2.default.setProperty(item, domNode, attrName, _attrVal2, true);
						}
					}
				}
			}
		}

		if (styleUpdates) {
			(0, _setValueForStyles2.default)(item, domNode, styleUpdates);
		}
	}

	function updateDOMDynamicAttributes(lastItem, nextItem, domNode, dynamicAttrs) {
		if (dynamicAttrs.index !== undefined) {
			var nextDynamicAttrs = (0, _variables.getValueWithIndex)(nextItem, dynamicAttrs.index);
			addDOMStaticAttributes(nextItem, domNode, nextDynamicAttrs);
			return;
		}

		var styleUpdates = undefined;

		for (var attrName in dynamicAttrs) {
			var lastAttrVal = (0, _variables.getValueWithIndex)(lastItem, dynamicAttrs[attrName]);
			var nextAttrVal = (0, _variables.getValueWithIndex)(nextItem, dynamicAttrs[attrName]);

			if (lastAttrVal !== nextAttrVal) {
				if (nextAttrVal !== undefined) {

					if (attrName === 'style') {

						styleUpdates = attrVal;
					} else {

						if (fastPropSet(attrName, nextAttrVal, domNode) === false) {
							if (_eventMapping2.default[attrName]) {
								(0, _addListener2.default)(nextItem, domNode, _eventMapping2.default[attrName], nextAttrVal);
							} else {
								_2.default.setProperty(nextItem, domNode, attrName, nextAttrVal, true);
							}
						}
					}
				}
			}
		}

		if (styleUpdates) {
			(0, _setValueForStyles2.default)(vNode, domNode, styleUpdates);
		}
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.pool = pool;
	exports.recycle = recycle;
	exports.isRecyclingEnabled = isRecyclingEnabled;
	var recyclingEnabled = true;

	function pool(item) {
		var key = item.key;
		var tree = item.domTree;
		if (key === null) {
			tree.pool.push(item);
		} else {
			var keyedPool = tree.keyedPool; // TODO rename
			(keyedPool[key] || (keyedPool[key] = [])).push(item);
		}
	}

	function recycle(tree, item) {
		// TODO use depth as key
		var key = item.key;
		var recyclableItem = undefined;
		// TODO faster to check pool size first?
		if (key !== null) {
			var keyPool = tree.keyedPool[key];
			recyclableItem = keyPool && keyPool.pop();
		} else {
			recyclableItem = tree.pool.pop();
		}
		if (recyclableItem) {
			tree.update(recyclableItem, item);
			return item.rootNode;
		}
	}

	function isRecyclingEnabled() {
		return recyclingEnabled;
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = recreateRootNode;
	function recreateRootNode(lastItem, nextItem, node) {
		var lastDomNode = lastItem.rootNode;
		var domNode = node.create(nextItem);
		lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
		// TODO recycle old node
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.updateKeyed = updateKeyed;
	exports.insertOrAppend = insertOrAppend;
	exports.remove = remove;

	var _recycling = __webpack_require__(4);

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function updateKeyed(items, oldItems, parentNode, parentNextNode) {
		var stop = false;
		var startIndex = 0;
		var oldStartIndex = 0;
		var itemsLength = items.length;
		var oldItemsLength = oldItems.length;

		// TODO only if there are no other children
		if (itemsLength === 0 && oldItemsLength >= 5) {
			if (recyclingEnabled) {
				for (var i = 0; i < oldItemsLength; i++) {
					(0, _recycling.pool)(oldItems[i]);
				}
			}
			parentNode.textContent = '';
			return;
		}

		var endIndex = itemsLength - 1;
		var oldEndIndex = oldItemsLength - 1;
		var startItem = itemsLength > 0 && items[startIndex];
		var oldStartItem = oldItemsLength > 0 && oldItems[oldStartIndex];
		var endItem = undefined;
		var oldEndItem = undefined;
		var nextNode = undefined;
		var oldItem = undefined;
		var item = undefined;

		// TODO don't read key too often
		outer: while (!stop && startIndex <= endIndex && oldStartIndex <= oldEndIndex) {
			stop = true;
			while (startItem.key === oldStartItem.key) {
				startItem.domTree.update(oldStartItem, startItem);
				startIndex++;
				oldStartIndex++;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					startItem = items[startIndex];
					oldStartItem = oldItems[oldStartIndex];
					stop = false;
				}
			}
			endItem = items[endIndex];
			oldEndItem = oldItems[oldEndIndex];
			while (endItem.key === oldEndItem.key) {
				endItem.domTree.update(oldEndItem, endItem);
				endIndex--;
				oldEndIndex--;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					endItem = items[endIndex];
					oldEndItem = oldItems[oldEndIndex];
					stop = false;
				}
			}
			while (endItem.key === oldStartItem.key) {
				nextNode = endIndex + 1 < itemsLength ? items[endIndex + 1].rootNode : parentNextNode;
				endItem.domTree.update(oldStartItem, endItem);
				insertOrAppend(parentNode, endItem.rootNode, nextNode);
				endIndex--;
				oldStartIndex++;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					endItem = items[endIndex];
					oldStartItem = oldItems[oldStartIndex];
					stop = false;
				}
			}
			while (startItem.key === oldEndItem.key) {
				nextNode = oldItems[oldStartIndex].rootNode;
				startItem.domTree.update(oldEndItem, startItem);
				insertOrAppend(parentNode, startItem.rootNode, nextNode);
				startIndex++;
				oldEndIndex--;
				if (startIndex > endIndex || oldStartIndex > oldEndIndex) {
					break outer;
				} else {
					startItem = items[startIndex];
					oldEndItem = oldItems[oldEndIndex];
					stop = false;
				}
			}
		}

		if (oldStartIndex > oldEndIndex) {
			if (startIndex <= endIndex) {
				nextNode = endIndex + 1 < itemsLength ? items[endIndex + 1].rootNode : parentNextNode;
				for (; startIndex <= endIndex; startIndex++) {
					item = items[startIndex];
					insertOrAppend(parentNode, item.domTree.create(item), nextNode);
				}
			}
		} else if (startIndex > endIndex) {
			for (; oldStartIndex <= oldEndIndex; oldStartIndex++) {
				oldItem = oldItems[oldStartIndex];
				remove(oldItem, parentNode);
			}
		} else {
			var oldItemsMap = {};
			var oldNextItem = oldEndIndex + 1 < oldItemsLength ? oldItems[oldEndIndex + 1] : null;

			for (var i = oldEndIndex; i >= oldStartIndex; i--) {
				oldItem = oldItems[i];
				oldItem.nextItem = oldNextItem;
				oldItemsMap[oldItem.key] = oldItem;
				oldNextItem = oldItem;
			}
			var nextItem = endIndex + 1 < itemsLength ? items[endIndex + 1] : null;
			for (var i = endIndex; i >= startIndex; i--) {
				item = items[i];
				var key = item.key;

				oldItem = oldItemsMap[key];
				if (oldItem) {
					oldItemsMap[key] = null;
					oldNextItem = oldItem.nextItem;
					item.domTree.update(oldItem, item);
					// TODO optimise
					if (item.rootNode.nextSibling != (nextItem && nextItem.rootNode)) {
						nextNode = nextItem && nextItem.rootNode || parentNextNode;
						insertOrAppend(parentNode, item.rootNode, nextNode);
					}
				} else {
					nextNode = nextItem && nextItem.rootNode || parentNextNode;
					insertOrAppend(parentNode, item.domTree.create(item), nextNode);
				}
				nextItem = item;
			}
			for (var i = oldStartIndex; i <= oldEndIndex; i++) {
				oldItem = oldItems[i];
				if (oldItemsMap[oldItem.key] !== null) {
					oldItem = oldItems[oldStartIndex];
					remove(item, parentNode);
				}
			}
		}
	}

	function insertOrAppend(parentNode, newNode, nextNode) {
		if (nextNode) {
			parentNode.insertBefore(newNode, nextNode);
		} else {
			parentNode.appendChild(newNode);
		}
	}

	function remove(item, parentNode) {
		parentNode.removeChild(item.rootNode);
		if (recyclingEnabled) {
			(0, _recycling.pool)(item);
		}
	}

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = InfernoNodeID;
	var INFERNO_PROP = '__Inferno__id__';
	var counter = 1;

	function InfernoNodeID(node, get) {
		return node[INFERNO_PROP] || (get ? 0 : node[INFERNO_PROP] = counter++);
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Internal store for event listeners
	 * DOMNodeId -> type -> listener
	 */
	exports.default = {};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _ExecutionEnvironment = __webpack_require__(56);

	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);

	var _addRootListener = __webpack_require__(10);

	var _addRootListener2 = _interopRequireDefault(_addRootListener);

	var _setHandler = __webpack_require__(12);

	var _setHandler2 = _interopRequireDefault(_setHandler);

	var _focusEvents = __webpack_require__(53);

	var _focusEvents2 = _interopRequireDefault(_focusEvents);

	var _eventMapping = __webpack_require__(14);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var standardNativeEvents = Object.keys(_eventMapping.standardNativeEventMapping).map(function (key) {
		return _eventMapping.standardNativeEventMapping[key];
	});

	var nonBubbleableEvents = Object.keys(_eventMapping.nonBubbleableEventMapping).map(function (key) {
		return _eventMapping.nonBubbleableEventMapping[key];
	});

	var EventRegistry = {};

	if (_ExecutionEnvironment2.default.canUseDOM) {
		var i = 0;
		var type = undefined;
		var nativeFocus = 'onfocusin' in document.documentElement;

		for (; i < standardNativeEvents.length; i++) {
			type = standardNativeEvents[i];
			EventRegistry[type] = {
				_type: type,
				_bubbles: true,
				_counter: 0,
				_enabled: false
			};
			// 'focus' and 'blur'
			if (_focusEvents2.default[type]) {
				// IE has `focusin` and `focusout` events which bubble.
				// @see http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				EventRegistry[type]._focusBlur = nativeFocus ? function () {
					var _type = this._type;
					var handler = (0, _setHandler2.default)(_type, function (e) {
						(0, _addRootListener2.default)(e, _type);
					}).handler;
					document.addEventListener(_focusEvents2.default[_type], handler);
				}
				// firefox doesn't support focusin/focusout events
				: function () {
					var _type = this._type;
					document.addEventListener(_type, (0, _setHandler2.default)(_type, _addRootListener2.default).handler, true);
				};
			}
		}
		// For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
		for (i = 0; i < nonBubbleableEvents.length; i++) {
			type = nonBubbleableEvents[i];
			EventRegistry[type] = {
				_type: type,
				_bubbles: false,
				_enabled: false
			};
		}
	}

	exports.default = EventRegistry;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = addRootListener;

	var _InfernoNodeID = __webpack_require__(7);

	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);

	var _listenersStorage = __webpack_require__(8);

	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);

	var _EventRegistry = __webpack_require__(9);

	var _EventRegistry2 = _interopRequireDefault(_EventRegistry);

	var _eventInterface = __webpack_require__(20);

	var _eventInterface2 = _interopRequireDefault(_eventInterface);

	var _createListenerArguments = __webpack_require__(11);

	var _createListenerArguments2 = _interopRequireDefault(_createListenerArguments);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function addRootListener(e, type) {
		type || (type = e.type);
		var registry = _EventRegistry2.default[type];

		// Support: Safari 6-8+
		// Target should not be a text node
		if (e.target.nodeType === 3) {
			e.target = e.target.parentNode;
		}

		var target = e.target,
		    listenersCount = registry._counter,
		    listeners = undefined,
		    listener = undefined,
		    nodeID = undefined,
		    event = undefined,
		    args = undefined,
		    defaultArgs = undefined;

		if (listenersCount > 0) {
			event = (0, _eventInterface2.default)(e, type);
			defaultArgs = args = [event];
		}
		// NOTE: Only the event blubbling phase is modeled. This is done because
		// handlers specified on props can not specify they are handled on the
		// capture phase.
		while (target !== null && listenersCount > 0 && target !== document.parentNode) {
			if (nodeID = (0, _InfernoNodeID2.default)(target, true)) {
				listeners = _listenersStorage2.default[nodeID];
				if (listeners && listeners[type] && (listener = listeners[type])) {
					// lazily instantiate additional arguments in the case
					// where an event handler takes more than one argument
					// listener is a function, and length is the number of
					// arguments that function takes
					var numArgs = listener.originalHandler.length;
					args = defaultArgs;
					if (numArgs > 1) {
						args = (0, _createListenerArguments2.default)(target, event);
					}

					// 'this' on an eventListener is the element handling the event
					// event.currentTarget is unwriteable, and since these are
					// native events, will always refer to the document. Therefore
					// 'this' is the only supported way of referring to the element
					// whose listener is handling the current event
					listener.handler.apply(target, args);

					// Check if progagation stopped. There is only one listener per
					// type, so we do not need to check immediate propagation.
					if (event.isPropagationStopped()) {
						break;
					}

					--listenersCount;
				}
			}
			target = target.parentNode;
		}
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createListenerArguments;

	var _isFormElement = __webpack_require__(58);

	var _isFormElement2 = _interopRequireDefault(_isFormElement);

	var _getFormElementValues = __webpack_require__(22);

	var _getFormElementValues2 = _interopRequireDefault(_getFormElementValues);

	var _setupHooks = __webpack_require__(54);

	var _setupHooks2 = _interopRequireDefault(_setupHooks);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createListenerArguments(target, event) {
		var type = event.type;
		var nodeName = target.nodeName.toLowerCase();

		var tagHooks = undefined;

		if (tagHooks = _setupHooks2.default[type]) {
			var hook = tagHooks[nodeName];
			if (hook) {
				return hook(target, event);
			}
		}
		// Default behavior:
		// Form elements with a value attribute will have the arguments:
		// [event, value]
		if ((0, _isFormElement2.default)(nodeName)) {
			return [event, (0, _getFormElementValues2.default)(target)];
		}
		// Fallback to just event
		return [event];
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = setHandler;

	var _eventHooks = __webpack_require__(52);

	var _eventHooks2 = _interopRequireDefault(_eventHooks);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Creates a wrapped handler that hooks into the Inferno
	 * eventHooks system based on the type of event being
	 * attached.
	 *
	 * @param {string} type
	 * @param {Function} handler
	 * @return {Function} wrapped handler
	 */
	function setHandler(type, handler) {
	  var hook = _eventHooks2.default[type];
	  if (hook) {
	    var hooked = hook(handler);
	    hooked.originalHandler = handler;
	    return hooked;
	  }

	  return { handler: handler, originalHandler: handler };
	}

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = unmountComponent;
	function unmountComponent(instance) {
		// TODO
		// if we have a parentComponent, remove us from there
		// unmount us and then
		// unmount all our child components too
	}

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var standardNativeEventMapping = exports.standardNativeEventMapping = {
		onBlur: 'blur',
		onChange: 'change',
		onClick: 'click',
		onCompositionEnd: 'compositionend',
		onCompositionStart: 'compositionstart',
		onCompositionUpdate: 'compositionupdate',
		onContextMenu: 'contextmenu',
		onCopy: 'copy',
		onCut: 'cut',
		onDoubleClick: 'dblclick',
		onDrag: 'drag',
		onDragEnd: 'dragend',
		onDragEnter: 'dragenter',
		onDragExit: 'dragexit',
		onDragLeave: 'dragleave',
		onDragOver: 'dragover',
		onDragStart: 'dragstart',
		onDrop: 'drop',
		onFocus: 'focus',
		onFocusIn: 'focusin',
		onFocusOut: 'focusout',
		onInput: 'input',
		onKeyDown: 'keydown',
		onKeyPress: 'keypress',
		onKeyUp: 'keyup',
		onMouseDown: 'mousedown',
		onMouseMove: 'mousemove',
		onMouseOut: 'mouseout',
		onMouseOver: 'mouseover',
		onMouseUp: 'mouseup',
		onMouseWheel: 'mousewheel',
		onPaste: 'paste',
		onReset: 'reset',
		onSelect: 'select',
		onSelectionChange: 'selectionchange',
		onSelectStart: 'selectstart',
		onShow: 'show',
		onSubmit: 'submit',
		onTextInput: 'textInput',
		onTouchCancel: 'touchcancel',
		onTouchEnd: 'touchend',
		onTouchMove: 'touchmove',
		onTouchStart: 'touchstart',
		onWheel: 'wheel'
	};

	var nonBubbleableEventMapping = exports.nonBubbleableEventMapping = {
		onAbort: 'abort',
		onBeforeUnload: 'beforeunload',
		onCanPlay: 'canplay',
		onCanPlayThrough: 'canplaythrough',
		onDurationChange: 'durationchange',
		onEmptied: 'emptied',
		onEnded: 'ended',
		onError: 'error',
		onInput: 'input',
		onInvalid: 'invalid',
		onLoad: 'load',
		onLoadedData: 'loadeddata',
		onLoadedMetadata: 'loadedmetadata',
		onLoadStart: 'loadstart',
		onMouseEnter: 'mouseenter',
		onMouseLeave: 'mouseleave',
		onOrientationChange: 'orientationchange',
		onPause: 'pause',
		onPlay: 'play',
		onPlaying: 'playing',
		onProgress: 'progress',
		onRateChange: 'ratechange',
		onResize: 'resize',
		onScroll: 'scroll',
		onSeeked: 'seeked',
		onSeeking: 'seeking',
		onSelect: 'select',
		onStalled: 'stalled',
		onSuspend: 'suspend',
		onTimeUpdate: 'timeupdate',
		onUnload: 'unload',
		onVolumeChange: 'volumechange',
		onWaiting: 'waiting'
	};

	var propertyToEventType = {};
	[standardNativeEventMapping, nonBubbleableEventMapping].forEach(function (mapping) {
		Object.keys(mapping).reduce(function (state, property) {
			state[property] = mapping[property];
			return state;
		}, propertyToEventType);
	});

	exports.default = propertyToEventType;

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var PROPERTY = 0x1;
	var BOOLEAN = 0x2;
	var NUMERIC_VALUE = 0x4;
	var POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;

	var xlink = 'http://www.w3.org/1999/xlink';
	var xml = 'http://www.w3.org/XML/1998/namespace';

	var DOMAttributeNamespaces = {
	    'xlink:actuate': xlink,
	    'xlink:arcrole': xlink,
	    'xlink:href': xlink,
	    'xlink:role': xlink,
	    'xlink:show': xlink,
	    'xlink:title': xlink,
	    'xlink:type': xlink,
	    'xml:base': xml,
	    'xml:lang': xml,
	    'xml:space': xml
	};

	var DOMAttributeNames = {
	    acceptCharset: 'accept-charset',
	    className: 'class',
	    htmlFor: 'for',
	    httpEquiv: 'http-equiv',
	    xlinkActuate: 'xlink:actuate',
	    xlinkArcrole: 'xlink:arcrole',
	    xlinkHref: 'xlink:href',
	    xlinkRole: 'xlink:role',
	    xlinkShow: 'xlink:show',
	    xlinkTitle: 'xlink:title',
	    xlinkType: 'xlink:type',
	    xmlBase: 'xml:base',
	    xmlLang: 'xml:lang',
	    xmlSpace: 'xml:space',
	    viewBox: 'viewBox' // SVG - Edge case. The letter 'b' need to be uppercase
	};

	var DOMPropertyNames = {
	    autoComplete: 'autocomplete',
	    autoFocus: 'autofocus',
	    autoPlay: 'autoplay',
	    autoSave: 'autosave',
	    hrefLang: 'hreflang',
	    radioGroup: 'radiogroup',
	    spellCheck: 'spellcheck',
	    srcDoc: 'srcdoc',
	    srcSet: 'srcset'
	};

	// This 'whitelist' contains edge cases such as attributes
	// that should be seen as a property or boolean property.
	// ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
	var Whitelist = {
	    allowFullScreen: BOOLEAN,
	    async: BOOLEAN,
	    autoFocus: BOOLEAN,
	    autoPlay: null,
	    capture: BOOLEAN,
	    checked: PROPERTY | BOOLEAN,
	    controls: BOOLEAN,
	    currentTime: PROPERTY | POSITIVE_NUMERIC_VALUE,
	    default: BOOLEAN,
	    defaultChecked: BOOLEAN,
	    defaultMuted: BOOLEAN,
	    defaultSelected: BOOLEAN,
	    defer: BOOLEAN,
	    disabled: PROPERTY | BOOLEAN,
	    download: BOOLEAN,
	    enabled: BOOLEAN,
	    formNoValidate: BOOLEAN,
	    hidden: PROPERTY | BOOLEAN, // 3.2.5 - Global attributes
	    loop: BOOLEAN,
	    // Caution; `option.selected` is not updated if `select.multiple` is
	    // disabled with `removeAttribute`.
	    multiple: PROPERTY | BOOLEAN,
	    muted: PROPERTY | BOOLEAN,
	    noValidate: BOOLEAN,
	    noShade: PROPERTY | BOOLEAN,
	    noResize: BOOLEAN,
	    noWrap: BOOLEAN,
	    typeMustMatch: BOOLEAN,
	    open: BOOLEAN,
	    paused: PROPERTY,
	    playbackRate: PROPERTY | NUMERIC_VALUE,
	    readOnly: BOOLEAN,
	    required: PROPERTY | BOOLEAN,
	    reversed: BOOLEAN,
	    draggable: BOOLEAN, // 3.2.5 - Global attributes
	    dropzone: null, // 3.2.5 - Global attributes
	    scoped: BOOLEAN,
	    visible: BOOLEAN,
	    trueSpeed: BOOLEAN,
	    sortable: BOOLEAN,
	    inert: BOOLEAN,
	    indeterminate: BOOLEAN,
	    nohref: BOOLEAN,
	    compact: BOOLEAN,
	    declare: BOOLEAN,
	    ismap: PROPERTY | BOOLEAN,
	    pauseOnExit: PROPERTY | BOOLEAN,
	    seamless: BOOLEAN,
	    translate: BOOLEAN, // 3.2.5 - Global attributes
	    selected: PROPERTY | BOOLEAN,
	    srcLang: PROPERTY,
	    srcObject: PROPERTY,
	    value: PROPERTY,
	    volume: PROPERTY | POSITIVE_NUMERIC_VALUE,
	    itemScope: BOOLEAN, // 3.2.5 - Global attributes
	    className: null,
	    tabindex: PROPERTY | NUMERIC_VALUE,

	    /**
	     * Numeric attributes
	     */
	    cols: POSITIVE_NUMERIC_VALUE,
	    rows: NUMERIC_VALUE,
	    rowspan: NUMERIC_VALUE,
	    size: POSITIVE_NUMERIC_VALUE,
	    sizes: NUMERIC_VALUE,
	    start: NUMERIC_VALUE,

	    /**
	     * Namespace attributes
	     */
	    'xlink:actuate': null,
	    'xlink:arcrole': null,
	    'xlink:href': null,
	    'xlink:role': null,
	    'xlink:show': null,
	    'xlink:title': null,
	    'xlink:type': null,
	    'xml:base': null,
	    'xml:lang': null,
	    'xml:space': null,

	    /**
	     * 3.2.5 - Global attributes
	     */
	    itemprop: true,
	    itemref: true,
	    itemscope: true,
	    itemtype: true,
	    id: null,
	    class: null,
	    dir: null,
	    lang: null,
	    title: null,

	    /**
	     * Properties that MUST be set as attributes, due to:
	     *
	     * - browser bug
	     * - strange spec outlier
	     *
	     * Nothing bad with this. This properties get a performance boost
	     * compared to custom attributes because they are skipping the
	     * validation check.
	     */

	    // Force 'autocorrect' and 'autoCapitalize' to be set as an attribute
	    // to fix issues with Mobile Safari on iOS devices
	    autocorrect: BOOLEAN,

	    autoCapitalize: null,

	    // Some version of IE (like IE9) actually throw an exception
	    // if you set input.type = 'something-unknown'
	    type: null,

	    /**
	     * Form
	     */
	    form: null,
	    formAction: null,
	    formEncType: null,
	    formMethod: null,
	    formTarget: null,
	    frameBorder: null,

	    /**
	     * Internet Explorer / Edge
	     */

	    // IE-only attribute that controls focus behavior
	    unselectable: null,

	    /**
	     * Firefox
	     */

	    continuous: BOOLEAN,

	    /**
	     * Safari
	     */

	    // color is for Safari mask-icon link
	    color: null,

	    /**
	     * RDFa Properties
	     */
	    datatype: null,
	    // property is also supported for OpenGraph in meta tags.
	    property: null,

	    /**
	     * Others
	     */

	    srcSet: null,
	    scrolling: null,
	    nonce: null,
	    method: null,
	    minLength: null,
	    marginWidth: null,
	    marginHeight: null,
	    list: null,
	    keyType: null,
	    is: null,
	    inputMode: null,
	    height: null,
	    width: null,
	    dateTime: null,
	    contenteditable: null, // 3.2.5 - Global attributes
	    contextMenu: null,
	    classID: null,
	    cellPadding: null,
	    cellSpacing: null,
	    charSet: null,
	    allowTransparency: null,
	    spellcheck: null // 3.2.5 - Global attributes
	};

	var HTMLPropsContainer = {};

	function checkBitmask(value, bitmask) {
	    return bitmask !== null && (value & bitmask) === bitmask;
	}

	for (var propName in Whitelist) {

	    var propConfig = Whitelist[propName];

	    HTMLPropsContainer[propName] = {
	        attributeName: DOMAttributeNames[propName] || propName.toLowerCase(),
	        attributeNamespace: DOMAttributeNamespaces[propName] ? DOMAttributeNamespaces[propName] : null,
	        propertyName: DOMPropertyNames[propName] || propName,

	        mustUseProperty: checkBitmask(propConfig, PROPERTY),
	        hasBooleanValue: checkBitmask(propConfig, BOOLEAN),
	        hasNumericValue: checkBitmask(propConfig, NUMERIC_VALUE),
	        hasPositiveNumericValue: checkBitmask(propConfig, POSITIVE_NUMERIC_VALUE)
	    };
	}

	exports.default = HTMLPropsContainer;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createDOMFragment;

	var _domMutate = __webpack_require__(6);

	function createDOMFragment(parentNode, nextNode) {
		var lastItem = undefined;
		var _componentTree = [];
		var treeSuccessListeners = [];
		var treeLifecycle = {
			addTreeSuccessListener: function addTreeSuccessListener(listener) {
				treeSuccessListeners.push(listener);
			},
			removeTreeSuccessListener: function removeTreeSuccessListener(listener) {
				for (var i = 0; i < treeSuccessListeners.length; i++) {
					var treeSuccessListener = treeSuccessListeners[i];

					if (treeSuccessListener === listener) {
						treeSuccessListeners.splice(i, 1);
						return;
					}
				}
			}
		};
		var fragment = {
			parentNode: parentNode,
			_componentTree: _componentTree,
			render: function render(nextItem) {
				if (!nextItem) {
					return;
				}
				var tree = nextItem.domTree;

				if (lastItem) {
					tree.update(lastItem, nextItem, _componentTree, treeLifecycle);
				} else {
					var dom = tree.create(nextItem, _componentTree, treeLifecycle);

					if (nextNode) {
						parentNode.insertBefore(dom, nextNode);
					} else if (parentNode) {
						parentNode.appendChild(dom);
					}
				}
				lastItem = nextItem;
				return fragment;
			},
			remove: function remove() {
				(0, _domMutate.remove)(lastItem, parentNode);
				return fragment;
			}
		};
		return fragment;
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createDOMTree;

	var _rootNodeWithDynamicText = __webpack_require__(37);

	var _rootNodeWithDynamicText2 = _interopRequireDefault(_rootNodeWithDynamicText);

	var _nodeWithDynamicText = __webpack_require__(31);

	var _nodeWithDynamicText2 = _interopRequireDefault(_nodeWithDynamicText);

	var _rootNodeWithStaticChild = __webpack_require__(38);

	var _rootNodeWithStaticChild2 = _interopRequireDefault(_rootNodeWithStaticChild);

	var _nodeWithStaticChild = __webpack_require__(32);

	var _nodeWithStaticChild2 = _interopRequireDefault(_nodeWithStaticChild);

	var _rootNodeWithDynamicChild = __webpack_require__(35);

	var _rootNodeWithDynamicChild2 = _interopRequireDefault(_rootNodeWithDynamicChild);

	var _nodeWithDynamicChild = __webpack_require__(29);

	var _nodeWithDynamicChild2 = _interopRequireDefault(_nodeWithDynamicChild);

	var _rootNodeWithDynamicSubTreeForChildren = __webpack_require__(36);

	var _rootNodeWithDynamicSubTreeForChildren2 = _interopRequireDefault(_rootNodeWithDynamicSubTreeForChildren);

	var _nodeWithDynamicSubTreeForChildren = __webpack_require__(30);

	var _nodeWithDynamicSubTreeForChildren2 = _interopRequireDefault(_nodeWithDynamicSubTreeForChildren);

	var _rootStaticNode = __webpack_require__(39);

	var _rootStaticNode2 = _interopRequireDefault(_rootStaticNode);

	var _staticNode = __webpack_require__(41);

	var _staticNode2 = _interopRequireDefault(_staticNode);

	var _rootDynamicNode = __webpack_require__(33);

	var _rootDynamicNode2 = _interopRequireDefault(_rootDynamicNode);

	var _dynamicNode = __webpack_require__(27);

	var _dynamicNode2 = _interopRequireDefault(_dynamicNode);

	var _rootVoidNode = __webpack_require__(40);

	var _rootVoidNode2 = _interopRequireDefault(_rootVoidNode);

	var _voidNode = __webpack_require__(42);

	var _voidNode2 = _interopRequireDefault(_voidNode);

	var _rootNodeWithComponent = __webpack_require__(34);

	var _rootNodeWithComponent2 = _interopRequireDefault(_rootNodeWithComponent);

	var _nodeWithComponent = __webpack_require__(28);

	var _nodeWithComponent2 = _interopRequireDefault(_nodeWithComponent);

	var _variables = __webpack_require__(1);

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _addAttributes = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function createStaticAttributes(node, domNode, excludeAttrs) {
	    var attrs = node.attrs;

	    if (attrs != null) {
	        if (excludeAttrs) {
	            var newAttrs = _extends({}, attrs);

	            for (var attr in excludeAttrs) {
	                if (newAttrs[attr]) {
	                    delete newAttrs[attr];
	                }
	            }
	            (0, _addAttributes.addDOMStaticAttributes)(node, domNode, newAttrs);
	        } else {
	            (0, _addAttributes.addDOMStaticAttributes)(node, domNode, attrs);
	        }
	    }
	}

	function createStaticTreeChildren(children, parentNode, domNamespace) {
	    if ((0, _isArray2.default)(children)) {
	        for (var i = 0; i < children.length; i++) {
	            var childItem = children[i];
	            if (typeof childItem === 'string' || typeof childItem === 'number') {
	                var textNode = document.createTextNode(childItem);
	                parentNode.appendChild(textNode);
	            } else {
	                createStaticTreeNode(childItem, parentNode, domNamespace);
	            }
	        }
	    } else {
	        if (typeof children === 'string' || typeof children === 'number') {
	            parentNode.textContent = children;
	        } else {
	            createStaticTreeNode(children, parentNode, domNamespace);
	        }
	    }
	}

	function createStaticTreeNode(node, parentNode, domNamespace, schema) {
	    var staticNode = undefined;

	    if (typeof node === 'string' || typeof node === 'number') {
	        staticNode = document.createTextNode(node);
	    } else {
	        var tag = node.tag;
	        if (tag) {
	            var namespace = node.attrs && node.attrs.xmlns || null;
	            var is = node.attrs && node.attrs.is || null;

	            if (!namespace) {
	                switch (tag) {
	                    case 'svg':
	                        domNamespace = 'http://www.w3.org/2000/svg';
	                        break;
	                    case 'math':
	                        domNamespace = 'http://www.w3.org/1998/Math/MathML';
	                        break;
	                    default:
	                        break;
	                }
	            } else {
	                domNamespace = namespace;
	            }
	            if (domNamespace) {
	                if (is) {
	                    staticNode = document.createElementNS(domNamespace, tag, is);
	                } else {
	                    staticNode = document.createElementNS(domNamespace, tag);
	                }
	            } else {
	                if (is) {
	                    staticNode = document.createElement(tag, is);
	                } else {
	                    staticNode = document.createElement(tag);
	                }
	            }
	            var text = node.text;
	            var children = node.children;

	            if (text != null) {
	                if (children != null) {
	                    throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
	                }
	                staticNode.textContent = text;
	            } else {
	                if (children != null) {
	                    createStaticTreeChildren(children, staticNode, domNamespace);
	                }
	            }
	            createStaticAttributes(node, staticNode);
	        } else if (node.text) {
	            staticNode = document.createTextNode(node.text);
	        }
	    }
	    if (parentNode === null) {
	        return staticNode;
	    } else {
	        parentNode.appendChild(staticNode);
	    }
	}

	function createDOMTree(schema, isRoot, dynamicNodeMap, domNamespace) {
	    var dynamicFlags = dynamicNodeMap.get(schema);
	    var node = undefined;
	    var templateNode = undefined;

	    if ((0, _isArray2.default)(schema)) {
	        throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
	    }

	    if (!dynamicFlags) {
	        templateNode = createStaticTreeNode(schema, null, domNamespace, schema);

	        if (!templateNode) {
	            throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
	        }

	        if (isRoot) {
	            node = (0, _rootStaticNode2.default)(templateNode);
	        } else {
	            node = (0, _staticNode2.default)(templateNode);
	        }
	    } else {
	        if (dynamicFlags.NODE === true) {
	            if (isRoot) {
	                node = (0, _rootDynamicNode2.default)(schema.index, domNamespace);
	            } else {
	                node = (0, _dynamicNode2.default)(schema.index, domNamespace);
	            }
	        } else {
	            var tag = schema.tag;

	            if (tag) {
	                if (tag.type === _variables.ObjectTypes.VARIABLE) {
	                    var lastAttrs = schema.attrs;
	                    var _attrs = _extends({}, lastAttrs);
	                    var _children = null;

	                    if (schema.children) {
	                        if ((0, _isArray2.default)(schema.children) && schema.children.length > 1) {
	                            _attrs.children = [];
	                            for (var i = 0; i < schema.children.length; i++) {
	                                var childNode = schema.children[i];
	                                _attrs.children.push(createDOMTree(childNode, false, dynamicNodeMap, domNamespace));
	                            }
	                        } else {
	                            if ((0, _isArray2.default)(schema.children) && schema.children.length === 1) {
	                                _attrs.children = createDOMTree(schema.children[0], false, dynamicNodeMap, domNamespace);
	                            } else {
	                                _attrs.children = createDOMTree(schema.children, false, dynamicNodeMap, domNamespace);
	                            }
	                        }
	                    }
	                    if (isRoot) {
	                        return (0, _rootNodeWithComponent2.default)(tag.index, _attrs, _children, domNamespace);
	                    } else {
	                        return (0, _nodeWithComponent2.default)(tag.index, _attrs, _children, domNamespace);
	                    }
	                }
	                var namespace = schema.attrs && schema.attrs.xmlns || null;
	                var is = schema.attrs && schema.attrs.is || null;

	                if (!namespace) {
	                    switch (tag) {
	                        case 'svg':
	                            domNamespace = 'http://www.w3.org/2000/svg';
	                            break;
	                        case 'math':
	                            domNamespace = 'http://www.w3.org/1998/Math/MathML';
	                            break;
	                        default:
	                            break;
	                    }
	                } else {
	                    domNamespace = namespace;
	                }
	                if (domNamespace) {
	                    if (is) {
	                        templateNode = document.createElementNS(domNamespace, tag, is);
	                    } else {
	                        templateNode = document.createElementNS(domNamespace, tag);
	                    }
	                } else {
	                    if (is) {
	                        templateNode = document.createElement(tag, is);
	                    } else {
	                        templateNode = document.createElement(tag);
	                    }
	                }
	                var attrs = schema.attrs;
	                var dynamicAttrs = null;

	                if (attrs != null) {
	                    if (dynamicFlags.ATTRS === true) {
	                        dynamicAttrs = attrs;
	                    } else if (dynamicFlags.ATTRS !== false) {
	                        dynamicAttrs = dynamicFlags.ATTRS;
	                        createStaticAttributes(schema, templateNode, dynamicAttrs);
	                    } else {
	                        createStaticAttributes(schema, templateNode);
	                    }
	                }
	                var text = schema.text;
	                var children = schema.children;

	                if (text != null) {
	                    if (children != null) {
	                        throw Error('Inferno Error: Template nodes cannot contain both TEXT and a CHILDREN properties, they must only use one or the other.');
	                    }
	                    if (dynamicFlags.TEXT === true) {
	                        if (isRoot) {
	                            node = (0, _rootNodeWithDynamicText2.default)(templateNode, text.index, dynamicAttrs);
	                        } else {
	                            node = (0, _nodeWithDynamicText2.default)(templateNode, text.index, dynamicAttrs);
	                        }
	                    } else {
	                        templateNode.textContent = text;
	                        if (isRoot) {
	                            node = (0, _rootNodeWithStaticChild2.default)(templateNode, dynamicAttrs);
	                        } else {
	                            node = (0, _nodeWithStaticChild2.default)(templateNode, dynamicAttrs);
	                        }
	                    }
	                } else {
	                    if (children != null) {
	                        if (children.type === _variables.ObjectTypes.VARIABLE) {
	                            if (isRoot) {
	                                node = (0, _rootNodeWithDynamicChild2.default)(templateNode, children.index, dynamicAttrs, domNamespace);
	                            } else {
	                                node = (0, _nodeWithDynamicChild2.default)(templateNode, children.index, dynamicAttrs, domNamespace);
	                            }
	                        } else if (dynamicFlags.CHILDREN === true) {
	                            var subTreeForChildren = [];
	                            if ((0, _isArray2.default)(children)) {
	                                for (var i = 0; i < children.length; i++) {
	                                    var childItem = children[i];
	                                    subTreeForChildren.push(createDOMTree(childItem, false, dynamicNodeMap, domNamespace));
	                                }
	                            } else if ((typeof children === 'undefined' ? 'undefined' : _typeof(children)) === 'object') {
	                                subTreeForChildren = createDOMTree(children, false, dynamicNodeMap, domNamespace);
	                            }
	                            if (isRoot) {
	                                node = (0, _rootNodeWithDynamicSubTreeForChildren2.default)(templateNode, subTreeForChildren, dynamicAttrs, domNamespace);
	                            } else {
	                                node = (0, _nodeWithDynamicSubTreeForChildren2.default)(templateNode, subTreeForChildren, dynamicAttrs, domNamespace);
	                            }
	                        } else if (typeof children === 'string' || typeof children === 'number') {
	                            templateNode.textContent = children;
	                            if (isRoot) {
	                                node = (0, _rootNodeWithStaticChild2.default)(templateNode, dynamicAttrs);
	                            } else {
	                                node = (0, _nodeWithStaticChild2.default)(templateNode, dynamicAttrs);
	                            }
	                        } else {
	                            var childNodeDynamicFlags = dynamicNodeMap.get(children);

	                            if (!childNodeDynamicFlags) {
	                                createStaticTreeChildren(children, templateNode, domNamespace);

	                                if (isRoot) {
	                                    node = (0, _rootNodeWithStaticChild2.default)(templateNode, dynamicAttrs);
	                                } else {
	                                    node = (0, _nodeWithStaticChild2.default)(templateNode, dynamicAttrs);
	                                }
	                            }
	                        }
	                    } else {
	                        if (isRoot) {
	                            node = (0, _rootVoidNode2.default)(templateNode, dynamicAttrs);
	                        } else {
	                            node = (0, _voidNode2.default)(templateNode, dynamicAttrs);
	                        }
	                    }
	                }
	            }
	        }
	    }
	    return node;
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = addListener;

	var _InfernoNodeID = __webpack_require__(7);

	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);

	var _addRootListener = __webpack_require__(10);

	var _addRootListener2 = _interopRequireDefault(_addRootListener);

	var _EventRegistry = __webpack_require__(9);

	var _EventRegistry2 = _interopRequireDefault(_EventRegistry);

	var _listenersStorage = __webpack_require__(8);

	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);

	var _setHandler = __webpack_require__(12);

	var _setHandler2 = _interopRequireDefault(_setHandler);

	var _createEventListener = __webpack_require__(19);

	var _createEventListener2 = _interopRequireDefault(_createEventListener);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function addListener(vNode, domNode, type, listener) {
		if (!domNode) {
			return null; // TODO! Should we throw?
		}
		var registry = _EventRegistry2.default[type];

		// only add listeners for registered events
		if (registry) {
			if (!registry._enabled) {
				// handle focus / blur events
				if (registry._focusBlur) {
					registry._focusBlur();
				} else if (registry._bubbles) {
					var handler = (0, _setHandler2.default)(type, _addRootListener2.default).handler;
					document.addEventListener(type, handler, false);
				}
				registry._enabled = true;
			}
			var nodeID = (0, _InfernoNodeID2.default)(domNode),
			    listeners = _listenersStorage2.default[nodeID] || (_listenersStorage2.default[nodeID] = {});

			if (listeners[type]) {
				if (listeners[type].destroy) {
					listeners[type].destroy();
				}
			}
			if (registry._bubbles) {
				if (!listeners[type]) {
					++registry._counter;
				}
				listeners[type] = {
					handler: listener,
					originalHandler: listener
				};
			} else {
				listeners[type] = (0, _setHandler2.default)(type, (0, _createEventListener2.default)(type));
				listeners[type].originalHandler = listener;
				domNode.addEventListener(type, listeners[type].handler, false);
			}
		} else {
			throw Error('Inferno Error: ' + type + ' has not been registered, and therefor not supported.');
		}
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createEventListener;

	var _listenersStorage = __webpack_require__(8);

	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);

	var _createListenerArguments = __webpack_require__(11);

	var _createListenerArguments2 = _interopRequireDefault(_createListenerArguments);

	var _InfernoNodeID = __webpack_require__(7);

	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createEventListener(type) {
		return function (e) {
			var target = e.target;
			var listener = _listenersStorage2.default[(0, _InfernoNodeID2.default)(target)][type];
			var args = listener.originalHandler.length > 1 ? (0, _createListenerArguments2.default)(target, e) : [e];

			listener.originalHandler.apply(target, args);
		};
	}

/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function stopPropagation() {
		this._isPropagationStopped = true;
		if (this._stopPropagation) {
			this._stopPropagation();
		} else {
			this.cancelBubble = true;
		}
	}

	function isPropagationStopped() {
		return this._isPropagationStopped;
	}

	function stopImmediatePropagation() {
		this._isImmediatePropagationStopped = true;
		this._isPropagationStopped = true;
		if (this._stopImmediatePropagation) {
			this._stopImmediatePropagation();
		} else {
			this.cancelBubble = true;
		}
	}

	function isImmediatePropagationStopped() {
		return this._isImmediatePropagationStopped;
	}

	function preventDefault() {
		this._isDefaultPrevented = true;

		if (this._preventDefault) {
			this._preventDefault();
		} else {
			this.returnValue = false;
		}
	}

	function isDefaultPrevented() {
		return this._isDefaultPrevented;
	}

	function eventInterface(nativeEvent) {

		// Extend nativeEvent
		nativeEvent._stopPropagation = nativeEvent.stopPropagation;
		nativeEvent.stopPropagation = stopPropagation;
		nativeEvent.isPropagationStopped = isPropagationStopped;

		nativeEvent._stopImmediatePropagation = nativeEvent.stopImmediatePropagation;
		nativeEvent.stopImmediatePropagation = stopImmediatePropagation;
		nativeEvent.isImmediatePropagationStopped = isImmediatePropagationStopped;

		nativeEvent._preventDefault = nativeEvent.preventDefault;
		nativeEvent.preventDefault = preventDefault;
		nativeEvent.isDefaultPrevented = isDefaultPrevented;

		return nativeEvent;
	}

	exports.default = eventInterface;

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = getFormElementType;
	function getFormElementType(node) {
		var name = node.nodeName.toLowerCase();
		if (name !== 'input') {
			if (name === 'select' && node.multiple) {
				return 'select-multiple';
			}
			return name;
		}
		var type = node.getAttribute('type');
		if (!type) {
			return 'text';
		}
		return type.toLowerCase();
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = getFormElementValues;

	var _getFormElementType = __webpack_require__(21);

	var _getFormElementType2 = _interopRequireDefault(_getFormElementType);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function selectValues(node) {
		var result = [];
		var index = node.selectedIndex;
		var option = undefined;
		var options = node.options;
		var length = options.length;
		var i = index < 0 ? length : 0;

		for (; i < length; i++) {

			option = options[i];
			// IMPORTANT! IE9 doesn't update selected after form reset
			if ((option.selected || i === index) &&
			// Don't return options that are disabled or in a disabled optgroup
			!option.disabled && (!option.parentNode.disabled || option.parentNode.nodeName !== 'OPTGROUP')) {
				result.push(option.value);
			}
		}
		return result;
	}

	function getFormElementValues(node) {
		var name = (0, _getFormElementType2.default)(node);

		switch (name) {
			case 'checkbox':
			case 'radio':
				if (node.checked) {
					return true;
				}
				return false;
			case 'select-multiple':
				return selectValues(node);
			default:
				return node.value;
		}
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _DOMRegistry = __webpack_require__(15);

	var _DOMRegistry2 = _interopRequireDefault(_DOMRegistry);

	var _setSelectValueForProperty = __webpack_require__(25);

	var _setSelectValueForProperty2 = _interopRequireDefault(_setSelectValueForProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var template = {
	    /**
	     * Sets the value for a property on a node. If a value is specified as
	     * '' (empty string), the corresponding style property will be unset.
	     *
	     * @param {DOMElement} node
	     * @param {string} name
	     * @param {*} value
	     */

	    setProperty: function setProperty(vNode, domNode, name, value, useProperties) {

	        var propertyInfo = _DOMRegistry2.default[name] || null;

	        if (propertyInfo) {
	            if (value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && value !== value || propertyInfo.hasPositiveNumericValue && value < 1 || value.length === 0) {
	                template.removeProperty(vNode, domNode, name, useProperties);
	            } else {
	                var propName = propertyInfo.propertyName;

	                if (propertyInfo.mustUseProperty) {
	                    if (propName === 'value' && vNode.tag === 'select') {
	                        (0, _setSelectValueForProperty2.default)(vNode, domNode, value, useProperties);
	                    } else if ('' + domNode[propName] !== '' + value) {
	                        if (useProperties) {
	                            domNode[propName] = value;
	                        } else {
	                            if (propertyInfo.hasBooleanValue && value === true) {
	                                value = propName;
	                            }
	                            domNode.setAttribute(propName, value);
	                        }
	                    }
	                } else {

	                    var attributeName = propertyInfo.attributeName;
	                    var namespace = propertyInfo.attributeNamespace;

	                    // if 'truthy' value, and boolean, it will be 'propName=propName'
	                    if (propertyInfo.hasBooleanValue && value === true) {
	                        value = attributeName;
	                    }

	                    if (namespace) {
	                        domNode.setAttributeNS(namespace, attributeName, value);
	                    } else {
	                        domNode.setAttribute(attributeName, value);
	                    }
	                }
	            }
	        } else if (value == null) {
	            domNode.removeAttribute(name);
	        } else if (name) {
	            domNode.setAttribute(name, value);
	        }
	    },

	    /**
	     * Removes the value for a property on a node.
	     *
	     * @param {DOMElement} node
	     * @param {string} name
	     */
	    removeProperty: function removeProperty(vNode, domNode, name, useProperties) {
	        var propertyInfo = _DOMRegistry2.default[name];

	        if (propertyInfo) {
	            if (propertyInfo.mustUseProperty) {
	                var propName = propertyInfo.propertyName;
	                if (propertyInfo.hasBooleanValue) {
	                    if (useProperties) {
	                        domNode[propName] = false;
	                    } else {
	                        domNode.removeAttribute(propName);
	                    }
	                } else {
	                    if (useProperties) {
	                        if ('' + domNode[propName] !== '') {
	                            domNode[propName] = '';
	                        }
	                    } else {
	                        domNode.removeAttribute(propName);
	                    }
	                }
	            } else {
	                domNode.removeAttribute(propertyInfo.attributeName);
	            }
	            // HTML attributes and custom attributes
	        } else {
	                domNode.removeAttribute(name);
	            }
	    }
	};

	exports.default = template;

/***/ },
/* 24 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = recreateRootNode;
	function recreateRootNode(lastDomNode, nextItem, node) {
		var domNode = node.create(nextItem);
		lastDomNode.parentNode.replaceChild(domNode, lastDomNode);
		// TODO recycle old node
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = setSelectValueForProperty;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _inArray = __webpack_require__(57);

	var _inArray2 = _interopRequireDefault(_inArray);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// TODO!! Optimize!!
	function setSelectValueForProperty(vNode, domNode, value, useProperties) {
		var isMultiple = (0, _isArray2.default)(value);
		var options = domNode.options;
		var len = options.length;

		var i = 0,
		    optionNode = undefined;
		while (i < len) {
			optionNode = options[i++];
			if (useProperties) {
				optionNode.selected = value != null && (isMultiple ? (0, _inArray2.default)(value, optionNode.value) : optionNode.value === value);
			} else {
				if (value != null && (isMultiple ? (0, _inArray2.default)(value, optionNode.value) : optionNode.value === value)) {
					optionNode.setAttribute('selected', 'selected');
				} else {
					optionNode.removeAttribute('selected');
				}
			}
		}
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _addPixelSuffixToValueIfNeeded = __webpack_require__(51);

	var _addPixelSuffixToValueIfNeeded2 = _interopRequireDefault(_addPixelSuffixToValueIfNeeded);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Sets the value for multiple styles on a node. If a value is specified as
	 * '' (empty string), the corresponding style property will be unset.
	 *
	 * @param {DOMElement} node
	 * @param {object} styles
	 */

	exports.default = function (vNode, domNode, styles) {
	  for (var styleName in styles) {
	    var styleValue = styles[styleName];

	    domNode.style[styleName] = styleValue == null ? '' : (0, _addPixelSuffixToValueIfNeeded2.default)(styleName, styleValue);
	  }
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createDynamicNode;

	var _variables = __webpack_require__(1);

	function createDynamicNode(valueIndex, domNamespace) {
		var domNode = undefined;

		var node = {
			create: function create(item, parentComponent) {
				var value = (0, _variables.getValueWithIndex)(item, valueIndex);
				var type = (0, _variables.getTypeFromValue)(value);

				switch (type) {
					case _variables.ValueTypes.TEXT:
						// TODO check if string is empty?
						if (value == null) {
							value = '';
						}
						domNode = document.createTextNode(value);
						break;
					case _variables.ValueTypes.ARRAY:
						throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
						break;
					case _variables.ValueTypes.TREE:
						domNode = value.create(item, parentComponent);
						break;
					default:
						break;
				}

				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent) {
				var nextValue = (0, _variables.getValueWithIndex)(nextItem, valueIndex);
				var lastValue = (0, _variables.getValueWithIndex)(lastItem, valueIndex);

				if (nextValue !== lastValue) {
					var nextType = (0, _variables.getTypeFromValue)(nextValue);
					var lastType = (0, _variables.getTypeFromValue)(lastValue);

					if (lastType !== nextType) {
						// TODO replace node and rebuild
						return;
					}

					switch (nextType) {
						case _variables.ValueTypes.TEXT:
							// TODO check if string is empty?
							if (nextValue == null) {
								nextValue = '';
							}
							domNode.nodeValue = nextValue;
							break;
						case _variables.ValueTypes.ARRAY:
							throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
							break;
						case _variables.ValueTypes.TREE:
							//debugger;
							break;
						default:
							break;
					}
				}
			}
		};
		return node;
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createNodeWithComponent;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _variables = __webpack_require__(1);

	var _domMutate = __webpack_require__(6);

	var _addAttributes = __webpack_require__(3);

	var _unmountComponent = __webpack_require__(13);

	var _unmountComponent2 = _interopRequireDefault(_unmountComponent);

	var _recreateNode = __webpack_require__(24);

	var _recreateNode2 = _interopRequireDefault(_recreateNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function getCorrectItemForValues(node, item) {
		if (node !== item.domTree && item.parent) {
			return getCorrectItemForValues(node, item.parent);
		} else {
			return item;
		}
	}

	function createNodeWithComponent(componentIndex, props, domNamespace) {
		var instance = undefined;
		var lastRender = undefined;
		var domNode = undefined;
		var node = {
			create: function create(item, parentComponent, treeLifecycle) {
				var valueItem = getCorrectItemForValues(node, item);
				var Component = (0, _variables.getValueWithIndex)(valueItem, componentIndex);

				if (Component == null) {
					//bad component, make a text node
					return document.createTextNode('');
				}
				instance = new Component((0, _variables.getValueForProps)(props, valueItem));
				instance.componentWillMount();
				var nextRender = instance.render();

				nextRender.parent = item;
				domNode = nextRender.domTree.create(nextRender, instance);
				lastRender = nextRender;
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				var Component = (0, _variables.getValueWithIndex)(nextItem, componentIndex);

				if (Component !== instance.constructor) {
					(0, _unmountComponent2.default)(instance);
					(0, _recreateNode2.default)(domNode, nextItem, node);
					return;
				}
				var prevProps = instance.props;
				var prevState = instance.state;
				var nextState = instance.state;
				var nextProps = (0, _variables.getValueForProps)(props, nextItem);

				if (!nextProps.children) {
					nextProps.children = prevProps.children;
				}

				if (prevProps !== nextProps || prevState !== nextState) {
					if (prevProps !== nextProps) {
						instance._blockRender = true;
						instance.componentWillReceiveProps(nextProps);
						instance._blockRender = false;
					}
					var shouldUpdate = instance.shouldComponentUpdate(nextProps, nextState);

					if (shouldUpdate) {
						instance._blockSetState = true;
						instance.componentWillUpdate(nextProps, nextState);
						instance._blockSetState = false;
						instance.props = nextProps;
						instance.state = nextState;
						var nextRender = instance.render();

						nextRender.parent = nextItem;
						nextRender.domTree.update(lastRender, nextRender, instance);
						instance.componentDidUpdate(prevProps, prevState);
						lastRender = nextRender;
					}
				}
			}
		};
		return node;
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createNodeWithDynamicChild;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _variables = __webpack_require__(1);

	var _domMutate = __webpack_require__(6);

	var _addAttributes = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function createNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
		var domNode = undefined;
		var node = {
			create: function create(item, parentComponent, treeLifecycle) {
				domNode = templateNode.cloneNode(false);
				var value = (0, _variables.getValueWithIndex)(item, valueIndex);

				if (value != null) {
					if ((0, _isArray2.default)(value)) {
						for (var i = 0; i < value.length; i++) {
							var childItem = value[i];

							if ((typeof childItem === 'undefined' ? 'undefined' : _typeof(childItem)) === 'object') {
								domNode.appendChild(childItem.domTree.create(childItem));
							} else if (typeof childItem === 'string' || typeof childItem === 'number') {
								var textNode = document.createTextNode(childItem);
								domNode.appendChild(textNode);
							}
						}
					} else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
						domNode.appendChild(value.domTree.create(value, parentComponent));
					} else if (typeof value === 'string' || typeof value === 'number') {
						domNode.textContent = value;
					}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				var nextValue = (0, _variables.getValueWithIndex)(nextItem, valueIndex);
				var lastValue = (0, _variables.getValueWithIndex)(lastItem, valueIndex);

				if (nextValue !== lastValue) {
					if (typeof nextValue === 'string') {
						domNode.firstChild.nodeValue = nextValue;
					} else if (nextValue === null) {
						// TODO
					} else if ((0, _isArray2.default)(nextValue)) {
							if ((0, _isArray2.default)(lastValue)) {
								(0, _domMutate.updateKeyed)(nextValue, lastValue, domNode, null);
							} else {
								//debugger;
							}
						} else if ((typeof nextValue === 'undefined' ? 'undefined' : _typeof(nextValue)) === 'object') {
								var tree = nextValue.domTree;

								if (tree !== null) {
									if (lastValue.domTree !== null) {
										tree.update(lastValue, nextValue, parentComponent);
									} else {
										// TODO implement
									}
								}
							} else if (typeof nextValue === 'string' || typeof nextValue === 'number') {
									domNode.firstChild.nodeValue = nextValue;
								}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createNodeWithDynamicSubTreeForChildren;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _variables = __webpack_require__(1);

	var _domMutate = __webpack_require__(6);

	var _addAttributes = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function createNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
		var domNode = undefined;
		var node = {
			create: function create(item, parentComponent, treeLifecycle) {
				domNode = templateNode.cloneNode(false);
				if (subTreeForChildren != null) {
					if ((0, _isArray2.default)(subTreeForChildren)) {
						for (var i = 0; i < subTreeForChildren.length; i++) {
							var subTree = subTreeForChildren[i];
							domNode.appendChild(subTree.create(item));
						}
					} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : _typeof(subTreeForChildren)) === 'object') {
						domNode.appendChild(subTreeForChildren.create(item, parentComponent));
					}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				if (subTreeForChildren != null) {
					if ((0, _isArray2.default)(subTreeForChildren)) {
						for (var i = 0; i < subTreeForChildren.length; i++) {
							var subTree = subTreeForChildren[i];
							subTree.update(lastItem, nextItem);
						}
					} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : _typeof(subTreeForChildren)) === 'object') {
						subTreeForChildren.update(lastItem, nextItem, parentComponent);
					}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createNodeWithDynamicText;

	var _variables = __webpack_require__(1);

	var _addAttributes = __webpack_require__(3);

	function createNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
		var domNode;

		var node = {
			create: function create(item) {
				domNode = templateNode.cloneNode(false);
				var value = (0, _variables.getValueWithIndex)(item, valueIndex);

				if (value != null) {
					domNode.textContent = value;
				}
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				var nextValue = (0, _variables.getValueWithIndex)(nextItem, valueIndex);

				if (nextValue !== (0, _variables.getValueWithIndex)(lastItem, valueIndex)) {
					domNode.firstChild.nodeValue = nextValue;
				}
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createNodeWithStaticChild;

	var _variables = __webpack_require__(1);

	var _addAttributes = __webpack_require__(3);

	function createNodeWithStaticChild(templateNode, dynamicAttrs) {
		var domNode = undefined;
		var node = {
			create: function create(item) {
				domNode = templateNode.cloneNode(true);
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootDynamicNode;

	var _recycling = __webpack_require__(4);

	var _variables = __webpack_require__(1);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootDynamicNode(valueIndex, domNamespace) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item, parentComponent, treeLifecycle) {
				var domNode = undefined;

				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				var value = (0, _variables.getValueWithIndex)(item, valueIndex);
				var type = getTypeFromValue(value);

				switch (type) {
					case ValueTypes.TEXT:
						// TODO check if string is empty?
						if (value == null) {
							value = '';
						}
						domNode = document.createTextNode(value);
						break;
					case ValueTypes.ARRAY:
						throw Error('Inferno Error: A valid template node must be returned. You may have returned undefined, an array or some other invalid object.');
						break;
					case ValueTypes.TREE:
						domNode = value.create(item, parentComponent);
						break;
					default:
						break;
				}

				item.rootNode = domNode;
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;

				var nextValue = (0, _variables.getValueWithIndex)(nextItem, valueIndex);
				var lastValue = (0, _variables.getValueWithIndex)(lastItem, valueIndex);

				if (nextValue !== lastValue) {
					var nextType = getTypeFromValue(nextValue);
					var lastType = getTypeFromValue(lastValue);

					if (lastType !== nextType) {
						// TODO replace node and rebuild
						return;
					}

					switch (nextType) {
						case ValueTypes.TEXT:
							// TODO check if string is empty?
							domNode.nodeValue = nextValue;
							break;
						default:
							break;
					}
				}
			}
		};
		return node;
	}

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootNodeWithComponent;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _recycling = __webpack_require__(4);

	var _variables = __webpack_require__(1);

	var _domMutate = __webpack_require__(6);

	var _addAttributes = __webpack_require__(3);

	var _unmountComponent = __webpack_require__(13);

	var _unmountComponent2 = _interopRequireDefault(_unmountComponent);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootNodeWithComponent(componentIndex, props, domNamespace) {
		var instance = undefined;
		var lastRender = undefined;
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item, parentComponent, treeLifecycle) {
				var domNode = undefined;

				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				var Component = (0, _variables.getValueWithIndex)(item, componentIndex);

				if (Component == null) {
					//bad component, make a text node
					domNode = document.createTextNode('');
					item.rootNode = domNode;
					return domNode;
				}
				instance = new Component((0, _variables.getValueForProps)(props, item));
				instance.componentWillMount();
				var nextRender = instance.render();

				nextRender.parent = item;
				domNode = nextRender.domTree.create(nextRender, instance);
				item.rootNode = domNode;
				lastRender = nextRender;
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				var Component = (0, _variables.getValueWithIndex)(nextItem, componentIndex);

				if (Component !== instance.constructor) {
					(0, _unmountComponent2.default)(instance);
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				if (node !== lastItem.domTree) {
					(0, _unmountComponent2.default)(instance);
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;

				var prevProps = instance.props;
				var prevState = instance.state;
				var nextState = instance.state;
				var nextProps = (0, _variables.getValueForProps)(props, nextItem);

				if (!nextProps.children) {
					nextProps.children = prevProps.children;
				}

				if (prevProps !== nextProps || prevState !== nextState) {
					if (prevProps !== nextProps) {
						instance._blockRender = true;
						instance.componentWillReceiveProps(nextProps);
						instance._blockRender = false;
					}
					var shouldUpdate = instance.shouldComponentUpdate(nextProps, nextState);

					if (shouldUpdate) {
						instance._blockSetState = true;
						instance.componentWillUpdate(nextProps, nextState);
						instance._blockSetState = false;
						instance.props = nextProps;
						instance.state = nextState;
						var nextRender = instance.render();

						nextRender.parent = nextItem;
						nextRender.domTree.update(lastRender, nextRender, instance);
						nextItem.rootNode = nextRender.rootNode;
						instance.componentDidUpdate(prevProps, prevState);
						lastRender = nextRender;
					}
				}
			}
		};
		return node;
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootNodeWithDynamicChild;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _recycling = __webpack_require__(4);

	var _variables = __webpack_require__(1);

	var _domMutate = __webpack_require__(6);

	var _addAttributes = __webpack_require__(3);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootNodeWithDynamicChild(templateNode, valueIndex, dynamicAttrs, domNamespace) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item, parentComponent, treeLifecycle) {
				var domNode = undefined;

				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				domNode = templateNode.cloneNode(false);
				var value = (0, _variables.getValueWithIndex)(item, valueIndex);

				if (value != null) {
					if ((0, _isArray2.default)(value)) {
						for (var i = 0; i < value.length; i++) {
							var childItem = value[i];

							if ((typeof childItem === 'undefined' ? 'undefined' : _typeof(childItem)) === 'object') {
								domNode.appendChild(childItem.domTree.create(childItem, parentComponent));
							} else if (typeof childItem === 'string' || typeof childItem === 'number') {
								var textNode = document.createTextNode(childItem);
								domNode.appendChild(textNode);
							}
						}
					} else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
						domNode.appendChild(value.domTree.create(value));
					} else if (typeof value === 'string' || typeof value === 'number') {
						domNode.textContent = value;
					}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				item.rootNode = domNode;
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;
				var nextValue = (0, _variables.getValueWithIndex)(nextItem, valueIndex);
				var lastValue = (0, _variables.getValueWithIndex)(lastItem, valueIndex);

				if (nextValue !== lastValue) {
					if (typeof nextValue === 'string') {
						domNode.firstChild.nodeValue = nextValue;
					} else if (nextValue === null) {
						// TODO
					} else if ((0, _isArray2.default)(nextValue)) {
							if ((0, _isArray2.default)(lastValue)) {
								(0, _domMutate.updateKeyed)(nextValue, lastValue, domNode, null);
							} else {
								// TODO
							}
						} else if ((typeof nextValue === 'undefined' ? 'undefined' : _typeof(nextValue)) === 'object') {
								var tree = nextValue.domTree;

								if (tree !== null) {
									if (lastValue.domTree !== null) {
										tree.update(lastValue, nextValue, parentComponent);
									} else {
										// TODO implement
									}
								}
							} else if (typeof nextValue === 'string' || typeof nextValue === 'number') {
									domNode.firstChild.nodeValue = nextValue;
								}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootNodeWithDynamicSubTreeForChildren;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _recycling = __webpack_require__(4);

	var _variables = __webpack_require__(1);

	var _domMutate = __webpack_require__(6);

	var _addAttributes = __webpack_require__(3);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootNodeWithDynamicSubTreeForChildren(templateNode, subTreeForChildren, dynamicAttrs, domNamespace) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item, parentComponent, treeLifecycle) {
				var domNode = undefined;
				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				domNode = templateNode.cloneNode(false);
				if (subTreeForChildren != null) {
					if ((0, _isArray2.default)(subTreeForChildren)) {
						for (var i = 0; i < subTreeForChildren.length; i++) {
							var subTree = subTreeForChildren[i];
							domNode.appendChild(subTree.create(item, parentComponent));
						}
					} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : _typeof(subTreeForChildren)) === 'object') {
						domNode.appendChild(subTreeForChildren.create(item, parentComponent));
					}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				item.rootNode = domNode;
				return domNode;
			},
			update: function update(lastItem, nextItem, parentComponent, treeLifecycle) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;
				if (subTreeForChildren != null) {
					if ((0, _isArray2.default)(subTreeForChildren)) {
						for (var i = 0; i < subTreeForChildren.length; i++) {
							var subTree = subTreeForChildren[i];
							subTree.update(lastItem, nextItem, parentComponent);
						}
					} else if ((typeof subTreeForChildren === 'undefined' ? 'undefined' : _typeof(subTreeForChildren)) === 'object') {
						subTreeForChildren.update(lastItem, nextItem, parentComponent);
					}
				}
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootNodeWithDynamicText;

	var _recycling = __webpack_require__(4);

	var _variables = __webpack_require__(1);

	var _addAttributes = __webpack_require__(3);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootNodeWithDynamicText(templateNode, valueIndex, dynamicAttrs) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item) {
				var domNode = undefined;

				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				domNode = templateNode.cloneNode(false);
				var value = (0, _variables.getValueWithIndex)(item, valueIndex);

				if (value != null) {
					domNode.textContent = value;
				}
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				item.rootNode = domNode;
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;
				var nextValue = (0, _variables.getValueWithIndex)(nextItem, valueIndex);

				if (nextValue !== (0, _variables.getValueWithIndex)(lastItem, valueIndex)) {
					domNode.firstChild.nodeValue = nextValue;
				}
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootNodeWithStaticChild;

	var _recycling = __webpack_require__(4);

	var _variables = __webpack_require__(1);

	var _addAttributes = __webpack_require__(3);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootNodeWithStaticChild(templateNode, dynamicAttrs) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item) {
				var domNode = undefined;

				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				domNode = templateNode.cloneNode(true);
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				item.rootNode = domNode;
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootStaticNode;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _recycling = __webpack_require__(4);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootStaticNode(templateNode) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item) {
				var domNode = undefined;
				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				domNode = templateNode.cloneNode(true);
				item.rootNode = domNode;
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				nextItem.rootNode = lastItem.rootNode;
			}
		};
		return node;
	}

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createRootVoidNode;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _recycling = __webpack_require__(4);

	var _addAttributes = __webpack_require__(3);

	var _recreateRootNode = __webpack_require__(5);

	var _recreateRootNode2 = _interopRequireDefault(_recreateRootNode);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var recyclingEnabled = (0, _recycling.isRecyclingEnabled)();

	function createRootVoidNode(templateNode, dynamicAttrs) {
		var node = {
			pool: [],
			keyedPool: [],
			create: function create(item) {
				var domNode = undefined;
				if (recyclingEnabled) {
					domNode = (0, _recycling.recycle)(node, item);
					if (domNode) {
						return domNode;
					}
				}
				domNode = templateNode.cloneNode(true);
				item.rootNode = domNode;
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				if (node !== lastItem.domTree) {
					(0, _recreateRootNode2.default)(lastItem, nextItem, node);
					return;
				}
				var domNode = lastItem.rootNode;

				nextItem.rootNode = domNode;
				nextItem.rootNode = lastItem.rootNode;
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createStaticNode;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createStaticNode(templateNode) {
		var domNode;

		var node = {
			create: function create() {
				domNode = templateNode.cloneNode(true);
				return domNode;
			},
			update: function update() {}
		};
		return node;
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createVoidNode;

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	var _addAttributes = __webpack_require__(3);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createVoidNode(templateNode, dynamicAttrs) {
		var domNode = undefined;
		var node = {
			create: function create(item) {
				domNode = templateNode.cloneNode(true);
				if (dynamicAttrs) {
					(0, _addAttributes.addDOMDynamicAttributes)(item, domNode, dynamicAttrs);
				}
				return domNode;
			},
			update: function update(lastItem, nextItem) {
				if (dynamicAttrs) {
					(0, _addAttributes.updateDOMDynamicAttributes)(lastItem, nextItem, domNode, dynamicAttrs);
				}
			}
		};
		return node;
	}

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _queueStateChanges = __webpack_require__(47);

	var _queueStateChanges2 = _interopRequireDefault(_queueStateChanges);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Component = (function () {
		function Component(props, context) {
			_classCallCheck(this, Component);

			this.props = props || {};
			this._blockRender = false;
			this._blockSetState = false;
			this._deferSetState = false;
			this._pendingSetState = false;
			this._pendingState = {};
			this._componentTree = [];
			this.state = {};
		}

		_createClass(Component, [{
			key: "render",
			value: function render() {}
		}, {
			key: "forceUpdate",
			value: function forceUpdate() {}
		}, {
			key: "setState",
			value: function setState(newState, callback) {
				// TODO the callback
				if (this._blockSetState === false) {
					(0, _queueStateChanges2.default)(this, newState);
				} else {
					throw Error("Inferno Error: Cannot update state via setState() in componentWillUpdate()");
				}
			}
		}, {
			key: "componentDidMount",
			value: function componentDidMount() {}
		}, {
			key: "componentWillMount",
			value: function componentWillMount() {}
		}, {
			key: "componentWillUnmount",
			value: function componentWillUnmount() {}
		}, {
			key: "componentDidUpdate",
			value: function componentDidUpdate() {}
		}, {
			key: "shouldComponentUpdate",
			value: function shouldComponentUpdate() {
				return true;
			}
		}, {
			key: "componentWillReceiveProps",
			value: function componentWillReceiveProps() {}
		}, {
			key: "componentWillUpdate",
			value: function componentWillUpdate() {}
		}]);

		return Component;
	})();

	exports.default = Component;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createChildren(children) {
		var childrenArray = [];
		if ((0, _isArray2.default)(children)) {
			for (var i = 0; i < children.length; i++) {
				var childItem = children[i];
				childrenArray.push(childItem);
			}
		}
		return childrenArray;
	}

	function createElement(tag, attrs) {
		if (tag) {
			var vNode = {
				tag: tag
			};
			if (attrs) {
				if (attrs.key !== undefined) {
					vNode.key = attrs.key;
					delete attrs.key;
				}
				vNode.attrs = attrs;
			}

			for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
				children[_key - 2] = arguments[_key];
			}

			if (children) {
				if (children.length) {
					vNode.children = createChildren(children);
				} else {
					vNode.children = children[0];
				}
			}
			return vNode;
		} else {
			return {
				text: tag
			};
		}
	}

	exports.default = {
		createElement: createElement
	};

/***/ },
/* 45 */
/***/ function(module, exports) {

	"use strict";

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function applyState(component) {
		var blockRender = component._blockRender;
		requestAnimationFrame(function () {
			if (component._deferSetState === false) {
				component._pendingSetState = false;
				var pendingState = component._pendingState;
				var oldState = component.state;
				var nextState = _extends({}, oldState, pendingState);
				component._pendingState = {};
				component._pendingSetState = false;
				//updateComponent(component, component.props, nextState, blockRender);
				// TODO
			} else {
					applyState(component);
				}
		});
	}

	exports.default = applyState;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createTemplate;

	var _createTree = __webpack_require__(17);

	var _createTree2 = _interopRequireDefault(_createTree);

	var _createHTMLStringTree = __webpack_require__(50);

	var _createHTMLStringTree2 = _interopRequireDefault(_createHTMLStringTree);

	var _variables = __webpack_require__(1);

	var _scanTreeForDynamicNodes = __webpack_require__(49);

	var _scanTreeForDynamicNodes2 = _interopRequireDefault(_scanTreeForDynamicNodes);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function createTemplate(callback) {
		var construct = callback.construct;

		if (!construct) {
			(function () {
				var callbackLength = callback.length;
				var callbackArguments = new Array(callbackLength);
				for (var i = 0; i < callbackLength; i++) {
					callbackArguments[i] = (0, _variables.createVariable)(i);
				}
				var schema = callback.apply(undefined, callbackArguments);
				var dynamicNodeMap = new Map();
				(0, _scanTreeForDynamicNodes2.default)(schema, dynamicNodeMap);
				var domTree = (0, _createTree2.default)(schema, true, dynamicNodeMap);
				var htmlStringTree = (0, _createHTMLStringTree2.default)(schema, true, dynamicNodeMap);
				var key = schema.key;
				var keyIndex = key ? key.index : -1;

				switch (callbackLength) {
					case 0:
						construct = function () {
							return {
								parent: null,
								domTree: domTree,
								htmlStringTree: htmlStringTree,
								key: null,
								nextItem: null,
								rootNode: null
							};
						};
						break;
					case 1:
						construct = function (v0) {
							var key = undefined;

							if (keyIndex === 0) {
								key = v0;
							}
							return {
								parent: null,
								domTree: domTree,
								htmlStringTree: htmlStringTree,
								key: key,
								nextItem: null,
								rootNode: null,
								v0: v0
							};
						};
						break;
					case 2:
						construct = function (v0, v1) {
							var key = undefined;

							if (keyIndex === 0) {
								key = v0;
							} else if (keyIndex === 1) {
								key = v1;
							}
							return {
								parent: null,
								domTree: domTree,
								htmlStringTree: htmlStringTree,
								key: key,
								nextItem: null,
								rootNode: null,
								v0: v0,
								v1: v1
							};
						};
						break;
					default:
						construct = function (v0, v1) {
							for (var _len = arguments.length, values = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
								values[_key - 2] = arguments[_key];
							}

							var key = undefined;

							if (keyIndex === 0) {
								key = v0;
							} else if (keyIndex === 1) {
								key = v1;
							} else if (keyIndex > 1) {
								key = values[keyIndex];
							}
							return {
								parent: null,
								domTree: domTree,
								htmlStringTree: htmlStringTree,
								key: key,
								nextItem: null,
								rootNode: null,
								v0: v0,
								v1: v1,
								values: values
							};
						};
						break;
				}
				callback.construct = construct;
			})();
		}
		return construct;
	}

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = queueStateChanges;

	var _applyState = __webpack_require__(45);

	var _applyState2 = _interopRequireDefault(_applyState);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function queueStateChanges(component, newState) {
		for (var stateKey in newState) {
			component._pendingState[stateKey] = newState[stateKey];
		}
		if (component._pendingSetState === false) {
			component._pendingSetState = true;
			(0, _applyState2.default)(component);
		}
	}

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.getRootFragmentAtNode = getRootFragmentAtNode;
	exports.removeRootFragment = removeRootFragment;
	exports.render = render;
	exports.renderToString = renderToString;
	exports.unmountComponentsAtNode = unmountComponentsAtNode;

	var _createFragment = __webpack_require__(16);

	var _createFragment2 = _interopRequireDefault(_createFragment);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var rootFragments = [];

	function unmountComponentsAtFragment(fragment) {}

	function getRootFragmentAtNode(node) {
		var rootFragmentsLength = rootFragments.length;

		if (rootFragmentsLength === 0) {
			return null;
		}
		for (var i = 0; i < rootFragmentsLength; i++) {
			var rootFragment = rootFragments[i];
			if (rootFragment.parentNode === node) {
				return rootFragment;
			}
		}
		return null;
	}

	function removeRootFragment(rootFragment) {
		for (var i = 0; i < rootFragments.length; i++) {
			if (rootFragments[i] === rootFragment) {
				rootFragments.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	function render(nextItem, parentNode) {
		var rootFragment = getRootFragmentAtNode(parentNode);

		if (rootFragment === null) {
			var fragment = (0, _createFragment2.default)(parentNode);
			fragment.render(nextItem);
			rootFragments.push(fragment);
		} else {
			if (nextItem === null) {
				unmountComponentsAtFragment(rootFragment);
				rootFragment.remove();
				removeRootFragment(rootFragment);
			} else {
				rootFragment.render(nextItem);
			}
		}
	}

	function renderToString(nextItem) {
		// TODO
	}

	function unmountComponentsAtNode(parentNode) {
		var rootFragment = getRootFragmentAtNode(parentNode);
		unmountComponentsAtFragment(rootFragment);
	}

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = scanTreeForDynamicNodes;

	var _variables = __webpack_require__(1);

	var _isArray = __webpack_require__(2);

	var _isArray2 = _interopRequireDefault(_isArray);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	function scanTreeForDynamicNodes(node, nodeMap) {
		var nodeIsDynamic = false;
		var dynamicFlags = {
			NODE: false,
			TEXT: false,
			ATTRS: false, //attrs can also be an object
			CHILDREN: false,
			KEY: false,
			COMPONENTS: false
		};

		if (node.type === _variables.ObjectTypes.VARIABLE) {
			nodeIsDynamic = true;
			dynamicFlags.NODE = true;
		} else {
			if (node != null) {
				if (node.tag != null) {
					if (node.tag.type === _variables.ObjectTypes.VARIABLE) {
						nodeIsDynamic = true;
						dynamicFlags.COMPONENTS = true;
					}
				}
				if (node.text != null) {
					if (node.text.type === _variables.ObjectTypes.VARIABLE) {
						nodeIsDynamic = true;
						dynamicFlags.TEXT = true;
					}
				}
				if (node.attrs != null) {
					if (node.attrs.type === _variables.ObjectTypes.VARIABLE) {
						nodeIsDynamic = true;
						dynamicFlags.ATTRS = true;
					} else {
						for (var attr in node.attrs) {
							var attrVal = node.attrs[attr];
							if (attrVal != null && attrVal.type === _variables.ObjectTypes.VARIABLE) {
								if (attr === 'xmlns') {
									throw Error('Inferno Error: The "xmlns" attribute cannot be dynamic. Please use static value for "xmlns" attribute instead.');
								}
								if (dynamicFlags.ATTRS === false) {
									dynamicFlags.ATTRS = {};
								}
								dynamicFlags.ATTRS[attr] = attrVal.index;
								nodeIsDynamic = true;
							}
						}
					}
				}
				if (node.children != null) {
					if (node.children.type === _variables.ObjectTypes.VARIABLE) {
						nodeIsDynamic = true;
					} else {
						if ((0, _isArray2.default)(node.children)) {
							for (var i = 0; i < node.children.length; i++) {
								var childItem = node.children[i];
								var result = scanTreeForDynamicNodes(childItem, nodeMap);

								if (result === true) {
									nodeIsDynamic = true;
									dynamicFlags.CHILDREN = true;
								}
							}
						} else if ((typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object') {
							var result = scanTreeForDynamicNodes(node.children, nodeMap);

							if (result === true) {
								nodeIsDynamic = true;
								dynamicFlags.CHILDREN = true;
							}
						}
					}
				}
				if (node.key != null) {
					if (node.key.type === _variables.ObjectTypes.VARIABLE) {
						nodeIsDynamic = true;
						dynamicFlags.KEY = true;
					}
				}
			}
		}
		if (nodeIsDynamic === true) {
			nodeMap.set(node, dynamicFlags);
		}
		return nodeIsDynamic;
	}

/***/ },
/* 50 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = createHTMLStringTree;
	function createHTMLStringTree() {}

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _unitlessProperties = __webpack_require__(55);

	var _unitlessProperties2 = _interopRequireDefault(_unitlessProperties);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Normalize CSS properties for SSR
	 *
	 * @param {String} name The boolean attribute name to set.
	 * @param {String} value The boolean attribute value to set.
	 */

	exports.default = function (name, value) {
		if (value === null || value === '') {
			return '';
		}

		if (value === 0 || (0, _unitlessProperties2.default)(name)) {
			return '' + value; // cast to string
		}

		if (isNaN(value)) {
			return '' + value; // cast to string
		}

		if (typeof value === 'string') {
			value = value.trim();
		}
		return value + 'px';
	};

/***/ },
/* 52 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {};

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		focus: 'focusin', // DOM L3
		blur: 'focusout' // DOM L3
	};

/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// type -> node -> function(target, event)
	exports.default = {};

/***/ },
/* 55 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var unitlessProps = {
		flex: true,
		base: true,
		zoom: true,
		order: true,
		marker: true,
		stress: true,
		volume: true,
		widows: true,
		zIndex: true,
		boxFlex: true,
		gridRow: true,
		opacity: true,
		orphans: true,
		tabSize: true,
		flexGrow: true,
		richness: true,
		flexOrder: true,
		lineClamp: true,
		msBoxFlex: true,
		flexShrink: true,
		fontWeight: true,
		gridColumn: true,
		lineHeight: true,
		pitchRange: true,
		MozBoxFlex: true,
		columnCount: true,
		stopOpacity: true,
		fillOpacity: true,
		strokeWidth: true,
		boxFlexGroup: true,
		counterReset: true,
		flexPositive: true,
		flexNegative: true,
		strokeOpacity: true,
		WebkitBoxFlex: true,
		WebkitGridRow: true,
		WebkitFlexGrow: true,
		boxOrdinalGroup: true,
		WebkitFlexShrink: true,
		counterIncrement: true,
		strokeDashoffset: true,
		WebkitStrokeWidth: true,
		MozBoxOrdinalGroup: true,
		WebkitBoxOrdinalGroup: true,
		animationIterationCount: true,
		WebkitAnimationIterationCount: true
	};

	exports.default = function (str) {
		return str in unitlessProps;
	};

/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

	/**
	 * Simple, lightweight module assisting with the detection and context of
	 * Worker. Helps avoid circular dependencies and allows code to reason about
	 * whether or not they are in a Worker, even if they never include the main
	 * `ReactWorker` dependency.
	 */
	exports.default = {

	  canUseDOM: canUseDOM,

	  canUseWorkers: typeof Worker !== 'undefined',

	  canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

	  canUseViewport: canUseDOM && !!window.screen,

	  isInWorker: !canUseDOM // For now, this is true - might change in the future.

	};

/***/ },
/* 57 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = inArray;
	function inArray(arr, item) {
	    var len = arr.length;
	    var i = 0;

	    while (i < len) {
	        if (arr[i++] == item) {
	            return true;
	        }
	    }

	    return false;
	}

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function isFormElement(nodeName) {
		return nodeName === 'form' || nodeName === 'input' || nodeName === 'textarea' || nodeName === 'label' || nodeName === 'fieldset' || nodeName === 'legend' || nodeName === 'select' || nodeName === 'optgroup' || nodeName === 'option' || nodeName === 'button' || nodeName === 'datalist' || nodeName === 'keygen' || nodeName === 'output';
	}

	exports.default = isFormElement;

/***/ }
/******/ ])
});
;