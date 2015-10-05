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
/******/ 	__webpack_require__.p = "http://localhost:8080/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* global __VERSION__ */
	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _classComponent = __webpack_require__(34);
	
	var _classComponent2 = _interopRequireDefault(_classComponent);
	
	var _coreRender = __webpack_require__(9);
	
	var _coreRender2 = _interopRequireDefault(_coreRender);
	
	var _coreRenderToString = __webpack_require__(43);
	
	var _coreRenderToString2 = _interopRequireDefault(_coreRenderToString);
	
	var _coreUnmountComponentAtNode = __webpack_require__(44);
	
	var _coreUnmountComponentAtNode2 = _interopRequireDefault(_coreUnmountComponentAtNode);
	
	var _enumFragmentValueTypes = __webpack_require__(2);
	
	var _enumFragmentValueTypes2 = _interopRequireDefault(_enumFragmentValueTypes);
	
	var _enumTemplateTypes = __webpack_require__(10);
	
	var _enumTemplateTypes2 = _interopRequireDefault(_enumTemplateTypes);
	
	var _coreCreateFragment = __webpack_require__(37);
	
	var _coreCreateFragment2 = _interopRequireDefault(_coreCreateFragment);
	
	var _coreCreateTemplate = __webpack_require__(20);
	
	var _coreCreateTemplate2 = _interopRequireDefault(_coreCreateTemplate);
	
	var _template = __webpack_require__(15);
	
	var _template2 = _interopRequireDefault(_template);
	
	var _coreClearDomElement = __webpack_require__(36);
	
	var _coreClearDomElement2 = _interopRequireDefault(_coreClearDomElement);
	
	var _coreCreateRef = __webpack_require__(38);
	
	var _coreCreateRef2 = _interopRequireDefault(_coreCreateRef);
	
	exports['default'] = {
		Component: _classComponent2['default'],
		render: _coreRender2['default'],
		renderToString: _coreRenderToString2['default'],
		createFragment: _coreCreateFragment2['default'],
		createTemplate: _coreCreateTemplate2['default'],
		unmountComponentAtNode: _coreUnmountComponentAtNode2['default'],
		FragmentValueTypes: _enumFragmentValueTypes2['default'],
		TemplateTypes: _enumTemplateTypes2['default'],
		template: _template2['default'],
		clearDomElement: _coreClearDomElement2['default'],
		createRef: _coreCreateRef2['default'],
		version: ("0.3.0")
	};
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (obj) {
	  return obj && obj.__esModule ? obj : {
	    "default": obj
	  };
	};
	
	exports.__esModule = true;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports["default"] = {
		TEXT: 0,
		TEXT_DIRECT: 1,
		FRAGMENT: 2,
		LIST: 3,
		FRAGMENT_REPLACE: 4,
		LIST_REPLACE: 5,
		ATTR_CLASS: 6,
		ATTR_ID: 7,
		ATTR_LABEL: 8,
		ATTR_PLACEHOLDER: 9,
		ATTR_NAME: 10,
		ATTR_WIDTH: 11,
		ATTR_HEIGHT: 12,
		ATTR_REF: 13,
		ATTR_DESIGNMODE: 14,
		ATTR_HTMLFOR: 15,
		ATTR_PLAYBACKRATE: 16,
		ATTR_PRELOAD: 17,
		ATTR_SRCDOC: 18,
		ATTR_AUTOPLAY: 19,
		ATTR_CHECKED: 20,
		ATTR_ISMAP: 21,
		ATTR_LOOP: 22,
		ATTR_MUTED: 23,
		ATTR_READONLY: 24,
		ATTR_REVERSED: 25,
		ATTR_REQUIRED: 26,
		ATTR_SELECTED: 27,
		ATTR_SPELLCHECK: 28,
		ATTR_TRUESPEED: 29,
		ATTR_MULTIPLE: 30,
		ATTR_CONTROLS: 31,
		ATTR_DEFER: 32,
		ATTR_NOVALIDATE: 33,
		ATTR_SCOPED: 34,
		ATTR_NO_RESIZE: 35,
		//will contain other "custom" types, like rowspan etc or custom data-attributes
		ATTR_OTHER: {},
		COMPONENT_PROPS: {}
	};
	module.exports = exports["default"];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _removeFragment = __webpack_require__(6);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragmentValue = __webpack_require__(45);
	
	var _updateFragmentValue2 = _interopRequireDefault(_updateFragmentValue);
	
	var _updateFragmentValues = __webpack_require__(46);
	
	var _updateFragmentValues2 = _interopRequireDefault(_updateFragmentValues);
	
	var _unmountComponentAtFragment = __webpack_require__(22);
	
	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);
	
	function updateFragment(context, oldFragment, fragment, parent, component) {
	
		if (fragment == null) {
			(0, _removeFragment2['default'])(context, parent, oldFragment);
			return;
		}
	
		if (oldFragment == null) {
			(0, _attachFragment2['default'])(context, fragment, parent, component);
			return;
		}
	
		if (oldFragment.template !== fragment.template) {
	
			if (oldFragment.component) {
				var oldComponentFragment = oldFragment.component.context.fragment;
	
				(0, _unmountComponentAtFragment2['default'])(oldFragment);
				(0, _attachFragment2['default'])(context, fragment, parent, component, oldComponentFragment, true);
				return;
			}
			(0, _attachFragment2['default'])(context, fragment, parent, component, oldFragment, true);
	
			return;
		}
		var fragmentComponent = oldFragment.component;
		//if this fragment is a component
		if (fragmentComponent) {
			fragmentComponent.props = fragment.props;
			fragmentComponent.forceUpdate();
			fragment.component = fragmentComponent;
			return;
		}
	
		//ensure we reference the new fragment with the old fragment's DOM node
		fragment.dom = oldFragment.dom;
		if (fragment.templateValue !== undefined) {
			//update a single value in the fragement (templateValue rather than templateValues)
			(0, _updateFragmentValue2['default'])(context, oldFragment, fragment, component);
		} else if (fragment.templateValues) {
			//updates all values within the fragment (templateValues is an array)
			(0, _updateFragmentValues2['default'])(context, oldFragment, fragment, component);
		}
	}
	
	exports['default'] = updateFragment;
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
				value: true
	});
	exports['default'] = {
				onBlur: 'blur',
				onChange: 'change',
				onClick: 'click',
				onCompositionEnd: 'compositionend',
				onCompositionStart: 'compositionstart',
				onCompositionUpdate: 'compositionupdate',
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
				onError: 'error',
				onFocus: 'focus',
				onInput: 'input',
				onInvalid: 'invalid',
				onKeyDown: 'keydown',
				onKeyPress: 'keypress',
				onKeyUp: 'keyup',
				onLoad: 'load',
				onMouseDown: 'mousedown',
				onMouseEnter: 'mouseenter',
				onMouseLeave: 'mouseleave',
				onMouseMove: 'mousemove',
				onMouseOut: 'mouseout',
				onMouseOver: 'mouseover',
				onMouseUp: 'mouseup',
				onPaste: 'paste',
				onReset: 'reset',
				onScroll: 'scroll',
				onSelectionChange: 'selectionchange',
				onTextInput: 'textInput',
				onSubmit: 'submit',
				onTouchCancel: 'touchcancel',
				onTouchEnd: 'touchend',
				onTouchMove: 'touchmove',
				onTouchStart: 'touchstart',
				onWheel: 'wheel'
	};
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// import Inferno from '../..';
	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _getRecycledFragment = __webpack_require__(39);
	
	var _getRecycledFragment2 = _interopRequireDefault(_getRecycledFragment);
	
	var _updateFragment = __webpack_require__(3);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _attachFragmentList = __webpack_require__(19);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _enumFragmentValueTypes = __webpack_require__(2);
	
	var _enumFragmentValueTypes2 = _interopRequireDefault(_enumFragmentValueTypes);
	
	var _insertFragment = __webpack_require__(40);
	
	var _insertFragment2 = _interopRequireDefault(_insertFragment);
	
	var _render = __webpack_require__(9);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _enumTemplateTypes = __webpack_require__(10);
	
	var _enumTemplateTypes2 = _interopRequireDefault(_enumTemplateTypes);
	
	var _templateCreateElement = __webpack_require__(54);
	
	var _templateCreateElement2 = _interopRequireDefault(_templateCreateElement);
	
	var _utilBind = __webpack_require__(63);
	
	var _utilBind2 = _interopRequireDefault(_utilBind);
	
	function attachFragment(context, fragment, parentDom, component, nextFragment, replace) {
		var fragmentComponent = fragment.component;
	
		if (fragmentComponent) {
			if (typeof fragmentComponent === 'function') {
				fragmentComponent = fragment.component = new fragmentComponent(fragment.props);
				fragmentComponent.context = null;
				fragmentComponent.forceUpdate = _render2['default'].bind(null, (0, _utilBind2['default'])(fragmentComponent, fragmentComponent.render), parentDom, fragmentComponent);
				fragmentComponent.forceUpdate();
			}
			return;
		}
	
		var template = fragment.template;
		var templateKey = template.key;
	
		if (context.shouldRecycle === true) {
			var recycledFragment = (0, _getRecycledFragment2['default'])(templateKey);
			if (recycledFragment != null) {
				(0, _updateFragment2['default'])(context, recycledFragment, fragment, parentDom, component);
				(0, _insertFragment2['default'])(context, parentDom, fragment.dom, nextFragment, replace);
				return;
			}
		}
	
		//there are different things we need to check for now
		switch (template.type) {
			case _enumTemplateTypes2['default'].TEMPLATE_API:
				template(fragment);
				break;
			case _enumTemplateTypes2['default'].FUNCTIONAL_API:
				var createElement = (0, _utilBind2['default'])(fragment, _templateCreateElement2['default']);
				var params = [createElement],
				    length = fragment.templateValue != null && 1 || fragment.templateValues && fragment.templateValues.length || 0;
	
				//create our pointers, for example 0,1,2,3,4,5 as params to pass through
				for (var i = 0; i < length; i++) {
					params.push({ pointer: i });
				}
				fragment.dom = template.apply(null, params);
				break;
			default:
				template(fragment);
				break;
		}
		//if this fragment has a single value, we attach only that value
		if (fragment.templateValue) {
			switch (fragment.templateType) {
				case _enumFragmentValueTypes2['default'].LIST:
					(0, _attachFragmentList2['default'])(context, fragment.templateValue, fragment.templateElement);
					break;
				case _enumFragmentValueTypes2['default'].FRAGMENT:
				case _enumFragmentValueTypes2['default'].LIST_REPLACE:
					attachFragment(context, fragment.templateValue, fragment.templateElement, component);
					break;
				case _enumFragmentValueTypes2['default'].FRAGMENT_REPLACE:
					attachFragment(context, fragment.templateValue, parentDom, fragment.templateElement, true);
					fragment.templateElement = fragment.templateValue.dom.parentNode;
					break;
				case _enumFragmentValueTypes2['default'].ATTR_REF:
					fragment.templateValue.element = fragment.templateElement;
					break;
			}
		} else if (fragment.templateValues) {
			//if the fragment has multiple values, we must loop through them all and attach them
			//pulling this block of code out into its own function caused strange things to happen
			//with performance. it was faster in Gecko but far slower in v8
			for (var i = 0, _length = fragment.templateValues.length; i < _length; i++) {
				var element = fragment.templateElements[i],
				    value = fragment.templateValues[i];
	
				switch (fragment.templateTypes[i]) {
					case _enumFragmentValueTypes2['default'].LIST:
						(0, _attachFragmentList2['default'])(context, value, element);
						break;
					case _enumFragmentValueTypes2['default'].LIST_REPLACE:
						var nodeList = document.createDocumentFragment(),
						    placeholderNode = fragment.templateElements[i],
						    parentElem = placeholderNode.parentNode;
	
						(0, _attachFragmentList2['default'])(context, value, nodeList);
						parentElem.replaceChild(nodeList, placeholderNode);
						fragment.templateElements[i] = parentElem;
						break;
					case _enumFragmentValueTypes2['default'].FRAGMENT:
						attachFragment(context, fragment.templateValues[i], fragment.templateElements[i], component);
						break;
					case _enumFragmentValueTypes2['default'].FRAGMENT_REPLACE:
						attachFragment(context, value, parentDom, component, element, true);
						fragment.templateElements[i] = value.dom.parentNode;
						break;
					case _enumFragmentValueTypes2['default'].ATTR_REF:
						fragment.templateValues[i].element = fragment.templateElements[i];
						break;
				}
			}
		}
	
		(0, _insertFragment2['default'])(context, parentDom, fragment.dom, nextFragment, replace);
	}
	
	exports['default'] = attachFragment;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _destroyFragment = __webpack_require__(21);
	
	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);
	
	exports['default'] = function (context, parentDom, item) {
		var domItem = item.dom;
	
		(0, _destroyFragment2['default'])(context, item);
		parentDom.removeChild(domItem);
	};
	
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _varsContexts = __webpack_require__(18);
	
	var _varsContexts2 = _interopRequireDefault(_varsContexts);
	
	exports['default'] = function (dom) {
		for (var i = 0; i < _varsContexts2['default'].length; i++) {
			if (_varsContexts2['default'][i].dom === dom) {
				return _varsContexts2['default'][i];
			}
		}
		return null;
	};
	
	module.exports = exports['default'];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _varsContexts = __webpack_require__(18);
	
	var _varsContexts2 = _interopRequireDefault(_varsContexts);
	
	exports['default'] = function (dom) {
		var idx = _varsContexts2['default'].length;
	
		while (idx--) {
			if (_varsContexts2['default'][idx].dom === dom) {
				_varsContexts2['default'].splice(idx, 1);
				return;
			}
		}
	};
	
	module.exports = exports['default'];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _eventsAddRootListener = __webpack_require__(47);
	
	var _eventsAddRootListener2 = _interopRequireDefault(_eventsAddRootListener);
	
	var _varsContexts = __webpack_require__(18);
	
	var _varsContexts2 = _interopRequireDefault(_varsContexts);
	
	var _getContext = __webpack_require__(7);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(3);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var initialisedListeners = false;
	
	function render(fragment, dom, component) {
		var context = undefined,
		    generatedFragment = undefined;
	
		if (component) {
			if (component.context) {
				generatedFragment = fragment();
				context = component.context;
				(0, _updateFragment2['default'])(context, context.fragment, generatedFragment, dom, component, false);
				context.fragment = generatedFragment;
			} else {
				generatedFragment = fragment();
				context = component.context = {
					fragment: generatedFragment,
					dom: dom,
					shouldRecycle: true
				};
				component.componentWillMount();
				(0, _attachFragment2['default'])(context, generatedFragment, dom, component);
				component.componentDidMount();
			}
		} else {
			if (initialisedListeners === false) {
				(0, _eventsAddRootListener2['default'])();
				initialisedListeners = true;
			}
			context = (0, _getContext2['default'])(dom);
	
			if (context) {
				(0, _updateFragment2['default'])(context, context.fragment, fragment, dom, component, false);
				context.fragment = fragment;
			} else {
				context = {
					fragment: fragment,
					dom: dom,
					shouldRecycle: true
				};
				(0, _attachFragment2['default'])(context, fragment, dom, component);
				_varsContexts2['default'].push(context);
			}
		}
	}
	
	exports['default'] = render;
	module.exports = exports['default'];

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports["default"] = {
		TEMPLATE_API: 1,
		FUNCTIONAL_API: 2
	};
	module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = addEventListener;
	
	var _sharedRootListeners = __webpack_require__(13);
	
	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);
	
	var _sharedEvents = __webpack_require__(4);
	
	var _sharedEvents2 = _interopRequireDefault(_sharedEvents);
	
	function addEventListener(parentDom, listenerName, callback) {
		_sharedRootListeners2['default'][_sharedEvents2['default'][listenerName]].push({
			target: parentDom,
			callback: callback
		});
	}
	
	module.exports = exports['default'];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = clearEventListeners;
	
	var _sharedRootListeners = __webpack_require__(13);
	
	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);
	
	var _sharedEvents = __webpack_require__(4);
	
	var _sharedEvents2 = _interopRequireDefault(_sharedEvents);
	
	function clearEventListeners(parentDom, listenerName) {
		var listeners = _sharedRootListeners2['default'][_sharedEvents2['default'][listenerName]],
		    index = 0;
	
		while (index < listeners.length) {
			if (listeners[index].target === parentDom) {
				listeners.splice(index, 1);
				index = 0;
			}
			index++;
		}
	}
	
	module.exports = exports['default'];

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var rootListeners = {};
	
	exports["default"] = {
	
	    blur: [],
	    change: [],
	    click: [],
	    contextmenu: [],
	    copy: [],
	    cut: [],
	    dblclick: [],
	    drag: [],
	    dragend: [],
	    dragenter: [],
	    dragexit: [],
	    dragleave: [],
	    dragover: [],
	    dragstart: [],
	    drop: [],
	    error: [],
	    focus: [],
	    input: [],
	    invalid: [],
	    keydown: [],
	    keypress: [],
	    keyup: [],
	    load: [],
	    mousedown: [],
	    mouseenter: [],
	    mouseleave: [],
	    mousemove: [],
	    mouseout: [],
	    mouseover: [],
	    mouseup: [],
	    paste: [],
	    reset: [],
	    scroll: [],
	    submit: [],
	    touchcancel: [],
	    touchend: [],
	    touchmove: [],
	    touchstart: [],
	    wheel: []
	};
	module.exports = exports["default"];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _cfgAttrNameCfg = __webpack_require__(52);
	
	var _cfgAttrNameCfg2 = _interopRequireDefault(_cfgAttrNameCfg);
	
	var _cfgPropNameCfg = __webpack_require__(53);
	
	var _cfgPropNameCfg2 = _interopRequireDefault(_cfgPropNameCfg);
	
	var _cfgXmlCfg = __webpack_require__(27);
	
	var _cfgXmlCfg2 = _interopRequireDefault(_cfgXmlCfg);
	
	var _cfgXlinkCfg = __webpack_require__(26);
	
	var _cfgXlinkCfg2 = _interopRequireDefault(_cfgXlinkCfg);
	
	var _hasPropertyAccessor = __webpack_require__(60);
	
	var _hasPropertyAccessor2 = _interopRequireDefault(_hasPropertyAccessor);
	
	var _validateAttribute = __webpack_require__(62);
	
	var _validateAttribute2 = _interopRequireDefault(_validateAttribute);
	
	var _dasherize = __webpack_require__(57);
	
	var _dasherize2 = _interopRequireDefault(_dasherize);
	
	var _camelize = __webpack_require__(51);
	
	var _camelize2 = _interopRequireDefault(_camelize);
	
	var _normalizeCSS = __webpack_require__(61);
	
	var _normalizeCSS2 = _interopRequireDefault(_normalizeCSS);
	
	var _utilInArray = __webpack_require__(64);
	
	var _utilInArray2 = _interopRequireDefault(_utilInArray);
	
	var _utilIsArray = __webpack_require__(16);
	
	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);
	
	var _utilIsSVG = __webpack_require__(17);
	
	var _utilIsSVG2 = _interopRequireDefault(_utilIsSVG);
	
	var _utilTagName = __webpack_require__(65);
	
	var _utilTagName2 = _interopRequireDefault(_utilTagName);
	
	var _escapeHtml = __webpack_require__(58);
	
	var _escapeHtml2 = _interopRequireDefault(_escapeHtml);
	
	/**
	 * Applies a single attribute or property to a given Element. If the value is null
	 * or undefined, it is not set. Otherwise, the value is set
	 * as an attribute.
	 * @param {!Element} node
	 * @param {string} name The attribute's name.
	 * @param {?(boolean|number|string)=} value The attribute's value.
	 */
	var setAttribute = function setAttribute(node, name, value) {
		if (name === 'type' && (0, _utilTagName2['default'])(node) === 'input') {
			// Support: IE9-Edge
			var val = node.value; // value will be lost in IE if type is changed
			node.setAttribute(name, '' + value);
			// Check if val exist, if not we will get a stupid 'value=""' in the markup
			if (val) {
				node.value = val;
			}
		} else {
	
			// Avoid touching the DOM on falsy values
			if (value !== 'false') {
				node.setAttribute(_cfgAttrNameCfg2['default'][name] || name, '' + value); // cast to string
			}
		}
	};
	
	/**
	 * Applies the 'volume' attribute on a given Element
	 *
	 * @param {Object} node A DOM element.
	 * @param {String} name	 The attribute name to set.
	 * @param {String} value  The attribute value to set.
	 */
	var setVolumAttribute = function setVolumAttribute(node, name, value) {
		// The 'volume' attribute can only contain a number in the range 0.0 to 1.0, where 0.0 is the
		// quietest and 1.0 the loudest. So we optimize by checking for the most obvious first...
		if (value === 0.0 || value === 1 || typeof value === 'number' && (value > -1 && value < 1.1)) {
			node.setAttribute(name, value);
		}
	};
	/**
	 * Applies a custom attribute on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name	  The attribute name
	 * @param {*} value value The attribute value
	 */
	var setCustomAttribute = function setCustomAttribute(node, name, value) {
		// Custom attributes are the only arributes we are validating.
		if ((0, _validateAttribute2['default'])(name)) {
			// All attributes are lowercase
			node.setAttribute((_cfgAttrNameCfg2['default'][name] || name).toLowerCase(), '' + value); // cast to string
		}
	};
	
	/**
	 * Applies a numeric attribute on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name	  The numeric attribute name
	 * @param {*} value  The numeric attribute value
	 */
	var setNumericAttribute = function setNumericAttribute(node, name, value) {
		if (value > 0 && typeof value === 'number') {
			node.setAttribute(name, value);
		}
	};
	
	/**
	 * Applies a property on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name	  The property name
	 * @param {string} value	 The property value
	 */
	var setProperty = function setProperty(node, name, value) {
	
		if (value != null) {
	
			// 'contentEditable' is a special case
			if (name === 'contentEditable' && value) {
				/**
	    * We would need this check here, else it will throw:
	    *
	    * ' Failed to set the 'contentEditable' property on 'HTMLElement': The value
	    * ' provided ('contentEditable') is not one of 'true', 'false', 'plaintext-only', or 'inherit'.'
	    */
	
				// Workaround for the 'contentEditable' property
				var cEValue = undefined;
	
				switch (value) {
					case true:
						cEValue = value;
						break;
					case false:
						cEValue = value;
						break;
					case 'plaintext-only':
						cEValue = value;
						break;
					case 'inherit':
						cEValue = value;
						break;
					default:
						cEValue = 'inherit';
				}
	
				value = cEValue;
			}
	
			node[_cfgPropNameCfg2['default'][name] || name] = value;
		}
	};
	
	/**
	 * Applies the selectedIndex property on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {String} name	  The property name to set.
	 * @param {*} value  The property value to set.
	 */
	var setSelectedIndexProperty = function setSelectedIndexProperty(node, name, value) {
	
		// selectbox has special case
		if (Array.prototype.every.call(node.options, function (opt) {
			return !(opt.selected = opt.value === value);
		})) {
			// TODO! Fix this so we use a normal iteration loop, and avoid using 'Array.prototype.every'.
			node[name] = -1;
		}
	};
	
	/**
	 * Applies a dataset object property on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name  The property name
	 * @param {*} value  The property value
	 */
	var setPropertyForDataset = function setPropertyForDataset(node, name, value) {
		if ((undefined) !== 'production') {
			var typeOfVal = typeof value;
			if (typeOfVal !== 'object') {
				console.error('Error! "' + name + '" attribute expects an object as a value, not a ' + typeOfVal);
				return;
			}
		}
	
		var prop = node[name];
	
		for (var idx in value) {
			// regarding the specs we need to camelize the 'name'
			prop[(0, _camelize2['default'])(idx)] = value[idx] == null ? '' : (0, _dasherize2['default'])(value[idx]);
		}
	};
	
	/**
	 * Applies a style to an Element. Vendor prefix expansion is done for
	 * property names/values as well as adding the 'px' suffix.
	 * @param {!Element} el
	 * @param {string} name The property's name.
	 * @param {string|Object<string,string>} style The style to set. Either a
	 *     string of css or an object containing property-value pairs.
	 */
	var applyStyle = function applyStyle(node, name, value) {
		// CSS style need to be a object literal, not a string value
		if ((undefined) !== 'production') {
			var typeOfVal = typeof value;
			if (typeOfVal !== 'object') {
				console.error('Error! "' + name + '" attribute expects an object as a value, not a ' + typeOfVal);
				return;
			}
		}
	
		var prop = node[name];
	
		for (var idx in value) {
			node.style[idx] = value[idx] == null ? '' : (0, _normalizeCSS2['default'])(idx, value[idx]);
		}
	};
	
	/**
	 * Applies a 'value' property on a given Element after validation check
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {string} name	  The property name
	 * @param {*} value  The property value
	 */
	var setValueForProperty = function setValueForProperty(node, name, value) {
		if (name === 'value' && (0, _utilTagName2['default'])(node) === 'select') {
			setSelectValue(node, value);
		} else {
			// Need to validate this else it will fail when we update fragments etc.
			node[name] !== value && (node[name] = value);
		}
	};
	
	/**
	 * Applies a select / select multiple attribute on a given Element
	 *
	 * @param {!Element} node  A DOM element.
	 * @param {String|Array} value  The property value
	 */
	
	var setSelectValue = function setSelectValue(node, value) {
	
		var multiple = (0, _utilIsArray2['default'])(value),
		    options = node.options;
	
		var optionNode = undefined;
		for (var i = 0; i < options.length; i++) {
			optionNode = options[i];
			optionNode.selected = value != null && (multiple ? (0, _utilInArray2['default'])(value, optionNode.value) : optionNode.value == value);
		}
	};
	
	/**
	 * Render HTML attributes to a string for SSR
	 *
	 * @param {string} name
	 * @param {*} value
	 * @return {string} Markup string, or empty string if the property was invalid.
	 */
	var createAttributeMarkup = function createAttributeMarkup(name, value) {
		return !(0, _validateAttribute2['default'])(name) || value == null ? '' : (_cfgAttrNameCfg2['default'][name] || name) + '="' + (0, _escapeHtml2['default'])(value + '') + '"';
	};
	
	/**
	 * Render HTML markup from a dataset property for SSR rendring
	 *
	 * @param {string} name The name to be set.
	 * @param {Object} value  The value to be set.
	 */
	var datasetToString = function datasetToString(name, value) {
		var objectLiteral = '';
		for (var objName in value) {
			objectLiteral += value[objName] != null && 'data-' + objName + '="' + (0, _dasherize2['default'])(value[objName]) + '" ';
		}
		return objectLiteral;
	};
	
	/**
	 * Render HTML markup from boolean attributes to string for SSR rendring
	 *
	 * @param {string} name  The attribute name
	 * @param {*} value  The attribute value
	 */
	var booleanAttrToString = function booleanAttrToString(name, value) {
		// XHTML friendly
		switch (name) {
			case 'download':
			case 'multiple':
				return value ? name : '';
			case false:
				return '';
			case true:
				return name + '="' + '"';
			default:
				return name + '="' + (0, _escapeHtml2['default'])(value + '') + '"'; // cast to string
		}
	};
	
	/**
	 * Render CSS style property to string for SSR rendring
	 *
	 * @param {string} name  The attribute name
	 * @param {*} value The property value
	 */
	var createPropertyMarkup = function createPropertyMarkup(name, value) {
		var styles = '';
	
		for (var styleName in value) {
			value[styleName] != null && (styles += (0, _dasherize2['default'])(styleName) + ':' + (0, _normalizeCSS2['default'])(styleName, value[styleName]) + ';');
		}
	
		return styles ? name + '="' + styles + '"' : styles;
	};
	
	var IS_ATTRIBUTE = {
		set: setAttribute,
		toHtml: createAttributeMarkup
	};
	
	var IS_CUSTOM = {
		set: setCustomAttribute,
		toHtml: createAttributeMarkup
	};
	
	var IS_VOLUME_ATTRIBUTE = {
		set: setVolumAttribute,
		toHtml: createAttributeMarkup
	};
	
	var IS_NUMERIC = {
		set: setNumericAttribute,
		toHtml: createAttributeMarkup
	};
	
	var IS_PROPERTY = {
		set: setProperty,
		toHtml: createAttributeMarkup
	};
	
	var IS_SELECTED_PROPERTY = {
		set: setSelectedIndexProperty,
		toHtml: createAttributeMarkup
	};
	
	var IS_XLINK_NAMESPACE = {
	
		/**
	  * Applies a xlink namespace attribute on a given Element
	  *
	  * @param {!Element} node  A DOM element.
	  * @param {string} name  The attribute name
	  * @param {*} value	The attribute value
	  */
		set: function set(node, name, value) {
			node.setAttributeNS('http://www.w3.org/1999/xlink', _cfgXlinkCfg2['default'][name], value);
		},
	
		toHtml: createAttributeMarkup
	};
	
	var IS_XML_NAMESPACE = {
	
		/**
	  * Applies a xlink namespace attribute on a given Element
	  *
	  * @param {!Element} node  A DOM element.
	  * @param {string} name The attribute name
	  * @param {*} value The attribute value
	  */
		set: function set(node, name, value) {
			node.setAttributeNS('http://www.w3.org/XML/1998/namespace', _cfgXmlCfg2['default'][name], value);
		},
		toHtml: createAttributeMarkup
	};
	
	var DOMConfig = {
		acceptCharset: IS_ATTRIBUTE,
		accept: IS_ATTRIBUTE,
		allowTransparency: IS_ATTRIBUTE,
		charSet: IS_ATTRIBUTE,
		challenge: IS_ATTRIBUTE,
		classID: IS_ATTRIBUTE,
		className: _utilIsSVG2['default'] ? IS_ATTRIBUTE : IS_PROPERTY,
		clipPath: IS_ATTRIBUTE,
		cols: IS_NUMERIC,
		crossOrigin: IS_ATTRIBUTE,
		contentEditable: IS_PROPERTY,
		contextMenu: IS_ATTRIBUTE,
		cx: IS_ATTRIBUTE,
		cy: IS_ATTRIBUTE,
		d: IS_ATTRIBUTE,
		data: IS_ATTRIBUTE,
		dateTime: IS_ATTRIBUTE,
	
		/**
	  * 'dataset' is a special case
	  *
	  */
		dataset: {
			set: setPropertyForDataset,
			// 'dataset' property has to be removed as an attribute
			// because it's set as an attribute - e.g. data-foo='bar'
			toHtml: datasetToString
		},
		defaultPlaybackRate: IS_PROPERTY,
		designMode: IS_PROPERTY,
		dir: IS_ATTRIBUTE,
		dropzone: IS_ATTRIBUTE,
		dx: IS_ATTRIBUTE,
		dy: IS_ATTRIBUTE,
		encType: IS_ATTRIBUTE,
		file: IS_ATTRIBUTE,
		fill: IS_ATTRIBUTE,
		fillOpacity: IS_ATTRIBUTE,
		form: IS_ATTRIBUTE,
		formAction: IS_ATTRIBUTE,
		formEncType: IS_ATTRIBUTE,
		formMethod: IS_ATTRIBUTE,
		formTarget: IS_ATTRIBUTE,
		fontFamily: IS_ATTRIBUTE,
		fontSize: IS_ATTRIBUTE,
		frameBorder: IS_ATTRIBUTE,
		'for': IS_ATTRIBUTE,
		fx: IS_ATTRIBUTE,
		fy: IS_ATTRIBUTE,
		height: _utilIsSVG2['default'] ? IS_ATTRIBUTE : IS_PROPERTY,
		icon: IS_ATTRIBUTE,
		inputMode: IS_ATTRIBUTE,
		is: IS_ATTRIBUTE,
		keyParams: IS_ATTRIBUTE,
		keyType: IS_ATTRIBUTE,
		lang: IS_ATTRIBUTE,
		list: IS_ATTRIBUTE,
		manifest: IS_ATTRIBUTE,
		marginHeight: IS_ATTRIBUTE,
		marginWidth: IS_ATTRIBUTE,
		markerEnd: IS_ATTRIBUTE,
		markerMid: IS_ATTRIBUTE,
		markerStart: IS_ATTRIBUTE,
		maxLength: IS_ATTRIBUTE,
		max: IS_ATTRIBUTE,
		media: IS_ATTRIBUTE,
		mediagroup: IS_ATTRIBUTE,
		minLength: IS_ATTRIBUTE,
		name: IS_ATTRIBUTE,
		nohref: IS_ATTRIBUTE,
		// number used once or number once
		nonce: IS_NUMERIC,
		noshade: IS_ATTRIBUTE,
		opacity: IS_ATTRIBUTE,
		points: IS_ATTRIBUTE,
		poster: IS_ATTRIBUTE,
		prefix: IS_ATTRIBUTE,
		r: IS_ATTRIBUTE,
		resource: IS_ATTRIBUTE,
		role: IS_ATTRIBUTE,
		rows: IS_NUMERIC,
		rx: IS_ATTRIBUTE,
		ry: IS_ATTRIBUTE,
		selectedIndex: IS_SELECTED_PROPERTY,
		size: IS_NUMERIC,
		// Viewport-based selection
		sizes: IS_ATTRIBUTE,
		span: IS_NUMERIC,
		stroke: IS_ATTRIBUTE,
		src: IS_ATTRIBUTE,
		srcSet: IS_ATTRIBUTE,
		start: IS_ATTRIBUTE,
		step: IS_ATTRIBUTE,
		tabIndex: IS_PROPERTY,
		target: IS_ATTRIBUTE,
		transform: IS_ATTRIBUTE,
		title: IS_ATTRIBUTE,
		type: IS_ATTRIBUTE,
		'typeof': IS_ATTRIBUTE,
	
		/**
	  * CSS styling attribute is a special case, and will be set as a normal object.
	  * 'styles' should be used as an replacement.
	  */
		style: {
			set: applyStyle,
			toHtml: createPropertyMarkup
		},
		usemap: IS_ATTRIBUTE,
	
		/**
	  * 'value' is a special case
	  *
	  */
		value: {
			set: setValueForProperty,
			toHtml: createAttributeMarkup
		},
		version: IS_ATTRIBUTE,
		viewBox: IS_ATTRIBUTE,
		volume: IS_VOLUME_ATTRIBUTE,
		width: _utilIsSVG2['default'] ? IS_ATTRIBUTE : IS_PROPERTY,
		wmode: IS_ATTRIBUTE,
		x1: IS_ATTRIBUTE,
		x2: IS_ATTRIBUTE,
		x: IS_ATTRIBUTE,
		y1: IS_ATTRIBUTE,
		y2: IS_ATTRIBUTE,
		y: IS_ATTRIBUTE,
	
		/**
	  * Non-standard attributes
	  */
	
		// itemProp, itemScope, itemType are for
		// Microdata support. See http://schema.org/docs/gs.html
		itemProp: IS_ATTRIBUTE,
		itemType: IS_ATTRIBUTE,
		// itemID and itemRef are for Microdata support as well but
		// only specified in the the WHATWG spec document. See
		// https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
		itemID: IS_ATTRIBUTE,
		itemRef: IS_ATTRIBUTE,
		// IE-only attribute that specifies security restrictions on an iframe
		// as an alternative to the sandbox attribute on IE<10
		security: IS_ATTRIBUTE,
		// IE-only attribute that controls focus behavior
		unselectable: IS_ATTRIBUTE,
	
		/**
	  * Namespace attributes
	  */
		'xml:base': IS_XML_NAMESPACE,
		'xml:id': IS_XML_NAMESPACE,
		'xml:lang': IS_XML_NAMESPACE,
		'xml:space': IS_XML_NAMESPACE,
		'xlink:actuate': IS_XLINK_NAMESPACE,
		'xlink:arcrole': IS_XLINK_NAMESPACE,
		'xlink:href': IS_XLINK_NAMESPACE,
		'xlink:role': IS_XLINK_NAMESPACE,
		'xlink:show': IS_XLINK_NAMESPACE,
		'xlink:title': IS_XLINK_NAMESPACE,
		'xlink:type': IS_XLINK_NAMESPACE,
	
		/**
	  * Navigation attributes (SVG)
	  */
		'nav-up': IS_ATTRIBUTE,
		'nav-up-right': IS_ATTRIBUTE,
		'nav-right': IS_ATTRIBUTE,
		'nav-down-right': IS_ATTRIBUTE,
		'nav-down': IS_ATTRIBUTE,
		'nav-down-left': IS_ATTRIBUTE,
		'nav-left': IS_ATTRIBUTE,
		'xlink:role': IS_ATTRIBUTE,
		'nav-up-left ': IS_ATTRIBUTE,
	
		/**
	  * Conditional processing attributes (SVG)
	  */
	
		'requiredExtensions': IS_ATTRIBUTE,
		'requiredFeatures': IS_ATTRIBUTE,
		'requiredFonts': IS_ATTRIBUTE,
		'requiredFormats': IS_ATTRIBUTE,
		'systemLanguage': IS_ATTRIBUTE,
	
		/**
	  * Timing attributes (SVG)
	  */
	
		dur: IS_ATTRIBUTE,
		end: IS_ATTRIBUTE,
		restart: IS_ATTRIBUTE,
		repeatCount: IS_ATTRIBUTE,
		repeatDur: IS_ATTRIBUTE,
		fill: IS_ATTRIBUTE
	
	};
	
	exports['default'] = {
	
		/**
	  * Apply a HTML attribute / property on a given Element
	  *
	  * @param {!Element} node  A DOM element.
	  * @param {string} name The attribute / property name
	  * @param {String|Object} value The attribute / property value
	  */
		set: function set(node, name, value, skip) {
	
			// Prioritized HTML properties
			if (!skip) {
				switch (name) {
					case 'id': // Core attribute
					case 'label':
					case 'placeholder':
					case 'name':
					case 'designMode':
					case 'htmlFor':
					case 'playbackRate':
					case 'preload':
					case 'srcDoc':
					case 'autoPlay': // bool
					case 'checked': // bool
					case 'isMap': // bool
					case 'loop': // bool
					case 'muted': // bool
					case 'readOnly': // bool
					case 'reversed':
					case 'required': // bool
					case 'selected': // bool
					case 'spellCheck': // bool
					case 'trueSpeed': // bool
					case 'multiple': // bool
					case 'controls': // bool
					case 'defer': // bool
					case 'noValidate':
					case 'scoped': // bool
					case 'noResize':
						// bool
						if (value != null) {
							node[name] = value;
						}
						return;
				}
			}
	
			// Prioritized HTML attributes
			switch (name) {
				case 'about': // RDFA
				case 'async': // bool
				case 'allowFullScreen': // bool
				case 'autoFocus': // bool
				case 'autoPlay': // bool
				case 'baseProfile': // SVG
				case 'capture': // bool
				case 'datatype': // RDFA
				case 'default':
				case 'defaultchecked': // bool
				case 'defaultmuted': // bool
				case 'defaultselected': // bool
				case 'draggable': // bool
				case 'download': // bool
				case 'disabled': // bool
				case 'dir': // Core attribute
				case 'draggable': // bool
				case 'dropzone': // bool
				case 'for':
				case 'form':
				case 'formNoValidate': // bool
				case 'formEncType':
				case 'formMethod':
				case 'formTarget':
				case 'fontFamily':
				case 'fontSize':
				case 'frameBorder':
				case 'fontWeight':
				case 'hidden': // bool
				case 'href':
				case 'itemScope': // bool
				case 'is':
				case 'integrity':
				case 'name':
				case 'open':
				// 'property' is also supported for OpenGraph in meta tags.
				case 'property': // RDFA
				case 'seamless':
				case 'sortable':
				case 'title': // Core attribute
				case 'translate': // bool attribute
				case 'typemustmatch': // bool attribute
				case 'type':
				case 'vocab': // RDFA
				case 'viewBox':
				case 'visible':
				case 'xmlns':
	
					if (value !== 'false') {
						node.setAttribute(name, '' + (value === 'true' ? '' : value));
					}
					return;
			}
	
			return (DOMConfig[name] || IS_CUSTOM).set(node, name, value);
		},
	
		/**
	  * Render HTML attribute / property markup for SSR
	  *
	  * @param {string} name The attribute / property name to render.
	  * @param {*} value The attribute / property value to render.
	  */
		toHtml: function toHtml(name, value) {
			return (DOMConfig[name] || IS_CUSTOM).toHtml(name, value);
		}
	};
	module.exports = exports['default'];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _addAttributes = __webpack_require__(50);
	
	var _addAttributes2 = _interopRequireDefault(_addAttributes);
	
	var _extendUnitlessNumber = __webpack_require__(59);
	
	var _extendUnitlessNumber2 = _interopRequireDefault(_extendUnitlessNumber);
	
	var _createElementWithoutIs = __webpack_require__(56);
	
	var _createElementWithoutIs2 = _interopRequireDefault(_createElementWithoutIs);
	
	var _createElementWithIs = __webpack_require__(55);
	
	var _createElementWithIs2 = _interopRequireDefault(_createElementWithIs);
	
	exports['default'] = {
	    addAttributes: _addAttributes2['default'],
	    extendUnitlessNumber: _extendUnitlessNumber2['default'],
	    createElement: function createElement(tag, xmlns, is) {
	        return is ? (0, _createElementWithIs2['default'])(tag, xmlns, is) : (0, _createElementWithoutIs2['default'])(tag, xmlns);
	    },
	    createTextNode: function createTextNode(text) {
	        return document.createTextNode(text);
	    },
	    createEmptyText: function createEmptyText() {
	        return document.createTextNode('');
	    }
	};
	module.exports = exports['default'];

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports["default"] = function (x) {
	  return x.constructor === Array;
	};
	
	module.exports = exports["default"];

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	var isSVG = undefined;
	
	if (document) {
		var implementation = document.implementation;
	
		isSVG = implementation && implementation.hasFeature && implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');
	}
	
	exports['default'] = isSVG;
	module.exports = exports['default'];

