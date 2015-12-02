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
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ((function(modules) {
	// Check all modules for deduplicated modules
	for(var i in modules) {
		if(Object.prototype.hasOwnProperty.call(modules, i)) {
			switch(typeof modules[i]) {
			case "function": break;
			case "object":
				// Module can be created from a template
				modules[i] = (function(_m) {
					var args = _m.slice(1), fn = modules[_m[0]];
					return function (a,b,c) {
						fn.apply(this, [a,b,c].concat(args));
					};
				}(modules[i]));
				break;
			default:
				// Module is a copy of another module
				modules[i] = modules[modules[i]];
				break;
			}
		}
	}
	return modules;
}([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Component = __webpack_require__(44);
	
	var _Component2 = _interopRequireDefault(_Component);
	
	var _render = __webpack_require__(8);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _renderToString = __webpack_require__(57);
	
	var _renderToString2 = _interopRequireDefault(_renderToString);
	
	var _unmountComponentAtNode = __webpack_require__(23);
	
	var _unmountComponentAtNode2 = _interopRequireDefault(_unmountComponentAtNode);
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _templateTypes = __webpack_require__(15);
	
	var _templateTypes2 = _interopRequireDefault(_templateTypes);
	
	var _createFragment = __webpack_require__(51);
	
	var _createFragment2 = _interopRequireDefault(_createFragment);
	
	var _createTemplate = __webpack_require__(20);
	
	var _createTemplate2 = _interopRequireDefault(_createTemplate);
	
	var _clearDomElement = __webpack_require__(50);
	
	var _clearDomElement2 = _interopRequireDefault(_clearDomElement);
	
	var _createRef = __webpack_require__(52);
	
	var _createRef2 = _interopRequireDefault(_createRef);
	
	var _events = __webpack_require__(65);
	
	var _events2 = _interopRequireDefault(_events);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	module.exports = {
		Component: _Component2.default,
		render: _render2.default,
		renderToString: _renderToString2.default,
		createFragment: _createFragment2.default,
		createTemplate: _createTemplate2.default,
		unmountComponentAtNode: _unmountComponentAtNode2.default,
		FragmentValueTypes: _fragmentValueTypes2.default,
		TemplateTypes: _templateTypes2.default,
		clearDomElement: _clearDomElement2.default,
		createRef: _createRef2.default,
		Events: _events2.default
	};

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (x) {
	  return x.constructor === Array;
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		TEXT: 0,
		TEXT_DIRECT: 1,
		FRAGMENT: 2,
		LIST: 3,
		FRAGMENT_REPLACE: 4,
		LIST_REPLACE: 5,
		ATTR_CLASS: 6,
		ATTR_ID: 7,
		ATTR_REF: 8,
		COMPONENT: 9,
		COMPONENT_REPLACE: 10,
		COMPONENT_CHILDREN: 11,
		//will contain other "custom" types, like rowspan etc or custom data-attributes
		ATTR_OTHER: {},
		COMPONENT_PROPS: {}
	};

/***/ },
/* 3 */
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _removeFragment = __webpack_require__(7);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragmentValue = __webpack_require__(58);
	
	var _updateFragmentValue2 = _interopRequireDefault(_updateFragmentValue);
	
	var _updateFragmentValues = __webpack_require__(59);
	
	var _updateFragmentValues2 = _interopRequireDefault(_updateFragmentValues);
	
	var _unmountComponentAtFragment = __webpack_require__(22);
	
	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);
	
	var _removeComponent = __webpack_require__(6);
	
	var _removeComponent2 = _interopRequireDefault(_removeComponent);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function updateFragment(context, oldFragment, fragment, parent, component) {
	
		if (oldFragment == undefined) {
			(0, _attachFragment2.default)(context, fragment, parent, component);
			return;
		}
	
		if (fragment == undefined) {
			if (oldFragment.templateComponents) {
				for (var i = 0; i < oldFragment.templateComponents.length; i++) {
					(0, _removeComponent2.default)(oldFragment.templateComponents[i], oldFragment.templateElements[i]);
				}
				return;
			}
			(0, _removeFragment2.default)(context, parent, oldFragment);
			return;
		}
	
		if (oldFragment.template !== fragment.template) {
	
			// unmount component
			if (oldFragment.templateComponent || oldFragment.templateComponents) {
				(0, _unmountComponentAtFragment2.default)(oldFragment);
			}
			(0, _attachFragment2.default)(context, fragment, parent, component, oldFragment, true);
			return;
		}
		//ensure we reference the new fragment with the old fragment's DOM node
		fragment.dom = oldFragment.dom;
		if (fragment.templateValue !== undefined) {
			//update a single value in the fragement (templateValue rather than templateValues)
			(0, _updateFragmentValue2.default)(context, oldFragment, fragment, component);
		} else if (fragment.templateValues) {
			//updates all values within the fragment (templateValues is an array)
			(0, _updateFragmentValues2.default)(context, oldFragment, fragment, component);
		}
	}
	
	exports.default = updateFragment;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getRecycledFragment = __webpack_require__(53);
	
	var _getRecycledFragment2 = _interopRequireDefault(_getRecycledFragment);
	
	var _updateFragment = __webpack_require__(4);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _attachFragmentList = __webpack_require__(19);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _insertFragment = __webpack_require__(54);
	
	var _insertFragment2 = _interopRequireDefault(_insertFragment);
	
	var _bind = __webpack_require__(41);
	
	var _bind2 = _interopRequireDefault(_bind);
	
	var _templateTypes = __webpack_require__(15);
	
	var _templateTypes2 = _interopRequireDefault(_templateTypes);
	
	var _createElement = __webpack_require__(68);
	
	var _createElement2 = _interopRequireDefault(_createElement);
	
	var _createComponent = __webpack_require__(67);
	
	var _createComponent2 = _interopRequireDefault(_createComponent);
	
	var _dom = __webpack_require__(69);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _virtual = __webpack_require__(40);
	
	var _virtual2 = _interopRequireDefault(_virtual);
	
	var _attachComponent5 = __webpack_require__(48);
	
	var _attachComponent6 = _interopRequireDefault(_attachComponent5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// import Inferno from '../..';
	
	function attachFragment(context, fragment, parentDom, component, nextFragment, replace) {
		var template = fragment.template;
		var templateKey = template.key;
		var mountCallbacks = [];
	
		if (context.shouldRecycle === true) {
			var recycledFragment = (0, _getRecycledFragment2.default)(templateKey);
			if (recycledFragment != null) {
				(0, _updateFragment2.default)(context, recycledFragment, fragment, parentDom, component);
				(0, _insertFragment2.default)(context, fragment, parentDom, fragment.dom, nextFragment, replace);
				return;
			}
		}
	
		//there are different things we need to check for now
		var templateToUse = context.useVirtual ? _virtual2.default : _dom2.default;
		switch (template.type) {
			case _templateTypes2.default.TEMPLATE_API:
				template(fragment, templateToUse);
				break;
			case _templateTypes2.default.FUNCTIONAL_API:
				var createElement = (0, _createElement2.default)(fragment, templateToUse);
				var createComponent = (0, _createComponent2.default)(fragment, templateToUse);
				var params = [createElement, createComponent];
				var length = fragment.templateValue != null && 1 || fragment.templateValues && fragment.templateValues.length || 0;
	
				//create our pointers, for example 0,1,2,3,4,5 as params to pass through
				for (var i = 0; i < length; i++) {
					params.push({ pointer: i });
				}
				fragment.dom = template.apply(null, params);
				if (fragment.dom == null) {
					throw Error("Inferno Error: Fragment template (FUNCTIONAL_API) returned a null or undefined object rather than a DOM element.");
				}
				break;
			default:
				template(fragment);
				break;
		}
		//if this fragment has a single value, we attach only that value
		if (fragment.templateValue) {
			switch (fragment.templateType) {
				case _fragmentValueTypes2.default.LIST:
					(0, _attachFragmentList2.default)(context, fragment.templateValue, fragment.templateElement);
					break;
				case _fragmentValueTypes2.default.FRAGMENT:
				case _fragmentValueTypes2.default.LIST_REPLACE:
					attachFragment(context, fragment.templateValue, fragment.templateElement, component);
					break;
				case _fragmentValueTypes2.default.FRAGMENT_REPLACE:
					attachFragment(context, fragment.templateValue, parentDom, fragment.templateElement, true);
					fragment.templateElement = fragment.templateValue.dom.parentNode;
					break;
				case _fragmentValueTypes2.default.ATTR_REF:
					fragment.templateValue.element = fragment.templateElement;
					break;
				case _fragmentValueTypes2.default.COMPONENT_REPLACE:
					{
						var _attachComponent = (0, _attachComponent6.default)(context, fragment.templateElement, fragment.templateValue, fragment.dom, true);
	
						var mountElem = _attachComponent.mountElem;
						var _component = _attachComponent.component;
						var mountCallback = _attachComponent.mountCallback;
						var newElement = _attachComponent.newElement;
	
						fragment.templateElement = newElement;
						fragment.templateComponent = _component;
						//root component node
						if (mountElem === fragment.dom) {
							fragment.dom = newElement;
						}
						mountCallbacks.push(mountCallback);
						break;
					}
				case _fragmentValueTypes2.default.COMPONENT_CHILDREN:
					{
						fragment.templateElement.appendChild(fragment.templateValue);
						break;
					}
				case _fragmentValueTypes2.default.COMPONENT:
					{
						var _attachComponent2 = (0, _attachComponent6.default)(context, fragment.templateElement, fragment.templateValue, fragment.dom, false);
	
						var mountCallback = _attachComponent2.mountCallback;
	
						mountCallbacks.push(mountCallback);
						break;
					}
			}
		} else if (fragment.templateValues) {
			//if the fragment has multiple values, we must loop through them all and attach them
			//pulling this block of code out into its own function caused strange things to happen
			//with performance. it was faster in Gecko but far slower in v8
			for (var i = 0, length = fragment.templateValues.length; i < length; i++) {
				var element = fragment.templateElements[i],
				    value = fragment.templateValues[i];
	
				switch (fragment.templateTypes[i]) {
					case _fragmentValueTypes2.default.LIST:
						(0, _attachFragmentList2.default)(context, value, element);
						break;
					case _fragmentValueTypes2.default.LIST_REPLACE:
						var nodeList = document.createDocumentFragment(),
						    placeholderNode = fragment.templateElements[i],
						    parentElem = placeholderNode.parentNode;
	
						(0, _attachFragmentList2.default)(context, value, nodeList);
						parentElem.replaceChild(nodeList, placeholderNode);
						fragment.templateElements[i] = parentElem;
						break;
					case _fragmentValueTypes2.default.FRAGMENT:
						attachFragment(context, fragment.templateValues[i], fragment.templateElements[i], component);
						break;
					case _fragmentValueTypes2.default.FRAGMENT_REPLACE:
						attachFragment(context, value, parentDom, component, element, true);
						fragment.templateElements[i] = value.dom.parentNode;
						break;
					case _fragmentValueTypes2.default.ATTR_REF:
						fragment.templateValues[i].element = fragment.templateElements[i];
						break;
					case _fragmentValueTypes2.default.COMPONENT_REPLACE:
						{
							var _attachComponent3 = (0, _attachComponent6.default)(context, element, value, fragment.dom, true);
	
							var mountElem = _attachComponent3.mountElem;
							var _component2 = _attachComponent3.component;
							var mountCallback = _attachComponent3.mountCallback;
							var newElement = _attachComponent3.newElement;
	
							fragment.templateElements[i] = newElement;
							fragment.templateComponents[i] = _component2;
							//root component node
							if (mountElem === fragment.dom) {
								fragment.dom = newElement;
							}
							mountCallbacks.push(mountCallback);
							break;
						}
					case _fragmentValueTypes2.default.COMPONENT_CHILDREN:
						{
							fragment.templateElements[i].appendChild(fragment.templateValues[i]);
							break;
						}
					case _fragmentValueTypes2.default.COMPONENT:
						{
							var _attachComponent4 = (0, _attachComponent6.default)(context, fragment.templateElement, fragment.templateValue, fragment.dom, false);
	
							var mountCallback = _attachComponent4.mountCallback;
	
							mountCallbacks.push(mountCallback);
							break;
						}
				}
			}
		}
	
		(0, _insertFragment2.default)(context, fragment, parentDom, fragment.dom, nextFragment, replace);
	
		if (mountCallbacks) {
			//now fire all the component mountCallback functions so they know this fragment has been added
			for (var i = 0; i < mountCallbacks.length; i++) {
				mountCallbacks[i]();
			}
		}
	}
	
	exports.default = attachFragment;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = removeComponent;
	
	var _removeContext = __webpack_require__(13);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _badUpdate = __webpack_require__(49);
	
	var _badUpdate2 = _interopRequireDefault(_badUpdate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function removeComponent(component, element) {
		if (component == null) {
			return;
		}
		component.componentWillUnmount();
		(0, _removeContext2.default)(component.context.dom);
		component.forceUpdate = _badUpdate2.default;
		component.context = null;
		if (element) {
			element.parentNode.removeChild(element);
		}
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = removeFragment;
	
	var _destroyFragment = __webpack_require__(21);
	
	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function removeFragment(context, parentDom, item) {
		var domItem = item.dom;
	
		(0, _destroyFragment2.default)(context, item);
		domItem.parentNode.removeChild(domItem);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = renderFactory;
	
	var _contexts = __webpack_require__(17);
	
	var _contexts2 = _interopRequireDefault(_contexts);
	
	var _getContext = __webpack_require__(12);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(4);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function renderFactory(fragment, dom, component, useVirtual, defer) {
		var toRender = function render() {
			var context = undefined;
			var generatedFragment = undefined;
	
			if (component) {
				if (component.context) {
					context = component.context;
					generatedFragment = typeof fragment === 'function' ? fragment() : fragment;
					(0, _updateFragment2.default)(context, context.fragment, generatedFragment, dom, component, false);
					context.fragment = generatedFragment;
				} else {
					generatedFragment = typeof fragment === 'function' ? fragment() : fragment;
					context = component.context = {
						fragment: generatedFragment,
						dom: dom,
						shouldRecycle: !useVirtual,
						useVirtual: useVirtual
					};
					(0, _attachFragment2.default)(context, generatedFragment, dom, component);
				}
			} else {
				if (!useVirtual) {
					context = (0, _getContext2.default)(dom);
				}
				if (context) {
					(0, _updateFragment2.default)(context, context.fragment, fragment, dom, component, false);
					context.fragment = fragment;
				} else {
					context = {
						fragment: fragment,
						dom: dom,
						shouldRecycle: !useVirtual,
						useVirtual: useVirtual
					};
					(0, _attachFragment2.default)(context, fragment, dom, component);
					if (!useVirtual) {
						_contexts2.default.push(context);
					}
				}
			}
		};
		return defer ? toRender : toRender();
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _ExecutionEnvironment = __webpack_require__(3);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	var _addRootListener = __webpack_require__(26);
	
	var _addRootListener2 = _interopRequireDefault(_addRootListener);
	
	var _setHandler = __webpack_require__(28);
	
	var _setHandler2 = _interopRequireDefault(_setHandler);
	
	var _focusEvents = __webpack_require__(32);
	
	var _focusEvents2 = _interopRequireDefault(_focusEvents);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var standardNativeEvents = ['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', // mouse buttons
	'wheel', 'mousewheel', // mouse wheel
	'mouseover', 'mouseout', 'mousemove', 'selectstart', // mouse movement
	'keydown', 'keypress', 'keyup', // keyboard
	'copy', 'cut', 'paste', // text
	'change', 'reset', 'select', 'submit', 'focusout', 'focusin', // form elements
	
	// W3C native events
	'show', // mouse buttons
	'input', // form elements
	'touchstart', 'touchmove', 'touchend', 'touchcancel', // touch
	'textInput', // TextEvent
	'focus', 'blur', // Non-standard
	
	// Drag and Drop events
	'drag', 'drop', // dnd
	'dragstart', 'dragend', // dnd
	'dragenter', 'dragleave', // dnd
	'dragover', // dnd
	'dragexit', // Not supported
	
	// composition events
	'compositionstart', 'compositionend', 'compositionupdate', // composition
	'selectionchange' // IE-only
	];
	
	var nonBubbleableEvents = ['input', 'invalid', // form elements
	'select', // form elements
	'load', // window
	'unload', 'beforeunload', 'resize', // window
	'orientationchange', // mobile
	
	// Media
	'seeked', 'ended', 'durationchange', 'timeupdate', 'play', // media
	'pause', 'ratechange', 'loadstart', 'progress', 'suspend', // media
	'emptied', 'stalled', 'loadeddata', 'canplay', // media
	'canplaythrough', 'playing', 'waiting', 'seeking', // media
	'volumechange', // media
	
	// Misc Events
	'loadedmetadata', 'scroll', 'error', 'abort', // misc
	'mouseenter', 'mouseleave' // misc
	];
	
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
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _contexts = __webpack_require__(17);
	
	var _contexts2 = _interopRequireDefault(_contexts);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (dom) {
		for (var i = 0; i < _contexts2.default.length; i++) {
			if (_contexts2.default[i].dom === dom) {
				return _contexts2.default[i];
			}
		}
		return null;
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _contexts = __webpack_require__(17);
	
	var _contexts2 = _interopRequireDefault(_contexts);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (dom) {
		var idx = _contexts2.default.length;
	
		while (idx--) {
			if (_contexts2.default[idx].dom === dom) {
				_contexts2.default.splice(idx, 1);
				return;
			}
		}
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = updateComponent;
	function updateComponent(component, nextProps) {
		var nextState = arguments.length <= 2 || arguments[2] === undefined ? component.state : arguments[2];
		var blockRender = arguments[3];
	
		var prevProps = component.props;
		var prevState = component.state;
	
		if (!nextProps.children) {
			nextProps.children = prevProps.children;
		}
	
		if (prevProps !== nextProps || prevState !== nextState) {
			if (prevProps !== nextProps) {
				component._blockRender = true;
				component.componentWillReceiveProps(nextProps);
				component._blockRender = false;
			}
			var shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);
	
			if (shouldUpdate) {
				component._blockSetState = true;
				component.componentWillUpdate(nextProps, nextState);
				component._blockSetState = false;
				component.props = nextProps;
				component.state = nextState;
				if (!blockRender) {
					component.forceUpdate();
				}
				component.componentDidUpdate(prevProps, prevState);
			}
		}
	}

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = {
		TEMPLATE_API: 1,
		FUNCTIONAL_API: 2
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = registerEventHooks;
	
	var _eventHooks = __webpack_require__(29);
	
	var _eventHooks2 = _interopRequireDefault(_eventHooks);
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Register a wrapper around all events of a certain type
	 */
	function registerEventHooks(type, hook) {
		if ((0, _isArray2.default)(type)) {
			for (var i = 0; i < type.length; i++) {
				_eventHooks2.default[type[i]] = hook;
			}
		} else {
			_eventHooks2.default[type] = hook;
		}
	}

/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = [];

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	//VirtualTextNode are lightweight replacements for real DOM elements, they allow us to easily
	//move, remove, delete elements around our "virtual DOM" without needing real DOM elements
	//we can they find their text string for when we want to renderToString()
	function VirtualTextNode(nodeValue) {
	
	    return {
	        nodeValue: nodeValue
	    };
	}
	
	exports.default = VirtualTextNode;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function attachFragmentList(context, list, parentDom, component) {
		for (var i = 0; i < list.length; i++) {
			var item = list[i];
			//check this is a fragment we're dealing with
			if (item.template) {
				(0, _attachFragment2.default)(context, item, parentDom, component);
			} else {
				//otherwise it's an element, so we can simply append it
				parentDom.appendChild(item);
			}
		}
	}
	
	exports.default = attachFragmentList;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createTemplate;
	
	var _templateTypes = __webpack_require__(15);
	
	var _templateTypes2 = _interopRequireDefault(_templateTypes);
	
	var _uuid = __webpack_require__(81);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createTemplate(templateFunction) {
		//give the function a random key
		templateFunction.key = (0, _uuid2.default)();
		templateFunction.type = _templateTypes2.default.FUNCTIONAL_API;
		return templateFunction;
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _recycledFragments = __webpack_require__(43);
	
	var _recycledFragments2 = _interopRequireDefault(_recycledFragments);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Destroy fragment
	 */
	function destroyFragment(context, fragment) {
	
		var templateKey = undefined;
	
		//long winded approach, but components have their own context which is how we find their template keys
		if (fragment.component) {
			templateKey = fragment.component.context.fragment.template.key;
		} else {
			templateKey = fragment.template.key;
		}
	
		if (context.shouldRecycle === true) {
			var toRecycleForKey = _recycledFragments2.default[templateKey];
	
			if (!toRecycleForKey) {
				_recycledFragments2.default[templateKey] = toRecycleForKey = [];
			}
			toRecycleForKey.push(fragment);
		}
	}
	exports.default = destroyFragment;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = unmountComponentAtFragment;
	
	var _removeComponent = __webpack_require__(6);
	
	var _removeComponent2 = _interopRequireDefault(_removeComponent);
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function unmountComponentAtFragment(fragment) {
		var component = fragment.templateComponent || fragment.templateComponents;
		if (component != null) {
			if ((0, _isArray2.default)(component)) {
				for (var i = 0; i < component.length; i++) {
					(0, _removeComponent2.default)(component[i]);
				}
			} else {
				(0, _removeComponent2.default)(component);
			}
		}
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = unmountComponentAtNode;
	
	var _removeFragment = __webpack_require__(7);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _removeContext = __webpack_require__(13);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _getContext = __webpack_require__(12);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _unmountComponentAtFragment = __webpack_require__(22);
	
	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function unmountComponentAtNode(dom) {
		var context = (0, _getContext2.default)(dom);
	
		if (context !== null) {
			var component = context.fragment.templateComponents || context.fragment.templateComponent;
	
			if (component) {
				if ((0, _isArray2.default)(component)) {
					for (var i = 0; i < component.length; i++) {
						if (component[i]) {
							(0, _removeFragment2.default)(context, dom, component[i].context.fragment);
							(0, _unmountComponentAtFragment2.default)(component[i].context.fragment);
						}
					}
				} else {
					if (component) {
						(0, _removeFragment2.default)(context, dom.firstChild, component.context.fragment);
						(0, _unmountComponentAtFragment2.default)(component.context.fragment);
					}
				}
			} else {
				(0, _removeFragment2.default)(context, dom, context.fragment);
				(0, _removeContext2.default)(dom);
			}
		}
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = updateFragmentList;
	
	var _removeFragments = __webpack_require__(56);
	
	var _removeFragments2 = _interopRequireDefault(_removeFragments);
	
	var _removeFragment = __webpack_require__(7);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragmentList = __webpack_require__(19);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(4);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _moveFragment = __webpack_require__(55);
	
	var _moveFragment2 = _interopRequireDefault(_moveFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function updateFragmentList(context, oldList, list, parentDom, component, outerNextFragment) {
	
		if (oldList === list) {
			return;
		}
	
		var oldListLength = oldList.length;
		var listLength = list.length;
	
		if (listLength === 0) {
			(0, _removeFragments2.default)(context, parentDom, oldList, 0, oldListLength);
			return;
		} else if (oldListLength === 0) {
			(0, _attachFragmentList2.default)(context, list, parentDom, component);
			return;
		}
	
		if (oldListLength === 1 && listLength === 1) {
			(0, _updateFragment2.default)(context, oldList[0], list[0], parentDom);
			return;
		}
	
		var oldEndIndex = oldListLength - 1;
		var endIndex = listLength - 1;
		var oldStartIndex = 0;
		var startIndex = 0;
		var successful = true;
		var nextItem = undefined;
		var oldItem = undefined;
		var item = undefined;
		var oldStartItem = undefined;
		var oldEndItem = undefined;
		var startItem = undefined;
		var endItem = undefined;
	
		outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
	
			successful = false;
			oldStartItem = oldList[oldStartIndex];
			startItem = list[startIndex];
			while (oldStartItem.key === startItem.key) {
				(0, _updateFragment2.default)(context, oldStartItem, startItem, parentDom, component);
				oldStartIndex++;startIndex++;
				if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
					break outer;
				}
				oldStartItem = oldList[oldStartIndex];
				startItem = list[startIndex];
				successful = true;
			}
			oldEndItem = oldList[oldEndIndex];
			endItem = list[endIndex];
			while (oldEndItem.key === endItem.key) {
				(0, _updateFragment2.default)(context, oldEndItem, endItem, parentDom, component);
				oldEndIndex--;endIndex--;
				if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
					break outer;
				}
				oldEndItem = oldList[oldEndIndex];
				endItem = list[endIndex];
				successful = true;
			}
			while (oldStartItem.key === endItem.key) {
				nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
				(0, _updateFragment2.default)(context, oldStartItem, endItem, parentDom, component);
				(0, _moveFragment2.default)(parentDom, endItem, nextItem);
				oldStartIndex++;endIndex--;
				if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
					break outer;
				}
				oldStartItem = oldList[oldStartIndex];
				endItem = list[endIndex];
				successful = true;
			}
			while (oldEndItem.key === startItem.key) {
				nextItem = oldStartIndex < oldListLength ? oldList[oldStartIndex] : outerNextFragment;
				(0, _updateFragment2.default)(context, oldEndItem, startItem, parentDom, component);
				(0, _moveFragment2.default)(parentDom, startItem, nextItem);
				oldEndIndex--;startIndex++;
				if (oldStartIndex > oldEndIndex || startIndex > endIndex) {
					break outer;
				}
				oldEndItem = oldList[oldEndIndex];
				startItem = list[startIndex];
				successful = true;
			}
		}
		if (oldStartIndex > oldEndIndex) {
			nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
			for (var i = startIndex; i <= endIndex; i++) {
				item = list[i];
				(0, _attachFragment2.default)(context, item, parentDom, component, nextItem);
			}
		} else if (startIndex > endIndex) {
			(0, _removeFragments2.default)(context, parentDom, oldList, oldStartIndex, oldEndIndex + 1);
		} else {
			var oldNextItem = oldEndIndex + 1 >= oldListLength ? null : oldList[oldEndIndex + 1];
			var oldListMap = {};
	
			for (var i = oldEndIndex; i >= oldStartIndex; i--) {
				oldItem = oldList[i];
				oldItem.next = oldNextItem;
				oldListMap[oldItem.key] = oldItem;
				oldNextItem = oldItem;
			}
			nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
			for (var i = endIndex; i >= startIndex; i--) {
				item = list[i];
				var key = item.key;
				oldItem = oldListMap[key];
				if (oldItem) {
					oldListMap[key] = null;
					oldNextItem = oldItem.next;
					(0, _updateFragment2.default)(context, oldItem, item, parentDom, component);
					if (parentDom.nextSibling !== (nextItem && nextItem.dom)) {
						(0, _moveFragment2.default)(parentDom, item, nextItem);
					}
				} else {
					(0, _attachFragment2.default)(context, item, parentDom, component, nextItem);
				}
				nextItem = item;
			}
			for (var i = oldStartIndex; i <= oldEndIndex; i++) {
				oldItem = oldList[i];
				if (oldListMap[oldItem.key] !== null) {
					(0, _removeFragment2.default)(context, parentDom, oldItem);
				}
			}
		}
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = addListener;
	
	var _InfernoNodeID = __webpack_require__(10);
	
	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);
	
	var _addRootListener = __webpack_require__(26);
	
	var _addRootListener2 = _interopRequireDefault(_addRootListener);
	
	var _EventRegistry = __webpack_require__(9);
	
	var _EventRegistry2 = _interopRequireDefault(_EventRegistry);
	
	var _listenersStorage = __webpack_require__(11);
	
	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);
	
	var _setHandler = __webpack_require__(28);
	
	var _setHandler2 = _interopRequireDefault(_setHandler);
	
	var _createEventListener = __webpack_require__(60);
	
	var _createEventListener2 = _interopRequireDefault(_createEventListener);
	
	var _eventListener = __webpack_require__(30);
	
	var _eventListener2 = _interopRequireDefault(_eventListener);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Set a event listeners on a node
	 */
	function addListener(node, type, listener) {
	
	    if (!node) {
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
	
	        var nodeID = (0, _InfernoNodeID2.default)(node),
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
	            _eventListener2.default[type] = _eventListener2.default[type] || (0, _createEventListener2.default)(type);
	            node.addEventListener(type, _eventListener2.default[type], false);
	            listeners[type] = (0, _setHandler2.default)(type, listener);
	        }
	    } else {
	
	        throw Error('Inferno Error: ' + type + ' has not been registered, and therefor not supported.');
	    }
	}

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = addRootListener;
	
	var _InfernoNodeID = __webpack_require__(10);
	
	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);
	
	var _listenersStorage = __webpack_require__(11);
	
	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);
	
	var _EventRegistry = __webpack_require__(9);
	
	var _EventRegistry2 = _interopRequireDefault(_EventRegistry);
	
	var _eventInterface = __webpack_require__(61);
	
	var _eventInterface2 = _interopRequireDefault(_eventInterface);
	
	var _createListenerArguments = __webpack_require__(27);
	
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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createListenerArguments;
	
	var _isFormElement = __webpack_require__(78);
	
	var _isFormElement2 = _interopRequireDefault(_isFormElement);
	
	var _getFormElementValues = __webpack_require__(71);
	
	var _getFormElementValues2 = _interopRequireDefault(_getFormElementValues);
	
	var _setupHooks = __webpack_require__(33);
	
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = setHandler;
	
	var _eventHooks = __webpack_require__(29);
	
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
/* 29 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {};

/***/ },
/* 30 */
29,
/* 31 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// For events like 'submit' which don't consistently bubble (which we trap at a
	// lower node than `document`), binding at `document` would cause duplicate
	// events so we don't include them here
	exports.default = {
	  onAbort: 'abort',
	  onBeforeUnload: 'beforeunload',
	  onBlur: 'blur',
	  onCanPlay: 'canplay',
	  onCanPlayThrough: 'canplaythrough',
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
	  onDurationChange: 'durationchange',
	  onEmptied: 'emptied',
	  onEnded: 'ended',
	  onError: 'error',
	  onFocus: 'focus',
	  onFocusIn: 'focusin', // not supported by Firefox
	  onFocusOut: 'focusout', // not supported by Firefox
	  onInput: 'input',
	  onInvalid: 'invalid',
	  onKeyDown: 'keydown',
	  onKeyPress: 'keypress',
	  onKeyUp: 'keyup',
	  onLoad: 'load',
	  onLoadedData: 'loadeddata',
	  onLoadedMetadata: 'loadedmetadata',
	  onLoadStart: 'loadstart',
	  onMouseDown: 'mousedown',
	  onMouseMove: 'mousemove',
	  onMouseOut: 'mouseout',
	  onMouseOver: 'mouseover',
	  onMouseUp: 'mouseup',
	  onMouseEnter: 'mouseenter',
	  onMouseLeave: 'mouseleave',
	  onMouseWheel: 'mousewheel',
	  onOrientationChange: 'orientationchange',
	  onPaste: 'paste',
	  onPause: 'pause',
	  onPlay: 'play',
	  onPlaying: 'playing',
	  onProgress: 'progress',
	  onRateChange: 'ratechange',
	  onReset: 'reset',
	  onResize: 'resize',
	  onScroll: 'scroll',
	  onSeeked: 'seeked',
	  onSeeking: 'seeking',
	  onSelect: 'select',
	  onSelectionChange: 'selectionchange',
	  onSelectStart: 'selectstart',
	  onShow: 'show',
	  onStalled: 'stalled',
	  onSubmit: 'submit',
	  onSuspend: 'suspend',
	  onTextInput: 'textInput',
	  onTimeUpdate: 'timeupdate',
	  onTouchCancel: 'touchcancel',
	  onTouchEnd: 'touchend',
	  onTouchMove: 'touchmove',
	  onTouchStart: 'touchstart',
	  onUnload: 'unload',
	  onVolumeChange: 'volumechange',
	  onWaiting: 'waiting',
	  onWheel: 'wheel'
	};

/***/ },
/* 32 */
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
/* 33 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// type -> node -> function(target, event)
	exports.default = {};

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var PROPERTY = 0x1;
	var BOOLEAN = 0x2;
	var NUMERIC_VALUE = 0x4;
	var POSITIVE_NUMERIC_VALUE = 0x6 | 0x4;
	var OBJECT = 0x1 | 0x20;
	
	var xlink = 'http://www.w3.org/1999/xlink';
	var xml = 'http://www.w3.org/XML/1998/namespace';
	
	var namespaceAttrs = {
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
	
	var attributeMapping = {
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
	    xmlSpace: 'xml:space'
	};
	
	// This 'whitelist' contains edge cases such as attributes
	// that should be seen as a property or boolean property.
	// ONLY EDIT THIS IF YOU KNOW WHAT YOU ARE DOING!!
	var Whitelist = {
	    allowFullScreen: BOOLEAN,
	    async: BOOLEAN,
	    autoFocus: BOOLEAN,
	    autoPlay: BOOLEAN,
	    capture: BOOLEAN,
	    checked: PROPERTY | BOOLEAN,
	    cols: POSITIVE_NUMERIC_VALUE,
	    controls: BOOLEAN,
	    currentTime: PROPERTY | POSITIVE_NUMERIC_VALUE,
	    default: BOOLEAN,
	    defer: BOOLEAN,
	    disabled: BOOLEAN,
	    download: BOOLEAN,
	    enabled: BOOLEAN,
	    formNoValidate: BOOLEAN,
	    hidden: BOOLEAN,
	    loop: BOOLEAN,
	    // Caution; `option.selected` is not updated if `select.multiple` is
	    // disabled with `removeAttribute`.
	    multiple: PROPERTY | BOOLEAN,
	    muted: PROPERTY | BOOLEAN,
	    noValidate: BOOLEAN,
	    open: BOOLEAN,
	    paused: PROPERTY,
	    playbackRate: PROPERTY | NUMERIC_VALUE,
	    readOnly: BOOLEAN,
	    required: BOOLEAN,
	    reversed: BOOLEAN,
	    rowSpan: NUMERIC_VALUE,
	    scoped: BOOLEAN,
	    seamless: BOOLEAN,
	    selected: PROPERTY | BOOLEAN,
	    style: OBJECT, // TODO! Fix inline styles
	    size: POSITIVE_NUMERIC_VALUE,
	    span: POSITIVE_NUMERIC_VALUE,
	    srcLang: PROPERTY,
	    srcObject: PROPERTY,
	    start: NUMERIC_VALUE,
	    value: PROPERTY,
	    volume: PROPERTY | POSITIVE_NUMERIC_VALUE,
	    itemScope: BOOLEAN,
	
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
	    'xml:space': null
	};
	
	function checkBitmask(value, bitmask) {
	    return bitmask != null && (value & bitmask) === bitmask;
	}
	
	exports.default = (function () {
	
	    var attributeContainer = {};
	
	    for (var propName in Whitelist) {
	
	        var propConfig = Whitelist[propName];
	
	        var attributeName = attributeMapping[propName] || propName.toLowerCase();
	
	        var propertyInfo = {
	            attributeName: attributeName,
	            attributeNamespace: namespaceAttrs[propName],
	            propertyName: propName,
	            mutationMethod: null,
	
	            mustUseProperty: checkBitmask(propConfig, PROPERTY),
	            hasBooleanValue: checkBitmask(propConfig, BOOLEAN),
	            hasNumericValue: checkBitmask(propConfig, NUMERIC_VALUE),
	            hasPositiveNumericValue: checkBitmask(propConfig, POSITIVE_NUMERIC_VALUE),
	            hasObject: checkBitmask(propConfig, OBJECT) // Todo! Should this also contain dataset?
	        };
	
	        attributeContainer[attributeName] = propertyInfo;
	    }
	    return function getPropertyInfo(attributeName) {
	
	        var lowerCased = attributeName.toLowerCase();
	        var propInfo = undefined;
	
	        if (attributeContainer[lowerCased]) {
	            propInfo = attributeContainer[lowerCased];
	        } else {
	            propInfo = {
	                attributeName: attributeMapping[attributeName] || lowerCased,
	                mustUseAttribute: true,
	                isCustomAttribute: true // TODO! Check for HTML 'data-*' attribute and validate
	            };
	        }
	        return propInfo;
	    };
	})();

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _HTMLProperties = __webpack_require__(34);
	
	var _HTMLProperties2 = _interopRequireDefault(_HTMLProperties);
	
	var _shouldIgnoreValue = __webpack_require__(38);
	
	var _shouldIgnoreValue2 = _interopRequireDefault(_shouldIgnoreValue);
	
	var _ExecutionEnvironment = __webpack_require__(3);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _addPixelSuffixToValueIfNeeded = __webpack_require__(37);
	
	var _addPixelSuffixToValueIfNeeded2 = _interopRequireDefault(_addPixelSuffixToValueIfNeeded);
	
	var _setSelectValueForProperty = __webpack_require__(73);
	
	var _setSelectValueForProperty2 = _interopRequireDefault(_setSelectValueForProperty);
	
	var _setValueForStyles = __webpack_require__(75);
	
	var _setValueForStyles2 = _interopRequireDefault(_setValueForStyles);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*
	 * Template interface
	 */
	
	var template = {};
	
	if (_ExecutionEnvironment2.default.canUseDOM) {
	
	    template = {
	        setProperty: function setProperty(node, name, value) {
	
	            var propertyInfo = (0, _HTMLProperties2.default)(name);
	
	            if (propertyInfo) {
	                if ((0, _shouldIgnoreValue2.default)(propertyInfo, value)) {
	                    template.removeProperty(node, name);
	                } else {
	                    if (propertyInfo.mustUseProperty) {
	
	                        var propName = propertyInfo.propertyName;
	
	                        if (propertyInfo.hasObject) {
	                            if (propName === 'style') {
	                                (0, _setValueForStyles2.default)(node, value);
	                            }
	                        } else if (propName === 'value' && node.tagName === 'SELECT') {
	                            (0, _setSelectValueForProperty2.default)(node, propName, value);
	                        } else if ('' + node[propName] !== '' + value) {
	                            node[propName] = value;
	                        }
	                    } else {
	                        var attributeName = propertyInfo.attributeName;
	                        var namespace = propertyInfo.attributeNamespace;
	
	                        if (namespace) {
	
	                            node.setAttributeNS(namespace, attributeName, '' + value);
	                        } else {
	                            node.setAttribute(attributeName, '' + value);
	                        }
	                    }
	                }
	                // custom attributes
	                // Take any attribute (with correct syntax) as custom attribute.
	            } else if (name) {
	                    // TODO! Validate
	                    node.setAttribute(name, value);
	                }
	        },
	
	        /**
	         * Deletes the value for a property on a node.
	         *
	         * @param {DOMElement} node
	         * @param {string} name
	         */
	        removeProperty: function removeProperty(node, name) {
	            var propertyInfo = (0, _HTMLProperties2.default)(name);
	
	            if (propertyInfo !== undefined) {
	                if (propertyInfo.mustUseProperty) {
	
	                    var propName = propertyInfo.propertyName;
	                    // Special case: 'style' and 'dataset' property has to be removed as an attribute
	                    if (propertyInfo.hasObject) {
	                        node.removeAttribute(propName);
	                    } else if (propName === 'value' && node.tagName.toLowerCase() === 'select') {
	                        var options = node.options;
	                        var len = options.length;
	                        var i = 0;
	                        while (i < len) {
	                            options[i++].selected = false;
	                        }
	                    } else if (propertyInfo.hasBooleanValue) {
	                        node[propName] = false;
	                    } else {
	                        if ('' + node[propName] !== '') {
	                            node[propName] = '';
	                        }
	                    }
	                } else {
	                    node.removeAttribute(propertyInfo.attributeName);
	                }
	                // Custom attributes
	            } else {
	                    node.removeAttribute(name);
	                }
	        }
	    };
	}
	
	exports.default = template;

/***/ },
/* 36 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = sanitizeValue;
	function sanitizeValue(element, value, propertyName, attributeName) {
		if (value == null) {
			element.removeAttribute(attributeName);
			return;
		}
		if (propertyName !== null) {
			element[propertyName] = value;
		} else {
			element.setAttribute(attributeName, value);
		}
	}

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _unitlessProperties = __webpack_require__(77);
	
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
		if (value === 0 || (0, _unitlessProperties2.default)(name) || isNaN(value)) {
			return '' + value; // cast to string
		}
		if (typeof value === 'string') {
			value = value.trim();
		}
		return value + 'px';
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function shouldIgnoreValue(propertyInfo, value) {
	    return value == null || propertyInfo.hasBooleanValue && !value || propertyInfo.hasNumericValue && isNaN(value) || propertyInfo.hasPositiveNumericValue && value < 1 || propertyInfo.hasOverloadedBooleanValue && value === false;
	}
	
	exports.default = shouldIgnoreValue;

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _ = __webpack_require__(35);
	
	var _2 = _interopRequireDefault(_);
	
	var _addListener = __webpack_require__(25);
	
	var _addListener2 = _interopRequireDefault(_addListener);
	
	var _removeListener = __webpack_require__(66);
	
	var _removeListener2 = _interopRequireDefault(_removeListener);
	
	var _eventMapping = __webpack_require__(31);
	
	var _eventMapping2 = _interopRequireDefault(_eventMapping);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Detecting differences in property values and updating the DOM as necessary.
	 * This function is probably the single most critical path for performance optimization.
	 *
	 * @param {DOMElement} element
	 * @param {string} propName
	 * @param {object} oldProp
	 * @param {object} newProp
	 */
	function updateDOMProperties(element, propName, oldProp, newProp) {
	    if (propName === 'style') {
	        var styleUpdates = undefined;
	        var styleName = undefined;
	
	        if (oldProp != null) {
	            if (newProp == null) {
	                _2.default.removeProperty(element, propName);
	            } else {
	                // Unset styles on `oldProp` but not on `newProp`.
	                for (styleName in oldProp) {
	                    if (oldProp[styleName] && (!newProp || !newProp[styleName])) {
	                        styleUpdates = styleUpdates || {};
	                        styleUpdates[styleName] = '';
	                    }
	                }
	                // Update styles that changed since `oldProp`.
	                for (styleName in newProp) {
	                    if (newProp[styleName] && oldProp[styleName] !== newProp[styleName]) {
	                        styleUpdates = styleUpdates || {};
	                        styleUpdates[styleName] = newProp[styleName];
	                    }
	                }
	            }
	        } else if (newProp != null) {
	            styleUpdates = newProp;
	        }
	        if (styleUpdates) {
	            _2.default.setProperty(element, propName, styleUpdates);
	        }
	        // Event listeners
	    } else if (_eventMapping2.default[propName] != null) {
	            if (oldProp != null) {
	                if (newProp != null) {
	                    (0, _addListener2.default)(element, _eventMapping2.default[propName], newProp);
	                } else {
	                    (0, _removeListener2.default)(element, _eventMapping2.default[propName]);
	                }
	            } else if (newProp != null) {
	                (0, _addListener2.default)(element, _eventMapping2.default[propName], newProp);
	            }
	        } else if (oldProp != null) {
	            // If 'newProp' is null or undefined, we, we should remove the property
	            // from the DOM node instead of inadvertantly setting to a string.
	            if (newProp != null) {
	                _2.default.setProperty(element, propName, newProp);
	            } else {
	                _2.default.removeProperty(element, propName);
	            }
	        } else if (newProp != null) {
	            _2.default.setProperty(element, propName, newProp);
	        }
	}
	
	exports.default = updateDOMProperties;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _VirtualElement = __webpack_require__(45);
	
	var _VirtualElement2 = _interopRequireDefault(_VirtualElement);
	
	var _VirtualTextNode = __webpack_require__(18);
	
	var _VirtualTextNode2 = _interopRequireDefault(_VirtualTextNode);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		createElement: function createElement(tag, xmlns, is) {
			return (0, _VirtualElement2.default)(tag, xmlns, is);
		},
		createTextNode: function createTextNode(text) {
			return (0, _VirtualTextNode2.default)(text);
		},
		createEmptyText: function createEmptyText() {
			return (0, _VirtualTextNode2.default)('');
		},
		createEmptyDiv: function createEmptyDiv() {
			return (0, _VirtualElement2.default)('div');
		}
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function bind(self, fn) {
	  var curryArgs = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : [];
	  if (typeof fn === 'function') {
	    return curryArgs.length ? function () {
	      return arguments.length ? fn.apply(self, concat(curryArgs, arguments, 0)) // Todo! use 'new Array' instead of 'concat'
	      : fn.apply(self, curryArgs);
	    } : function () {
	      return arguments.length ? fn.apply(self, arguments) : fn.call(self);
	    };
	  } else {
	    // in IE, native methods are not functions so they cannot be bound (note: they don't need to be)
	    return fn;
	  }
	}
	exports.default = bind;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _ExecutionEnvironment = __webpack_require__(3);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var isSVG = undefined;
	
	if (_ExecutionEnvironment2.default.canUseDOM) {
		var _document = document;
		var implementation = _document.implementation;
	
		isSVG = implementation && implementation.hasFeature && implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
	}
	
	exports.default = isSVG;

/***/ },
/* 43 */
29,
/* 44 */
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
			this.context = context;
			this._blockRender = false;
			this._blockSetState = false;
			this._deferSetState = false;
			this._pendingSetState = false;
			this._pendingState = {};
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
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _VirtualTextNode = __webpack_require__(18);
	
	var _VirtualTextNode2 = _interopRequireDefault(_VirtualTextNode);
	
	var _HTMLProperties = __webpack_require__(34);
	
	var _HTMLProperties2 = _interopRequireDefault(_HTMLProperties);
	
	var _shouldIgnoreValue = __webpack_require__(38);
	
	var _shouldIgnoreValue2 = _interopRequireDefault(_shouldIgnoreValue);
	
	var _quoteAttributeValueForBrowser = __webpack_require__(76);
	
	var _quoteAttributeValueForBrowser2 = _interopRequireDefault(_quoteAttributeValueForBrowser);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createMarkupForProperty(name, value) {
	
	    console.log(value);
	
	    var propertyInfo = _HTMLProperties2.default[name];
	
	    if (propertyInfo) {
	
	        console.log(name);
	        if ((0, _shouldIgnoreValue2.default)(propertyInfo, value)) {
	            return '';
	        }
	        var attributeName = propertyInfo.attributeName;
	        if (propertyInfo.hasBooleanValue || propertyInfo.hasOverloadedBooleanValue && value === true) {
	            return attributeName + '=""';
	        }
	        return attributeName + '=' + (0, _quoteAttributeValueForBrowser2.default)(value);
	    } else {
	        if (value == null) {
	            return '';
	        }
	        return name + '=' + (0, _quoteAttributeValueForBrowser2.default)(value);
	    }
	    return null;
	}
	
	// The HTML elements in this list are speced by
	// http://www.w3.org/TR/html-markup/syntax.html#syntax-elements,
	// and will be forced to close regardless of if they have a
	// self-closing /> at the end.
	var voidTagNames = {
	    area: true,
	    base: true,
	    basefont: true,
	    br: true,
	    col: true,
	    command: true,
	    embed: true,
	    frame: true,
	    hr: true,
	    img: true,
	    input: true,
	    isindex: true,
	    keygen: true,
	    link: true,
	    meta: true,
	    param: true,
	    source: true,
	    track: true,
	    wbr: true,
	
	    //common self closing svg elements
	    path: true,
	    circle: true,
	    ellipse: true,
	    line: true,
	    rect: true,
	    use: true,
	    stop: true,
	    polyline: true,
	    polygon: true
	};
	
	var doNotShowInHtml = {
	    //  textContent: true,
	    //    appendChild: true,
	    //    setAttribute: true,
	    //    outerHTML: true,
	    innerHTML: true,
	    //    children: true,
	    tagName: true,
	    //    options: true,
	    selected: true,
	    value: true
	};
	
	function VirtualElement(tagName, xmlns, is) {
	
	    // Built-in properties that belong on the element
	
	    var virtual = {
	        props: {},
	        tagName: tagName,
	        options: [],
	        children: [],
	        appendChild: function appendChild(child) {
	            if (virtual.tagName === 'select') {
	                virtual.options.push(child);
	            }
	            virtual.children.push(child);
	        },
	        setAttribute: function setAttribute(attribute, value) {
	            virtual.props[attribute] = value;
	        }
	    };
	
	    Object.defineProperty(virtual, 'textContent', {
	        set: function set(textValue) {
	            /* TODO shouldn't this entire function just be
	            	this.children = [new VirtualTextNode(textValue)];
	            */
	            if (virtual.children.length > 0) {
	                //if we have children, kill them
	                virtual.children = [];
	            } else {
	
	                virtual.appendChild((0, _VirtualTextNode2.default)(textValue));
	            }
	        },
	        get: function get() {
	            return virtual.children[0].nodeValue;
	        }
	    });
	
	    Object.defineProperty(virtual, 'innerHTML', {
	        set: function set() {
	            throw Error('You cannot set the innerHTML of virtual elements, use declarative API instead');
	        },
	        get: function get() {
	            return virtual.children.map(function (child) {
	                return child.outerHTML || child.nodeValue;
	            }).join('');
	        }
	    });
	
	    Object.defineProperty(virtual, 'outerHTML', {
	        set: function set() {
	            throw Error('You cannot set the outerHTML of virtual elements, use declarative API instead');
	        },
	        get: function get() {
	
	            var isVoidElement = voidTagNames[tagName.toLowerCase()];
	
	            var innerHTML = virtual.props.innerHTML;
	            var attributes = '';
	            var childrenInnerHtml = undefined;
	            delete virtual.props.innerHTML;
	
	            var ret = '<' + tagName;
	
	            //let childrenInnerHtml;
	            // Props taken out and moved into it's own object. Need to finish this later on.
	
	            for (var property in virtual.props) {
	
	                var propVal = virtual.props[property];
	
	                var markup = createMarkupForProperty(property, propVal);
	
	                if (markup) {
	                    ret += ' ' + markup;
	                }
	            }
	
	            if (isVoidElement) {
	
	                ret = ret + '/>';
	            } else {
	
	                ret = ret + '>';
	                if (innerHTML) {
	                    childrenInnerHtml = innerHTML;
	                } else {
	                    childrenInnerHtml = virtual.children.map(function (child) {
	                        return child.outerHTML || child.nodeValue;
	                    }).join('');
	                }
	                if (childrenInnerHtml) {
	                    ret = ret + childrenInnerHtml;
	                }
	                ret = ret + '</' + tagName + '>';
	            }
	            return ret;
	        }
	    });
	
	    return virtual;
	}
	
	exports.default = VirtualElement;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _updateComponent = __webpack_require__(14);
	
	var _updateComponent2 = _interopRequireDefault(_updateComponent);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
				(0, _updateComponent2.default)(component, component.props, nextState, blockRender);
			} else {
				applyState(component);
			}
		});
	}
	
	exports.default = applyState;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = queueStateChanges;
	
	var _applyState = __webpack_require__(46);
	
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
	exports.default = attachComponent;
	
	var _bind = __webpack_require__(41);
	
	var _bind2 = _interopRequireDefault(_bind);
	
	var _render = __webpack_require__(8);
	
	var _render2 = _interopRequireDefault(_render);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function attachComponent(context, mountElem, Component, fragmentDom, replaceComponent) {
		var newElement = undefined;
		var props = Component.props || {};
		var parentElem = mountElem.parentNode;
		var children = mountElem.childNodes;
	
		if (children.length > 0) {
			props.children = [].slice.call(children);
		}
		var component = new Component.component(props);
	
		component.context = null;
		component.forceUpdate = (0, _render2.default)((0, _bind2.default)(component, component.render), mountElem, component, context.useVirtual, true);
		component.componentWillMount();
		component.forceUpdate();
	
		if (replaceComponent) {
			newElement = mountElem.firstChild;
	
			if (parentElem != null) {
				parentElem.replaceChild(newElement, mountElem);
			}
		}
	
		var mountCallback = component.componentDidMount;
		return { component: component, mountElem: mountElem, newElement: newElement, mountCallback: mountCallback };
	}

