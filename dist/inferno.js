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
	
	var _Component = __webpack_require__(39);
	
	var _Component2 = _interopRequireDefault(_Component);
	
	var _render = __webpack_require__(6);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _renderToString = __webpack_require__(52);
	
	var _renderToString2 = _interopRequireDefault(_renderToString);
	
	var _unmountComponentAtNode = __webpack_require__(53);
	
	var _unmountComponentAtNode2 = _interopRequireDefault(_unmountComponentAtNode);
	
	var _fragmentValueTypes = __webpack_require__(1);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _templateTypes = __webpack_require__(10);
	
	var _templateTypes2 = _interopRequireDefault(_templateTypes);
	
	var _createFragment = __webpack_require__(46);
	
	var _createFragment2 = _interopRequireDefault(_createFragment);
	
	var _createTemplate = __webpack_require__(16);
	
	var _createTemplate2 = _interopRequireDefault(_createTemplate);
	
	var _clearDomElement = __webpack_require__(45);
	
	var _clearDomElement2 = _interopRequireDefault(_clearDomElement);
	
	var _createRef = __webpack_require__(47);
	
	var _createRef2 = _interopRequireDefault(_createRef);
	
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
		createRef: _createRef2.default
	};

/***/ },
/* 1 */
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
		//will contain other "custom" types, like rowspan etc or custom data-attributes
		ATTR_OTHER: {},
		COMPONENT_PROPS: {}
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _removeFragment = __webpack_require__(5);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragment = __webpack_require__(4);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragmentValue = __webpack_require__(54);
	
	var _updateFragmentValue2 = _interopRequireDefault(_updateFragmentValue);
	
	var _updateFragmentValues = __webpack_require__(55);
	
	var _updateFragmentValues2 = _interopRequireDefault(_updateFragmentValues);
	
	var _unmountComponentAtFragment = __webpack_require__(19);
	
	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function updateFragment(context, oldFragment, fragment, parent, component) {
		if (fragment == null) {
			(0, _removeFragment2.default)(context, parent, oldFragment);
			return;
		}
		if (oldFragment == null) {
			(0, _attachFragment2.default)(context, fragment, parent, component);
			return;
		}
		if (oldFragment.template !== fragment.template) {
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
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  onAbort: 'abort',
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
	  onEncrypted: 'encrypted',
	  onEnded: 'ended',
	  onError: 'error',
	  onFocus: 'focus',
	  onInput: 'input',
	  onKeyDown: 'keydown',
	  onKeyPress: 'keypress',
	  onKeyUp: 'keyup',
	  onLoadedData: 'loadeddata',
	  onLoadedMetadata: 'loadedmetadata',
	  onLoadStart: 'loadstart',
	  onMouseDown: 'mousedown',
	  onMouseMove: 'mousemove',
	  onMouseOut: 'mouseout',
	  onMouseOver: 'mouseover',
	  onMouseUp: 'mouseup',
	  onPaste: 'paste',
	  onPause: 'pause',
	  onPlay: 'play',
	  onPlaying: 'playing',
	  onProgress: 'progress',
	  onRateChange: 'ratechange',
	  onScroll: 'scroll',
	  onSeeked: 'seeked',
	  onSeeking: 'seeking',
	  onSelectionChange: 'selectionchange',
	  onStalled: 'stalled',
	  onSuspend: 'suspend',
	  onTextInput: 'textInput',
	  onTimeUpdate: 'timeupdate',
	  onTouchCancel: 'touchcancel',
	  onTouchEnd: 'touchend',
	  onTouchMove: 'touchmove',
	  onTouchStart: 'touchstart',
	  onVolumeChange: 'volumechange',
	  onWaiting: 'waiting',
	  onWheel: 'wheel'
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _getRecycledFragment = __webpack_require__(48);
	
	var _getRecycledFragment2 = _interopRequireDefault(_getRecycledFragment);
	
	var _updateFragment = __webpack_require__(2);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _attachFragmentList = __webpack_require__(15);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _fragmentValueTypes = __webpack_require__(1);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _insertFragment = __webpack_require__(49);
	
	var _insertFragment2 = _interopRequireDefault(_insertFragment);
	
	var _bind = __webpack_require__(36);
	
	var _bind2 = _interopRequireDefault(_bind);
	
	var _templateTypes = __webpack_require__(10);
	
	var _templateTypes2 = _interopRequireDefault(_templateTypes);
	
	var _createElement = __webpack_require__(68);
	
	var _createElement2 = _interopRequireDefault(_createElement);
	
	var _createComponent = __webpack_require__(66);
	
	var _createComponent2 = _interopRequireDefault(_createComponent);
	
	var _dom = __webpack_require__(69);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _virtual = __webpack_require__(34);
	
	var _virtual2 = _interopRequireDefault(_virtual);
	
	var _attachComponent5 = __webpack_require__(43);
	
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
	
		//now fire all the component mountCallback functions so they know this fragment has been added
		for (var i = 0; i < mountCallbacks.length; i++) {
			mountCallbacks[i]();
		}
	}
	
	exports.default = attachFragment;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _destroyFragment = __webpack_require__(17);
	
	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (context, parentDom, item) {
		var domItem = item.dom;
	
		(0, _destroyFragment2.default)(context, item);
		parentDom.removeChild(domItem);
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = renderFactory;
	
	var _contexts = __webpack_require__(13);
	
	var _contexts2 = _interopRequireDefault(_contexts);
	
	var _getContext = __webpack_require__(8);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _attachFragment = __webpack_require__(4);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(2);
	
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
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _events = __webpack_require__(3);
	
	var _events2 = _interopRequireDefault(_events);
	
	var _getUniqueId = __webpack_require__(22);
	
	var _getUniqueId2 = _interopRequireDefault(_getUniqueId);
	
	var _root = __webpack_require__(23);
	
	var _root2 = _interopRequireDefault(_root);
	
	var _rootListeners = __webpack_require__(25);
	
	var _rootListeners2 = _interopRequireDefault(_rootListeners);
	
	var _eventsCfg = __webpack_require__(24);
	
	var _eventsCfg2 = _interopRequireDefault(_eventsCfg);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Add event listeners
	 * @param {Object} element
	 * @param {String} type
	 * @param {String} listener
	 */
	function addListener(element, type, listener) {
	
	    type = _events2.default[type];
	
	    var config = _eventsCfg2.default[type];
	
	    if (config) {
	        if (!config.set) {
	            if (config.setup) {
	                config.setup();
	            } else if (config.bubbles) {
	                document.addEventListener(type, _root2.default.addRootListener, false);
	            }
	            config.set = true;
	        }
	
	        var uniqueId = (0, _getUniqueId2.default)(element);
	        var listeners = _rootListeners2.default[uniqueId] || (_rootListeners2.default[uniqueId] = {});
	
	        if (!listeners[type]) {
	
	            if (config.bubbles) {
	                ++config.countListeners;
	            } else {
	                element.addEventListener(type, _root2.default.eventHandler, false);
	            }
	        }
	
	        listeners[type] = listener;
	    }
	}
	
	/**
	 * Remove single listener
	 * @param {Object} element
	 * @param {String} type
	 */
	function removeListener(element, type) {
	    var uniqueID = (0, _getUniqueId2.default)(element, true);
	
	    if (uniqueID) {
	        var listeners = _rootListeners2.default[uniqueID];
	
	        type = _events2.default[type];
	
	        if (listeners && listeners[type]) {
	            listeners[type] = null;
	
	            var cfg = _eventsCfg2.default[type];
	
	            if (cfg) {
	                if (cfg.bubbles) {
	                    --cfg.countListeners;
	                } else {
	                    element.removeEventListener(type, _root2.default.eventHandler);
	                }
	            }
	        }
	    }
	}
	
	exports.default = {
	    addListener: addListener,
	    removeListener: removeListener
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _contexts = __webpack_require__(13);
	
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _contexts = __webpack_require__(13);
	
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
/* 10 */
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
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _DOMAttributeNamespaces = __webpack_require__(63);
	
	var _DOMAttributeNamespaces2 = _interopRequireDefault(_DOMAttributeNamespaces);
	
	var _DOMAttributeNames = __webpack_require__(62);
	
	var _DOMAttributeNames2 = _interopRequireDefault(_DOMAttributeNames);
	
	var _DOMasks = __webpack_require__(64);
	
	var _DOMasks2 = _interopRequireDefault(_DOMasks);
	
	var _checkMask = __webpack_require__(27);
	
	var _checkMask2 = _interopRequireDefault(_checkMask);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var DOMPropertyNames = {};
	
	var MUST_USE_PROPERTY = _DOMasks2.default.MUST_USE_PROPERTY;
	var IS_EDGE_CASE = _DOMasks2.default.IS_EDGE_CASE;
	var HAS_BOOLEAN_VALUE = _DOMasks2.default.HAS_BOOLEAN_VALUE;
	var HAS_NUMERIC_VALUE = _DOMasks2.default.HAS_NUMERIC_VALUE;
	var HAS_POSITIVE_NUMERIC_VALUE = _DOMasks2.default.HAS_POSITIVE_NUMERIC_VALUE;
	
	var DOMPropertyContainer = {};
	
	var DOMProperties = {
	    /**
	     * Standard Properties
	     */
	    accept: null,
	    acceptCharset: null,
	    accessKey: null,
	    action: null,
	    allowFullScreen: HAS_BOOLEAN_VALUE,
	    allowTransparency: null,
	    alt: null,
	    async: HAS_BOOLEAN_VALUE,
	    autoComplete: null,
	    autoFocus: HAS_BOOLEAN_VALUE,
	    autoPlay: HAS_BOOLEAN_VALUE,
	    capture: HAS_BOOLEAN_VALUE,
	    cellPadding: null,
	    cellSpacing: null,
	    charSet: null,
	    challenge: null,
	    checked: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	    classID: null,
	    className: null,
	    cols: HAS_POSITIVE_NUMERIC_VALUE,
	    colSpan: null,
	    content: null,
	    contentEditable: null,
	    contextMenu: null,
	    controls: HAS_BOOLEAN_VALUE,
	    coords: null,
	    crossOrigin: null,
	    currentTime: MUST_USE_PROPERTY | HAS_POSITIVE_NUMERIC_VALUE,
	    data: null, // For `<object />` acts as `src`.
	    dateTime: null,
	    default: HAS_BOOLEAN_VALUE,
	    defer: HAS_BOOLEAN_VALUE,
	    dir: null,
	    disabled: HAS_BOOLEAN_VALUE,
	    download: HAS_BOOLEAN_VALUE,
	    draggable: null,
	    enabled: HAS_BOOLEAN_VALUE,
	    encType: null,
	    form: null,
	    formAction: null,
	    formEncType: null,
	    formMethod: null,
	    formNoValidate: HAS_BOOLEAN_VALUE,
	    formTarget: null,
	    frameBorder: null,
	    headers: null,
	    height: null,
	    hidden: HAS_BOOLEAN_VALUE,
	    high: null,
	    href: null,
	    hrefLang: null,
	    htmlFor: null,
	    httpEquiv: null,
	    icon: null,
	    id: null,
	    inputMode: null,
	    integrity: null,
	    is: null,
	    keyParams: null,
	    keyType: null,
	    kind: null,
	    label: null,
	    lang: null,
	    list: null,
	    loop: HAS_BOOLEAN_VALUE,
	    low: null,
	    manifest: null,
	    marginHeight: null,
	    marginWidth: null,
	    max: null,
	    maxLength: null,
	    media: null,
	    mediaGroup: null,
	    method: null,
	    min: null,
	    minLength: null,
	    // Caution; `option.selected` is not updated if `select.multiple` is
	    // disabled with `removeAttribute`.
	    multiple: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	    muted: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	    name: null,
	    noValidate: HAS_BOOLEAN_VALUE,
	    open: HAS_BOOLEAN_VALUE,
	    optimum: null,
	    pattern: null,
	    paused: MUST_USE_PROPERTY,
	    placeholder: null,
	    playbackRate: MUST_USE_PROPERTY | HAS_NUMERIC_VALUE,
	    poster: null,
	    preload: null,
	    radioGroup: null,
	    readOnly: HAS_BOOLEAN_VALUE,
	    rel: null,
	    required: HAS_BOOLEAN_VALUE,
	    reversed: HAS_BOOLEAN_VALUE,
	    role: null,
	    rows: null,
	    rowSpan: HAS_NUMERIC_VALUE,
	    sandbox: null,
	    scope: null,
	    scoped: HAS_BOOLEAN_VALUE,
	    scrolling: null,
	    seamless: HAS_BOOLEAN_VALUE,
	    selected: MUST_USE_PROPERTY | HAS_BOOLEAN_VALUE,
	    shape: null,
	    size: HAS_POSITIVE_NUMERIC_VALUE,
	    sizes: null,
	    span: HAS_POSITIVE_NUMERIC_VALUE,
	    spellCheck: null,
	    src: null,
	    srcDoc: null,
	    srcLang: MUST_USE_PROPERTY,
	    srcObject: MUST_USE_PROPERTY,
	    srcSet: null,
	    start: HAS_NUMERIC_VALUE,
	    step: null,
	    style: null,
	    summary: null,
	    tabIndex: null,
	    target: null,
	    title: null,
	    // Setting .type throws on non-<input> tags
	    type: null,
	    useMap: null,
	    value: MUST_USE_PROPERTY | IS_EDGE_CASE,
	    volume: MUST_USE_PROPERTY | HAS_POSITIVE_NUMERIC_VALUE,
	    width: null,
	    wmode: null,
	    wrap: null,
	
	    /**
	     * RDFa Properties
	     */
	    about: null,
	    datatype: null,
	    inlist: null,
	    prefix: null,
	    // property is also supported for OpenGraph in meta tags.
	    property: null,
	    resource: null,
	    typeof: null,
	    vocab: null,
	
	    /**
	     * Non-standard Properties
	     */
	    // autoCapitalize and autoCorrect are supported in Mobile Safari for
	    // keyboard hints.
	    autoCapitalize: null,
	    autoCorrect: null,
	    // autoSave allows WebKit/Blink to persist values of input fields on page reloads
	    autoSave: null,
	    // color is for Safari mask-icon link
	    color: null,
	    // itemProp, itemScope, itemType are for
	    // Microdata support. See http://schema.org/docs/gs.html
	    itemProp: null,
	    itemScope: HAS_BOOLEAN_VALUE,
	    itemType: null,
	    // itemID and itemRef are for Microdata support as well but
	    // only specified in the the WHATWG spec document. See
	    // https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
	    itemID: null,
	    itemRef: null,
	    // results show looking glass icon and recent searches on input
	    // search fields in WebKit/Blink
	    results: null,
	    // IE-only attribute that specifies security restrictions on an iframe
	    // as an alternative to the sandbox attribute on IE<10
	    security: null,
	    // IE-only attribute that controls focus behavior
	    unselectable: null,
	
	    /*
	     * SVG
	     */
	
	    accentHeight: null,
	    accumulate: null,
	    alignmentBaseline: null,
	    alphabetic: null,
	    amplitude: null,
	    animate: null,
	    arabicForm: null,
	    ascent: null,
	    attributeType: null,
	    azimuth: null,
	    baseFrequency: null,
	    baseProfile: null,
	    baselineShift: null,
	    bbox: null,
	    bias: null,
	    by: null,
	    calcMode: null,
	    capHeight: null,
	    'class': null,
	    clip: null,
	    clipPath: null,
	    clipPathUnits: null,
	    clipRule: null,
	    colorInterpolation: null,
	    colorInterpolationFilters: null,
	    colorProfile: null,
	    colorRendering: null,
	    contentScriptType: null,
	    contentStyleType: null,
	    cursor: null,
	    cx: null,
	    cy: null,
	    d: null,
	    descent: null,
	    diffuseConstant: null,
	    direction: null,
	    display: null,
	    divisor: null,
	    dominantBaseline: null,
	    dur: null,
	    dx: null,
	    dy: null,
	    edgeMode: null,
	    elevation: null,
	    enableBackground: null,
	    end: null,
	    exponent: null,
	    externalResourcesRequired: null,
	    feColorMatrix: null,
	    feComposite: null,
	    feGaussianBlur: null,
	    feMorphology: null,
	    feTile: null,
	    fill: null,
	    fillOpacity: null,
	    fillRule: null,
	    filter: null,
	    filterRes: null,
	    filterUnits: null,
	    floodColor: null,
	    floodOpacity: null,
	    fontFamily: null,
	    fontSize: null,
	    fontSizeAdjust: null,
	    fontStretch: null,
	    fontStyle: null,
	    fontVariant: null,
	    fontWeight: null,
	    format: null,
	    from: null,
	    fx: null,
	    fy: null,
	    g1: null,
	    g2: null,
	    glyphName: null,
	    glyphOrientationHorizontal: null,
	    glyphOrientationVertical: null,
	    glyphRef: null,
	    gradientTransform: null,
	    gradientUnits: null,
	    hanging: null,
	    horizAdvX: null,
	    horizOriginX: null,
	    horizOriginY: null,
	    ideographic: null,
	    imageRendering: null,
	    in2: null,
	    'in': null,
	    intercept: null,
	    k1: null,
	    k2: null,
	    k3: null,
	    k4: null,
	    k: null,
	    kernelMatrix: null,
	    kernelUnitLength: null,
	    kerning: null,
	    keyPoints: null,
	    keySplines: null,
	    keyTimes: null,
	    lengthAdjust: null,
	    letterSpacing: null,
	    lightingColor: null,
	    limitingConeAngle: null,
	    local: null,
	    markerEnd: null,
	    markerHeight: null,
	    markerMid: null,
	    markerStart: null,
	    markerUnits: null,
	    markerWidth: null,
	    mask: null,
	    maskContentUnits: null,
	    maskUnits: null,
	    mathematical: null,
	    mode: null,
	    numOctaves: null,
	    offset: null,
	    opacity: null,
	    operator: null,
	    order: null,
	    orient: null,
	    orientation: null,
	    origin: null,
	    overflow: null,
	    overlinePosition: null,
	    overlineThickness: null,
	    panose1: null,
	    path: null,
	    pathLength: null,
	    patternContentUnits: null,
	    patternTransform: null,
	    patternUnits: null,
	    pointerEvents: null,
	    points: null,
	    pointsAtX: null,
	    pointsAtY: null,
	    pointsAtZ: null,
	    preserveAlpha: null,
	    preserveAspectRatio: null,
	    primitiveUnits: null,
	    r: null,
	    radius: null,
	    refX: null,
	    refY: null,
	    renderingIntent: null,
	    repeatCount: null,
	    repeatDur: null,
	    requiredExtensions: null,
	    restart: null,
	    result: null,
	    resize: MUST_USE_PROPERTY,
	    rotate: null,
	    rx: null,
	    ry: null,
	    scale: null,
	    seed: null,
	    shapeRendering: null,
	    slope: null,
	    spacing: null,
	    specularConstant: null,
	    specularExponent: null,
	    spreadMethod: null,
	    startOffset: null,
	    stdDeviation: null,
	    stemh: null,
	    stemv: null,
	    stitchTiles: null,
	    stopColor: null,
	    stopOpacity: null,
	    strikethroughPosition: null,
	    strikethroughThickness: null,
	    stroke: null,
	    strokeDasharray: null,
	    strokeDashoffset: null,
	    strokeLinecap: null,
	    strokeLinejoin: null,
	    strokeMiterlimit: null,
	    strokeOpacity: null,
	    strokeWidth: null,
	    surfaceScale: null,
	    systemLanguage: null,
	    tableValues: null,
	    targetX: null,
	    targetY: null,
	    textAnchor: null,
	    textDecoration: null,
	    textLength: null,
	    textRendering: null,
	    to: null,
	    transform: null,
	    u1: null,
	    u2: null,
	    underlinePosition: null,
	    underlineThickness: null,
	    unicode: null,
	    unicodeBidi: null,
	    unicodeRange: null,
	    unitsPerEm: null,
	    use: null,
	    vAlphabetic: null,
	    vHanging: null,
	    vIdeographic: null,
	    vMathematical: null,
	    values: null,
	    version: null,
	    vertAdvY: null,
	    vertOriginX: null,
	    vertOriginY: null,
	    viewBox: null,
	    viewTarget: null,
	    visibility: null,
	    widths: null,
	    wordSpacing: null,
	    writingMode: null,
	    x1: null,
	    x2: null,
	    x: null,
	    xChannelSelector: null,
	    xHeight: null,
	    xmlns: null,
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
	    y1: null,
	    y2: null,
	    y: null,
	    yChannelSelector: null,
	    z: null,
	    zoomAndPan: null
	};
	
	for (var propName in DOMProperties) {
	
	    var propConfig = DOMProperties[propName];
	
	    var propertyInfo = {
	        attributeName: propName.toLowerCase(),
	        attributeNamespace: null,
	        propertyName: propName,
	        mutationMethod: null,
	
	        mustUseProperty: (0, _checkMask2.default)(propConfig, MUST_USE_PROPERTY),
	        hasSideEffects: (0, _checkMask2.default)(propConfig, IS_EDGE_CASE),
	        hasBooleanValue: (0, _checkMask2.default)(propConfig, HAS_BOOLEAN_VALUE),
	        hasNumericValue: (0, _checkMask2.default)(propConfig, HAS_NUMERIC_VALUE),
	        hasPositiveNumericValue: (0, _checkMask2.default)(propConfig, HAS_POSITIVE_NUMERIC_VALUE)
	    };
	
	    if (_DOMAttributeNames2.default[propName]) {
	        var attributeName = _DOMAttributeNames2.default[propName];
	        propertyInfo.attributeName = attributeName;
	    }
	
	    if (_DOMAttributeNamespaces2.default[propName]) {
	        propertyInfo.attributeNamespace = _DOMAttributeNamespaces2.default[propName];
	    }
	
	    if (DOMPropertyNames[propName]) {
	        propertyInfo.propertyName = DOMPropertyNames[propName];
	    }
	
	    DOMPropertyContainer[propName] = propertyInfo;
	}
	
	exports.default = DOMPropertyContainer;

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports.default = function (x) {
	  return x.constructor === Array;
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = [];

/***/ },
/* 14 */
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _attachFragment = __webpack_require__(4);
	
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createTemplate;
	
	var _templateTypes = __webpack_require__(10);
	
	var _templateTypes2 = _interopRequireDefault(_templateTypes);
	
	var _uuid = __webpack_require__(73);
	
	var _uuid2 = _interopRequireDefault(_uuid);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createTemplate(templateFunction) {
		//give the function a random key
		templateFunction.key = (0, _uuid2.default)();
		templateFunction.type = _templateTypes2.default.FUNCTIONAL_API;
		return templateFunction;
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _recycledFragments = __webpack_require__(38);
	
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
/* 18 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = removeComponent;
	function removeComponent(component, element) {
		// TODO
		//unmount component
		//remove component context
		//remove node from DOM
		element.parentNode.removeChild(element);
	}

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _removeContext = __webpack_require__(9);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _badUpdate = __webpack_require__(44);
	
	var _badUpdate2 = _interopRequireDefault(_badUpdate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (fragment) {
		var component = fragment.component;
	
		component.componentWillUnmount();
		(0, _removeContext2.default)(component.context.dom);
		component.forceUpdate = _badUpdate2.default;
		component.context = null;
		component = null;
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = updateComponent;
	function updateComponent(component, nextProps) {
	
		var prevProps = component.props;
	
		if (!nextProps.children) {
			nextProps.children = prevProps.children;
		}
	
		var prevState = component.state;
	
		if (prevProps !== nextProps) {
			component._blockSetState = true;
			component.componentWillReceiveProps(nextProps);
			component._blockSetState = false;
	
			var nextState = component.state;
			var shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);
	
			if (shouldUpdate) {
				component._deferSetState = true;
				component.componentWillUpdate(nextProps, nextState);
				component._deferSetState = false;
				component.props = nextProps;
				component.state = nextState;
				component.forceUpdate();
				component.componentDidUpdate(prevProps, prevState);
			}
		}
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = updateFragmentList;
	
	var _removeFragments = __webpack_require__(51);
	
	var _removeFragments2 = _interopRequireDefault(_removeFragments);
	
	var _removeFragment = __webpack_require__(5);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragmentList = __webpack_require__(15);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _attachFragment = __webpack_require__(4);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(2);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _moveFragment = __webpack_require__(50);
	
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _infernoID = __webpack_require__(61);
	
	var _infernoID2 = _interopRequireDefault(_infernoID);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var counter = 1;
	
	exports.default = function (node, onlyGet) {
	  return node[_infernoID2.default] || (onlyGet ? null : node[_infernoID2.default] = counter++);
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _eventsCfg = __webpack_require__(24);
	
	var _eventsCfg2 = _interopRequireDefault(_eventsCfg);
	
	var _checkKeyboard = __webpack_require__(58);
	
	var _checkKeyboard2 = _interopRequireDefault(_checkKeyboard);
	
	var _getUniqueId = __webpack_require__(22);
	
	var _getUniqueId2 = _interopRequireDefault(_getUniqueId);
	
	var _rootListeners = __webpack_require__(25);
	
	var _rootListeners2 = _interopRequireDefault(_rootListeners);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var stopImmediate = false;
	
	function normalizeEvents(ev, type) {
	
	    if (!ev) {
	        ev = window.event;
	        if (!ev.preventDefault) {
	            ev.preventDefault = function () {
	                this.defaultPrevented = true;
	                this.returnValue = false;
	            };
	            ev.stopPropagation = function () {
	                this.cancelBubble = true;
	            };
	            ev.defaultPrevented = ev.returnValue === false;
	        }
	    }
	
	    ev.stopImmediatePropagation = function () {
	        stopImmediate = true;
	        this.stopPropagation();
	    };
	
	    switch (type) {
	
	        case 'keydown':
	        case 'keyup':
	        case 'keypress':
	            // webkit key event issue workaround
	            ev = (0, _checkKeyboard2.default)(ev, type);
	            break;
	        case 'wheel':
	            // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
	            'deltaX' in ev ? ev.deltaX : -ev.wheelDeltaX;
	            // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
	            'deltaY' in ev ? ev.deltaY : -ev.wheelDeltaY;
	            break;
	    }
	
	    return ev;
	}
	
	function eventHandler(e) {
	    _rootListeners2.default[(0, _getUniqueId2.default)(e.target)][e.type](normalizeEvents(e, e.type));
	}
	
	function addRootListener(e, type) {
	
	    type || (type = e.type);
	
	    var config = _eventsCfg2.default[type];
	
	    var target = e.target;
	    var listenersState = config.countListeners;
	    var listeners = undefined;
	    var listener = undefined;
	    var uniqueId = undefined;
	    var ev = undefined;
	
	    while (listenersState > 0 && target !== document.body) {
	        if (uniqueId = (0, _getUniqueId2.default)(target, true)) {
	            listeners = _rootListeners2.default[uniqueId];
	            if (listeners && (listener = listeners[type])) {
	                listener(ev || (ev = normalizeEvents(e)));
	                if (stopImmediate) {
	                    stopImmediate = false;
	                    break;
	                }
	                --listenersState;
	            }
	        }
	
	        target = target.parentNode;
	    }
	}
	
	exports.default = { eventHandler: eventHandler, addRootListener: addRootListener };

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _capturedEvents = __webpack_require__(57);
	
	var _capturedEvents2 = _interopRequireDefault(_capturedEvents);
	
	var _noCaptureEvents = __webpack_require__(60);
	
	var _noCaptureEvents2 = _interopRequireDefault(_noCaptureEvents);
	
	var _focusEvents = __webpack_require__(59);
	
	var _focusEvents2 = _interopRequireDefault(_focusEvents);
	
	var _root = __webpack_require__(23);
	
	var _root2 = _interopRequireDefault(_root);
	
	var _isEventSupported = __webpack_require__(56);
	
	var _isEventSupported2 = _interopRequireDefault(_isEventSupported);
	
	var _ExecutionEnvironment = __webpack_require__(35);
	
	var _ExecutionEnvironment2 = _interopRequireDefault(_ExecutionEnvironment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var eventsCfg = {};
	
	// This will not work on server side
	if (_ExecutionEnvironment2.default.canUseDOM) {
	
	    var i = 0;
	    var type = undefined;
	
	    while (i < _capturedEvents2.default.length) {
	        type = _capturedEvents2.default[i++];
	        eventsCfg[type] = {
	            type: type,
	            bubbles: true,
	            countListeners: 0,
	            set: false,
	            // firefox doesn't support focusin/focusout events
	            setup: _focusEvents2.default && _focusEvents2.default[type] && (0, _isEventSupported2.default)(_focusEvents2.default[type]) ? function () {
	                var type = this.type;
	                document.addEventListener(_focusEvents2.default[type], function (e) {
	                    addEventListener(e, type);
	                });
	            } : function () {
	                document.addEventListener(this.type, _root2.default.addRootListener, true);
	            }
	        };
	    }
	    i = 0;
	    while (i < _noCaptureEvents2.default.length) {
	        eventsCfg[_noCaptureEvents2.default[i++]] = {
	            type: type,
	            bubbles: false,
	            set: false
	        };
	    }
	}
	
	exports.default = eventsCfg;

/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = addAttributes;
	
	var _events = __webpack_require__(3);
	
	var _events2 = _interopRequireDefault(_events);
	
	var _eventManager = __webpack_require__(7);
	
	var _eventManager2 = _interopRequireDefault(_eventManager);
	
	var _setValueForProperty = __webpack_require__(30);
	
	var _setValueForProperty2 = _interopRequireDefault(_setValueForProperty);
	
	var _setValueForStyles = __webpack_require__(31);
	
	var _setValueForStyles2 = _interopRequireDefault(_setValueForStyles);
	
	var _processFragmentAttrs = __webpack_require__(70);
	
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
	
	        if (attrVal && attrVal.pointer != null) {
	            var proccessedAttrs = (0, _processFragmentAttrs2.default)(node, attrName, attrVal, fragment);
	            attrVal = proccessedAttrs.attrVal;
	            skip = proccessedAttrs.skip;
	        }
	
	        if (attrName === 'style') {
	
	            (0, _setValueForStyles2.default)(node, attrVal);
	        } else {
	
	            // avoid 'null' values
	            if (attrVal !== undefined) {
	                // events
	                if (_events2.default[attrName] !== undefined) {
	                    _eventManager2.default.addListener(node, attrName, attrVal);
	                    // attributes / properties
	                } else {
	                        (0, _setValueForProperty2.default)(node, attrName, attrVal);
	                    }
	            }
	        }
	    }
	}

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function checkMask(value, bitmask) {
	
	  return bitmask != null && (value & bitmask) === bitmask;
	}
	
	exports.default = checkMask;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _DOMProperties = __webpack_require__(11);
	
	var _DOMProperties2 = _interopRequireDefault(_DOMProperties);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Deletes the value for a property on a node.
	 *
	 * @param {DOMElement} node
	 * @param {string} name
	 */
	function deleteValueForProperty(node, name) {
	
	    var propertyInfo = _DOMProperties2.default[name];
	
	    if (propertyInfo !== undefined) {
	
	        if (propertyInfo.mustUseProperty) {
	
	            var propName = propertyInfo.propertyName;
	
	            if (propName === 'value' && node.tagName.toLowerCase() === 'select') {
	
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
	
	exports.default = deleteValueForProperty;

/***/ },
/* 29 */
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
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _DOMProperties = __webpack_require__(11);
	
	var _DOMProperties2 = _interopRequireDefault(_DOMProperties);
	
	var _shouldIgnoreValue = __webpack_require__(32);
	
	var _shouldIgnoreValue2 = _interopRequireDefault(_shouldIgnoreValue);
	
	var _deleteDOMProperties = __webpack_require__(28);
	
	var _deleteDOMProperties2 = _interopRequireDefault(_deleteDOMProperties);
	
	var _isArray = __webpack_require__(12);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function setValueForProperty(node, name, value) {
	
	    var propertyInfo = _DOMProperties2.default[name];
	
	    if (propertyInfo !== undefined) {
	
	        if ((0, _shouldIgnoreValue2.default)(propertyInfo, value)) {
	            (0, _deleteDOMProperties2.default)(node, name);
	            return;
	        }
	
	        if (propertyInfo.mustUseProperty) {
	
	            var propName = propertyInfo.propertyName;
	
	            if (propName === 'value' && node.tagName.toLowerCase() === 'select') {
	
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
	            } else if ('' + node[propName] !== '' + value) {
	                node[propName] = value;
	            }
	
	            return;
	        }
	
	        var attributeName = propertyInfo.attributeName;
	        var namespace = propertyInfo.attributeNamespace;
	
	        if (namespace) {
	            node.setAttributeNS(namespace, attributeName, '' + value);
	        } else {
	            node.setAttribute(attributeName, '' + value);
	        }
	    } else {
	        // custom attributes
	
	        // Take any attribute (with correct syntax) as custom attribute.
	        if (name) {
	            node.setAttribute(name, value);
	        }
	    }
	}
	
	exports.default = setValueForProperty;

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _addPixelSuffixToValueIfNeeded = __webpack_require__(65);
	
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
/* 32 */
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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _deleteDOMProperties = __webpack_require__(28);
	
	var _deleteDOMProperties2 = _interopRequireDefault(_deleteDOMProperties);
	
	var _setValueForProperty = __webpack_require__(30);
	
	var _setValueForProperty2 = _interopRequireDefault(_setValueForProperty);
	
	var _setValueForStyles = __webpack_require__(31);
	
	var _setValueForStyles2 = _interopRequireDefault(_setValueForStyles);
	
	var _eventManager = __webpack_require__(7);
	
	var _eventManager2 = _interopRequireDefault(_eventManager);
	
	var _events = __webpack_require__(3);
	
	var _events2 = _interopRequireDefault(_events);
	
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
	                (0, _deleteDOMProperties2.default)(element, propName);
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
	            (0, _setValueForStyles2.default)(element, styleUpdates);
	        }
	
	        // Event listeners
	    } else if (_events2.default[propName] != null) {
	
	            if (oldProp != null) {
	
	                if (newProp != null) {
	                    _eventManager2.default.addListener(element, propName, newProp);
	                } else {
	                    _eventManager2.default.removeListener(element, propName);
	                }
	            } else if (newProp != null) {
	                _eventManager2.default.addListener(element, propName, newProp);
	            }
	        } else if (oldProp != null) {
	
	            // If 'newProp' is null or undefined, we, we should remove the property
	            // from the DOM node instead of inadvertantly setting to a string.
	            if (newProp != null) {
	                (0, _setValueForProperty2.default)(element, propName, newProp);
	            } else {
	                (0, _deleteDOMProperties2.default)(element, propName);
	            }
	        } else if (newProp != null) {
	            (0, _setValueForProperty2.default)(element, propName, newProp);
	        }
	}
	
	exports.default = updateDOMProperties;

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _addAttributes = __webpack_require__(26);
	
	var _addAttributes2 = _interopRequireDefault(_addAttributes);
	
	var _VirtualElement = __webpack_require__(40);
	
	var _VirtualElement2 = _interopRequireDefault(_VirtualElement);
	
	var _VirtualTextNode = __webpack_require__(14);
	
	var _VirtualTextNode2 = _interopRequireDefault(_VirtualTextNode);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
		addAttributes: _addAttributes2.default,
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
/* 35 */
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
/* 36 */
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
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _ExecutionEnvironment = __webpack_require__(35);
	
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
/* 38 */
25,
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _applyState = __webpack_require__(41);
	
	var _applyState2 = _interopRequireDefault(_applyState);
	
	var _queueStateChanges = __webpack_require__(42);
	
	var _queueStateChanges2 = _interopRequireDefault(_queueStateChanges);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Component = (function () {
		function Component(props, context) {
			_classCallCheck(this, Component);
	
			this.props = props;
			this.context = context;
			this._blockSetState = false;
			this._pendingState = {};
			this._deferSetState = false;
			this.state = {};
		}
	
		_createClass(Component, [{
			key: 'render',
			value: function render() {}
		}, {
			key: 'forceUpdate',
			value: function forceUpdate() {}
		}, {
			key: 'setState',
			value: function setState(newState) {
				if (this._blockSetState === false) {
					(0, _queueStateChanges2.default)(this, newState);
				} else {
					throw Error("Inferno Error: Cannot update state via setState() in componentWillReceiveProps()");
				}
			}
		}, {
			key: 'replaceState',
			value: function replaceState(newState) {
				this.state = newState;
				this.forceUpdate();
			}
		}, {
			key: 'componentDidMount',
			value: function componentDidMount() {}
		}, {
			key: 'componentWillMount',
			value: function componentWillMount() {}
		}, {
			key: 'componentWillUnmount',
			value: function componentWillUnmount() {}
		}, {
			key: 'componentDidUpdate',
			value: function componentDidUpdate() {}
		}, {
			key: 'shouldComponentUpdate',
			value: function shouldComponentUpdate() {
				return true;
			}
		}, {
			key: 'componentWillReceiveProps',
			value: function componentWillReceiveProps() {}
		}, {
			key: 'componentWillUpdate',
			value: function componentWillUpdate() {}
		}]);
	
		return Component;
	})();
	
	exports.default = Component;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _VirtualTextNode = __webpack_require__(14);
	
	var _VirtualTextNode2 = _interopRequireDefault(_VirtualTextNode);
	
	var _DOMProperties = __webpack_require__(11);
	
	var _DOMProperties2 = _interopRequireDefault(_DOMProperties);
	
	var _shouldIgnoreValue = __webpack_require__(32);
	
	var _shouldIgnoreValue2 = _interopRequireDefault(_shouldIgnoreValue);
	
	var _quoteAttributeValueForBrowser = __webpack_require__(71);
	
	var _quoteAttributeValueForBrowser2 = _interopRequireDefault(_quoteAttributeValueForBrowser);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createMarkupForProperty(name, value) {
	
	    console.log(value);
	
	    var propertyInfo = _DOMProperties2.default[name];
	
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
/* 41 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function applyState(component) {
		requestAnimationFrame(function () {
			if (component._deferSetState === false) {
				component._pendingSetState = false;
				for (var stateKey in component._pendingState) {
					component.state[stateKey] = component._pendingState[stateKey];
				}
				component._pendingState = {};
				component._pendingSetState = false;
				component.forceUpdate();
			} else {
				applyState(component);
			}
		});
	}
	
	exports.default = applyState;

/***/ },
/* 42 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	function queueStateChanges(component, newState) {
		for (var stateKey in newState) {
			component._pendingState = newState[stateKey];
		}
		if (component._pendingSetState == false) {
			component._pendingSetState = true;
			applyState(component);
		}
	}
	
	exports.default = queueStateChanges;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = attachComponent;
	
	var _bind = __webpack_require__(36);
	
	var _bind2 = _interopRequireDefault(_bind);
	
	var _render = __webpack_require__(6);
	
	var _render2 = _interopRequireDefault(_render);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function attachComponent(context, mountElem, Component, fragmentDom, replaceComponent) {
		var newElement = undefined;
		var props = Component.props;
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
/* 44 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports.default = function () {
		console.warn('Update called on a component that is no longer mounted!');
	};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = clearDomElement;
	
	var _getContext = __webpack_require__(8);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _removeContext = __webpack_require__(9);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function clearDomElement(dom) {
		var context = (0, _getContext2.default)(dom);
		if (context != null) {
			(0, _removeContext2.default)(dom);
		}
	}

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createFragment;
	
	var _isArray = __webpack_require__(12);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _createTemplate = __webpack_require__(16);
	
	var _createTemplate2 = _interopRequireDefault(_createTemplate);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function createFragment(values, template) {
		var key = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
		if (template.key == null) {
			template = (0, _createTemplate2.default)(template);
		}
	
		var fragmentObject = {
			dom: null,
			key: key,
			next: null,
			template: template
		};
	
		if (values != null && (0, _isArray2.default)(values)) {
			if (values.length === 1) {
				fragmentObject.templateElement = null;
				fragmentObject.templateType = null;
				fragmentObject.templateValue = values[0];
				fragmentObject.templateComponent = null;
			} else {
				fragmentObject.templateElements = new Array(values.length);
				fragmentObject.templateTypes = new Array(values.length);
				fragmentObject.templateComponents = new Array(values.length);
				fragmentObject.templateValues = values;
			}
		} else {
			fragmentObject.templateElement = null;
			fragmentObject.templateType = null;
			fragmentObject.templateValue = values;
		}
		return fragmentObject;
	}

/***/ },
/* 47 */
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
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _recycledFragments = __webpack_require__(38);
	
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
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = insertFragment;
	
	var _destroyFragment = __webpack_require__(17);
	
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
/* 50 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports.default = function (parentDom, item, nextItem) {
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
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _removeFragment = __webpack_require__(5);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (context, parentDom, fragments, i, to) {
		for (; i < to; i++) {
			(0, _removeFragment2.default)(context, parentDom, fragments[i]);
		}
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = renderToString;
	
	var _render = __webpack_require__(6);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _virtual = __webpack_require__(34);
	
	var _virtual2 = _interopRequireDefault(_virtual);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function renderToString(fragment, component) {
		var dom = _virtual2.default.createElement('div');
		(0, _render2.default)(fragment, dom, component, true);
		return dom.innerHTML;
	}

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _removeFragment = __webpack_require__(5);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _removeContext = __webpack_require__(9);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _getContext = __webpack_require__(8);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _unmountComponentAtFragment = __webpack_require__(19);
	
	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (dom) {
		var context = (0, _getContext2.default)(dom);
	
		if (context !== null) {
			var component = context.fragment.component;
	
			if (component) {
				(0, _removeFragment2.default)(context, dom, component.fragment);
				(0, _unmountComponentAtFragment2.default)(component.fragment);
			} else {
				(0, _removeFragment2.default)(context, dom, context.fragment);
				(0, _removeContext2.default)(dom);
			}
		}
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _updateFragment = __webpack_require__(2);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _fragmentValueTypes = __webpack_require__(1);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _updateFragmentList = __webpack_require__(21);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _eventManager = __webpack_require__(7);
	
	var _eventManager2 = _interopRequireDefault(_eventManager);
	
	var _events = __webpack_require__(3);
	
	var _events2 = _interopRequireDefault(_events);
	
	var _isSVG = __webpack_require__(37);
	
	var _isSVG2 = _interopRequireDefault(_isSVG);
	
	var _updateDOMProperties = __webpack_require__(33);
	
	var _updateDOMProperties2 = _interopRequireDefault(_updateDOMProperties);
	
	var _updateComponent = __webpack_require__(20);
	
	var _updateComponent2 = _interopRequireDefault(_updateComponent);
	
	var _removeComponent = __webpack_require__(18);
	
	var _removeComponent2 = _interopRequireDefault(_removeComponent);
	
	var _sanitizeValue = __webpack_require__(29);
	
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
	
	                if (comp === null) {
	                    (0, _removeComponent2.default)(templateComponent, element);
	                    templateComponent = fragment.templateValue = null;
	                } else if (comp && comp.component === oldComp.component) {
	                    (0, _updateComponent2.default)(templateComponent, comp.props);
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
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _updateFragment = __webpack_require__(2);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _fragmentValueTypes = __webpack_require__(1);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _updateFragmentList = __webpack_require__(21);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _eventManager = __webpack_require__(7);
	
	var _eventManager2 = _interopRequireDefault(_eventManager);
	
	var _events = __webpack_require__(3);
	
	var _events2 = _interopRequireDefault(_events);
	
	var _isSVG = __webpack_require__(37);
	
	var _isSVG2 = _interopRequireDefault(_isSVG);
	
	var _updateDOMProperties = __webpack_require__(33);
	
	var _updateDOMProperties2 = _interopRequireDefault(_updateDOMProperties);
	
	var _updateComponent = __webpack_require__(20);
	
	var _updateComponent2 = _interopRequireDefault(_updateComponent);
	
	var _removeComponent = __webpack_require__(18);
	
	var _removeComponent2 = _interopRequireDefault(_removeComponent);
	
	var _sanitizeValue = __webpack_require__(29);
	
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
	
	                    if (comp === null) {
	                        (0, _removeComponent2.default)(templateComponent, element);
	                        templateComponent = fragment.templateValues[i] = null;
	                    } else if (comp && comp.component === oldComp.component) {
	                        (0, _updateComponent2.default)(templateComponent, comp.props);
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
	                    if (type == null) {
	                        throw Error('Inferno Error: value "' + fragment.templateValues[i] + '" for fragment is never used');
	                    }
	                    //custom attribute, so simply setAttribute it
	                    if (_events2.default[type] != null) {
	                        _eventManager2.default.addListener(element, type, fragment.templateValues[i]);
	                    } else {
	                        (0, _updateDOMProperties2.default)(element, type, oldFragment.templateValues[i], fragment.templateValues[i]);
	                    }
	                    break;
	            }
	        }
	    }
	}
	
	exports.default = updateFragmentValues;

/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports.default = function (eventNameSuffix) {
	
	    var eventName = 'on' + eventNameSuffix;
	
	    if (eventName in document) {
	        return true;
	    }
	
	    var element = document.createElement('div');
	
	    element.setAttribute(eventName, 'return;');
	
	    if (typeof element[eventName] === 'function') {
	        return true;
	    }
	
	    return false;
	};

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = ['abort', 'mouseover', 'mousemove', 'mouseout', 'mousedown', 'mouseup', 'error', 'encrypted', 'emptied', 'ended', 'error', 'loadastart', 'compositionend', 'compositionstart', 'compositionupdate', 'durationchange', 'loadeddata', 'loadstart', 'pause', 'play', 'seeked', 'seeking', 'selectionchange', 'stalled', 'suspend', 'textInput', 'timeupdate', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'volumechange', 'waiting', 'loadedmetadata', 'click', 'dblclick', 'keydown', 'keypress', 'keyup', 'change', 'input', 'submit', 'focus', 'blur', 'dragstart', 'drag', 'dragenter', 'dragover', 'dragleave', 'dragend', 'drop', 'contextmenu', 'wheel', 'copy', 'cut', 'paste'];

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	// Workaround for https://bugs.webkit.org/show_bug.cgi?id=16735
	
	exports.default = function (ev, type) {
	    if (ev.ctrlKey != (type || false) || ev.altKey != (type || false) || ev.shiftKey != (type || false) || ev.metaKey != (type || false) || ev.keyCode != (type || 0) || ev.charCode != (type || 0)) {
	
	        ev = document.createEvent('Event');
	        ev.initEvent(type, true, true);
	        ev.ctrlKey = type || false;
	        ev.altKey = type || false;
	        ev.shiftKey = type || false;
	        ev.metaKey = type || false;
	        ev.keyCode = type || 0;
	        ev.charCode = type || 0;
	    }
	
	    return ev;
	};

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var focusEvents = null;
	
	// support: Firefox
	if (typeof InstallTrigger !== 'undefined') {
	    focusEvents = {
	        focus: 'focusin',
	        blur: 'focusout'
	    };
	}
	
	exports.default = focusEvents;

/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = ['scroll', 'load', 'error'];

/***/ },
/* 61 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = '__Inferno__';

/***/ },
/* 62 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    acceptCharset: 'accept-charset',
	    className: 'class',
	    htmlFor: 'for',
	    httpEquiv: 'http-equiv',
	
	    /**
	     * SVG
	     */
	
	    accentHeight: 'accent-height',
	    alignmentBaseline: 'alignment-baseline',
	    arabicForm: 'arabic-form',
	    attributeType: 'attributeType',
	    baseFrequency: 'baseFrequency',
	    baseProfile: 'baseProfile',
	    baselineShift: 'baseline-shift',
	    calcMode: 'calcMode',
	    capHeight: 'cap-height',
	    clipPath: 'clip-path',
	    clipPathUnits: 'clipPathUnits',
	    clipRule: 'clip-rule',
	    colorInterpolation: 'color-interpolation',
	    colorInterpolationFilters: 'color-interpolation-filters',
	    colorProfile: 'color-profile',
	    colorRendering: 'color-rendering',
	    contentScriptType: 'contentScriptType',
	    contentStyleType: 'contentStyleType',
	    diffuseConstant: 'diffuseConstant',
	    dominantBaseline: 'dominant-baseline',
	    edgeMode: 'edgeMode',
	    enableBackground: 'enable-background',
	    externalResourcesRequired: 'externalResourcesRequired',
	    feColorMatrix: 'feColorMatrix',
	    feComposite: 'feComposite',
	    feGaussianBlur: 'feGaussianBlur',
	    feMorphology: 'feMorphology',
	    feTile: 'feTile',
	    fillOpacity: 'fill-opacity',
	    fillRule: 'fill-rule',
	    filterRes: 'filterRes',
	    filterUnits: 'filterUnits',
	    floodColor: 'flood-color',
	    floodOpacity: 'flood-opacity',
	    fontFamily: 'font-family',
	    fontSize: 'font-size',
	    fontSizeAdjust: 'font-size-adjust',
	    fontStretch: 'font-stretch',
	    fontStyle: 'font-style',
	    fontVariant: 'font-variant',
	    fontWeight: 'font-weight',
	    glyphName: 'glyph-name',
	    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
	    glyphOrientationVertical: 'glyph-orientation-vertical',
	    glyphRef: 'glyphRef',
	    gradientTransform: 'gradientTransform',
	    gradientUnits: 'gradientUnits',
	    horizAdvX: 'horiz-adv-x',
	    horizOriginX: 'horiz-origin-x',
	    horizOriginY: 'horiz-origin-y',
	    imageRendering: 'image-rendering',
	    kernelMatrix: 'kernelMatrix',
	    kernelUnitLength: 'kernelUnitLength',
	    keyPoints: 'keyPoints',
	    keySplines: 'keySplines',
	    keyTimes: 'keyTimes',
	    lengthAdjust: 'lengthAdjust',
	    letterSpacing: 'letter-spacing',
	    lightingColor: 'lighting-color',
	    limitingConeAngle: 'limitingConeAngle',
	    markerEnd: 'marker-end',
	    markerHeight: 'markerHeight',
	    markerMid: 'marker-mid',
	    markerStart: 'marker-start',
	    markerUnits: 'markerUnits',
	    markerWidth: 'markerWidth',
	    maskContentUnits: 'maskContentUnits',
	    maskUnits: 'maskUnits',
	    numOctaves: 'numOctaves',
	    overlinePosition: 'overline-position',
	    overlineThickness: 'overline-thickness',
	    panose1: 'panose-1',
	    pathLength: 'pathLength',
	    patternContentUnits: 'patternContentUnits',
	    patternTransform: 'patternTransform',
	    patternUnits: 'patternUnits',
	    pointerEvents: 'pointer-events',
	    pointsAtX: 'pointsAtX',
	    pointsAtY: 'pointsAtY',
	    pointsAtZ: 'pointsAtZ',
	    preserveAlpha: 'preserveAlpha',
	    preserveAspectRatio: 'preserveAspectRatio',
	    primitiveUnits: 'primitiveUnits',
	    refX: 'refX',
	    refY: 'refY',
	    renderingIntent: 'rendering-intent',
	    repeatCount: 'repeatCount',
	    repeatDur: 'repeatDur',
	    requiredExtensions: 'requiredExtensions',
	    shapeRendering: 'shape-rendering',
	    specularConstant: 'specularConstant',
	    specularExponent: 'specularExponent',
	    spreadMethod: 'spreadMethod',
	    startOffset: 'startOffset',
	    stdDeviation: 'stdDeviation',
	    stitchTiles: 'stitchTiles',
	    stopColor: 'stop-color',
	    stopOpacity: 'stop-opacity',
	    strikethroughPosition: 'strikethrough-position',
	    strikethroughThickness: 'strikethrough-thickness',
	    strokeDasharray: 'stroke-dasharray',
	    strokeDashoffset: 'stroke-dashoffset',
	    strokeLinecap: 'stroke-linecap',
	    strokeLinejoin: 'stroke-linejoin',
	    strokeMiterlimit: 'stroke-miterlimit',
	    strokeOpacity: 'stroke-opacity',
	    strokeWidth: 'stroke-width',
	    surfaceScale: 'surfaceScale',
	    systemLanguage: 'systemLanguage',
	    tableValues: 'tableValues',
	    targetX: 'targetX',
	    targetY: 'targetY',
	    textAnchor: 'text-anchor',
	    textDecoration: 'text-decoration',
	    textLength: 'textLength',
	    textRendering: 'text-rendering',
	    underlinePosition: 'underline-position',
	    underlineThickness: 'underline-thickness',
	    unicodeBidi: 'unicode-bidi',
	    unicodeRange: 'unicode-range',
	    unitsPerEm: 'units-per-em',
	    vAlphabetic: 'v-alphabetic',
	    vHanging: 'v-hanging',
	    vIdeographic: 'v-ideographic',
	    vMathematical: 'v-mathematical',
	    vertAdvY: 'vert-adv-y',
	    vertOriginX: 'vert-origin-x',
	    vertOriginY: 'vert-origin-y',
	    viewBox: 'viewBox',
	    viewTarget: 'viewTarget',
	    wordSpacing: 'word-spacing',
	    writingMode: 'writing-mode',
	    xChannelSelector: 'xChannelSelector',
	    xHeight: 'x-height',
	    yChannelSelector: 'yChannelSelector',
	    zoomAndPan: 'zoomAndPan',
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

/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var xlink = 'http://www.w3.org/1999/xlink';
	var xml = 'http://www.w3.org/XML/1998/namespace';
	
	exports.default = {
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

/***/ },
/* 64 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = {
	  MUST_USE_PROPERTY: 0x1,
	  HAS_BOOLEAN_VALUE: 0x4,
	  HAS_NUMERIC_VALUE: 0x8,
	  HAS_POSITIVE_NUMERIC_VALUE: 0x10 | 0x8
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _unitlessProperties = __webpack_require__(72);
	
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
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createComponentFactory;
	
	var _fragmentValueTypes = __webpack_require__(1);
	
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
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _checkMask = __webpack_require__(27);
	
	var _checkMask2 = _interopRequireDefault(_checkMask);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var IS_SVG = 0x15;
	var IS_MATHML = 0x20;
	
	// DOM Element list here
	var DOMElements = {
	
	    a: IS_SVG,
	    altGlyph: IS_SVG,
	    altGlyphDef: IS_SVG,
	    altGlyphItem: IS_SVG,
	    animate: IS_SVG,
	    animateColor: IS_SVG,
	    animateMotion: IS_SVG,
	    animateTransform: IS_SVG,
	    circle: IS_SVG,
	    clipPath: IS_SVG,
	    'color-profile': IS_SVG,
	    cursor: IS_SVG,
	    defs: IS_SVG,
	    desc: IS_SVG,
	    ellipse: IS_SVG,
	    feBlend: IS_SVG,
	    feColorMatrix: IS_SVG,
	    feComponentTransfer: IS_SVG,
	    feComposite: IS_SVG,
	    feConvolveMatrix: IS_SVG,
	    feDiffuseLighting: IS_SVG,
	    feDisplacementMap: IS_SVG,
	    feDistantLight: IS_SVG,
	    feFlood: IS_SVG,
	    feFuncA: IS_SVG,
	    feFuncB: IS_SVG,
	    feFuncG: IS_SVG,
	    feFuncR: IS_SVG,
	    feGaussianBlur: IS_SVG,
	    feImage: IS_SVG,
	    feMerge: IS_SVG,
	    feMergeNode: IS_SVG,
	    feMorphology: IS_SVG,
	    feOffset: IS_SVG,
	    fePointLight: IS_SVG,
	    feSpecularLighting: IS_SVG,
	    feSpotLight: IS_SVG,
	    feTile: IS_SVG,
	    feTurbulence: IS_SVG,
	    filter: IS_SVG,
	    font: IS_SVG,
	    'font-face': IS_SVG,
	    'font-face-format': IS_SVG,
	    'font-face-name': IS_SVG,
	    'font-face-src': IS_SVG,
	    'font-face-uri': IS_SVG,
	    foreignObject: IS_SVG,
	    g: IS_SVG,
	    glyph: IS_SVG,
	    glyphRef: IS_SVG,
	    hkern: IS_SVG,
	    image: IS_SVG,
	    line: IS_SVG,
	    linearGradient: IS_SVG,
	    marker: IS_SVG,
	    mask: IS_SVG,
	    metadata: IS_SVG,
	    math: IS_MATHML,
	    maction: IS_MATHML,
	    maligngroup: IS_MATHML,
	    malignmark: IS_MATHML,
	    menclose: IS_MATHML,
	    merror: IS_MATHML,
	    mfenced: IS_MATHML,
	    mfrac: IS_MATHML,
	    mglyph: IS_MATHML,
	    mi: IS_MATHML,
	    mlabeledtr: IS_MATHML,
	    mlongdiv: IS_MATHML,
	    mmultiscripts: IS_MATHML,
	    mn: IS_MATHML,
	    mo: IS_MATHML,
	    mover: IS_MATHML,
	    mpadded: IS_MATHML,
	    mphantom: IS_MATHML,
	    mroot: IS_MATHML,
	    mrow: IS_MATHML,
	    ms: IS_MATHML,
	    mscarries: IS_MATHML,
	    mscarry: IS_MATHML,
	    msgroup: IS_MATHML,
	    msline: IS_MATHML,
	    mspace: IS_MATHML,
	    msqrt: IS_MATHML,
	    msrow: IS_MATHML,
	    mstack: IS_MATHML,
	    mstyle: IS_MATHML,
	    msub: IS_MATHML,
	    msup: IS_MATHML,
	    msubsup: IS_MATHML,
	    'missing-glyph': IS_SVG,
	    mpath: IS_SVG,
	    path: IS_SVG,
	    pattern: IS_SVG,
	    polygon: IS_SVG,
	    polyline: IS_SVG,
	    radialGradient: IS_SVG,
	    rect: IS_SVG,
	    script: IS_SVG,
	    set: IS_SVG,
	    stop: IS_SVG,
	    style: IS_SVG,
	    svg: IS_SVG,
	    switch: IS_SVG,
	    symbol: IS_SVG,
	    text: IS_SVG,
	    textPath: IS_SVG,
	    title: IS_SVG,
	    tref: IS_SVG,
	    tspan: IS_SVG,
	    use: IS_SVG,
	    view: IS_SVG,
	    vkern: IS_SVG
	};
	
	var DOMElementContainer = {};
	
	for (var element in DOMElements) {
	
	    var elementConfig = DOMElements[element];
	
	    var elementInfo = {
	
	        isSVG: (0, _checkMask2.default)(elementConfig, IS_SVG),
	        isMathML: (0, _checkMask2.default)(elementConfig, IS_MATHML)
	    };
	
	    DOMElementContainer[element] = elementInfo;
	}
	
	exports.default = DOMElementContainer;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.default = createElementFactory;
	
	var _fragmentValueTypes = __webpack_require__(1);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	var _isArray = __webpack_require__(12);
	
	var _isArray2 = _interopRequireDefault(_isArray);
	
	var _render = __webpack_require__(6);
	
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
							var value = fragment.templateValue || fragment.templateValues[child.pointer];
	
							if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
								var node = template.createTextNode(value);
	
								if (fragment.templateValue) {
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
							} else if (value.template) {
								(0, _render2.default)(value, element);
								if (fragment.templateValues) {
									fragment.templateTypes[child.pointer] = _fragmentValueTypes2.default.COMPONENT_CHILDREN;
								} else {
									fragment.templateType = _fragmentValueTypes2.default.COMPONENT_CHILDREN;
								}
							}
						} else if ((typeof child === 'undefined' ? 'undefined' : _typeof(child)) !== 'object') {
							var node = template.createTextNode(child);
	
							element.appendChild(node);
						} else if (child.component) {
							if (fragment.templateValues) {
								var templateIndex = child.templateIndex;
	
								fragment.templateElements[templateIndex] = element;
								fragment.templateTypes[templateIndex] = _fragmentValueTypes2.default.FRAGMENT;
								fragment.templateValues[templateIndex] = child;
							} else {
								fragment.templateElement = element;
								fragment.templateType = _fragmentValueTypes2.default.FRAGMENT;
								fragment.templateValue = child;
							}
						} else {
							element.appendChild(child);
						}
					}
				} else if ((children = children[0]) && children.pointer !== undefined) {
					var value = fragment.templateValue || fragment.templateValues[children.pointer];
	
					if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
						element.textContent = value;
						if (fragment.templateValue) {
							fragment.templateElement = element;
							fragment.templateType = _fragmentValueTypes2.default.TEXT;
						} else {
							fragment.templateElements[children.pointer] = element;
							fragment.templateTypes[children.pointer] = _fragmentValueTypes2.default.TEXT;
						}
					} else if ((0, _isArray2.default)(value)) {
						if (fragment.templateValue) {
							fragment.templateElement = element;
							fragment.templateType = _fragmentValueTypes2.default.LIST;
						} else {
							fragment.templateElements[children.pointer] = element;
							fragment.templateTypes[children.pointer] = _fragmentValueTypes2.default.LIST;
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
	
	var _addAttributes = __webpack_require__(26);
	
	var _addAttributes2 = _interopRequireDefault(_addAttributes);
	
	var _createDOMElements = __webpack_require__(67);
	
	var _createDOMElements2 = _interopRequireDefault(_createDOMElements);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	    addAttributes: _addAttributes2.default,
	    createElement: function createElement(tag, is) {
	
	        switch (tag) {
	            case 'div':
	            case 'span':
	            case 'button':
	            case 'em':
	            case 'form':
	            case 'img':
	            case 'a':
	            case 'ol':
	            case 'p':
	            case 'table':
	            case 'ul':
	            case 'ol':
	            case 'p':
	
	                return is ? document.createElement(tag, is) : document.createElement(tag);
	            default:
	
	                var DOMElementsInfo = _createDOMElements2.default[tag.toLowerCase()];
	
	                if (DOMElementsInfo !== undefined) {
	                    if (DOMElementsInfo.isSVG) {
	                        // add SVG namespace
	                        return is ? document.createElementNS('http://www.w3.org/2000/svg', tag, is) : document.createElementNS('http://www.w3.org/2000/svg', tag);
	                    }
	                    if (DOMElementsInfo.isMathML) {
	                        // add mathML namespace
	                        return is ? document.createElementNS('http://www.w3.org/1998/Math/MathML', tag, is) : document.createElementNS('http://www.w3.org/1998/Math/MathML', tag);
	                    }
	                }
	                // all others
	                return is ? document.createElement(tag, is) : document.createElement(tag);
	        }
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
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _fragmentValueTypes = __webpack_require__(1);
	
	var _fragmentValueTypes2 = _interopRequireDefault(_fragmentValueTypes);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function processFragmentAttrs(node, attrName, attrVal, fragment) {
	
		var fragmentType = undefined;
		var skip = false;
	
		switch (attrName) {
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
/* 71 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var ESCAPE_LOOKUP = {
	  '&': '&amp;',
	  '>': '&gt;',
	  '<': '&lt;',
	  '"': '&quot;'
	};
	
	var ESCAPE_REGEX = /[&><"]/g;
	
	var escaper = function escaper(match) {
	  return ESCAPE_LOOKUP[match];
	};
	
	/**
	 * Escapes attribute value to prevent scripting attacks.
	 *
	 * @param {*} value Attribute value to escape.
	 * @return {string} An escaped string.
	 */
	
	exports.default = function (value) {
	  return '"' + ('' + value).replace(ESCAPE_REGEX, escaper) + '"';
	};

/***/ },
/* 72 */
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
/* 73 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// Generate a unique identifier
	var uuidFunc = function uuidFunc(char) {
	  return char == 'x' ? Math.random() * 16 | 0 : (Math.random() * 16 | 0 & 0x3 | 0x8).toString(16);
	};
	
	exports.default = function () {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, uuidFunc);
	};

/***/ }
/******/ ])))
});
;
//# sourceMappingURL=inferno.js.map