/***/ },
/* 18 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = [];
	module.exports = exports["default"];

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	function attachFragmentList(context, list, parentDom, component) {
		for (var i = 0; i < list.length; i++) {
			(0, _attachFragment2['default'])(context, list[i], parentDom, component);
		}
	}
	
	exports['default'] = attachFragmentList;
	module.exports = exports['default'];

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = createTemplate;
	
	var _enumTemplateTypes = __webpack_require__(10);
	
	var _enumTemplateTypes2 = _interopRequireDefault(_enumTemplateTypes);
	
	function createTemplate(templateFunction) {
		//give the function a random key
		templateFunction.key = 't' + Math.floor(Math.random() * 100000);
		templateFunction.type = _enumTemplateTypes2['default'].FUNCTIONAL_API;
		return templateFunction;
	}
	
	module.exports = exports['default'];

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _varsRecycledFragments = __webpack_require__(33);
	
	var _varsRecycledFragments2 = _interopRequireDefault(_varsRecycledFragments);
	
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
			var toRecycleForKey = _varsRecycledFragments2['default'][templateKey];
	
			if (!toRecycleForKey) {
				_varsRecycledFragments2['default'][templateKey] = toRecycleForKey = [];
			}
			toRecycleForKey.push(fragment);
		}
	}
	exports['default'] = destroyFragment;
	module.exports = exports['default'];

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _removeContext = __webpack_require__(8);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _badUpdate = __webpack_require__(35);
	
	var _badUpdate2 = _interopRequireDefault(_badUpdate);
	
	exports['default'] = function (fragment) {
		var component = fragment.component;
	
		component.componentWillUnmount();
		(0, _removeContext2['default'])(component.context.dom);
		component.forceUpdate = _badUpdate2['default'];
		component.context = null;
		component = null;
	};
	
	module.exports = exports['default'];

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = updateFragmentList;
	
	var _removeFragments = __webpack_require__(42);
	
	var _removeFragments2 = _interopRequireDefault(_removeFragments);
	
	var _removeFragment = __webpack_require__(6);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragmentList = __webpack_require__(19);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _attachFragment = __webpack_require__(5);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(3);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _moveFragment = __webpack_require__(41);
	
	var _moveFragment2 = _interopRequireDefault(_moveFragment);
	
	function updateFragmentList(context, oldList, list, parentDom, component, outerNextFragment) {
	
		if (oldList === list) {
			return;
		}
	
		var oldListLength = oldList.length;
		var listLength = list.length;
	
		if (listLength === 0) {
			(0, _removeFragments2['default'])(context, parentDom, oldList, 0, oldListLength);
			return;
		} else if (oldListLength === 0) {
			(0, _attachFragmentList2['default'])(context, list, parentDom, component);
			return;
		}
	
		if (oldListLength === 1 && listLength === 1) {
			(0, _updateFragment2['default'])(context, oldList[0], list[0], parentDom);
			return;
		}
	
		var oldEndIndex = oldListLength - 1;
		var endIndex = listLength - 1;
		var oldStartIndex = 0,
		    startIndex = 0;
		var successful = true;
		var nextItem = undefined;
		var oldItem = undefined,
		    item = undefined;
	
		outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
			var oldStartItem = undefined,
			    oldEndItem = undefined,
			    startItem = undefined,
			    endItem = undefined;
	
			successful = false;
			oldStartItem = oldList[oldStartIndex];
			startItem = list[startIndex];
			while (oldStartItem.key === startItem.key) {
				(0, _updateFragment2['default'])(context, oldStartItem, startItem, parentDom, component);
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
				(0, _updateFragment2['default'])(context, oldEndItem, endItem, parentDom, component);
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
				(0, _updateFragment2['default'])(context, oldStartItem, endItem, parentDom, component);
				(0, _moveFragment2['default'])(parentDom, endItem, nextItem);
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
				(0, _updateFragment2['default'])(context, oldEndItem, startItem, parentDom, component);
				(0, _moveFragment2['default'])(parentDom, startItem, nextItem);
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
				(0, _attachFragment2['default'])(context, item, parentDom, component, nextItem);
			}
		} else if (startIndex > endIndex) {
			(0, _removeFragments2['default'])(context, parentDom, oldList, oldStartIndex, oldEndIndex + 1);
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
					(0, _updateFragment2['default'])(context, oldItem, item, parentDom, component);
					if (parentDom.nextSibling !== (nextItem && nextItem.dom)) {
						(0, _moveFragment2['default'])(parentDom, item, nextItem);
					}
				} else {
					(0, _attachFragment2['default'])(context, item, parentDom, component, nextItem);
				}
				nextItem = item;
			}
			for (var i = oldStartIndex; i <= oldEndIndex; i++) {
				oldItem = oldList[i];
				if (oldListMap[oldItem.key] !== null) {
					(0, _removeFragment2['default'])(context, parentDom, oldItem);
				}
			}
		}
	}
	
	module.exports = exports['default'];

/***/ },
/* 24 */
/***/ function(module, exports) {

	/**
	 * Supported SVG elements
	 *
	 * @type {Array}
	 */
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = {
	  'animate': true,
	  'animateColor': true,
	  'animateMotion': true,
	  'circle': true,
	  'clipPath': true,
	  'color-profile': true,
	  'cursor': true,
	  'defs': true,
	  'ellipse': true,
	  'filter': true,
	  'font': true,
	  'font-face': true,
	  'g': true,
	  'glyph': true,
	  'glyphRef': true,
	  'line': true,
	  'linearGradient': true,
	  'marker': true,
	  'mask': true,
	  'path': true,
	  'pattern': true,
	  'polygon': true,
	  'polyline': true,
	  'radialGradient': true,
	  'rect': true,
	  'stop': true,
	  'svg': true,
	  'switch': true,
	  'symbol': true,
	  'text': true,
	  'textPath': true,
	  'title': true,
	  'tref': true,
	  'tspan': true
	};
	module.exports = exports['default'];

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _utilForIn = __webpack_require__(32);
	
	var _utilForIn2 = _interopRequireDefault(_utilForIn);
	
	var _prefixes = __webpack_require__(29);
	
	var _prefixes2 = _interopRequireDefault(_prefixes);
	
	var _prefixKey = __webpack_require__(28);
	
	var _prefixKey2 = _interopRequireDefault(_prefixKey);
	
	/**
	 * CSS properties which accept numbers but are not in units of 'px'.
	 */
	var unitless = {
		animationIterationCount: true,
		boxFlex: true,
		boxFlexGroup: true,
		boxOrdinalGroup: true,
		counterReset: true,
		counterIncrement: true,
		columnCount: true,
		flex: true,
		flexGrow: true,
		flexPositive: true,
		flexShrink: true,
		flexNegative: true,
		flexOrder: true,
		float: true,
		fontWeight: true,
		// Supports CSS3 Grid Layout Module
		gridRow: true,
		gridColumn: true,
		lineClamp: true,
		lineHeight: true,
		marker: true,
		opacity: true,
		order: true,
		orphans: true,
		pitchRange: true,
		richness: true,
		stress: true,
		tabSize: true,
		volume: true,
		widows: true,
		zIndex: true,
		zoom: true,
		// SVG-related properties
		stopOpacity: true,
		fillOpacity: true,
		strokeDashoffset: true,
		strokeOpacity: true,
		strokeWidth: true
	};
	
	// TODO merge with extendUnitlessNumber
	// convert to vendor prefixed unitless CSS properties
	(0, _utilForIn2['default'])(unitless, function (prop, value) {
		_prefixes2['default'].forEach(function (prefix) {
			unitless[(0, _prefixKey2['default'])(prefix, prop)] = value;
		});
	});
	
	exports['default'] = unitless;
	module.exports = exports['default'];

/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = {
		'xlink:actuate': 'actuate',
		'xlink:arcrole': 'arcrole',
		'xlink:href': 'href',
		'xlink:role': 'role',
		'xlink:show': 'show',
		'xlink:title': 'title',
		'xlink:type': 'type'
	};
	module.exports = exports['default'];

/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = {
		'xml:base': 'base',
		'xml:id': 'id',
		'xml:lang': 'lang',
		'xml:space': 'spac'
	};
	module.exports = exports['default'];

/***/ },
/* 28 */
/***/ function(module, exports) {

	/**
	 * @param {string} prefix vendor-specific prefix, eg: Webkit
	 * @param {string} key style name, eg: transitionDuration
	 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
	 * WebkitTransitionDuration
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	exports["default"] = function (prefix, key) {
	  return prefix + key.charAt(0).toUpperCase() + key.slice(1);
	};
	
	module.exports = exports["default"];

/***/ },
/* 29 */
/***/ function(module, exports) {

	/**
	 * Support style names that may come passed in prefixed by adding permutations
	 * of vendor prefixes.
	 */
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = ['Webkit', 'Khtml', 'Moz', 'ms', 'O'];
	module.exports = exports['default'];

/***/ },
/* 30 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = 'http://www.w3.org/1998/Math/MathML';
	module.exports = exports['default'];

/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = 'http://www.w3.org/2000/svg';
	module.exports = exports['default'];

/***/ },
/* 32 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports["default"] = function (obj, callback) {
		if (obj) {
			// v8 optimizing. To have a fast "for In", the "key" must be a pure local variable
			for (var key in obj) {
				callback(key, obj[key]);
			}
		}
		return obj;
	};
	
	module.exports = exports["default"];

/***/ },
/* 33 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = {};
	module.exports = exports["default"];

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// TODO! Finish this
	
	"use strict";
	
	var _createClass = __webpack_require__(68)["default"];
	
	var _classCallCheck = __webpack_require__(67)["default"];
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var Component = (function () {
		function Component(props, context) {
			_classCallCheck(this, Component);
	
			this.props = props;
			this.context = context;
			// TODO this.state should not be defined by default
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
			value: function setState(newStateItems) {
				for (var stateItem in newStateItems) {
					this.state[stateItem] = newStateItems[stateItem];
				}
				this.forceUpdate();
			}
		}, {
			key: "replaceState",
			value: function replaceState(newState) {
				this.state = newState;
				this.forceUpdate();
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
		}]);
	
		return Component;
	})();
	
	exports["default"] = Component;
	module.exports = exports["default"];

/***/ },
/* 35 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	exports['default'] = function () {
		console.warn('Update called on a component that is no longer mounted!');
	};
	
	module.exports = exports['default'];

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = clearDomElement;
	
	var _coreGetContext = __webpack_require__(7);
	
	var _coreGetContext2 = _interopRequireDefault(_coreGetContext);
	
	var _coreRemoveContext = __webpack_require__(8);
	
	var _coreRemoveContext2 = _interopRequireDefault(_coreRemoveContext);
	
	function clearDomElement(dom) {
		var context = (0, _coreGetContext2['default'])(dom);
		if (context != null) {
			(0, _coreRemoveContext2['default'])(dom);
		}
		dom.innerHTML = '';
	}
	
	module.exports = exports['default'];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = createFragment;
	
	var _utilIsArray = __webpack_require__(16);
	
	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);
	
	var _createTemplate = __webpack_require__(20);
	
	var _createTemplate2 = _interopRequireDefault(_createTemplate);
	
	function createFragment(values, template) {
		var key = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	
		if (template.key == null) {
			template = (0, _createTemplate2['default'])(template);
		}
	
		var fragmentObject = {
			dom: null,
			key: key,
			next: null,
			template: template
		};
	
		if (values != null && (0, _utilIsArray2['default'])(values)) {
			if (values.length === 1) {
				fragmentObject.templateElement = null;
				fragmentObject.templateType = null;
				fragmentObject.templateValue = values[0];
			} else {
				fragmentObject.templateElements = new Array(values.length);
				fragmentObject.templateTypes = new Array(values.length);
				fragmentObject.templateValues = values;
			}
		} else {
			fragmentObject.templateElement = null;
			fragmentObject.templateType = null;
			fragmentObject.templateValue = values;
		}
	
		return fragmentObject;
	}
	
	module.exports = exports['default'];

/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = createRef;
	
	function createRef() {
	    return {
	        element: null
	    };
	}
	
	;
	module.exports = exports["default"];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _varsRecycledFragments = __webpack_require__(33);
	
	var _varsRecycledFragments2 = _interopRequireDefault(_varsRecycledFragments);
	
	exports['default'] = function (templateKey) {
	
		var fragments = _varsRecycledFragments2['default'][templateKey];
		if (!fragments || fragments.length === 0) {
	
			return null;
		}
		return fragments.pop();
	};
	
	module.exports = exports['default'];

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = insertFragment;
	
	var _destroyFragment = __webpack_require__(21);
	
	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);
	
	function insertFragment(fragment, parent, container, nextFragment, replace) {
	
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
	                (0, _destroyFragment2['default'])(fragment, nextFragment);
	            }
	
	            parent.replaceChild(container, domNextFragment);
	
	            return;
	        }
	
	        parent.insertBefore(container, domNextFragment);
	    } else {
	
	        parent.appendChild(container);
	    }
	}
	
	module.exports = exports['default'];

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports["default"] = function (parentDom, item, nextItem) {
		var domItem = item.dom,
		    domRefItem = nextItem && nextItem.dom;
	
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
	
	module.exports = exports["default"];

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _removeFragment = __webpack_require__(6);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	exports['default'] = function (context, parentDom, fragments, i, to) {
		for (; i < to; i++) {
			(0, _removeFragment2['default'])(context, parentDom, fragments[i]);
		}
	};
	
	module.exports = exports['default'];

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = renderToString;
	
	var _render = __webpack_require__(9);
	
	var _render2 = _interopRequireDefault(_render);
	
	var _template = __webpack_require__(15);
	
	var _template2 = _interopRequireDefault(_template);
	
	function renderToString(fragment, component) {
	
		var dom = _template2['default'].createElement('div');
	
		(0, _render2['default'])(fragment, dom, component);
	
		return dom.innerHTML;
	}
	
	module.exports = exports['default'];

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _removeFragment = __webpack_require__(6);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _removeContext = __webpack_require__(8);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _getContext = __webpack_require__(7);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _unmountComponentAtFragment = __webpack_require__(22);
	
	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);
	
	exports['default'] = function (dom) {
		var context = (0, _getContext2['default'])(dom);
	
		if (context !== null) {
			var component = context.fragment.component;
	
			if (component) {
				(0, _removeFragment2['default'])(context, dom, component.fragment);
				(0, _unmountComponentAtFragment2['default'])(component.fragment);
			} else {
				(0, _removeFragment2['default'])(context, dom, context.fragment);
				(0, _removeContext2['default'])(dom);
			}
		}
	};
	
	module.exports = exports['default'];

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _updateFragment = __webpack_require__(3);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _enumFragmentValueTypes = __webpack_require__(2);
	
	var _enumFragmentValueTypes2 = _interopRequireDefault(_enumFragmentValueTypes);
	
	var _updateFragmentList = __webpack_require__(23);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _eventsClearEventListeners = __webpack_require__(12);
	
	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);
	
	var _eventsAddEventListener = __webpack_require__(11);
	
	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);
	
	var _eventsSharedEvents = __webpack_require__(4);
	
	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);
	
	var _utilIsSVG = __webpack_require__(17);
	
	var _utilIsSVG2 = _interopRequireDefault(_utilIsSVG);
	
	var _templateAttributeOps = __webpack_require__(14);
	
	var _templateAttributeOps2 = _interopRequireDefault(_templateAttributeOps);
	
	function updateFragmentValue(context, oldFragment, fragment, component) {
		var element = oldFragment.templateElement,
		    type = oldFragment.templateType;
	
		fragment.templateElement = element;
		fragment.templateType = type;
	
		if (fragment.templateValue !== oldFragment.templateValue) {
	
			switch (type) {
				case _enumFragmentValueTypes2['default'].LIST:
				case _enumFragmentValueTypes2['default'].LIST_REPLACE:
					(0, _updateFragmentList2['default'])(context, oldFragment.templateValue, fragment.templateValue, element, component);
					return;
				case _enumFragmentValueTypes2['default'].TEXT:
					element.firstChild.nodeValue = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].TEXT_DIRECT:
					element.nodeValue = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].FRAGMENT:
				case _enumFragmentValueTypes2['default'].FRAGMENT_REPLACE:
					(0, _updateFragment2['default'])(context, oldFragment.templateValue, fragment.templateValue, element, component);
					return;
				case _enumFragmentValueTypes2['default'].ATTR_CLASS:
					// To set className on SVG elements, it's necessary to use .setAttribute;
					// this works on HTML elements too in all browsers.
					// If this kills the performance, we have to consider not to support SVG
					if (_utilIsSVG2['default']) {
						element.setAttribute('class', fragment.templateValue);
					} else {
						element.className = fragment.templateValue;
					}
					return;
				case _enumFragmentValueTypes2['default'].ATTR_ID:
					element.id = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_NAME:
					element.name = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_LABEL:
					element.label = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_PLACEHOLDER:
					element.placeholder = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_DESIGNMODE:
					element.designMode = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_HTMLFOR:
					element.htmlFor = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_PLAYBACKRATE:
					element.playbackRate = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_PRELOAD:
					element.preload = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_SRCDOC:
					element.srcDoc = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_AUTOPLAY:
					element.autoPlay = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_CHECKED:
					element.checked = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_ISMAP:
					element.isMap = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_LOOP:
					element.loop = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_MUTED:
					element.muted = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_READONLY:
					element.readOnly = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_REVERSED:
					element.reversed = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_REQUIRED:
					element.required = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_SELECTED:
					element.selected = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_SPELLCHECK:
					element.spellCheck = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_TRUESPEED:
					element.truespeed = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_MULTIPLE:
					element.multiple = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_CONTROLS:
					element.controls = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_DEFER:
					element.defer = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_NOVALIDATE:
					element.noValidate = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_SCOPED:
					element.scoped = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_NO_RESIZE:
					element.noResize = fragment.templateValue;
					return;
				case _enumFragmentValueTypes2['default'].ATTR_WIDTH:
					if (_utilIsSVG2['default']) {
						element.setAttribute('width', fragment.templateValue);
					} else {
						element.width = fragment.templateValue;
					}
					return;
				case _enumFragmentValueTypes2['default'].ATTR_HEIGHT:
					if (_utilIsSVG2['default']) {
						element.setAttribute('height', fragment.templateValue);
					} else {
						element.height = fragment.templateValue;
					}
					return;
				default:
					// TODO make component props work for single value fragments
					if (element.props) {
						// component prop, update it
					} else {
							if (_eventsSharedEvents2['default'][type] != null) {
								(0, _eventsClearEventListeners2['default'])(element, type);
								(0, _eventsAddEventListener2['default'])(element, type, fragment.templateValue);
							} else {
								_templateAttributeOps2['default'].set(element, type, fragment.templateValue, true);
							}
						}
			}
		}
	}
	
	exports['default'] = updateFragmentValue;
	module.exports = exports['default'];

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _updateFragment = __webpack_require__(3);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _enumFragmentValueTypes = __webpack_require__(2);
	
	var _enumFragmentValueTypes2 = _interopRequireDefault(_enumFragmentValueTypes);
	
	var _updateFragmentList = __webpack_require__(23);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _eventsClearEventListeners = __webpack_require__(12);
	
	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);
	
	var _eventsAddEventListener = __webpack_require__(11);
	
	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);
	
	var _eventsSharedEvents = __webpack_require__(4);
	
	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);
	
	var _utilIsSVG = __webpack_require__(17);
	
	var _utilIsSVG2 = _interopRequireDefault(_utilIsSVG);
	
	var _templateAttributeOps = __webpack_require__(14);
	
	var _templateAttributeOps2 = _interopRequireDefault(_templateAttributeOps);
	
	// TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
	// refactored to by more DRY. although, this causes a significant performance cost
	// on the v8 compiler. need to explore how to refactor without introducing this performance cost
	function updateFragmentValues(context, oldFragment, fragment, component) {
	
		var componentsToUpdate = [];
	
		for (var i = 0, _length = fragment.templateValues.length; i < _length; i++) {
			var element = oldFragment.templateElements[i];
			var type = oldFragment.templateTypes[i];
	
			fragment.templateElements[i] = element;
			fragment.templateTypes[i] = type;
	
			if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
				switch (type) {
					case _enumFragmentValueTypes2['default'].LIST:
					case _enumFragmentValueTypes2['default'].LIST_REPLACE:
						(0, _updateFragmentList2['default'])(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
						break;
					case _enumFragmentValueTypes2['default'].TEXT:
						element.firstChild.nodeValue = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].TEXT_DIRECT:
						element.nodeValue = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].FRAGMENT:
					case _enumFragmentValueTypes2['default'].FRAGMENT_REPLACE:
						(0, _updateFragment2['default'])(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
						break;
					case _enumFragmentValueTypes2['default'].ATTR_CLASS:
						if (_utilIsSVG2['default']) {
							element.setAttribute('class', fragment.templateValues[i]);
						} else {
							element.className = fragment.templateValues[i];
						}
						break;
					case _enumFragmentValueTypes2['default'].ATTR_ID:
						element.id = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_NAME:
						element.name = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_LABEL:
						element.label = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_PLACEHOLDER:
						element.placeholder = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_DESIGNMODE:
						element.designMode = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_HTMLFOR:
						element.htmlFor = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_PLAYBACKRATE:
						element.playbackRate = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_PRELOAD:
						element.preload = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_SRCDOC:
						element.srcDoc = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_AUTOPLAY:
						element.autoPlay = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_CHECKED:
						element.checked = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_ISMAP:
						element.isMap = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_LOOP:
						element.loop = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_MUTED:
						element.muted = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_READONLY:
						element.readOnly = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_REVERSED:
						element.reversed = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_REQUIRED:
						element.required = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_SELECTED:
						element.selected = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_SPELLCHECK:
						element.spellCheck = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_TRUESPEED:
						element.truespeed = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_MULTIPLE:
						element.multiple = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_CONTROLS:
						element.controls = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_DEFER:
						element.defer = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_NOVALIDATE:
						element.noValidate = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_SCOPED:
						element.scoped = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_NO_RESIZE:
						element.noResize = fragment.templateValues[i];
						break;
					case _enumFragmentValueTypes2['default'].ATTR_WIDTH:
						if (_utilIsSVG2['default']) {
							element.setAttribute('width', fragment.templateValues[i]);
						} else {
							element.width = fragment.templateValues[i];
						}
						break;
					case _enumFragmentValueTypes2['default'].ATTR_HEIGHT:
						if (_utilIsSVG2['default']) {
							element.setAttribute('height', fragment.templateValues[i]);
						} else {
							element.height = fragment.templateValues[i];
						}
						break;
					default:
						//custom attribute, so simply setAttribute it
						if (!element.props) {
							if (_eventsSharedEvents2['default'][type] != null) {
								(0, _eventsClearEventListeners2['default'])(element, type);
								(0, _eventsAddEventListener2['default'])(element, type, fragment.templateValues[i]);
							} else {
								_templateAttributeOps2['default'].set(element, type, fragment.templateValues[i], true);
							}
						}
						//component prop, update it
						else {
								element.props[type] = fragment.templateValues[i];
								var alreadyInQueue = false;
								for (var s = 0; s < componentsToUpdate.length; s++) {
									if (componentsToUpdate[s] === element) {
										alreadyInQueue = true;
									}
								}
								if (alreadyInQueue === false) {
									componentsToUpdate.push(element);
								}
							}
						break;
				}
			}
		}
		if (componentsToUpdate.length > 0) {
			for (var i = 0; i < componentsToUpdate.length; i++) {
				componentsToUpdate[i].forceUpdate();
			}
		}
	}
	
	exports['default'] = updateFragmentValues;
	module.exports = exports['default'];

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = addRootListener;
	
	var _sharedRootListeners = __webpack_require__(13);
	
	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);
	
	var _sharedCapturable = __webpack_require__(48);
	
	var _sharedCapturable2 = _interopRequireDefault(_sharedCapturable);
	
	var _sharedEvtList = __webpack_require__(49);
	
	var _sharedEvtList2 = _interopRequireDefault(_sharedEvtList);
	
	function addRootListener() {
	    var _loop = function (i) {
	
	        var event = _sharedEvtList2['default'][i];
	
	        document.addEventListener(event, function (e) {
	            for (var ii = 0; ii < _sharedRootListeners2['default'][event].length; ii++) {
	                if (_sharedRootListeners2['default'][event][ii].target === e.target) {
	                    _sharedRootListeners2['default'][event][ii].callback(e);
	                }
	            }
	        }, _sharedCapturable2['default'][name] !== undefined);
	    };
	
	    for (var i = 0; i < _sharedEvtList2['default'].length; i++) {
	        _loop(i);
	    }
	}
	
	module.exports = exports['default'];

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports['default'] = {
	  'blur': true,
	  'focus': true,
	  'mouseenter': true,
	  'mouseleave': true
	};
	module.exports = exports['default'];

/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	exports['default'] = ['blur', 'change', 'click', 'compositionend', 'compositionstart', 'compositionupdate', 'contextmenu', 'copy', 'cut', 'dblclick', 'drag', 'dragend', 'dragenter', 'dragexit', 'dragleave', 'dragover', 'dragstart', 'drop', 'error', 'focus', 'input', 'invalid', 'keydown', 'keypress', 'keyup', 'load', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'paste', 'reset', 'selectionchange', 'scroll', 'submit', 'touchcancel', 'touchend', 'touchmove', 'touchstart', 'wheel'];
	module.exports = exports['default'];

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = addAttributes;
	
	var _eventsSharedEvents = __webpack_require__(4);
	
	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);
	
	var _eventsClearEventListeners = __webpack_require__(12);
	
	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);
	
	var _eventsAddEventListener = __webpack_require__(11);
	
	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);
	
	var _AttributeOps = __webpack_require__(14);
	
	var _AttributeOps2 = _interopRequireDefault(_AttributeOps);
	
	var _enumFragmentValueTypes = __webpack_require__(2);
	
	var _enumFragmentValueTypes2 = _interopRequireDefault(_enumFragmentValueTypes);
	
	//ensuring we use these fragmentTypes before using ATTR_OTHER makes updates on
	//fragments far faster, as there's way less overhead and logic involved when
	//we get to updateFragmentValue/updateFragmentValues (especially on classNames)
	//this somewhat replicates buildInfernoAttrsParams() in t7
	function processFragmentAttrs(node, attrName, attrVal, fragment) {
		var fragmentType = undefined;
	
		switch (attrName) {
			case 'class':
			case 'className':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_CLASS;
				break;
			case 'id':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_ID;
				break;
			case 'label':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_LABEL;
				break;
			case 'placeholder':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_PLACEHOLDER;
				break;
			case 'name':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_NAME;
				break;
			case 'width':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_WIDTH;
				break;
			case 'height':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_HEIGHT;
				break;
			case 'designMode':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_DESIGNMODE;
				break;
			case 'htmlFor':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_HTMLFOR;
				break;
			case 'playbackRate':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_PLAYBACKRATE;
				break;
			case 'preload':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_PRELOAD;
				break;
			case 'srcDoc':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_SRCDOC;
				break;
			case 'autoplay':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_AUTOPLAY;
				break;
			case 'checked':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_CHECKED;
				break;
			case 'isMap':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_ISMAP;
				break;
			case 'loop':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_LOOP;
				break;
			case 'muted':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_MUTED;
				break;
			case 'readOnly':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_READONLY;
				break;
			case 'reversed':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_REVERSED;
				break;
			case 'required':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_REQUIRED;
				break;
			case 'selected':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_SELECTED;
				break;
			case 'spellCheck':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_SPELLCHECK;
				break;
			case 'trueSpeed':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_TRUESPEED;
				break;
			case 'multiple':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_MULTIPLE;
				break;
			case 'controls':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_CONTROLS;
				break;
			case 'defer':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_DEFER;
				break;
			case 'noValidate':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_NOVALIDATE;
				break;
			case 'scoped':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_SCOPED;
				break;
			case 'resize':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_NO_RESIZE;
				break;
			case 'ref':
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_REF;
				break;
			default:
				fragmentType = _enumFragmentValueTypes2['default'].ATTR_OTHER;
		}
	
		if (fragment.templateValue !== undefined) {
			fragment.templateElement = node;
			if (fragmentType === _enumFragmentValueTypes2['default'].ATTR_OTHER) {
				fragment.templateType = _enumFragmentValueTypes2['default'].ATTR_OTHER[attrName] = attrName;
			} else {
				fragment.templateType = fragmentType;
			}
			return fragment.templateValue;
		} else {
			fragment.templateElements[attrVal.pointer] = node;
			if (fragmentType === _enumFragmentValueTypes2['default'].ATTR_OTHER) {
				fragment.templateTypes[attrVal.pointer] = _enumFragmentValueTypes2['default'].ATTR_OTHER[attrName] = attrName;
			} else {
				fragment.templateTypes[attrVal.pointer] = fragmentType;
			}
			return fragment.templateValues[attrVal.pointer];
		}
	}
	
	/**
	 * Set HTML attributes on the template
	 * @param{ HTMLElement } node
	 * @param{ Object } attrs
	 */
	
	function addAttributes(node, attrs, fragment) {
		for (var attrName in attrs) {
			var attrVal = attrs[attrName];
	
			//check if we have a pointer, if so, this is from the funcitonal API
			//and thus it needs its fragment processing
			//the t7 template API shouldn't need this as it post-processes the same code
			//within t7: look for buildInfernoAttrsParams() in t7
			if (attrVal && attrVal.pointer != null) {
				attrVal = processFragmentAttrs(node, attrName, attrVal, fragment);
			}
			// avoid 'null' values
			if (attrVal !== undefined) {
				// events
				if (_eventsSharedEvents2['default'][attrName] !== undefined) {
					(0, _eventsClearEventListeners2['default'])(node, attrName);
					(0, _eventsAddEventListener2['default'])(node, attrName, attrVal);
					// attributes / properties
				} else if (attrVal != null) {
						_AttributeOps2['default'].set(node, attrName, attrVal);
					}
			}
		}
	}
	
	module.exports = exports['default'];