/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports.default = function () {
		console.warn('Update called on a component that is no longer mounted!');
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = clearDomElement;
	
	var _getContext = __webpack_require__(12);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _removeContext = __webpack_require__(13);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _unmountComponentAtNode = __webpack_require__(23);
	
	var _unmountComponentAtNode2 = _interopRequireDefault(_unmountComponentAtNode);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function clearDomElement(dom) {
		var context = (0, _getContext2.default)(dom);
		//unmountComponentAtNode(dom);
		if (context != null) {
			(0, _removeContext2.default)(dom);
		}
	}

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createFragment;
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _createTemplate = __webpack_require__(20);
	
	var _createTemplate2 = _interopRequireDefault(_createTemplate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createFragment(values, template) {
	    var key = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
	    if (template.key == null) {
	        template = (0, _createTemplate2.default)(template);
	    }
	
	    var fragment = {
	        dom: null,
	        key: key,
	        next: null,
	        template: template
	    };
	
	    if (values != null) {
	        if ((0, _isArray2.default)(values)) {
	
	            if (values.length === 1) {
	                fragment.templateElement = null;
	                fragment.templateType = null;
	                fragment.templateValue = values[0];
	                fragment.templateComponent = null;
	            } else if (values.length > 1) {
	                fragment.templateElements = new Array(values.length);
	                fragment.templateTypes = new Array(values.length);
	                fragment.templateComponents = new Array(values.length);
	                fragment.templateValues = values;
	            }
	        } else {
	            fragment.templateElement = null;
	            fragment.templateType = null;
	            fragment.templateValue = values;
	        }
	    }
	
	    return fragment;
	}

/***/ },
/* 52 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createRef;
	function createRef() {
	    return {
	        element: null
	    };
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _recycledFragments = __webpack_require__(43);
	
	var _recycledFragments2 = _interopRequireDefault(_recycledFragments);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (templateKey) {
	
		var fragments = _recycledFragments2.default[templateKey];
		if (!fragments || fragments.length === 0) {
	
			return null;
		}
		return fragments.pop();
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = insertFragment;
	
	var _destroyFragment = __webpack_require__(21);
	
	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function insertFragment(context, fragment, parent, container, nextFragment, replace) {
	    if (nextFragment) {
	        var noDestroy = false;
	        var domNextFragment = nextFragment.dom;
	
	        if (!domNextFragment) {
	            domNextFragment = nextFragment;
	            parent = domNextFragment.parentNode;
	            noDestroy = true;
	        }
	
	        if (replace) {
	            if (noDestroy === false) {
	                (0, _destroyFragment2.default)(fragment, nextFragment);
	            }
	            parent.replaceChild(container, domNextFragment);
	            return;
	        }
	        parent.insertBefore(container, domNextFragment);
	    } else {
	        parent.appendChild(container);
	    }
	}

/***/ },
/* 55 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = moveFragment;
	function moveFragment(parentDom, item, nextItem) {
		var domItem = item.dom;
		var domRefItem = nextItem && nextItem.dom;
	
		if (domItem !== domRefItem) {
			var activeFragment = document.activeElement;
	
			if (domRefItem) {
				parentDom.insertBefore(domItem, domRefItem);
			} else {
				parentDom.appendChild(domItem);
			}
			if (activeFragment !== document.body && document.activeElement !== activeFragment) {
				activeFragment.focus();
			}
		}
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _removeFragment = __webpack_require__(7);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (context, parentDom, fragments, i, to) {
		for (; i < to; i++) {
			(0, _removeFragment2.default)(context, parentDom, fragments[i]);
		}
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = renderToString;
	
	var _render = __webpack_require__(8);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _virtual = __webpack_require__(40);
	
	var _virtual2 = _interopRequireDefault(_virtual);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function renderToString(fragment, component) {
		var dom = _virtual2.default.createElement('div');
		(0, _render2.default)(fragment, dom, component, true);
		return dom.innerHTML;
	}

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _updateFragment = __webpack_require__(4);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _updateFragmentList = __webpack_require__(24);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _isSVG = __webpack_require__(42);
	
	var _isSVG2 = _interopRequireDefault(_isSVG);
	
	var _updateDOMProperties = __webpack_require__(39);
	
	var _updateDOMProperties2 = _interopRequireDefault(_updateDOMProperties);
	
	var _updateComponent = __webpack_require__(14);
	
	var _updateComponent2 = _interopRequireDefault(_updateComponent);
	
	var _removeComponent = __webpack_require__(6);
	
	var _removeComponent2 = _interopRequireDefault(_removeComponent);
	
	var _sanitizeValue = __webpack_require__(36);
	
	var _sanitizeValue2 = _interopRequireDefault(_sanitizeValue);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function updateFragmentValue(context, oldFragment, fragment, component) {
	    var element = oldFragment.templateElement,
	        type = oldFragment.templateType,
	        templateComponent = oldFragment.templateComponent;
	
	    fragment.templateElement = element;
	    fragment.templateType = type;
	    fragment.templateComponent = templateComponent;
	
	    if (fragment.templateValue !== oldFragment.templateValue) {
	
	        switch (type) {
	            case _fragmentValueTypes2.default.LIST:
	            case _fragmentValueTypes2.default.LIST_REPLACE:
	                (0, _updateFragmentList2.default)(context, oldFragment.templateValue, fragment.templateValue, element, component);
	                return;
	            case _fragmentValueTypes2.default.TEXT:
	                element.firstChild.nodeValue = fragment.templateValue;
	                return;
	            case _fragmentValueTypes2.default.TEXT_DIRECT:
	                element.nodeValue = fragment.templateValue;
	                return;
	            case _fragmentValueTypes2.default.FRAGMENT:
	            case _fragmentValueTypes2.default.FRAGMENT_REPLACE:
	                (0, _updateFragment2.default)(context, oldFragment.templateValue, fragment.templateValue, element, component);
	                return;
	            case _fragmentValueTypes2.default.ATTR_CLASS:
	                // To set className on SVG elements, it's necessary to use .setAttribute;
	                // this works on HTML elements too in all browsers.
	                // If this kills the performance, we have to consider not to support SVG
	                if (_isSVG2.default) {
	                    (0, _sanitizeValue2.default)(element, fragment.templateValue, null, 'class');
	                } else {
	                    (0, _sanitizeValue2.default)(element, fragment.templateValue, 'className', 'class');
	                }
	                return;
	            case _fragmentValueTypes2.default.COMPONENT:
	            case _fragmentValueTypes2.default.COMPONENT_REPLACE:
	                var comp = fragment.templateValue;
	                var oldComp = oldFragment.templateValue;
	
	                if (comp === null || comp.component === null) {
	                    (0, _removeComponent2.default)(templateComponent, element);
	                    templateComponent = fragment.templateValue = null;
	                } else {
	                    if (comp && comp.component === oldComp.component) {
	                        (0, _updateComponent2.default)(templateComponent, comp.props || {});
	                    }
	                }
	                return;
	            case _fragmentValueTypes2.default.COMPONENT_CHILDREN:
	                break;
	            case _fragmentValueTypes2.default.ATTR_ID:
	                (0, _sanitizeValue2.default)(element, fragment.templateValue, 'id', 'id');
	                return;
	            default:
	                (0, _updateDOMProperties2.default)(element, type, oldFragment.templateValue, fragment.templateValue);
	        }
	    }
	}
	
	exports.default = updateFragmentValue;

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _updateFragment = __webpack_require__(4);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _updateFragmentList = __webpack_require__(24);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _isSVG = __webpack_require__(42);
	
	var _isSVG2 = _interopRequireDefault(_isSVG);
	
	var _updateDOMProperties = __webpack_require__(39);
	
	var _updateDOMProperties2 = _interopRequireDefault(_updateDOMProperties);
	
	var _updateComponent = __webpack_require__(14);
	
	var _updateComponent2 = _interopRequireDefault(_updateComponent);
	
	var _removeComponent = __webpack_require__(6);
	
	var _removeComponent2 = _interopRequireDefault(_removeComponent);
	
	var _sanitizeValue = __webpack_require__(36);
	
	var _sanitizeValue2 = _interopRequireDefault(_sanitizeValue);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
	// refactored to by more DRY. although, this causes a significant performance cost
	// on the v8 compiler. need to explore how to refactor without introducing this performance cost
	function updateFragmentValues(context, oldFragment, fragment, component) {
	    for (var i = 0, length = fragment.templateValues.length; i < length; i++) {
	        var element = oldFragment.templateElements[i];
	        var type = oldFragment.templateTypes[i];
	        var templateComponent = oldFragment.templateComponents[i];
	
	        fragment.templateElements[i] = element;
	        fragment.templateTypes[i] = type;
	        fragment.templateComponents[i] = templateComponent;
	
	        if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
	            switch (type) {
	                case _fragmentValueTypes2.default.LIST:
	                case _fragmentValueTypes2.default.LIST_REPLACE:
	                    (0, _updateFragmentList2.default)(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
	                    break;
	                case _fragmentValueTypes2.default.TEXT:
	                    element.firstChild.nodeValue = fragment.templateValues[i];
	                    break;
	                case _fragmentValueTypes2.default.TEXT_DIRECT:
	                    element.nodeValue = fragment.templateValues[i];
	                    break;
	                case _fragmentValueTypes2.default.FRAGMENT:
	                case _fragmentValueTypes2.default.FRAGMENT_REPLACE:
	                    (0, _updateFragment2.default)(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
	                    break;
	                case _fragmentValueTypes2.default.COMPONENT:
	                case _fragmentValueTypes2.default.COMPONENT_REPLACE:
	                    var comp = fragment.templateValues[i];
	                    var oldComp = oldFragment.templateValues[i];
	
	                    if (comp === null || comp.component === null) {
	                        (0, _removeComponent2.default)(templateComponent, element);
	                        templateComponent = fragment.templateValues[i] = null;
	                    } else {
	                        if (comp && comp.component === oldComp.component) {
	                            (0, _updateComponent2.default)(templateComponent, comp.props || {});
	                        }
	                    }
	                    break;
	                case _fragmentValueTypes2.default.COMPONENT_CHILDREN:
	                    break;
	                case _fragmentValueTypes2.default.ATTR_CLASS:
	                    if (_isSVG2.default) {
	                        (0, _sanitizeValue2.default)(element, fragment.templateValues[i], null, 'class');
	                    } else {
	                        (0, _sanitizeValue2.default)(element, fragment.templateValues[i], 'className', 'class');
	                    }
	                    break;
	                case _fragmentValueTypes2.default.ATTR_ID:
	                    (0, _sanitizeValue2.default)(element, fragment.templateValues[i], 'id', 'id');
	                    break;
	                default:
	                    (0, _updateDOMProperties2.default)(element, type, oldFragment.templateValues[i], fragment.templateValues[i]);
	            }
	        }
	    }
	}
	
	exports.default = updateFragmentValues;

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = createEventListener;
	
	var _listenersStorage = __webpack_require__(11);
	
	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);
	
	var _createListenerArguments = __webpack_require__(27);
	
	var _createListenerArguments2 = _interopRequireDefault(_createListenerArguments);
	
	var _InfernoNodeID = __webpack_require__(10);
	
	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createEventListener(type) {
	    return function (e) {
	        var target = e.target;
	        var listener = _listenersStorage2.default[(0, _InfernoNodeID2.default)(target)][type];
	        var args = listener.originalHandler.length < 1 ? [e] : (0, _createListenerArguments2.default)(target, e);
	
	        listener.handler.apply(target, args);
	    };
	}

/***/ },
/* 61 */
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
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _requestAnimationFrame = __webpack_require__(80);
	
	var _registerEventHooks = __webpack_require__(16);
	
	var _registerEventHooks2 = _interopRequireDefault(_registerEventHooks);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var frameEvents = ['scroll', 'mousemove', 'drag', 'dragover', 'touchmove'];
	
	(0, _registerEventHooks2.default)(frameEvents, function (listener) {
	    var rafId = 0;
	    var handler = function handler() {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }
	
	        if (!rafId) {
	            rafId = (0, _requestAnimationFrame.requestAnimationFrame)(function () {
	                listener.apply(args[0].currentTarget, args);
	                rafId = 0;
	            });
	        }
	    };
	
	    var destroy = function destroy() {
	        cancelAnimationFrame(rafId);
	    };
	
	    return {
	        destroy: destroy,
	        handler: handler
	    };
	});

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(62);

	__webpack_require__(64);

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _registerEventHooks = __webpack_require__(16);
	
	var _registerEventHooks2 = _interopRequireDefault(_registerEventHooks);
	
	var _ExecutionEnvironment = __webpack_require__(3);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var wheel = 'wheel'; // default: 'wheel'
	
	if (_ExecutionEnvironment2.default.canUseDOM) {
		// 'wheel' is a special case
		wheel = 'onwheel' in document || document.documentMode >= 9 ? 'wheel' : 'mousewheel';
	}
	
	(0, _registerEventHooks2.default)(wheel, function (handler) {
		return { handler: handler };
	});

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _registerEventHooks = __webpack_require__(16);
	
	var _registerEventHooks2 = _interopRequireDefault(_registerEventHooks);
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _ExecutionEnvironment = __webpack_require__(3);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	var _setupHooks = __webpack_require__(33);
	
	var _setupHooks2 = _interopRequireDefault(_setupHooks);
	
	var _EventRegistry = __webpack_require__(9);
	
	var _EventRegistry2 = _interopRequireDefault(_EventRegistry);
	
	__webpack_require__(63);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	var Events = {};
	
	// Don't expose Events interface for server side
	
	// TODO! Is there a better way of doing this?
	
	if (_ExecutionEnvironment2.default.canUseDOM) {
	
	    Events = {
	
	        /**
	         * @param {string} type is a type of event
	         * @return {boolean} True if event are registered.
	         */
	
	        isRegistered: function isRegistered(type) {
	            return !!(_EventRegistry2.default[type] && _EventRegistry2.default[type]._enabled);
	        },
	
	        /**
	         * @param {string} type is a type of event
	         * @param {string} nodeName is a DOM node type
	         * @param {function} hook is a function(element, event) -> [args...]
	         */
	        registerSetupHooksForType: function registerSetupHooksForType(type, nodeName, hook) {
	
	            if (!type) {
	                return;
	            }
	
	            var nodeHooks = _setupHooks2.default[type] || (_setupHooks2.default[type] = {});
	
	            if ((typeof nodeName === 'undefined' ? 'undefined' : _typeof(nodeName)) === 'object') {
	                if ((0, _isArray2.default)(nodeName)) {
	                    for (var i = 0; i < nodeName.length; i++) {
	                        nodeHooks[nodeName[i]] = hook;
	                    }
	                }
	            } else {
	                // TODO! What if this is not a string?
	                nodeHooks[nodeName] = hook;
	            }
	        },
	
	        /**
	         * @param {string} type is a type of event
	         * @param {string} nodeName is a DOM node type
	         * @param {function} hook is a function(element, event) -> [args...]
	         */
	        registerSetupHooks: function registerSetupHooks(type, nodeName, hook) {
	            if (!type) {
	                return;
	            }
	            if ((typeof nodeName === 'undefined' ? 'undefined' : _typeof(nodeName)) === 'object') {
	                if ((0, _isArray2.default)(type)) {
	                    for (var i = 0; i < type.length; i++) {
	                        Events.registerSetupHooksForType(type[i], nodeName, hook);
	                    }
	                }
	            } else {
	                // TODO! What if this is not a string?
	                Events.registerSetupHooksForType(type, nodeName, hook);
	            }
	        },
	
	        registerEventHooks: _registerEventHooks2.default
	    };
	}
	
	/**** HOOKS ******/
	exports.default = Events;

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = removeListener;
	
	var _InfernoNodeID = __webpack_require__(10);
	
	var _InfernoNodeID2 = _interopRequireDefault(_InfernoNodeID);
	
	var _EventRegistry = __webpack_require__(9);
	
	var _EventRegistry2 = _interopRequireDefault(_EventRegistry);
	
	var _listenersStorage = __webpack_require__(11);
	
	var _listenersStorage2 = _interopRequireDefault(_listenersStorage);
	
	var _eventListener = __webpack_require__(30);
	
	var _eventListener2 = _interopRequireDefault(_eventListener);
	
	var _focusEvents = __webpack_require__(32);
	
	var _focusEvents2 = _interopRequireDefault(_focusEvents);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Remove event listeners from a node
	 */
	function removeListener(node, type) {
	
	    if (!node) {
	        return null; // TODO! Should we throw?
	    }
	
	    var nodeID = (0, _InfernoNodeID2.default)(node, true);
	
	    if (nodeID) {
	        var listeners = _listenersStorage2.default[nodeID];
	
	        if (listeners && listeners[type]) {
	            if (listeners[type] && listeners[type].destroy) {
	                listeners[type].destroy();
	            }
	            listeners[type] = null;
	
	            var registry = _EventRegistry2.default[type];
	
	            if (registry) {
	                if (registry._bubbles) {
	                    --registry._counter;
	                    // TODO Run tests and check if this works, or code should be removed
	                    //				} else if (registry._focusBlur) {
	                    //					node.removeEventListener(type, eventListener[focusEvents[type]]);					
	                } else {
	                        node.removeEventListener(type, _eventListener2.default[type]);
	                    }
	            }
	        }
	    }
	}

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createComponentFactory;
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createComponentFactory(fragment, template) {
		return function createComponent(component) {
			var element = template.createEmptyDiv();
	
			if (fragment.templateValue) {
				fragment.templateElement = element;
				fragment.templateType = _fragmentValueTypes2.default.COMPONENT_REPLACE;
			} else {
				fragment.templateElements[component.pointer] = element;
				fragment.templateTypes[component.pointer] = _fragmentValueTypes2.default.COMPONENT_REPLACE;
			}
	
			for (var _len = arguments.length, children = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				children[_key - 1] = arguments[_key];
			}
	
			for (var i = 0; i < children.length; i++) {
				element.appendChild(children[i]);
			}
			return element;
		};
	}

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createElementFactory;
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _render = __webpack_require__(8);
	
	var _render2 = _interopRequireDefault(_render);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }
	
	function createElementFactory(fragment, template) {
		return function createElement(tag, props) {
			for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
				children[_key - 2] = arguments[_key];
			}
	
			var element = undefined;
			var is = props && (props.is || null); // type extension
			var len = children.length;
	
			if (typeof tag === 'string') {
				element = template.createElement(tag, is);
			} else {
				throw Error("Inferno Error: Invalid tag passed to createElement(). Components cannot be passed to createElement().");
			}
	
			if (len > 0) {
				if (len > 1) {
					for (var i = 0; i < len; i++) {
						var child = children[i];
	
						if (child.pointer !== undefined) {
							var value = fragment.templateValue != null ? fragment.templateValue : fragment.templateValues[child.pointer];
	
							if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
								var node = template.createTextNode(value);
	
								if (fragment.templateValue != null) {
									fragment.templateElement = node;
									fragment.templateType = _fragmentValueTypes2.default.TEXT_DIRECT;
								} else {
									fragment.templateElements[child.pointer] = node;
									fragment.templateTypes[child.pointer] = _fragmentValueTypes2.default.TEXT_DIRECT;
								}
								element.appendChild(node);
							} else if ((0, _isArray2.default)(value)) {
								for (var s = 0; s < value.length; s++) {
									element.appendChild(value[s]);
								}
							}
						} else if ((typeof child === 'undefined' ? 'undefined' : _typeof(child)) !== 'object') {
							var node = template.createTextNode(child);
	
							element.appendChild(node);
						} else if (child.component) {
							if (fragment.templateValue != null) {
								fragment.templateElement = element;
								fragment.templateType = _fragmentValueTypes2.default.FRAGMENT;
								fragment.templateValue = child;
							} else {
								var templateIndex = child.templateIndex;
	
								fragment.templateElements[templateIndex] = element;
								fragment.templateTypes[templateIndex] = _fragmentValueTypes2.default.FRAGMENT;
								fragment.templateValues[templateIndex] = child;
							}
						} else {
							element.appendChild(child);
						}
					}
				} else if ((children = children[0]) && children.pointer !== undefined) {
					var value = fragment.templateValue != null ? fragment.templateValue : fragment.templateValues[children.pointer];
	
					if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
						element.textContent = value;
						if (fragment.templateValue != null) {
							fragment.templateElement = element;
							fragment.templateType = _fragmentValueTypes2.default.TEXT;
						} else {
							fragment.templateElements[children.pointer] = element;
							fragment.templateTypes[children.pointer] = _fragmentValueTypes2.default.TEXT;
						}
					} else if ((0, _isArray2.default)(value)) {
						if (fragment.templateValue != null) {
							fragment.templateElement = element;
							fragment.templateType = _fragmentValueTypes2.default.LIST;
						} else {
							fragment.templateElements[children.pointer] = element;
							fragment.templateTypes[children.pointer] = _fragmentValueTypes2.default.LIST;
						}
					} else {
						if (fragment.templateValue != null) {
							fragment.templateElement = element;
							fragment.templateType = _fragmentValueTypes2.default.COMPONENT_CHILDREN;
						} else {
							fragment.templateElements[children.pointer] = element;
							fragment.templateTypes[children.pointer] = _fragmentValueTypes2.default.COMPONENT_CHILDREN;
						}
					}
				} else if ((typeof children === 'undefined' ? 'undefined' : _typeof(children)) !== 'object') {
					element.textContent = children;
				} else if (children) {
					element.appendChild(children);
				}
			}
	
			if (props) {
				template.addAttributes(element, props, fragment);
			}
			return element;
		};
	}

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _setValueForProperty = __webpack_require__(74);
	
	var _setValueForProperty2 = _interopRequireDefault(_setValueForProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//OPTIMIZATION: This functions should not be moved out of this module. V8 will not inline
	//this function if it's situated in another module due to context switch.
	
	function fastTag(tag) {
	    return tag === 'a' || tag === 'p' || tag === 'em' || tag === 'ol' || tag === 'ul' || tag === 'div' || tag === 'img' || tag === 'span' || tag === 'form' || tag === 'table' || tag === 'button';
	}
	
	exports.default = {
	    addAttributes: _setValueForProperty2.default,
	    createElement: function createElement(tag) {
	
	        if (fastTag(tag)) {
	
	            tag = document.createElement(tag);
	        } else if (tag === 'svg') {
	
	            tag = document.createElementNS('svg', 'http://www.w3.org/2000/svg');
	        } else {
	            tag = document.createElement(tag);
	        }
	
	        return tag;
	    },
	
	    createTextNode: function createTextNode(text) {
	        return document.createTextNode(text);
	    },
	    createEmptyText: function createEmptyText() {
	        return document.createTextNode('');
	    },
	    createEmptyDiv: function createEmptyDiv() {
	        return document.createElement('div');
	    }
	};

/***/ },
/* 70 */
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
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = getFormElementValues;
	
	var _getFormElementType = __webpack_require__(70);
	
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
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _fragmentValueTypes = __webpack_require__(2);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function processFragmentAttrs(node, attrName, attrVal, fragment) {
		var fragmentType = undefined;
		var skip = false;
	
		switch (attrName) {
			case 'className':
				fragmentType = _fragmentValueTypes2.default.ATTR_CLASS;
				break;
			case 'id':
				fragmentType = _fragmentValueTypes2.default.ATTR_ID;
				break;
			case 'ref':
				fragmentType = _fragmentValueTypes2.default.ATTR_REF;
				skip = true;
				break;
			default:
				fragmentType = _fragmentValueTypes2.default.ATTR_OTHER;
		}
	
		if (fragment.templateValue !== undefined) {
			fragment.templateElement = node;
			if (fragmentType === _fragmentValueTypes2.default.ATTR_OTHER) {
				fragment.templateType = _fragmentValueTypes2.default.ATTR_OTHER[attrName] = attrName;
			} else {
				fragment.templateType = fragmentType;
			}
			return { attrVal: fragment.templateValue, skip: skip };
		} else {
			fragment.templateElements[attrVal.pointer] = node;
			if (fragmentType === _fragmentValueTypes2.default.ATTR_OTHER) {
				fragment.templateTypes[attrVal.pointer] = _fragmentValueTypes2.default.ATTR_OTHER[attrName] = attrName;
			} else {
				fragment.templateTypes[attrVal.pointer] = fragmentType;
			}
			return { attrVal: fragment.templateValues[attrVal.pointer], skip: skip };
		}
	
		return { attrVal: null, skip: skip };
	}
	
	exports.default = processFragmentAttrs;

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = setSelectValueForProperty;
	
	var _isArray = __webpack_require__(1);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// TODO!! Optimize!!
	function setSelectValueForProperty(node, value) {
	
	    var multiple = (0, _isArray2.default)(value);
	    var options = node.options;
	
	    var selectedValue = undefined;
	    var idx = undefined;
	    var l = undefined;
	
	    if (multiple) {
	        selectedValue = {};
	        for (idx = 0, l = value.length; idx < l; ++idx) {
	            selectedValue['' + value[idx]] = true;
	        }
	        for (idx = 0, l = options.length; idx < l; idx++) {
	            var selected = selectedValue[options[idx].value];
	
	            if (options[idx].selected !== selected) {
	                options[idx].selected = selected;
	            }
	        }
	    } else {
	        // Do not set `select.value` as exact behavior isn't consistent across all
	        // browsers for all cases.
	        selectedValue = '' + value;
	        for (idx = 0, l = options.length; idx < l; idx++) {
	
	            if (options[idx].value === selectedValue) {
	                options[idx].selected = true;
	            }
	        }
	    }
	}

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = addAttributes;
	
	var _eventMapping = __webpack_require__(31);
	
	var _eventMapping2 = _interopRequireDefault(_eventMapping);
	
	var _addListener = __webpack_require__(25);
	
	var _addListener2 = _interopRequireDefault(_addListener);
	
	var _ = __webpack_require__(35);
	
	var _2 = _interopRequireDefault(_);
	
	var _processFragmentAttrs = __webpack_require__(72);
	
	var _processFragmentAttrs2 = _interopRequireDefault(_processFragmentAttrs);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Set HTML attributes on the template
	 * @param{ HTMLElement } node
	 * @param{ Object } attrs
	 */
	function addAttributes(node, attrs, fragment) {
	
	    for (var attrName in attrs) {
	
	        var attrVal = attrs[attrName];
	        var skip = false;
	
	        if (attrVal) {
	
	            if (attrVal.pointer != null) {
	                var proccessedAttrs = (0, _processFragmentAttrs2.default)(node, attrName, attrVal, fragment);
	                attrVal = proccessedAttrs.attrVal;
	                skip = proccessedAttrs.skip;
	            }
	
	            if (_eventMapping2.default[attrName]) {
	                (0, _addListener2.default)(node, _eventMapping2.default[attrName], attrVal);
	            } else {
	                _2.default.setProperty(node, attrName, attrVal);
	            }
	        }
	    }
	}

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _addPixelSuffixToValueIfNeeded = __webpack_require__(37);
	
	var _addPixelSuffixToValueIfNeeded2 = _interopRequireDefault(_addPixelSuffixToValueIfNeeded);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Sets the value for multiple styles on a node. If a value is specified as
	 * '' (empty string), the corresponding style property will be unset.
	 *
	 * @param {DOMElement} node
	 * @param {object} styles
	 */
	
	exports.default = function (node, styles) {
	    for (var styleName in styles) {
	        var styleValue = styles[styleName];
	
	        node.style[styleName] = styleValue == null ? '' : (0, _addPixelSuffixToValueIfNeeded2.default)(styleName, styleValue);
	    }
	};

/***/ },
/* 76 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ESCAPE_LOOKUP = {
	  '&': '&amp;',
	  '>': '&gt;',
	  '<': '&lt;',
	  '"': '&quot;',
	  '`': '&#x60;',
	  "'": '&#x27;'
	};
	
	var ESCAPE_REGEX = /[&><"'`]/g;
	/**
	 * Escapes attribute value to prevent scripting attacks.
	 *
	 * @param {*} value Attribute value to escape.
	 * @return {string} An escaped string.
	 */
	
	exports.default = function (value) {
	  return '"' + ('' + value).replace(ESCAPE_REGEX, function (match) {
	    return ESCAPE_LOOKUP[match];
	  }) + '"';
	};
	
	var endOfText = '\u0003';

/***/ },
/* 77 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (str) {
	    switch (str.length) {
	        case 4:
	            return str === 'flex' || str === 'base' || str === 'zoom';
	        case 5:
	            return str === 'order';
	        case 6:
	            return str === 'marker' || str === 'stress' || str === 'volume' || str === 'widows' || str === 'zIndex';
	        case 7:
	            return str === 'boxFlex' || str === 'gridRow' || str === 'opacity' || str === 'orphans' || str === 'tabSize';
	        case 8:
	            return str === 'flexGrow' || str === 'richness';
	        case 9:
	            return str === 'flexOrder' || str === 'lineClamp' || 'msBoxFlex';
	        case 10:
	            return str === 'flexShrink' || str === 'counterReset' || str === 'fontWeight' || str === 'gridColumn' || str === 'lineHeight' || str === 'pitchRange' || str === 'MozBoxFlex';
	        case 11:
	            return str === 'columnCount' || str === 'counterReset' || str === 'stopOpacity' || str === 'fillOpacity' || str === 'strokeWidth';
	        case 12:
	            return str === 'boxFlexGroup' || str === 'counterReset' || str === 'flexPositive' || str === 'flexNegative';
	        case 13:
	            return str === 'strokeOpacity' || str === 'WebkitBoxFlex' || str === 'WebkitGridRow';
	        case 14:
	            return str === 'WebkitFlexGrow';
	        case 15:
	            return str === 'boxOrdinalGroup' || str === 'WebkitFlexShrink';
	        case 16:
	            return str === 'counterIncrement' || str === 'strokeDashoffset';
	        case 17:
	            return str === 'MozBoxOrdinalGroup' || str === 'WebkitStrokeWidth';
	        case 20:
	            return str === 'WebkitBoxOrdinalGroup';
	        case 23:
	            return str === 'animationIterationCount';
	        case 29:
	            return str === 'WebkitAnimationIterationCount';
	    }
	
	    return false;
	};

/***/ },
/* 78 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function isFormElement(nodeName) {
		return nodeName === 'form' || nodeName === 'input' || nodeName === 'textarea' || nodeName === 'label' || nodeName === 'fieldset' || nodeName === 'legend' || nodeName === 'select' || nodeName === 'optgroup' || nodeName === 'option' || nodeName === 'button' || nodeName === 'datalist' || nodeName === 'keygen' || nodeName === 'output';
	}
	
	exports.default = isFormElement;

/***/ },
/* 79 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function () {};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.cancelAnimationFrame = exports.requestAnimationFrame = undefined;
	
	var _ExecutionEnvironment = __webpack_require__(3);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	var _noop = __webpack_require__(79);
	
	var _noop2 = _interopRequireDefault(_noop);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// Server side workaround
	var requestAnimationFrame = _noop2.default;
	var cancelAnimationFrame = _noop2.default;
	
	if (_ExecutionEnvironment2.default.canUseDOM) {
	    (function () {
	
	        var lastTime = 0;
	
	        var nativeRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
	
	        var nativecancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame;
	
	        exports.requestAnimationFrame = requestAnimationFrame = nativeRequestAnimationFrame || function (callback) {
	            var currTime = Date.now();
	            var timeDelay = Math.max(0, 16 - (currTime - lastTime)); // 1000 / 60 = 16.666
	            lastTime = currTime + timeDelay;
	            return window.setTimeout(function () {
	                callback(Date.now());
	            }, timeDelay);
	        };
	
	        exports.cancelAnimationFrame = cancelAnimationFrame = cancelAnimationFrame || function (frameId) {
	            window.clearTimeout(frameId);
	        };
	    })();
	}
	
	exports.requestAnimationFrame = requestAnimationFrame;
	exports.cancelAnimationFrame = cancelAnimationFrame;

/***/ },
/* 81 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = uuid;
	// rfc4122 compliant
	var t = [];
	
	for (var n = 0; n < 256; n++) {
	    t[n] = (n < 16 ? "0" : "") + n.toString(16);
	}
	
	function uuid() {
	    var e = Math.random() * 4294967295 | 0;
	    var n = Math.random() * 4294967295 | 0;
	    var r = Math.random() * 4294967295 | 0;
	    var i = Math.random() * 4294967295 | 0;
	    return t[e & 255] + t[e >> 8 & 255] + t[e >> 16 & 255] + t[e >> 24 & 255] + "-" + t[n & 255] + t[n >> 8 & 255] + "-" + t[n >> 16 & 15 | 64] + t[n >> 24 & 255] + "-" + t[r & 63 | 128] + t[r >> 8 & 255] + "-" + t[r >> 16 & 255] + t[r >> 24 & 255] + t[i & 255] + t[i >> 8 & 255] + t[i >> 16 & 255] + t[i >> 24 & 255];
	};

/***/ }
/******/ ])))
});
;
//# sourceMappingURL=inferno.js.map