/***/ },
/* 51 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var NONWORD_FIRST_REGEX = /\W+(\w)/g;
	var NONWORD_FIRST_CAPITALIZE = function NONWORD_FIRST_CAPITALIZE($$, $1) {
	  return $1.toUpperCase();
	};
	
	exports["default"] = function (str) {
	  return str.toLowerCase().replace(NONWORD_FIRST_REGEX, NONWORD_FIRST_CAPITALIZE);
	};
	
	module.exports = exports["default"];

/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
					value: true
	});
	exports['default'] = {
					acceptCharset: 'accept-charset',
					className: 'class',
					htmlFor: 'for',
					httpEquiv: 'http-equiv',
	
					// SVG
	
					accentHeight: 'accent-height',
					alignmentBaseline: 'alignment-baseline',
					arabicForm: 'arabic-form',
					autoStartReverse: 'auto-start-reverse',
					baselineShift: 'baseline-shift',
					bufferedRendering: 'buffered-rendering',
					colorRendering: 'color-rendering',
					colorInterpolation: 'color-interpolation',
					colorInterpolationFilters: 'color-interpolation-filters',
					colorProfile: 'color-profile',
					clipPath: 'clip-path',
					dominantBaseline: 'dominant-baseline',
					fillOpacity: 'fill-opacity',
					fillRule: 'fill-rule',
					filterRes: 'filterRes',
					filterUnits: 'filterUnits',
					floodColor: 'flood-color',
					floodOpacity: 'flood-opacity',
					fontFamily: 'font-family',
					fontSize: 'font-size',
					fontStyle: 'font-style',
					fontWeight: 'font-weight',
					glyphName: 'glyph-name',
					glyphRef: 'glyphRef',
					gradientTransform: 'gradientTransform',
					gradientUnits: 'gradientUnits',
					horizAdvX: 'horiz-adv-x',
					horizOriginX: 'horiz-origin-x',
					horizOriginY: 'horiz-origin-y',
					markerEnd: 'marker-end',
					markerMid: 'marker-mid',
					markerStart: 'marker-start',
					overlinePosition: 'overline-position',
					overlineThickness: 'overline-thickness',
					paintOrder: 'paint-order',
					patternContentUnits: 'patternContentUnits',
					patternUnits: 'patternUnits',
					pathLength: 'pathLength',
					patternTransform: 'patternTransform',
					pointsAtX: 'pointsAtX',
					pointsAtY: 'pointsAtY',
					pointsAtZ: 'pointsAtZ',
					preserveAlpha: 'preserveAlpha',
					preserveAspectRatio: 'preserveAspectRatio',
					primitiveUnits: 'primitiveUnits',
					shapeRendering: 'shape-rendering',
					spreadMethod: 'spreadMethod',
					stopColor: 'stop-color',
					stopOpacity: 'stop-opacity',
					strikethroughPosition: 'strikethrough-position',
					strikethroughThickness: 'strikethrough-thickness',
					strokeDashoffset: 'stroke-dashoffset',
					strokeDasharray: 'stroke-dasharray',
					strokeLinecap: 'stroke-linecap',
					strokeOpacity: 'stroke-opacity',
					strokeWidth: 'stroke-width',
					tableValues: 'tableValues',
					targetX: 'targetX',
					targetY: 'targetY',
					textLength: 'textLength',
					underlinePosition: 'underline-position',
					underlineThickness: 'underline-thickness',
					unicodeBidi: 'unicode-bidi',
					unicodeRange: 'unicode-range',
					unitsPerEm: 'units-per-em',
					solidColor: 'solid-color',
					solidOpacity: 'solid-opacity',
					strokeLinejoin: 'stroke-linejoin',
					textAnchor: 'text-anchor',
					textDecoration: 'text-decoration',
					textRendering: 'text-rendering',
					vAlphabetic: 'v-alphabetic',
					vectorEffect: 'vector-effect',
					vHanging: 'v-hanging',
					vIdeographic: 'v-ideographic',
					vMathematical: 'v-mathematical',
					vertAdvY: 'vert-adv-y',
					vertOriginX: 'vert-origin-x',
					vertOriginY: 'vert-origin-y',
					viewBox: 'viewBox'
	};
	module.exports = exports['default'];

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = {
		autoCapitalize: 'autocapitalize',
		autoComplete: 'autocomplete',
		autoCorrect: 'autocorrect',
		autoFocus: 'autofocus',
		autoPlay: 'autoplay',
		'class': 'className',
		encType: 'encoding',
		hrefLang: 'hreflang',
		radioGroup: 'radiogroup',
		spellCheck: 'spellcheck',
		srcDoc: 'srcdoc',
		srcSet: 'srcset'
	};
	module.exports = exports['default'];

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	exports['default'] = createElement;
	
	var _ = __webpack_require__(15);
	
	var _2 = _interopRequireDefault(_);
	
	var _enumFragmentValueTypes = __webpack_require__(2);
	
	var _enumFragmentValueTypes2 = _interopRequireDefault(_enumFragmentValueTypes);
	
	var _utilIsArray = __webpack_require__(16);
	
	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);
	
	function createElement(tag, props) {
		for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			children[_key - 2] = arguments[_key];
		}
	
		var element = undefined;
		var is = props && (props.is || null); // type extension
		var xmlns = props && (props.xmlns || null); // xmlns
	
		if (typeof tag === 'string') {
			element = _2['default'].createElement(tag, xmlns, is);
		} else {
			var propsParsed = props;
	
			for (var prop in props) {
				if (props[prop].pointer) {
					propsParsed[prop] = this.templateValues[propsParsed[prop].pointer];
				}
			}
			element = {
				dom: null,
				component: this.templateValue || this.templateValues[tag.pointer],
				props: propsParsed,
				key: null,
				template: null,
				templateIndex: tag.pointer
			};
			return element;
		}
	
		var len = children.length;
	
		if (len > 0) {
			if (len > 1) {
				for (var i = 0; i < len; i++) {
					var child = children[i];
	
					if (child.pointer !== undefined) {
						var value = this.templateValue || this.templateValues[child.pointer];
	
						if (typeof value !== 'object') {
							var node = _2['default'].createTextNode(value);
	
							if (this.templateValue) {
								this.templateElement = node;
								this.templateType = _enumFragmentValueTypes2['default'].TEXT_DIRECT;
							} else {
								this.templateElements[child.pointer] = node;
								this.templateTypes[child.pointer] = _enumFragmentValueTypes2['default'].TEXT_DIRECT;
							}
							element.appendChild(node);
						}
					} else if (typeof child !== 'object') {
						var node = _2['default'].createTextNode(child);
	
						element.appendChild(node);
					} else if (child.component) {
						if (this.templateValues) {
							var templateIndex = child.templateIndex;
	
							this.templateElements[templateIndex] = element;
							this.templateTypes[templateIndex] = _enumFragmentValueTypes2['default'].FRAGMENT;
							this.templateValues[templateIndex] = child;
						} else {
							this.templateElement = element;
							this.templateType = _enumFragmentValueTypes2['default'].FRAGMENT;
							this.templateValue = child;
						}
					} else {
						element.appendChild(child);
					}
				}
			} else if ((children = children[0]).pointer !== undefined) {
				var value = this.templateValue || this.templateValues[children.pointer];
	
				if (typeof value !== 'object') {
					element.textContent = value;
					if (this.templateValue) {
						this.templateElement = element;
						this.templateType = _enumFragmentValueTypes2['default'].TEXT;
					} else {
						this.templateElements[children.pointer] = element;
						this.templateTypes[children.pointer] = _enumFragmentValueTypes2['default'].TEXT;
					}
				} else if ((0, _utilIsArray2['default'])(value)) {
					if (this.templateValue) {
						this.templateElement = element;
						this.templateType = _enumFragmentValueTypes2['default'].LIST;
					} else {
						this.templateElements[children.pointer] = element;
						this.templateTypes[children.pointer] = _enumFragmentValueTypes2['default'].LIST;
					}
				}
			} else if (typeof children !== 'object') {
				element.textContent = children;
			} else if (children.component) {
				this.templateElement = element;
				this.templateType = _enumFragmentValueTypes2['default'].FRAGMENT;
				this.templateValue = children;
			} else {
				element.appendChild(children);
			}
		}
	
		if (props) {
			_2['default'].addAttributes(element, props, this);
		}
	
		return element;
	}
	
	module.exports = exports['default'];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _cfgSvgCfg = __webpack_require__(24);
	
	var _cfgSvgCfg2 = _interopRequireDefault(_cfgSvgCfg);
	
	var _varsSvgNamespace = __webpack_require__(31);
	
	var _varsSvgNamespace2 = _interopRequireDefault(_varsSvgNamespace);
	
	var _varsMathNamespace = __webpack_require__(30);
	
	var _varsMathNamespace2 = _interopRequireDefault(_varsMathNamespace);
	
	function createElementWithIs(tag, xmlns, is) {
	
	    switch (tag) {
	        case 'a':
	            return document.createElement('a', is);
	        case 'button':
	            return document.createElement('button', is);
	        case 'div':
	            return document.createElement('div', is);
	        case 'em':
	            return document.createElement('em', is);
	        case 'form':
	            return document.createElement('form', is);
	        case 'img':
	            return document.createElement('img', is);
	        case 'h1':
	            return document.createElement('h1', is);
	        case 'h2':
	            return document.createElement('h2', is);
	        case 'li':
	            return document.createElement('li', is);
	        case 'ol':
	            return document.createElement('ol', is);
	        case 'p':
	            return document.createElement('p', is);
	        case 'span':
	            return document.createElement('span', is);
	        case 'table':
	            return document.createElement('table', is);
	        case 'ul':
	            return document.createElement('ul', is);
	        case 'svg':
	            return document.createElementNS(_varsSvgNamespace2['default'], 'svg', is);
	        default:
	
	            return xmlns ? document.createElementNS(xmlns, tag, is) : tag === 'math' ? document.createElementNS(_varsMathNamespace2['default'], tag, is) : _cfgSvgCfg2['default'][tag] ? document.createElementNS(_varsSvgNamespace2['default'], tag, is) : document.createElement(tag, is);
	    }
	}
	
	exports['default'] = createElementWithIs;
	module.exports = exports['default'];

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _cfgSvgCfg = __webpack_require__(24);
	
	var _cfgSvgCfg2 = _interopRequireDefault(_cfgSvgCfg);
	
	var _varsSvgNamespace = __webpack_require__(31);
	
	var _varsSvgNamespace2 = _interopRequireDefault(_varsSvgNamespace);
	
	var _varsMathNamespace = __webpack_require__(30);
	
	var _varsMathNamespace2 = _interopRequireDefault(_varsMathNamespace);
	
	function createElementWithoutIs(tag, xmlns) {
	
	    switch (tag) {
	        case 'a':
	            return document.createElement('a');
	        case 'button':
	            return document.createElement('button');
	        case 'div':
	            return document.createElement('div');
	        case 'em':
	            return document.createElement('em');
	        case 'form':
	            return document.createElement('form');
	        case 'img':
	            return document.createElement('img');
	        case 'h1':
	            return document.createElement('h1');
	        case 'h2':
	            return document.createElement('h2');
	        case 'li':
	            return document.createElement('li');
	        case 'ol':
	            return document.createElement('ol');
	        case 'p':
	            return document.createElement('p');
	        case 'span':
	            return document.createElement('span');
	        case 'table':
	            return document.createElement('table');
	        case 'ul':
	            return document.createElement('ul');
	        case 'svg':
	            return document.createElementNS(_varsSvgNamespace2['default'], 'svg');
	        default:
	
	            return xmlns ? document.createElementNS(xmlns, tag) : tag === 'math' ? document.createElementNS(_varsMathNamespace2['default'], tag) : _cfgSvgCfg2['default'][tag] ? document.createElementNS(_varsSvgNamespace2['default'], tag) : document.createElement(tag);
	    }
	}
	
	exports['default'] = createElementWithoutIs;
	module.exports = exports['default'];

/***/ },
/* 57 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var DASH_REGEX = /([^A-Z]+)([A-Z])/g;
	var DASHED_REPLACE = function DASHED_REPLACE($$, $1, $2) {
	  return $1 + "-" + $2;
	};
	
	exports["default"] = function (str) {
	  return str.replace(DASH_REGEX, DASHED_REPLACE).toLowerCase();
	};
	
	module.exports = exports["default"];

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	var ESCAPE_REGEX = /[&><]/g;
	
	// `'` and `'` are not escaped; they are parsed as regular characters in the
	// context of text content.
	
	var ESCAPE_TABLE = {
		'&': '&amp;',
		'>': '&gt;',
		'<': '&lt;'
	};
	
	exports['default'] = function (str) {
		return str.replace(ESCAPE_REGEX, function (match) {
			return ESCAPE_TABLE[match];
		});
	};
	
	module.exports = exports['default'];

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _cfgUnitlessCfg = __webpack_require__(25);
	
	var _cfgUnitlessCfg2 = _interopRequireDefault(_cfgUnitlessCfg);
	
	var _prefixes = __webpack_require__(29);
	
	var _prefixes2 = _interopRequireDefault(_prefixes);
	
	var _prefixKey = __webpack_require__(28);
	
	var _prefixKey2 = _interopRequireDefault(_prefixKey);
	
	var _utilForIn = __webpack_require__(32);
	
	var _utilForIn2 = _interopRequireDefault(_utilForIn);
	
	exports['default'] = function (properties) {
		(0, _utilForIn2['default'])(properties, function (prop, val) {
			_cfgUnitlessCfg2['default'][prop] = val;
			for (var i = _prefixes2['default'].length; --i > -1;) {
				_cfgUnitlessCfg2['default'][(0, _prefixKey2['default'])(_prefixes2['default'][i], prop)] = val;
			}
		});
	};
	
	module.exports = exports['default'];

/***/ },
/* 60 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var PropertyAccessor = {};
	
	exports["default"] = function (node, attrName) {
		var tag = node.tagName,
		    tagAttrs = PropertyAccessor[tag] || (PropertyAccessor[tag] = {});
		return attrName in tagAttrs ? tagAttrs[attrName] : tagAttrs[attrName] = document.createElement(tag)[attrName];
	};
	
	module.exports = exports["default"];

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
		value: true
	});
	
	var _cfgUnitlessCfg = __webpack_require__(25);
	
	var _cfgUnitlessCfg2 = _interopRequireDefault(_cfgUnitlessCfg);
	
	/**
	 * Normalize CSS properties for SSR
	 *
	 * @param {String} name The boolean attribute name to set.
	 * @param {String} value The boolean attribute value to set.
	 */
	function normalizeCSS(name, value) {
		if (value === null || value === '') {
			return '';
		}
		if (value === 0 || (_cfgUnitlessCfg2['default'][name] || isNaN(value))) {
			return '' + value; // cast to string
		}
		if (typeof value === 'string') {
			value = value.trim();
		}
		return value + 'px';
	};
	
	exports['default'] = normalizeCSS;
	module.exports = exports['default'];

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	    value: true
	});
	
	var _cfgXmlCfg = __webpack_require__(27);
	
	var _cfgXmlCfg2 = _interopRequireDefault(_cfgXmlCfg);
	
	var _cfgXlinkCfg = __webpack_require__(26);
	
	var _cfgXlinkCfg2 = _interopRequireDefault(_cfgXlinkCfg);
	
	// Simplified subset
	var VALID_ATTRIBUTE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z_\.\-\d]*$/,
	    illegalAttributeNameCache = {},
	    validatedAttributeNameCache = {};
	
	/**
	 * Validate custom attributes
	 *
	 * @param  {String} name  The boolean attribute name to set.
	 */
	function validateAttribute(name) {
	
	    if (validatedAttributeNameCache[name]) {
	        return true;
	    }
	
	    if (illegalAttributeNameCache[name]) {
	        return false;
	    }
	    if (VALID_ATTRIBUTE_NAME_REGEX.test(name) ||
	
	    // namespace attributes are seen as non-valid, avoid that!
	    _cfgXmlCfg2['default'][name] || _cfgXlinkCfg2['default'][name]) {
	
	        validatedAttributeNameCache[name] = true;
	        return true;
	    }
	
	    illegalAttributeNameCache[name] = true;
	
	    return false;
	}
	
	exports['default'] = validateAttribute;
	module.exports = exports['default'];

/***/ },
/* 63 */
/***/ function(module, exports) {

	// TODO! don't use 'slice'
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var slice = Array.prototype.slice.call(arguments, 2);
	
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
	exports['default'] = bind;
	module.exports = exports['default'];

/***/ },
/* 64 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	exports["default"] = function (arr, item) {
		var len = arr.length;
		var i = 0;
		while (i < len) {
			if (arr[i++] === item) {
				return true;
			}
		}
		return false;
	};
	
	module.exports = exports["default"];

/***/ },
/* 65 */
/***/ function(module, exports) {

	/**
	 * Returns a DOM node tagName as lowerCase
	 * @param {Object} node A DOM element.
	 */
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function getNodeName(node) {
	
	  // TODO!! Cache this for re-use?
	  return node.tagName.toLowerCase();
	};
	
	exports["default"] = getNodeName;
	module.exports = exports["default"];

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(69), __esModule: true };

/***/ },
/* 67 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$defineProperty = __webpack_require__(66)["default"];
	
	exports["default"] = (function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	
	      _Object$defineProperty(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	})();
	
	exports.__esModule = true;

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(70);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 70 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=inferno.js.map