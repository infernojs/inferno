/******/ (function(modules) { // webpackBootstrap
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

	__webpack_require__(1);
	__webpack_require__(32);
	__webpack_require__(41);
	__webpack_require__(48);
	__webpack_require__(44);
	__webpack_require__(69);
	__webpack_require__(30);
	__webpack_require__(7);
	__webpack_require__(11);
	__webpack_require__(3);
	__webpack_require__(24);
	__webpack_require__(4);
	__webpack_require__(21);
	__webpack_require__(35);
	__webpack_require__(66);
	__webpack_require__(34);
	__webpack_require__(2);
	__webpack_require__(9);
	__webpack_require__(19);
	__webpack_require__(28);
	__webpack_require__(71);
	__webpack_require__(72);
	__webpack_require__(14);
	__webpack_require__(16);
	__webpack_require__(8);
	__webpack_require__(10);
	__webpack_require__(29);
	__webpack_require__(31);
	__webpack_require__(20);
	__webpack_require__(27);
	__webpack_require__(13);
	__webpack_require__(18);
	__webpack_require__(26);
	__webpack_require__(33);
	__webpack_require__(12);
	__webpack_require__(17);
	__webpack_require__(15);
	__webpack_require__(25);
	__webpack_require__(23);
	__webpack_require__(5);
	__webpack_require__(22);
	__webpack_require__(37);
	__webpack_require__(57);
	__webpack_require__(51);
	__webpack_require__(64);
	__webpack_require__(55);
	__webpack_require__(36);
	__webpack_require__(67);
	__webpack_require__(68);
	__webpack_require__(40);
	__webpack_require__(62);
	__webpack_require__(63);
	__webpack_require__(60);
	__webpack_require__(61);
	__webpack_require__(73);
	__webpack_require__(46);
	__webpack_require__(74);
	__webpack_require__(45);
	__webpack_require__(49);
	__webpack_require__(75);
	__webpack_require__(76);
	__webpack_require__(77);
	__webpack_require__(38);
	__webpack_require__(78);
	__webpack_require__(50);
	__webpack_require__(47);
	__webpack_require__(39);
	__webpack_require__(79);
	__webpack_require__(80);
	module.exports = __webpack_require__(81);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var _universalClassComponent = __webpack_require__(2);

	var _universalClassComponent2 = _interopRequireDefault(_universalClassComponent);

	var _browserCoreRender = __webpack_require__(3);

	var _browserCoreRender2 = _interopRequireDefault(_browserCoreRender);

	var _InfernoVersion = __webpack_require__(32);

	var _InfernoVersion2 = _interopRequireDefault(_InfernoVersion);

	var _universalCoreUnmountComponentAtNode = __webpack_require__(33);

	var _universalCoreUnmountComponentAtNode2 = _interopRequireDefault(_universalCoreUnmountComponentAtNode);

	var _universalCoreFragmentTypes = __webpack_require__(16);

	var _universalCoreFragmentTypes2 = _interopRequireDefault(_universalCoreFragmentTypes);

	var _browserTemplateTemplate = __webpack_require__(34);

	var _browserTemplateTemplate2 = _interopRequireDefault(_browserTemplateTemplate);

	var _utilIsBrowser = __webpack_require__(69);

	var _utilIsBrowser2 = _interopRequireDefault(_utilIsBrowser);

	var _t7 = __webpack_require__(70);

	var _t72 = _interopRequireDefault(_t7);

	var _otherSetT7Dependency = __webpack_require__(30);

	var _otherSetT7Dependency2 = _interopRequireDefault(_otherSetT7Dependency);

	// TODO! Find a better way
	// Why not make t7 only works for Inferno, and maintain the other versions on another repo? Then we could
	// skip this. Or consider to let someone else make a Babel plugin out of it.
	_t72['default'].setOutput(_t72['default'].Outputs.Inferno);

	var Inferno = {
	  Component: _universalClassComponent2['default'],
	  render: _browserCoreRender2['default'],
	  unmountComponentAtNode: _universalCoreUnmountComponentAtNode2['default'],
	  Type: _universalCoreFragmentTypes2['default'],
	  template: _browserTemplateTemplate2['default'],
	  setT7Dependency: _otherSetT7Dependency2['default'],
	  // current version of the library
	  version: _InfernoVersion2['default']
	};

	if (_utilIsBrowser2['default']) {
	  global.t7 = _t72['default'];
	  global.Inferno = Inferno;
	}

	exports['default'] = Inferno;
	module.exports = exports['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	// TODO! Finish this

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Component = (function () {
	    function Component(props) {
	        _classCallCheck(this, Component);

	        this.props = props;
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
	            this.state = newSate;
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
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _eventsAddRootListener = __webpack_require__(4);

	var _eventsAddRootListener2 = _interopRequireDefault(_eventsAddRootListener);

	var _eventsSharedInitialisedListeners = __webpack_require__(5);

	var _eventsSharedInitialisedListeners2 = _interopRequireDefault(_eventsSharedInitialisedListeners);

	var _varsContexts = __webpack_require__(7);

	var _varsContexts2 = _interopRequireDefault(_varsContexts);

	var _universalCoreGetContext = __webpack_require__(8);

	var _universalCoreGetContext2 = _interopRequireDefault(_universalCoreGetContext);

	var _universalCoreAttachFragment = __webpack_require__(9);

	var _universalCoreAttachFragment2 = _interopRequireDefault(_universalCoreAttachFragment);

	var _universalCoreUpdateFragment = __webpack_require__(12);

	var _universalCoreUpdateFragment2 = _interopRequireDefault(_universalCoreUpdateFragment);

	var _universalCoreMaintainFocus = __webpack_require__(31);

	var _universalCoreMaintainFocus2 = _interopRequireDefault(_universalCoreMaintainFocus);

	exports["default"] = function (fragment, dom, component) {

	    var context, generatedFragment;
	    if (component === undefined) {
	        if ((0, _eventsSharedInitialisedListeners2["default"])() === false) {
	            (0, _eventsAddRootListener2["default"])();
	            (0, _eventsSharedInitialisedListeners2["default"])(true);
	        }

	        context = (0, _universalCoreGetContext2["default"])(dom);

	        if (context == null) {

	            context = {
	                fragment: fragment,
	                dom: dom,
	                shouldRecycle: true
	            };
	            (0, _universalCoreAttachFragment2["default"])(context, fragment, dom, component);
	            _varsContexts2["default"].push(context);
	        } else {

	            var activeElement = document.activeElement;
	            (0, _universalCoreUpdateFragment2["default"])(context, context.fragment, fragment, dom, component, false);
	            context.fragment = fragment;

	            // TODO! Move to moveFragment()
	            (0, _universalCoreMaintainFocus2["default"])(activeElement);
	        }
	    } else {

	        if (component.context == null) {

	            generatedFragment = fragment();
	            context = component.context = {
	                fragment: generatedFragment,
	                dom: dom,
	                shouldRecycle: true
	            };
	            component.componentWillMount();
	            (0, _universalCoreAttachFragment2["default"])(context, generatedFragment, dom, component);
	            component.componentDidMount();
	        } else {

	            generatedFragment = fragment();
	            context = component.context;
	            (0, _universalCoreUpdateFragment2["default"])(context, context.fragment, generatedFragment, dom, component, false);
	            context.fragment = generatedFragment;
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _sharedInitialisedListeners = __webpack_require__(5);

	var _sharedInitialisedListeners2 = _interopRequireDefault(_sharedInitialisedListeners);

	var _sharedRootListeners = __webpack_require__(6);

	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);

	exports["default"] = function () {
	    // has to do this 'hack' else it will become read-only
	    (0, _sharedInitialisedListeners2["default"])(true);

	    // FIX ME! Take this out into it's own module and do some event cleanup along the road?
	    document.addEventListener("click", function (e) {
	        for (var i = 0; i < _sharedRootListeners2["default"].click.length; i++) {
	            if (_sharedRootListeners2["default"].click[i].target === e.target) {
	                _sharedRootListeners2["default"].click[i].callback(e);
	            }
	        }
	    });
	};

	module.exports = exports["default"];

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var initialisedListeners = false;

	exports["default"] = function (value) {
	    if (value) {
	        initialisedListeners = value;
	    } else {
	        return initialisedListeners;
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = {
	    click: []
	};
	module.exports = exports["default"];

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = [];
	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _varsContexts = __webpack_require__(7);

	var _varsContexts2 = _interopRequireDefault(_varsContexts);

	exports["default"] = function (dom) {

	    for (var i = 0; i < _varsContexts2["default"].length; i++) {

	        if (_varsContexts2["default"][i].dom === dom) {

	            return _varsContexts2["default"][i];
	        }
	    }
	    return null;
	};

	module.exports = exports["default"];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _getRecycledFragment = __webpack_require__(10);

	var _getRecycledFragment2 = _interopRequireDefault(_getRecycledFragment);

	var _updateFragment = __webpack_require__(12);

	var _updateFragment2 = _interopRequireDefault(_updateFragment);

	var _attachFragmentList = __webpack_require__(19);

	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);

	var _fragmentTypes = __webpack_require__(16);

	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

	var _insertFragment = __webpack_require__(29);

	var _insertFragment2 = _interopRequireDefault(_insertFragment);

	var _browserCoreRender = __webpack_require__(3);

	var _browserCoreRender2 = _interopRequireDefault(_browserCoreRender);

	var _otherSetT7Dependency = __webpack_require__(30);

	var _otherSetT7Dependency2 = _interopRequireDefault(_otherSetT7Dependency);

	var attachFragment = function attachFragment(context, fragment, parentDom, component, nextFragment, replace) {
	    var fragmentComponent = fragment.component;

	    if (fragmentComponent) {
	        if (typeof fragmentComponent === "function") {
	            fragmentComponent = fragment.component = new fragmentComponent(fragment.props);
	            fragmentComponent.context = null;
	            fragmentComponent.forceUpdate = Inferno.render.bind(null, fragmentComponent.render.bind(fragmentComponent), parentDom, fragmentComponent);
	            fragmentComponent.forceUpdate();
	        }
	        return;
	    }

	    var recycledFragment = null,
	        template = fragment.template,
	        templateKey = template.key;

	    if (context.shouldRecycle === true) {
	        recycledFragment = (0, _getRecycledFragment2["default"])(templateKey);
	    }

	    if (recycledFragment !== null) {
	        (0, _updateFragment2["default"])(context, recycledFragment, fragment, parentDom, component);
	    } else {
	        //the user can optionally opt out of using the t7 dependency, thus removing the requirement
	        //to pass the t7 reference into the template constructor
	        if ((0, _otherSetT7Dependency2["default"])()) {
	            template(fragment, fragment.t7ref);
	        } else {
	            template(fragment);
	        }
	        //if this fragment has a single value, we attach only that value
	        if (fragment.templateValue) {
	            switch (fragment.templateType) {
	                case _fragmentTypes2["default"].LIST:
	                    (0, _attachFragmentList2["default"])(context, fragment.templateValue, fragment.templateElement);
	                    break;
	                case _fragmentTypes2["default"].LIST_REPLACE:
	                    attachFragment(context, fragment.templateValue, fragment.templateElement, component);
	                    break;
	                case _fragmentTypes2["default"].FRAGMENT:
	                    //TODO do we need this still?
	                    break;
	                case _fragmentTypes2["default"].FRAGMENT_REPLACE:
	                    attachFragment(context, fragment.templateValue, parentDom, fragment.templateElement, true);
	                    fragment.templateElement = fragment.templateValue.dom.parentNode;
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
	                    case _fragmentTypes2["default"].LIST:
	                        (0, _attachFragmentList2["default"])(context, value, element);
	                        break;
	                    case _fragmentTypes2["default"].LIST_REPLACE:
	                        var nodeList = document.createDocumentFragment(),
	                            placeholderNode = fragment.templateElements[i];
	                        (0, _attachFragmentList2["default"])(context, value, nodeList);
	                        placeholderNode.parentNode.replaceChild(nodeList, placeholderNode);
	                        fragment.templateElements[i] = nodeList;
	                        break;
	                    case _fragmentTypes2["default"].FRAGMENT:
	                        //TODO do we need this still?
	                        break;
	                    case _fragmentTypes2["default"].FRAGMENT_REPLACE:
	                        attachFragment(context, value, parentDom, component, element, true);
	                        fragment.templateElements[i] = value.dom.parentNode;
	                        break;
	                }
	            }
	        }
	    }

	    (0, _insertFragment2["default"])(context, parentDom, fragment.dom, nextFragment, replace);
	};

	exports["default"] = attachFragment;
	module.exports = exports["default"];

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _varsRecycledFragments = __webpack_require__(11);

	var _varsRecycledFragments2 = _interopRequireDefault(_varsRecycledFragments);

	exports["default"] = function (templateKey) {

	    var fragments = _varsRecycledFragments2["default"][templateKey];
	    if (!fragments || fragments.length === 0) {

	        return null;
	    }
	    return fragments.pop();
	};

	module.exports = exports["default"];

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = {};
	module.exports = exports["default"];

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeFragment = __webpack_require__(13);

	var _removeFragment2 = _interopRequireDefault(_removeFragment);

	var _attachFragment = __webpack_require__(9);

	var _attachFragment2 = _interopRequireDefault(_attachFragment);

	var _updateFragmentValue = __webpack_require__(15);

	var _updateFragmentValue2 = _interopRequireDefault(_updateFragmentValue);

	var _updateFragmentValues = __webpack_require__(25);

	var _updateFragmentValues2 = _interopRequireDefault(_updateFragmentValues);

	var _unmountComponentAtFragment = __webpack_require__(26);

	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);

	exports["default"] = function (context, oldFragment, fragment, parentDom, component) {

	        if (fragment === null) {

	                (0, _removeFragment2["default"])(context, parentDom, oldFragment);
	                return;
	        }
	        if (oldFragment === null) {

	                (0, _attachFragment2["default"])(context, fragment, parentDom, component);
	                return;
	        }
	        if (oldFragment.template !== fragment.template) {

	                if (oldFragment.component) {

	                        var oldComponentFragment = oldFragment.component.context.fragment;
	                        (0, _unmountComponentAtFragment2["default"])(oldFragment);
	                        (0, _attachFragment2["default"])(context, fragment, parentDom, component, oldComponentFragment, true);
	                } else {

	                        (0, _attachFragment2["default"])(context, fragment, parentDom, component, oldFragment, true);
	                }
	        } else {

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

	                if (fragment.templateValue) {

	                        //update a single value in the fragement (templateValue rather than templateValues)
	                        (0, _updateFragmentValue2["default"])(context, oldFragment, fragment, parentDom, component);
	                } else if (fragment.templateValues) {

	                        //updates all values within the fragment (templateValues is an array)
	                        (0, _updateFragmentValues2["default"])(context, oldFragment, fragment, parentDom, component);
	                }
	        }
	};

	module.exports = exports["default"];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _destroyFragment = __webpack_require__(14);

	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);

	exports["default"] = function (context, parentDom, item) {

	    var domItem = item.dom;
	    (0, _destroyFragment2["default"])(context, item);
	    parentDom.removeChild(domItem);
	};

	module.exports = exports["default"];

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeFragment = __webpack_require__(13);

	var _removeFragment2 = _interopRequireDefault(_removeFragment);

	var _varsRecycledFragments = __webpack_require__(11);

	var _varsRecycledFragments2 = _interopRequireDefault(_varsRecycledFragments);

	/**
	 * Destroy fragment
	 */

	exports["default"] = function (context, fragment) {

	    var templateKey = undefined;

	    //long winded approach, but components have their own context which is how we find their template keys
	    if (fragment.component) {

	        templateKey = fragment.component.context.fragment.template.key;
	    } else {

	        templateKey = fragment.template.key;
	    }

	    if (context.shouldRecycle === true) {

	        var toRecycleForKey = _varsRecycledFragments2["default"][templateKey];
	        if (!toRecycleForKey) {

	            _varsRecycledFragments2["default"][templateKey] = toRecycleForKey = [];
	        }
	        toRecycleForKey.push(fragment);
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _updateFragment = __webpack_require__(12);

	var _updateFragment2 = _interopRequireDefault(_updateFragment);

	var _fragmentTypes = __webpack_require__(16);

	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

	var _updateFragmentList = __webpack_require__(17);

	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);

	var _browserEventsClearEventListeners = __webpack_require__(21);

	var _browserEventsClearEventListeners2 = _interopRequireDefault(_browserEventsClearEventListeners);

	var _browserEventsAddEventListener = __webpack_require__(24);

	var _browserEventsAddEventListener2 = _interopRequireDefault(_browserEventsAddEventListener);

	var _browserEventsSharedEvents = __webpack_require__(23);

	var _browserEventsSharedEvents2 = _interopRequireDefault(_browserEventsSharedEvents);

	exports["default"] = function (context, oldFragment, fragment, parentDom, component) {

	    var element = oldFragment.templateElement,
	        type = oldFragment.templateType;

	    fragment.templateElement = element;
	    fragment.templateType = type;

	    if (fragment.templateValue !== oldFragment.templateValue) {

	        switch (type) {
	            case _fragmentTypes2["default"].LIST:
	            case _fragmentTypes2["default"].LIST_REPLACE:
	                (0, _updateFragmentList2["default"])(context, oldFragment.templateValue, fragment.templateValue, element, component);
	                return;
	            case _fragmentTypes2["default"].TEXT:
	                element.firstChild.nodeValue = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].TEXT_DIRECT:
	                element.nodeValue = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].FRAGMENT:
	            case _fragmentTypes2["default"].FRAGMENT_REPLACE:
	                (0, _updateFragment2["default"])(context, oldFragment.templateValue, fragment.templateValue, element, component);
	                return;
	            case _fragmentTypes2["default"].ATTR_CLASS:
	                element.className = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_CHECKED:
	                element.checked = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_SELECTED:
	                element.selected = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_DISABLED:
	                element.disabled = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_HREF:
	                element.href = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_ID:
	                element.id = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_VALUE:
	                element.value = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_NAME:
	                element.name = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_TYPE:
	                element.type = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_LABEL:
	                element.label = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_PLACEHOLDER:
	                element.placeholder = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_STYLE:
	                //TODO
	                return;
	            case _fragmentTypes2["default"].ATTR_WIDTH:
	                element.width = fragment.templateValue;
	                return;
	            case _fragmentTypes2["default"].ATTR_HEIGHT:
	                element.height = fragment.templateValue;
	                return;
	            default:
	                if (!element.props) {

	                    if (_browserEventsSharedEvents2["default"][type] != null) {

	                        (0, _browserEventsClearEventListeners2["default"])(element, type);
	                        (0, _browserEventsAddEventListener2["default"])(element, type, fragment.templateValue);
	                    } else {

	                        element.setAttribute(type, fragment.templateValue);
	                    }
	                }
	                //component prop, update it
	                else {
	                        //TODO make component props work for single value fragments
	                    }
	                return;
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 16 */
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
	    ATTR_DISABLED: 8,
	    ATTR_SELECTED: 9,
	    ATTR_CHECKED: 10,
	    ATTR_VALUE: 11,
	    ATTR_STYLE: 12,
	    ATTR_HREF: 13,
	    ATTR_LABEL: 14,
	    ATTR_TYPE: 15,
	    ATTR_PLACEHOLDER: 16,
	    ATTR_NAME: 17,
	    ATTR_WIDTH: 18,
	    ATTR_HEIGHT: 19,
	    //will contain other "custom" types, like rowspan etc or custom data-attributes
	    ATTR_OTHER: {},
	    COMPONENT_PROPS: {}
	};
	module.exports = exports["default"];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	            value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeFragments = __webpack_require__(18);

	var _removeFragments2 = _interopRequireDefault(_removeFragments);

	var _removeFragment = __webpack_require__(13);

	var _removeFragment2 = _interopRequireDefault(_removeFragment);

	var _attachFragmentList = __webpack_require__(19);

	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);

	var _attachFragment = __webpack_require__(9);

	var _attachFragment2 = _interopRequireDefault(_attachFragment);

	var _updateFragment = __webpack_require__(12);

	var _updateFragment2 = _interopRequireDefault(_updateFragment);

	var _moveFragment = __webpack_require__(20);

	var _moveFragment2 = _interopRequireDefault(_moveFragment);

	exports["default"] = function (context, oldList, list, parentDom, component, outerNextFragment) {

	            var oldListLength = oldList.length;
	            var listLength = list.length;

	            if (listLength === 0) {

	                        (0, _removeFragments2["default"])(context, parentDom, oldList, 0, oldListLength);
	                        return;
	            } else if (oldListLength === 0) {

	                        (0, _attachFragmentList2["default"])(context, list, parentDom, component);
	                        return;
	            }

	            var oldEndIndex = oldListLength - 1;
	            var endIndex = listLength - 1;
	            var oldStartIndex = 0,
	                startIndex = 0;
	            var successful = true;
	            var nextItem;
	            var oldItem, item;

	            outer: while (successful && oldStartIndex <= oldEndIndex && startIndex <= endIndex) {

	                        successful = false;
	                        var oldStartItem, oldEndItem, startItem, endItem, doUpdate;

	                        oldStartItem = oldList[oldStartIndex];
	                        startItem = list[startIndex];
	                        while (oldStartItem.key === startItem.key) {

	                                    (0, _updateFragment2["default"])(context, oldStartItem, startItem, parentDom, component);
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

	                                    (0, _updateFragment2["default"])(context, oldEndItem, endItem, parentDom, component);
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
	                                    (0, _updateFragment2["default"])(context, oldStartItem, endItem, parentDom, component);
	                                    (0, _moveFragment2["default"])(parentDom, endItem, nextItem);
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
	                                    (0, _updateFragment2["default"])(context, oldEndItem, startItem, parentDom, component);
	                                    (0, _moveFragment2["default"])(parentDom, startItem, nextItem);
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
	                        for (i = startIndex; i <= endIndex; i++) {

	                                    item = list[i];
	                                    (0, _attachFragment2["default"])(context, item, parentDom, component, nextItem);
	                        }
	            } else if (startIndex > endIndex) {

	                        (0, _removeFragments2["default"])(context, parentDom, oldList, oldStartIndex, oldEndIndex + 1);
	            } else {

	                        var i,
	                            oldNextItem = oldEndIndex + 1 >= oldListLength ? null : oldList[oldEndIndex + 1];
	                        var oldListMap = {};
	                        for (i = oldEndIndex; i >= oldStartIndex; i--) {

	                                    oldItem = oldList[i];
	                                    oldItem.next = oldNextItem;
	                                    oldListMap[oldItem.key] = oldItem;
	                                    oldNextItem = oldItem;
	                        }
	                        nextItem = endIndex + 1 < listLength ? list[endIndex + 1] : outerNextFragment;
	                        for (i = endIndex; i >= startIndex; i--) {

	                                    item = list[i];
	                                    var key = item.key;
	                                    oldItem = oldListMap[key];
	                                    if (oldItem) {

	                                                oldListMap[key] = null;
	                                                oldNextItem = oldItem.next;
	                                                (0, _updateFragment2["default"])(context, oldItem, item, parentDom, component);
	                                                if (parentDom.nextSibling != (nextItem && nextItem.dom)) {

	                                                            (0, _moveFragment2["default"])(parentDom, item, nextItem);
	                                                }
	                                    } else {

	                                                (0, _attachFragment2["default"])(context, item, parentDom, component, nextItem);
	                                    }
	                                    nextItem = item;
	                        }
	                        for (i = oldStartIndex; i <= oldEndIndex; i++) {

	                                    oldItem = oldList[i];
	                                    if (oldListMap[oldItem.key] !== null) {

	                                                (0, _removeFragment2["default"])(context, parentDom, oldItem);
	                                    }
	                        }
	            }
	};

	module.exports = exports["default"];

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeFragment = __webpack_require__(13);

	var _removeFragment2 = _interopRequireDefault(_removeFragment);

	exports["default"] = function (context, parentDom, fragments, i, to) {

	    for (; i < to; i++) {

	        (0, _removeFragment2["default"])(context, parentDom, fragments[i]);
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _attachFragment = __webpack_require__(9);

	var _attachFragment2 = _interopRequireDefault(_attachFragment);

	exports["default"] = function (context, list, parentDom, component) {

	    for (var i = 0; i < list.length; i++) {

	        (0, _attachFragment2["default"])(context, list[i], parentDom, component);
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 20 */
/***/ function(module, exports) {

	// TODO! Refactor
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (parentDom, item, nextItem) {

	    var domItem = item.dom,
	        domRefItem = nextItem && nextItem.dom;

	    if (domItem !== domRefItem) {

	        if (domRefItem) {

	            parentDom.insertBefore(domItem, domRefItem);
	        } else {

	            parentDom.appendChild(domItem);
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _sharedRootlisteners = __webpack_require__(22);

	var _sharedRootlisteners2 = _interopRequireDefault(_sharedRootlisteners);

	var _sharedEvents = __webpack_require__(23);

	var _sharedEvents2 = _interopRequireDefault(_sharedEvents);

	exports["default"] = function (parentDom, listenerName) {
	    var listeners = _sharedRootlisteners2["default"][_sharedEvents2["default"][listenerName]],
	        index = 0;

	    while (index < listeners.length) {
	        if (listeners[index].target === parentDom) {
	            listeners.splice(index, 1);
	            index = 0;
	        }
	        index++;
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = {
	    click: []
	};
	module.exports = exports["default"];

/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = {
	    onBlur: "blur",
	    onChange: "change",
	    onClick: "click",
	    onContextMenu: "contextmenu",
	    onCopy: "copy",
	    onCut: "cut",
	    onDoubleClick: "dblclick",
	    onDrag: "drag",
	    onDragEnd: "dragend",
	    onDragEnter: "dragenter",
	    onDragExit: "dragexit",
	    onDragLeave: "dragleave",
	    onDragOver: "dragover",
	    onDragStart: "dragstart",
	    onDrop: "drop",
	    onError: "error",
	    onFocus: "focus",
	    onInput: "input",
	    onInvalid: "invalid",
	    onKeyDown: "keydown",
	    onKeyPress: "keypress",
	    onKeyUp: "keyup",
	    onLoad: "load",
	    onMouseDown: "mousedown",
	    onMouseEnter: "mouseenter",
	    onMouseLeave: "mouseleave",
	    onMouseMove: "mousemove",
	    onMouseOut: "mouseout",
	    onMouseOver: "mouseover",
	    onMouseUp: "mouseup",
	    onMouseDown: "mousedown",
	    onMouseMove: "mousemove",
	    onMouseEnter: "mouseenter",
	    onMouseLeave: "mouseleave",
	    onPaste: "paste",
	    onReset: "reset",
	    onScroll: "scroll",
	    onSubmit: "submit",
	    onTouchCancel: "touchcancel",
	    onTouchEnd: "touchend",
	    onTouchMove: "touchmove",
	    onTouchStart: "touchstart",
	    onWheel: "wheel"
	};
	module.exports = exports["default"];

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _sharedRootListeners = __webpack_require__(6);

	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);

	var _sharedEvents = __webpack_require__(23);

	var _sharedEvents2 = _interopRequireDefault(_sharedEvents);

	exports["default"] = function (parentDom, listenerName, callback) {

	    _sharedRootListeners2["default"][_sharedEvents2["default"][listenerName]].push({
	        target: parentDom,
	        callback: callback
	    });
	};

	module.exports = exports["default"];

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _updateFragment = __webpack_require__(12);

	var _updateFragment2 = _interopRequireDefault(_updateFragment);

	var _fragmentTypes = __webpack_require__(16);

	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

	var _updateFragmentList = __webpack_require__(17);

	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);

	var _browserEventsClearEventListeners = __webpack_require__(21);

	var _browserEventsClearEventListeners2 = _interopRequireDefault(_browserEventsClearEventListeners);

	var _browserEventsAddEventListener = __webpack_require__(24);

	var _browserEventsAddEventListener2 = _interopRequireDefault(_browserEventsAddEventListener);

	var _browserEventsSharedEvents = __webpack_require__(23);

	var _browserEventsSharedEvents2 = _interopRequireDefault(_browserEventsSharedEvents);

	//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
	//refactored to by more DRY. although, this causes a significant performance cost
	//on the v8 compiler. need to explore how to refactor without introducing this performance cost

	exports["default"] = function (context, oldFragment, fragment, parentDom, component) {
	    var componentsToUpdate = [],
	        i = undefined;

	    for (i = 0, length = fragment.templateValues.length; i < length; i++) {

	        var element = oldFragment.templateElements[i];
	        var type = oldFragment.templateTypes[i];

	        fragment.templateElements[i] = element;
	        fragment.templateTypes[i] = type;

	        if (fragment.templateValues[i] !== oldFragment.templateValues[i]) {
	            switch (type) {
	                case _fragmentTypes2["default"].LIST:
	                case _fragmentTypes2["default"].LIST_REPLACE:
	                    (0, _updateFragmentList2["default"])(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
	                    break;
	                case _fragmentTypes2["default"].TEXT:
	                    element.firstChild.nodeValue = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].TEXT_DIRECT:
	                    element.nodeValue = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].FRAGMENT:
	                case _fragmentTypes2["default"].FRAGMENT_REPLACE:
	                    (0, _updateFragment2["default"])(context, oldFragment.templateValues[i], fragment.templateValues[i], element, component);
	                    break;
	                case _fragmentTypes2["default"].ATTR_CLASS:
	                    element.className = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_CHECKED:
	                    element.checked = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_SELECTED:
	                    element.selected = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_DISABLED:
	                    element.disabled = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_HREF:
	                    element.href = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_ID:
	                    element.id = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_VALUE:
	                    element.value = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_NAME:
	                    element.name = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_TYPE:
	                    element.type = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_LABEL:
	                    element.label = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_PLACEHOLDER:
	                    element.placeholder = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_STYLE:
	                    //TODO
	                    break;
	                case _fragmentTypes2["default"].ATTR_WIDTH:
	                    element.width = fragment.templateValues[i];
	                    break;
	                case _fragmentTypes2["default"].ATTR_HEIGHT:
	                    element.height = fragment.templateValues[i];
	                    break;
	                default:
	                    //custom attribute, so simply setAttribute it
	                    if (!element.props) {
	                        if (_browserEventsSharedEvents2["default"][type] != null) {
	                            (0, _browserEventsClearEventListeners2["default"])(element, type);
	                            (0, _browserEventsAddEventListener2["default"])(element, type, fragment.templateValues[i]);
	                        } else {
	                            element.setAttribute(type, fragment.templateValues[i]);
	                        }
	                    }
	                    //component prop, update it
	                    else {
	                            element.props[type] = fragment.templateValues[i];
	                            var alreadyInQueue = false;
	                            for (s = 0; s < componentsToUpdate.length; s++) {
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
	        for (i = 0; i < componentsToUpdate.length; i++) {
	            componentsToUpdate[i].forceUpdate();
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeContext = __webpack_require__(27);

	var _removeContext2 = _interopRequireDefault(_removeContext);

	var _badUpdate = __webpack_require__(28);

	var _badUpdate2 = _interopRequireDefault(_badUpdate);

	exports["default"] = function (fragment) {

	    var component = fragment.component;
	    component.componentWillUnmount();
	    (0, _removeContext2["default"])(component.context.dom);
	    component.forceUpdate = _badUpdate2["default"];
	    component.context = null;
	    component = null;
	};

	module.exports = exports["default"];

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _varsContexts = __webpack_require__(7);

	var _varsContexts2 = _interopRequireDefault(_varsContexts);

	exports["default"] = function (dom) {

	    var idx = _varsContexts2["default"].length;

	    while (idx--) {

	        if (_varsContexts2["default"][idx].dom === dom) {

	            _varsContexts2["default"].splice(idx, 1);
	            return;
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 28 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function () {

	    console.warn("Update called on a component that is no longer mounted!");
	};

	module.exports = exports["default"];

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _destroyFragment = __webpack_require__(14);

	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);

	exports["default"] = function (context, parentDom, domNode, nextFragment, replace) {

	        var noDestroy = false;
	        if (nextFragment) {

	                var domNextFragment = nextFragment.dom;
	                if (!domNextFragment) {

	                        domNextFragment = nextFragment;
	                        parentDom = domNextFragment.parentNode;
	                        noDestroy = true;
	                }
	                if (replace) {

	                        if (noDestroy === false) {

	                                (0, _destroyFragment2["default"])(context, nextFragment);
	                        }
	                        parentDom.replaceChild(domNode, domNextFragment);
	                } else {

	                        parentDom.insertBefore(domNode, domNextFragment);
	                }
	        } else {

	                parentDom.appendChild(domNode);
	        }
	};

	module.exports = exports["default"];

/***/ },
/* 30 */
/***/ function(module, exports) {

	/**
	 * Both a setter & getter for t7 dependency
	 */

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var _arguments = arguments;
	var t7dependency = true;

	exports["default"] = function (t7dependency) {

	    if (_arguments.length) {

	        t7dependency = t7dependency;

	        // if no args, do a return
	    } else {

	            return t7dependency;
	        }
	};

	module.exports = exports["default"];

/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (previousActiveElement) {

	    if (previousActiveElement && previousActiveElement != document.body && previousActiveElement != document.activeElement) {

	        previousActiveElement.focus();
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 32 */
/***/ function(module, exports) {

	
	'use strict';

	// TODO! Fix so this get automaticly pulled in from package.json
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = "0.2.4";
	module.exports = exports["default"];

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeFragment = __webpack_require__(13);

	var _removeFragment2 = _interopRequireDefault(_removeFragment);

	var _removeContext = __webpack_require__(27);

	var _removeContext2 = _interopRequireDefault(_removeContext);

	var _getContext = __webpack_require__(8);

	var _getContext2 = _interopRequireDefault(_getContext);

	var _unmountComponentAtFragment = __webpack_require__(26);

	var _unmountComponentAtFragment2 = _interopRequireDefault(_unmountComponentAtFragment);

	/**
	 * Unmount 
	 * @param {Element} dom DOM element
	 */

	exports["default"] = function (dom) {

	        var context = (0, _getContext2["default"])(dom);
	        if (context !== null) {

	                var component = context.fragment.component;
	                if (component) {

	                        (0, _removeFragment2["default"])(context, dom, component.fragment);
	                        (0, _unmountComponentAtFragment2["default"])(component.fragment);
	                } else {

	                        (0, _removeFragment2["default"])(context, dom, context.fragment);
	                        (0, _removeContext2["default"])(dom);
	                }
	        }
	};

	module.exports = exports["default"];

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _addAttributes = __webpack_require__(35);

	var _addAttributes2 = _interopRequireDefault(_addAttributes);

	var _addProperties = __webpack_require__(66);

	var _addProperties2 = _interopRequireDefault(_addProperties);

	var _utilIsBrowser = __webpack_require__(69);

	var _utilIsBrowser2 = _interopRequireDefault(_utilIsBrowser);

	exports["default"] = {

	    addAttributes: _addAttributes2["default"],
	    addProperties: _addProperties2["default"],
	    createElement: function createElement(tag) {

	        if (_utilIsBrowser2["default"]) {
	            return document.createElement(tag);
	        }
	    },
	    createTextNode: function createTextNode(text) {
	        if (_utilIsBrowser2["default"]) {
	            return document.createTextNode(text);
	        }
	    },
	    createEmptyText: function createEmptyText() {
	        if (_utilIsBrowser2["default"]) {
	            return document.createTextNode("");
	        }
	    },
	    createFragment: function createFragment() {
	        if (_utilIsBrowser2["default"]) {
	            return document.createFragment();
	        }
	    }
	};
	module.exports = exports["default"];

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _eventsSharedEvents = __webpack_require__(23);

	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);

	var _eventsClearEventListeners = __webpack_require__(21);

	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);

	var _eventsAddEventListener = __webpack_require__(24);

	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);

	var _cfgDOMAttrCfg = __webpack_require__(36);

	var _cfgDOMAttrCfg2 = _interopRequireDefault(_cfgDOMAttrCfg);

	var _utilForIn = __webpack_require__(41);

	var _utilForIn2 = _interopRequireDefault(_utilForIn);

	/**
	 * Set HTML attributes on the template
	 * @param{ HTMLElement } node
	 * @param{ Object } attrs 
	 * @param{ String } component
	 */

	exports["default"] = function (node, attrs, component) {
	    (0, _utilForIn2["default"])(attrs, function (attrName, attrVal) {
	        // avoid 'null' values
	        if (attrVal != null) {
	            if (_eventsSharedEvents2["default"][attrName] != null) {
	                (0, _eventsClearEventListeners2["default"])(node, attrName);
	                (0, _eventsAddEventListener2["default"])(node, attrName, attrVal);
	            } else {
	                (0, _cfgDOMAttrCfg2["default"])(attrName).add(node, attrName, attrVal);
	            }
	        }
	    });
	};

	module.exports = exports["default"];

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _attrsCfg = __webpack_require__(37);

	var _attrsCfg2 = _interopRequireDefault(_attrsCfg);

	var _defaultAttrCfg = __webpack_require__(64);

	var _defaultAttrCfg2 = _interopRequireDefault(_defaultAttrCfg);

	exports["default"] = function (attrName) {
	  return _attrsCfg2["default"][attrName] || _defaultAttrCfg2["default"];
	};

	module.exports = exports["default"];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _settersSetObjStyle = __webpack_require__(38);

	var _settersSetObjStyle2 = _interopRequireDefault(_settersSetObjStyle);

	var _settersRemoveProp = __webpack_require__(45);

	var _settersRemoveProp2 = _interopRequireDefault(_settersRemoveProp);

	var _settersSetPropWithCheck = __webpack_require__(50);

	var _settersSetPropWithCheck2 = _interopRequireDefault(_settersSetPropWithCheck);

	var _boolPropCfg = __webpack_require__(51);

	var _boolPropCfg2 = _interopRequireDefault(_boolPropCfg);

	var _defaultPropCfg = __webpack_require__(55);

	var _defaultPropCfg2 = _interopRequireDefault(_defaultPropCfg);

	var _boolAttrCfg = __webpack_require__(57);

	var _boolAttrCfg2 = _interopRequireDefault(_boolAttrCfg);

	var _xmlAttrCfg = __webpack_require__(60);

	var _xmlAttrCfg2 = _interopRequireDefault(_xmlAttrCfg);

	var _xlinkAttrCfg = __webpack_require__(62);

	var _xlinkAttrCfg2 = _interopRequireDefault(_xlinkAttrCfg);

	/************************** WARNING!! **********************************
	 *  Don't do any changes here except if you know what you are          *
	 *  doing. This list controlls wich attributes has to be set as an     *
	 *  HTML property, HTML boolean attribute or a HTML boolean property   *
	 ***********************************************************************/

	var attrsCfg = {
	    style: {
	        set: _settersSetObjStyle2["default"],
	        remove: _settersRemoveProp2["default"]
	    },
	    value: {
	        set: _settersSetPropWithCheck2["default"],
	        remove: _settersRemoveProp2["default"]
	    }
	};

	/**
	 * Attributes that should be set as a property on common types to improve creation performance
	 */
	("srcset enctype autocomplete htmlFor className paused placeholder playbackRate radiogroup currentTime srcObject tabIndex volume srcDoc " + "mediagroup kind label default id href value name").split(" ").forEach(function (prop) {

	    attrsCfg[prop] = _defaultPropCfg2["default"];
	});

	/**
	 * Boolean properties
	 */
	("multiple allowFullScreen async inert autofocus autoplay checked controls defer disabled enabled formNoValidate " + "loop muted noValidate open readOnly required scoped seamless selected itemScope translate " + "truespeed typemustmatch defaultSelected sortable reversed nohref noresize noshade indeterminate draggable " + "hidden defaultSelected defaultChecked compact autoplay itemscope formNoValidate").split(" ").forEach(function (prop) {

	    attrsCfg[prop] = _boolPropCfg2["default"];
	});

	/**
	 * Boolean attributes
	 */

	("multiple allowFullScreen loop muted controls seamless itemScope async nowrap inert required noresize " + "translate truespeed typemustmatch sortable reversed autoplay nohref defaultselected defaultchecked " + "checked disabled enabled selected hidden noResize " + "allowfullscreen declare spellcheck open autofocus " + "noshade indeterminate draggable defaultSelected defaultChecked compact itemscope").split(" ").forEach(function (prop) {

	    attrsCfg[prop.toLowerCase()] = _boolAttrCfg2["default"];
	});

	/**
	 * xlink namespace attributes
	 */
	"xlink:actuate xlink:arcrole xlink:href xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function (prop) {

	    attrsCfg[prop] = _xlinkAttrCfg2["default"];
	});

	/**
	 * xml namespace attributes
	 */
	"xml:base xml:id xml:lang xml:space".split(" ").forEach(function (prop) {

	    attrsCfg[prop] = _xmlAttrCfg2["default"];
	});

	exports["default"] = attrsCfg;
	module.exports = exports["default"];

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _stylesCleanValues = __webpack_require__(39);

	var _stylesCleanValues2 = _interopRequireDefault(_stylesCleanValues);

	var _utilForIn = __webpack_require__(41);

	var _utilForIn2 = _interopRequireDefault(_utilForIn);

	var _utilIsArray = __webpack_require__(44);

	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);

	/**
	 * Set CSS styles
	 *
	 * @param {Object} node
	 * @param {String} propertyName
	 * @param {String} value
	 */

	exports["default"] = function (node, propertyName, value) {

	  // FIX ME!! t7 has to be fixed so it handle object literal. Then
	  // we can remove this 'typeof' check
	  if (typeof value === "string") {

	    node.style.cssText = value;
	  } else {
	    (function () {

	      var idx = 0,
	          len = undefined,
	          style = node[propertyName];

	      (0, _utilForIn2["default"])(value, function (styleName, styleValue) {

	        if (styleValue != null) {
	          // TODO! Do we need to support array? It's a 'must wanted'
	          // feature for React, so maybe we should keep this
	          if ((0, _utilIsArray2["default"])(styleValue)) {

	            for (len = styleValue.length; idx < len; idx++) {

	              style[styleName] = (0, _stylesCleanValues2["default"])(styleName, styleValue[idx]);
	            }
	          } else {

	            style[styleName] = (0, _stylesCleanValues2["default"])(styleName, styleValue);
	          }
	        } else {

	          style[styleName] = "";
	        }
	      });
	    })();
	  }
	};

	module.exports = exports["default"];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _cfgUnitlessCfg = __webpack_require__(40);

	var _cfgUnitlessCfg2 = _interopRequireDefault(_cfgUnitlessCfg);

	exports["default"] = function (name, value) {

	    if (value == null || value === "") {

	        return "";
	    }

	    if (value === 0 || (_cfgUnitlessCfg2["default"][name] || isNaN(value))) {

	        return "" + value; // cast to string
	    }

	    if (typeof value === "string" || value instanceof Date) {

	        value = value.trim();
	    }

	    return value + "px";
	};

	module.exports = exports["default"];

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _utilForIn = __webpack_require__(41);

	var _utilForIn2 = _interopRequireDefault(_utilForIn);

	var _prefixes = __webpack_require__(42);

	var _prefixes2 = _interopRequireDefault(_prefixes);

	var _prefixKey = __webpack_require__(43);

	var _prefixKey2 = _interopRequireDefault(_prefixKey);

	/**
	 * CSS properties which accept numbers but are not in units of "px".
	 */
	var unitless = {
	    animationIterationCount: true,
	    boxFlex: true,
	    boxFlexGroup: true,
	    boxOrdinalGroup: true,
	    counterRreset: true,
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
	    lineClamp: true,
	    lineHeight: true,
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

	// convert to vendor prefixed unitless CSS properties
	(0, _utilForIn2["default"])(unitless, function (prop, value) {

	    _prefixes2["default"].forEach(function (prefix) {

	        unitless[(0, _prefixKey2["default"])(prefix, prop)] = value;
	    });
	});

	/**
	 * Common snake-cased CSS properties
	 */
	(0, _utilForIn2["default"])({
	    "animation-iteration-count": true,
	    "box-flex": true,
	    "box-flex-group": true,
	    "box-ordinal-group": true,
	    "counter-reset": true,
	    "counter-increment": true,
	    "column-count": true,
	    "flex-grow": true,
	    "flex-positive": true,
	    "flex-shrink": true,
	    "flex-negative": true,
	    "flex-order": true,
	    "font-weight": true,
	    "line-clamp": true,
	    "line-height": true,

	    // SVG-related properties
	    "stop-opacity": true,
	    "fill-opacity": true,
	    "stroke-dashoffset": true,
	    "stroke-opacity": true,
	    "stroke-width": true
	}, function (prop) {

	    _prefixes2["default"].forEach(function (prefix, value) {

	        unitless[prop] = value;
	    });
	});

	exports["default"] = unitless;
	module.exports = exports["default"];

/***/ },
/* 41 */
/***/ function(module, exports) {

	/**
	 * Simple for - in iteration loop to save some variables 
	 */
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
/* 42 */
/***/ function(module, exports) {

	/**
	 * Support style names that may come passed in prefixed by adding permutations
	 * of vendor prefixes.
	 */
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = ["Webkit", "O", "Moz", "ms"];
	module.exports = exports["default"];

/***/ },
/* 43 */
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
	  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
	};

	module.exports = exports["default"];

/***/ },
/* 44 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	exports["default"] = function (value) {
	  return value.constructor === Array;
	};

	module.exports = exports["default"];

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _hooksPropHook = __webpack_require__(46);

	var _hooksPropHook2 = _interopRequireDefault(_hooksPropHook);

	exports["default"] = function (node, name) {

	    if (HOOK.remove[name]) {

	        HOOK.remove[name](node, name);
	    } else {

	        node[name] = "";
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _settersSetSelectValue = __webpack_require__(47);

	var _settersSetSelectValue2 = _interopRequireDefault(_settersSetSelectValue);

	var _settersRemoveSelectValue = __webpack_require__(49);

	var _settersRemoveSelectValue2 = _interopRequireDefault(_settersRemoveSelectValue);

	var _utilIsArray = __webpack_require__(44);

	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);

	var _utilInArray = __webpack_require__(48);

	var _utilInArray2 = _interopRequireDefault(_utilInArray);

	var hooks = { add: {}, remove: {} };

	hooks.add.value = function (node, name, value) {

	    switch (node.tagName) {

	        case SELECT:
	            // selectbox has special case
	            (0, _settersSetSelectValue2["default"])(node, value);
	            break;
	        default:
	            if (node[name] !== value) {
	                node[name] = value;
	            }
	    }
	};

	hooks.remove.value = function (node, name) {

	    switch (node.tagName) {

	        case SELECT:
	            // selectbox has special case
	            (0, _settersRemoveSelectValue2["default"])(node);
	            break;
	        default:
	            node[name] = "";
	    }
	};

	hooks.add.title = function (node, value) {
	    var doc = node.ownerDocument;

	    (node === doc.documentElement ? doc : node).title = value;
	};

	// Radio and checkbox setter
	["radio", "checkbox"].forEach(function (tag) {
	    hooks.add[tag] = function (node, name, value) {
	        if ((0, _utilIsArray2["default"])(value)) {
	            return node.checked = (0, _utilInArray2["default"])(node.value, value) >= 0;
	        }
	    };
	});

	exports["default"] = hooks;
	module.exports = exports["default"];

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _utilInArray = __webpack_require__(48);

	var _utilInArray2 = _interopRequireDefault(_utilInArray);

	var _utilIsArray = __webpack_require__(44);

	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);

	exports["default"] = function (node, value) {

	    var isMultiple = (0, _utilIsArray2["default"])(value),
	        options = node.options,
	        len = options.length;

	    var i = 0,
	        optionNode = undefined;

	    if (value != null) {

	        while (i < len) {

	            optionNode = options[i++];

	            if (isMultiple) {

	                optionNode.selected = (0, _utilInArray2["default"])(value, optionNode.value);
	            } else {

	                optionNode.selected = optionNode.value == value;
	            }
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (arr, item) {

	    var len = arr.length;

	    var i = 0;

	    while (i < len) {

	        if (arr[i++] == item) {

	            return true;
	        }
	    }

	    return false;
	};

	module.exports = exports["default"];

/***/ },
/* 49 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});

	exports["default"] = function (node) {

	        var options = node.options,
	            len = options.length;

	        // skip iteration if no length
	        if (len) {

	                var i = 0;

	                while (i < len) {

	                        options[i++].selected = false;
	                }
	        }
	};

	module.exports = exports["default"];

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _hooksPropHook = __webpack_require__(46);

	var _hooksPropHook2 = _interopRequireDefault(_hooksPropHook);

	exports["default"] = function (node, name, value) {

	    if (_hooksPropHook2["default"].add[name]) {

	        _hooksPropHook2["default"].add(node, name, value);
	    } else {

	        if (node[name] !== value) {

	            node[name] = value;
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _setBooleanProp = __webpack_require__(52);

	var _setBooleanProp2 = _interopRequireDefault(_setBooleanProp);

	var _removeProp = __webpack_require__(53);

	var _removeProp2 = _interopRequireDefault(_removeProp);

	exports["default"] = {
	    set: _setBooleanProp2["default"],
	    remove: _removeProp2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 52 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, propertyName, propertyValue) {

	    node[propertyName] = !!propertyValue;
	};

	module.exports = exports["default"];

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeSelectValue = __webpack_require__(54);

	var _removeSelectValue2 = _interopRequireDefault(_removeSelectValue);

	var defaultPropVals = {};

	function getDefaultPropVal(tag, attrName) {

	    var tagAttrs = defaultPropVals[tag] || (defaultPropVals[tag] = {});
	    return attrName in tagAttrs ? tagAttrs[attrName] : tagAttrs[attrName] = document.createElement(tag)[attrName];
	}

	exports["default"] = function (node, name) {

	    if (name === "value" && node.tagName === "SELECT") {

	        (0, _removeSelectValue2["default"])(node);
	    } else {

	        node[name] = getDefaultPropVal(node.tagName, name);
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node) {

	    var options = node.options,
	        len = options.length;
	    // skip iteration if no length
	    if (len) {

	        var i = 0;

	        while (i < len) {

	            options[i++].selected = false;
	        }
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _setProp = __webpack_require__(56);

	var _setProp2 = _interopRequireDefault(_setProp);

	var _removeProp = __webpack_require__(53);

	var _removeProp2 = _interopRequireDefault(_removeProp);

	exports["default"] = {
	    set: _setProp2["default"],
	    remove: _removeProp2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 56 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, propertyName, propertyValue) {

	    node[propertyName] = propertyValue;
	};

	module.exports = exports["default"];

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _removeAttr = __webpack_require__(58);

	var _removeAttr2 = _interopRequireDefault(_removeAttr);

	var _setBooleanAttr = __webpack_require__(59);

	var _setBooleanAttr2 = _interopRequireDefault(_setBooleanAttr);

	exports["default"] = {
	    set: _setBooleanAttr2["default"],
	    remove: _removeAttr2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 58 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, name) {

	    node.removeAttribute(name);
	};

	module.exports = exports["default"];

/***/ },
/* 59 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, name, attrValue) {

	    // don't set falsy values!
	    if (attrValue !== false) {

	        // booleans should always be lower cased
	        node.setAttribute(name, "" + (attrValue == true ? "" : attrValue).toLowerCase());
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _xmlCfg = __webpack_require__(61);

	var _xmlCfg2 = _interopRequireDefault(_xmlCfg);

	exports["default"] = {
	    set: function set(node, key, value) {

	        node.setAttributeNS("http://www.w3.org/XML/1998/namespace", _xmlCfg2["default"][key], "" + value);
	    },
	    remove: function remove(node, key) {

	        node.removeAttributeNS("http://www.w3.org/XML/1998/namespace", _xmlCfg2["default"][key]);
	    }
	};
	module.exports = exports["default"];

/***/ },
/* 61 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = {
	    "xml:base": "base",
	    "xml:id": "id",
	    "xml:lang": "lang",
	    "xml:space": "space"
	};
	module.exports = exports["default"];

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _xlinkCfg = __webpack_require__(63);

	var _xlinkCfg2 = _interopRequireDefault(_xlinkCfg);

	exports["default"] = {
	    set: function set(node, key, value) {

	        node.setAttributeNS("http://www.w3.org/1999/xlink", _xlinkCfg2["default"][key], "" + value);
	    },
	    remove: function remove(node, key) {

	        node.removeAttributeNS("http://www.w3.org/1999/xlink", _xlinkCfg2["default"][key]);
	    }
	};
	module.exports = exports["default"];

/***/ },
/* 63 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = {
	    "xlink:actuate": "actuate",
	    "xlink:arcrole": "arcrole",
	    "xlink:href": "href",
	    "xlink:role": "role",
	    "xlink:show": "show",
	    "xlink:title": "title",
	    "xlink:type": "type"
	};
	module.exports = exports["default"];

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _setAttributes = __webpack_require__(65);

	var _setAttributes2 = _interopRequireDefault(_setAttributes);

	var _removeAttr = __webpack_require__(58);

	var _removeAttr2 = _interopRequireDefault(_removeAttr);

	exports["default"] = {
	    set: _setAttributes2["default"],
	    remove: _removeAttr2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 65 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, name, val) {

	    if (name === "type" && node.tagName === "INPUT") {

	        var value = node.value; // value will be lost in IE if type is changed
	        node.setAttribute(name, "" + val);
	        node.value = value;
	    } else {

	        node.setAttribute(name, "" + val);
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _eventsSharedEvents = __webpack_require__(23);

	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);

	var _eventsClearEventListeners = __webpack_require__(21);

	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);

	var _eventsAddEventListener = __webpack_require__(24);

	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);

	var _cfgDOMPropsCfg = __webpack_require__(67);

	var _cfgDOMPropsCfg2 = _interopRequireDefault(_cfgDOMPropsCfg);

	var _utilForIn = __webpack_require__(41);

	var _utilForIn2 = _interopRequireDefault(_utilForIn);

	/**
	 * Set HTML properties on the template
	 * @param{ HTMLElement } node
	 * @param{ Object } props 
	 * @param{ String } component
	 */

	exports["default"] = function (node, props, component) {

	    (0, _utilForIn2["default"])(props, function (propName, propVal) {
	        // avoid 'null' values
	        if (propVal != null) {
	            if (_eventsSharedEvents2["default"][propName] != null) {
	                (0, _eventsClearEventListeners2["default"])(node, propName);
	                (0, _eventsAddEventListener2["default"])(node, propName, propVal);
	            } else {
	                (0, _cfgDOMPropsCfg2["default"])(propName).add(node, propName, propVal);
	            }
	        }
	    });
	};

	module.exports = exports["default"];

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _propsCfg = __webpack_require__(68);

	var _propsCfg2 = _interopRequireDefault(_propsCfg);

	var _defaultPropCfg = __webpack_require__(55);

	var _defaultPropCfg2 = _interopRequireDefault(_defaultPropCfg);

	exports["default"] = function (propName) {
	  return _propsCfg2["default"][propName] || _defaultPropCfg2["default"];
	};

	module.exports = exports["default"];

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _settersSetObjStyle = __webpack_require__(38);

	var _settersSetObjStyle2 = _interopRequireDefault(_settersSetObjStyle);

	var _settersRemoveProp = __webpack_require__(45);

	var _settersRemoveProp2 = _interopRequireDefault(_settersRemoveProp);

	var _settersSetPropWithCheck = __webpack_require__(50);

	var _settersSetPropWithCheck2 = _interopRequireDefault(_settersSetPropWithCheck);

	var _boolPropCfg = __webpack_require__(51);

	var _boolPropCfg2 = _interopRequireDefault(_boolPropCfg);

	var _defaultAttrCfg = __webpack_require__(64);

	var _defaultAttrCfg2 = _interopRequireDefault(_defaultAttrCfg);

	var _boolAttrCfg = __webpack_require__(57);

	var _boolAttrCfg2 = _interopRequireDefault(_boolAttrCfg);

	/************************** WARNING!! **********************************
	 *  Don't do any changes here except if you know what you are          *
	 *  doing. This list controlls wich properties has to be set as an     *
	 *  HTML attributes, HTML boolean attribute or a HTML boolean property *
	 ***********************************************************************/

	var propCfg = {
	    style: {
	        set: _settersSetObjStyle2["default"],
	        remove: _settersRemoveProp2["default"]
	    },
	    value: {
	        set: _settersSetPropWithCheck2["default"],
	        remove: _settersRemoveProp2["default"]
	    }
	};

	/**
	 * Boolean attributes
	 */
	"paused spellcheck".split(" ").forEach(function (prop) {

	    propCfg[prop] = _boolAttrCfg2["default"];
	});

	/**
	 * Boolean properties
	 */
	("multiple allowFullScreen async inert autofocus autoplay checked controls defer disabled enabled formNoValidate " + "loop muted noValidate open readOnly required scoped seamless selected itemScope translate " + "truespeed typemustmatch defaultSelected sortable reversed nohref noresize noshade indeterminate draggable " + "hidden defaultSelected defaultChecked compact autoplay itemscope formNoValidate").split(" ").forEach(function (prop) {

	    propCfg[prop] = _boolPropCfg2["default"];
	});

	/**
	 * Properties that should be set as attributes
	 */
	("allowTransparency challenge charSet class classID cols contextMenu dateTime dominantBaseline form formAction formEncType " + "formMethod formTarget height keyParams keyType list manifest media role rows size sizes srcset " + "action enctype method novalidate scrolling width wmode " +
	// IE-only attribute that specifies security restrictions on an iframe
	// as an alternative to the sandbox attribute on IE<10
	"security " +
	// itemProp, itemScope, itemType are for
	// Microdata support. See http://schema.org/docs/gs.html
	"itemProp itemType inputMode inlist datatype prefix " +
	// property is supported for OpenGraph in meta tags.
	"property " + "resource rev typeof vocab about for " +
	// itemID and itemRef are for Microdata support as well but
	// only specified in the the WHATWG spec document. See
	// https://html.spec.whatwg.org/multipage/microdata.html#microdata-dom-api
	"itemID itemRef " +
	// All SVG attributes are supported if set as an attribute. This few attributes are added just to
	// prevent stupidity if anyone are trying to set them as properties
	"cursor cx cy d dx dy r rx ry viewBox transform r rx ry version y y1 y2 x1 x2 offset opacity points" +
	// IE-only attribute that controls focus behavior
	"unselectable" + "role rows size sizes srcSet").split(" ").forEach(function (prop) {

	    propCfg[prop] = _defaultAttrCfg2["default"];
	});

	exports["default"] = propCfg;
	module.exports = exports["default"];

/***/ },
/* 69 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var isBrowser = false;

	if (typeof window != "undefined") {
	  isBrowser = true;
	}

	exports["default"] = isBrowser;
	module.exports = exports["default"];

/***/ },
/* 70 */
/***/ function(module, exports) {

	/*

	  t7.js is a small, lightweight library for compiling ES2015 template literals
	  into virtual DOM objects.

	  By Dominic Gannaway

	*/

	var t7 = (function() {
	  "use strict";

	  //we store created functions in the cache (key is the template string)
	  var isBrowser = typeof window != "undefined" && document != null;
	  var docHead = null;
	  //to save time later, we can pre-create a props object structure to re-use
	  var output = null;
	  var precompile = false;
	  var version = "0.3.0";

	  if (isBrowser === true) {
	    docHead = document.getElementsByTagName('head')[0];
	  }

	  var selfClosingTags = {
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

	  //when creating a new function from a vdom, we'll need to build the vdom's children
	  function buildUniversalChildren(root, tagParams, childrenProp, component) {
	    var childrenText = [];
	    var i = 0;
	    var n = 0;
	    var key = "";
	    var matches = null;

	    //if the node has children that is an array, handle it with a loop
	    if (root.children != null && root.children instanceof Array) {
	      for (i = 0, n = root.children.length; i < n; i++) {
	        if (root.children[i] != null) {
	          if (typeof root.children[i] === "string") {
	            root.children[i] = root.children[i].replace(/(\r\n|\n|\r)/gm, "");
	            matches = root.children[i].match(/__\$props__\[\d*\]/g);
	            if (matches !== null) {
	              childrenText.push(root.children[i]);
	            } else {
	              childrenText.push("'" + root.children[i] + "'");
	            }
	          } else {
	            buildFunction(root.children[i], childrenText, component)
	          }
	        }
	      }
	      //push the children code into our tag params code
	      if (childrenText.length === 1) {
	        tagParams.push((childrenProp ? "children: " : "") + childrenText);
	      } else if (childrenText.length > 1) {
	        tagParams.push((childrenProp ? "children: " : "") + "[" + childrenText.join(",") + "]");
	      }

	    } else if (root.children != null && typeof root.children === "string") {
	      root.children = root.children.replace(/(\r\n|\n|\r)/gm, "").trim();
	      //this ensures its a prop replacement
	      matches = root.children.match(/__\$props__\[\d*\]/g);
	      //find any template strings and replace them
	      if (matches !== null) {
	        root.children = root.children.replace(/(__\$props__\[.*\])/g, "',$1,'")
	      }
	      //if the last two characters are ,', replace them with nothing
	      if (root.children.substring(root.children.length - 2) === ",'") {
	        root.children = root.children.substring(0, root.children.length - 2);
	        tagParams.push((childrenProp ? "children: " : "") + "['" + root.children + "]");
	      } else {
	        tagParams.push((childrenProp ? "children: " : "") + "['" + root.children + "']");
	      }
	    }
	  };

	  function buildInfernoTemplate(root, valueCounter, parentNodeName, templateValues, templateParams, component) {
	    //TODO this entire function is horrible, needs a revist and refactor
	    var nodeName = parentNodeName ? parentNodeName + "_" : "n_";
	    var child = null,
	      matches, valueName = "";

	    if (root.children instanceof Array) {
	      for (var i = 0; i < root.children.length; i++) {
	        child = root.children[i];
	        if (typeof child === "string" && root.children.length === 1) {
	          matches = child.match(/__\$props__\[\d*\]/g);
	          if (matches === null) {
	            if (!parentNodeName) {
	              templateParams.push("root.textContent=('" + child + "');");
	            } else {
	              templateParams.push(parentNodeName + ".textContent='" + child + "';");
	            }
	          } else {
	            valueName = "fragment.templateValues[" + valueCounter.index + "]";
	            templateParams.push("if(typeof " + valueName + " !== 'object') {");
	            if (!parentNodeName) {
	              templateParams.push("root.textContent=" + valueName + ";");
	            } else {
	              templateParams.push(parentNodeName + ".textContent=(" + valueName + " === '' ? ' ' : " + valueName + ");");
	            }
	            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.TEXT;");
	            templateParams.push("} else {");
	            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = (" + valueName + ".constructor === Array ? Inferno.Type.LIST : Inferno.Type.FRAGMENT);");
	            templateParams.push("}");
	            if (!parentNodeName) {
	              templateParams.push("fragment.templateElements[" + valueCounter.index + "] = root;");
	            } else {
	              templateParams.push("fragment.templateElements[" + valueCounter.index + "] = " + parentNodeName + ";");
	            }
	            templateValues.push(child);
	            valueCounter.index++;
	          }
	        } else if (typeof child === "string" && root.children.length > 1) {
	          matches = child.match(/__\$props__\[\d*\]/g);
	          if (matches === null) {
	            templateParams.push("var " + nodeName + i + " = Inferno.template.createText('" + child.replace(/(\r\n|\n|\r)/gm, "") + "');");
	          } else {
	            valueName = "fragment.templateValues[" + valueCounter.index + "]";
	            templateParams.push("var " + nodeName + i + ";");
	            templateParams.push("if(typeof " + valueName + " !== 'object') {");
	            templateParams.push(nodeName + i + " = Inferno.template.createText(" + valueName + ");");
	            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.TEXT_DIRECT;");
	            templateParams.push("} else {");
	            templateParams.push(nodeName + i + " = Inferno.template.createEmptyText();");
	            templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = (" + valueName + ".constructor === Array ? Inferno.Type.LIST_REPLACE : Inferno.Type.FRAGMENT_REPLACE);");
	            templateParams.push("}");
	            templateParams.push("fragment.templateElements[" + valueCounter.index + "] = " + nodeName + i + ";");
	            templateValues.push(child);
	            valueCounter.index++;
	          }
	          if (!parentNodeName) {
	            templateParams.push("root.appendChild(" + nodeName + i + ");");
	          } else {
	            templateParams.push(parentNodeName + ".appendChild(" + nodeName + i + ");");
	          }
	        } else if (child != null) {
	          if (child.tag) {
	            if (isComponentName(child.tag) === true) {
	              valueCounter.t7Required = true;
	              var props = [];
	              var propRefs = [];
	              if (child.attrs) {
	                buildInfernoAttrsParams(child, nodeName + i, props, templateValues, templateParams, valueCounter, propRefs);
	              }
	              templateParams.push("var " + nodeName + i + " = Inferno.template.createComponent(" + (!parentNodeName ? "root" : parentNodeName) + ", {" + props.join(",") + "}, t7.loadComponent('" + child.tag + "'));");
	              templateParams.push(propRefs.join(""));
	            } else {
	              templateParams.push("var " + nodeName + i + " = Inferno.template.createElement('" + child.tag + "');");
	              if (child.attrs) {
	                var attrsParams = [];
	                buildInfernoAttrsParams(child, nodeName + i, attrsParams, templateValues, templateParams, valueCounter);
	                templateParams.push("Inferno.template.addAttributes(" + nodeName + i + ", {" + attrsParams.join(",") + "});");
	              }
	              if (child.children) {
	                buildInfernoTemplate(child, valueCounter, nodeName + i, templateValues, templateParams, component);
	              }

	              if (!parentNodeName) {
	                templateParams.push("root.appendChild(" + nodeName + i + ");");
	              } else {
	                templateParams.push(parentNodeName + ".appendChild(" + nodeName + i + ");");
	              }
	            }
	          }
	        }
	      }
	    }
	  }

	  //when creating a new function from a vdom, we'll need to build the vdom's children
	  function buildReactChildren(root, tagParams, childrenProp, component) {
	    var childrenText = [];
	    var i = 0;
	    var n = 0;
	    var matches = null;

	    //if the node has children that is an array, handle it with a loop
	    if (root.children != null && root.children instanceof Array) {
	      //we're building an array in code, so we need an open bracket
	      for (i = 0, n = root.children.length; i < n; i++) {
	        if (root.children[i] != null) {
	          if (typeof root.children[i] === "string") {
	            root.children[i] = root.children[i].replace(/(\r\n|\n|\r)/gm, "");
	            matches = root.children[i].match(/__\$props__\[\d*\]/g);
	            if (matches != null) {
	              root.children[i] = root.children[i].replace(/(__\$props__\[[0-9]*\])/g, "$1")
	              if (root.children[i].substring(root.children[i].length - 1) === ",") {
	                root.children[i] = root.children[i].substring(0, root.children[i].length - 1);
	              }
	              childrenText.push(root.children[i]);
	            } else {
	              childrenText.push("'" + root.children[i] + "'");
	            }

	          } else {
	            buildFunction(root.children[i], childrenText, i === root.children.length - 1, component)
	          }
	        }
	      }
	      //push the children code into our tag params code
	      if (childrenText.length > 0) {
	        tagParams.push(childrenText.join(","));
	      }

	    } else if (root.children != null && typeof root.children === "string") {
	      root.children = root.children.replace(/(\r\n|\n|\r)/gm, "");
	      tagParams.push("'" + root.children + "'");
	    }
	  };

	  function buildInfernoAttrsParams(root, rootElement, attrsParams, templateValues, templateParams, valueCounter, propRefs) {
	    var val = '',
	      valueName;
	    var matches = null;
	    for (var name in root.attrs) {
	      val = root.attrs[name];
	      matches = val.match(/__\$props__\[\d*\]/g);
	      if (matches === null) {
	        attrsParams.push("'" + name + "':'" + val + "'");
	      } else {
	        valueName = "fragment.templateValues[" + valueCounter.index + "]";
	        if (!propRefs) {
	          switch (name) {
	            case "class":
	            case "className":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_CLASS;");
	              break;
	            case "id":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_ID;");
	              break;
	            case "value":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_VALUE;");
	              break;
	            case "width":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_WIDTH;");
	              break;
	            case "height":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_HEIGHT;");
	              break;
	            case "type":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_TYPE;");
	              break;
	            case "name":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_NAME;");
	              break;
	            case "href":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_HREF;");
	              break;
	            case "disabled":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_DISABLED;");
	              break;
	            case "checked":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_CHECKED;");
	              break;
	            case "selected":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_SELECTED;");
	              break;
	            case "label":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_LABEL;");
	              break;
	            case "style":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_STYLE;");
	              break;
	            case "placeholder":
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_PLACEHOLDER;");
	              break;
	            default:
	              templateParams.push("if(Inferno.Type.ATTR_OTHER." + name + " === undefined) { Inferno.Type.ATTR_OTHER." + name + " = '" + name + "'; }");
	              templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.ATTR_OTHER." + name + ";");
	              break;
	          }
	          templateParams.push("fragment.templateElements[" + valueCounter.index + "] = " + rootElement + ";");
	        } else {
	          templateParams.push("if(Inferno.Type.COMPONENT_PROPS." + name + " === undefined) { Inferno.Type.COMPONENT_PROPS." + name + " = '" + name + "'; }");
	          templateParams.push("fragment.templateTypes[" + valueCounter.index + "] = Inferno.Type.COMPONENT_PROPS." + name + ";");
	          propRefs.push("fragment.templateElements[" + valueCounter.index + "] = " + rootElement + ";");
	        }

	        attrsParams.push("'" + name + "':" + valueName);
	        templateValues.push(val);
	        valueCounter.index++;
	      }
	    }
	  };

	  function buildAttrsParams(root, attrsParams) {
	    var val = '';
	    var matches = null;
	    for (var name in root.attrs) {
	      val = root.attrs[name];
	      matches = val.match(/__\$props__\[\d*\]/g);
	      if (matches === null) {
	        attrsParams.push("'" + name + "':'" + val + "'");
	      } else {
	        attrsParams.push("'" + name + "':" + val);
	      }
	    }
	  };

	  function isComponentName(tagName) {
	    if (tagName[0] === tagName[0].toUpperCase()) {
	      return true;
	    }
	    return false;
	  };

	  //This takes a vDom array and builds a new function from it, to improve
	  //repeated performance at the cost of building new Functions()
	  function buildFunction(root, functionText, component, templateKey) {
	    var i = 0;
	    var tagParams = [];
	    var literalParts = [];
	    var attrsParams = [];
	    var attrsValueKeysParams = [];

	    if (root instanceof Array) {
	      //throw error about adjacent elements
	    } else {
	      //Universal output or Inferno output
	      if (output === t7.Outputs.Universal || output === t7.Outputs.Mithril) {
	        //if we have a tag, add an element, check too for a component
	        if (root.tag != null) {
	          if (isComponentName(root.tag) === false) {
	            functionText.push("{tag: '" + root.tag + "'");
	            //add the key
	            if (root.key != null) {
	              tagParams.push("key: " + root.key);
	            }
	            //build the attrs
	            if (root.attrs != null) {
	              buildAttrsParams(root, attrsParams);
	              tagParams.push("attrs: {" + attrsParams.join(',') + "}");
	            }
	            //build the children for this node
	            buildUniversalChildren(root, tagParams, true, component);
	            functionText.push(tagParams.join(',') + "}");
	          } else {
	            if (((typeof window != "undefined" && component === window) || component == null) && precompile === false) {
	              throw new Error("Error referencing component '" + root.tag + "'. Components can only be used when within modules. See documentation for more information on t7.module().");
	            }
	            if (output === t7.Outputs.Universal) {
	              //we need to apply the tag components
	              buildAttrsParams(root, attrsParams);
	              functionText.push("__$components__." + root.tag + "({" + attrsParams.join(',') + "})");
	            } else if (output === t7.Outputs.Mithril) {
	              //we need to apply the tag components
	              buildAttrsParams(root, attrsParams);
	              functionText.push("m.component(__$components__." + root.tag + ",{" + attrsParams.join(',') + "})");
	            }
	          }
	        } else {
	          //add a text entry
	          functionText.push("'" + root + "'");
	        }
	      }
	      //Inferno output
	      else if (output === t7.Outputs.Inferno) {
	        //inferno is a bit more complicated, it requires both a fragment "vdom" and a template to be generated
	        var key = root.key;
	        if (root.key === undefined) {
	          key = null;
	        }
	        var template = "null";
	        var component = null;
	        var props = null;
	        var templateParams = [];
	        var valueCounter = {
	          index: 0,
	          t7Required: false
	        };
	        var templateValues = [];

	        if (isComponentName(root.tag) === true) {
	          buildAttrsParams(root, attrsParams);
	          component = "__$components__." + root.tag;
	          props = " {" + attrsParams.join(',') + "}";
	        } else {
	          templateParams.push("var root = Inferno.template.createElement('" + root.tag + "');");
	          if (root.attrs) {
	            buildInfernoAttrsParams(root, "root", attrsParams, templateValues, templateParams, valueCounter);
	            templateParams.push("Inferno.template.addAttributes(root, {" + attrsParams.join(",") + "});");
	          }
	        }

	        if (root.children.length > 0) {
	          buildInfernoTemplate(root, valueCounter, null, templateValues, templateParams, component);
	          templateParams.push("fragment.dom = root;");
	          var scriptCode = templateParams.join("\n");
	          if (templateValues.length === 1) {
	            scriptCode = scriptCode.replace(/fragment.templateValues\[0\]/g, "fragment.templateValue");
	            scriptCode = scriptCode.replace(/fragment.templateElements\[0\]/g, "fragment.templateElement");
	            scriptCode = scriptCode.replace(/fragment.templateTypes\[0\]/g, "fragment.templateType");
	          }
	          if (isBrowser === true) {
	            addNewScriptFunction('t7._templateCache["' + templateKey + '"]=function(fragment, t7){"use strict";\n' + scriptCode + '}', templateKey);
	          } else {
	            t7._templateCache[templateKey] = new Function('"use strict";var fragment = arguments[0];var t7 = arguments[1];\n' + scriptCode);
	          }
	          t7._templateCache[templateKey].key = templateKey;
	          template = 't7._templateCache["' + templateKey + '"]';
	        }

	        var templateValuesString = "";

	        if (templateValues.length === 1) {
	          templateValuesString = "templateValue: " + templateValues[0] + ", templateElements: null, templateTypes: null, t7ref: t7";
	        } else if (templateValues.length > 1) {
	          templateValuesString = "templateValues: [" + templateValues.join(", ") + "], templateElements: Array(" + templateValues.length + "), templateTypes: Array(" + templateValues.length + "), t7ref: t7";
	        }

	        if (component !== null) {
	          functionText.push("{dom: null, component: " + component + ", props: " + props + ", key: " + key + ", template: " + template + (root.children.length > 0 ? ", " + templateValuesString : "") + "}");
	        } else {
	          functionText.push("{dom: null, key: " + key + ", template: " + template + (root.children.length > 0 ? ", " + templateValuesString : "") + "}");
	        }
	      }
	      //React output
	      else if (output === t7.Outputs.React) {
	        //if we have a tag, add an element
	        if (root.tag != null) {
	          //find out if the tag is a React componenet
	          if (isComponentName(root.tag) === true) {
	            if (((typeof window != "undefined" && component === window) || component == null) && precompile === false) {
	              throw new Error("Error referencing component '" + root.tag + "'. Components can only be used when within modules. See documentation for more information on t7.module().");
	            }
	            functionText.push("React.createElement(__$components__." + root.tag);
	          } else {
	            functionText.push("React.createElement('" + root.tag + "'");
	          }
	          //the props/attrs
	          if (root.attrs != null) {
	            buildAttrsParams(root, attrsParams);
	            //add the key
	            if (root.key != null) {
	              attrsParams.push("'key':" + root.key);
	            }
	            tagParams.push("{" + attrsParams.join(',') + "}");
	          } else {
	            tagParams.push("null");
	          }
	          //build the children for this node
	          buildReactChildren(root, tagParams, true, component);
	          functionText.push(tagParams.join(',') + ")");
	        } else {
	          //add a text entry
	          root = root.replace(/(\r\n|\n|\r)/gm, "\\n");
	          functionText.push("'" + root + "'");
	        }
	      }
	    }
	  };

	  function handleChildTextPlaceholders(childText, parent, onlyChild) {
	    var i = 0;
	    var parts = childText.split(/(__\$props__\[\d*\])/g)
	    for (i = 0; i < parts.length; i++) {
	      if (parts[i].trim() !== "") {
	        //set the children to this object
	        parent.children.push(parts[i]);
	      }
	    }
	    childText = null;

	    return childText;
	  };

	  function replaceQuotes(string) {
	    // string = string.replace(/'/g,"\\'")
	    if (string.indexOf("'") > -1) {
	      string = string.replace(/'/g, "\\'")
	    }
	    return string;
	  };

	  function applyValues(string, values) {
	    var index = 0;
	    var re = /__\$props__\[([0-9]*)\]/;
	    var placeholders = string.match(/__\$props__\[([0-9]*)\]/g);
	    for (var i = 0; i < placeholders.length; i++) {
	      index = re.exec(placeholders[i])[1];
	      string = string.replace(placeholders[i], values[index]);
	    }
	    return string;
	  };

	  function getVdom(html, values) {
	    var char = '';
	    var lastChar = '';
	    var i = 0;
	    var n = 0;
	    var root = null;
	    var insideTag = false;
	    var tagContent = '';
	    var tagName = '';
	    var vElement = null;
	    var childText = '';
	    var parent = null;
	    var tagData = null;
	    var skipAppend = false;
	    var newChild = null;
	    var hasRootNodeAlready = false;

	    for (i = 0, n = html.length; i < n; i++) {
	      //set the char to the current character in the string
	      char = html[i];
	      if (char === "<") {
	        insideTag = true;
	      } else if (char === ">" && insideTag === true) {
	        //check if first character is a close tag
	        if (tagContent[0] === "/") {
	          //bad closing tag
	          if (tagContent !== "/" + parent.tag && !selfClosingTags[parent.tag] && !parent.closed) {
	            console.error("Template error: " + applyValues(html, values));
	            throw new Error("Expected corresponding t7 closing tag for '" + parent.tag + "'.");
	          }
	          //when the childText is not empty
	          if (childText.trim() !== "") {
	            //escape quotes etc
	            childText = replaceQuotes(childText);
	            //check if childText contains one of our placeholders
	            childText = handleChildTextPlaceholders(childText, parent, true);
	            if (childText !== null && parent.children.length === 0) {
	              parent.children = childText;
	            } else if (childText != null) {
	              parent.children.push(childText);
	            }
	          }
	          //move back up the vDom tree
	          parent = parent.parent;
	          if (parent) {
	            parent.closed = true;
	          }
	        } else {
	          //check if we have any content in the childText, if so, it was a text node that needs to be added
	          if (childText.trim().length > 0 && !(parent instanceof Array)) {
	            //escape quotes etc
	            childText = replaceQuotes(childText);
	            //check the childtext for placeholders
	            childText = handleChildTextPlaceholders(
	              childText.replace(/(\r\n|\n|\r)/gm, ""),
	              parent
	            );
	            parent.children.push(childText);
	            childText = "";
	          }
	          //check if there any spaces in the tagContent, if not, we have our tagName
	          if (tagContent.indexOf(" ") === -1) {
	            tagData = {};
	            tagName = tagContent;
	          } else {
	            //get the tag data via the getTagData function
	            tagData = getTagData(tagContent);
	            tagName = tagData.tag;
	          }
	          //now we create out vElement
	          vElement = {
	            tag: tagName,
	            attrs: (tagData && tagData.attrs) ? tagData.attrs : null,
	            children: [],
	            closed: tagContent[tagContent.length - 1] === "/" || selfClosingTags[tagName] ? true : false
	          };

	          if (tagData && tagData.key) {
	            vElement.key = tagData.key;
	          }
	          //push the node we've constructed to the relevant parent
	          if (parent === null) {
	            if (hasRootNodeAlready === true) {
	              throw new Error("t7 templates must contain only a single root element");
	            }
	            hasRootNodeAlready = true;
	            if (root === null && vElement.closed === false) {
	              root = parent = vElement;
	            } else {
	              root = vElement;
	            }
	          } else if (parent instanceof Array) {
	            parent.push(vElement);
	          } else {
	            parent.children.push(vElement);
	          }
	          if (!selfClosingTags[tagName] && vElement.closed === false) {
	            //set our node's parent to our current parent
	            if (parent === vElement) {
	              vElement.parent = null;
	            } else {
	              vElement.parent = parent;
	            }
	            //now assign the parent to our new node
	            parent = vElement;
	          }
	        }
	        //reset our flags and strings
	        insideTag = false;
	        tagContent = '';
	        childText = '';
	      } else if (insideTag === true) {
	        tagContent += char;
	        lastChar = char;
	      } else {
	        childText += char;
	        lastChar = char;
	      }
	    }
	    //return the root (our constructed vDom)
	    return root;
	  }

	  function getTagData(tagText) {
	    var parts = [];
	    var char = '';
	    var lastChar = '';
	    var i = 0;
	    var s = 0;
	    var n = 0;
	    var n2 = 0;
	    var currentString = '';
	    var inQuotes = false;
	    var attrParts = [];
	    var attrs = {};
	    var key = '';

	    //build the parts of the tag
	    for (i = 0, n = tagText.length; i < n; i++) {
	      char = tagText[i];

	      if (char === " " && inQuotes === false) {
	        parts.push(currentString);
	        currentString = '';
	      } else if (char === "'") {
	        if (inQuotes === false) {
	          inQuotes = true;
	        } else {
	          inQuotes = false;
	          parts.push(currentString);
	          currentString = '';
	        }
	      } else if (char === '"') {
	        if (inQuotes === false) {
	          inQuotes = true;
	        } else {
	          inQuotes = false;
	          parts.push(currentString);
	          currentString = '';
	        }
	      } else {
	        currentString += char;
	      }
	    }

	    if (currentString !== "") {
	      parts.push(currentString);
	    }
	    currentString = '';

	    //loop through the parts of the tag
	    for (i = 1, n = parts.length; i < n; i++) {
	      attrParts = [];
	      lastChar = '';
	      currentString = '';

	      for (s = 0, n2 = parts[i].length; s < n2; s++) {
	        char = parts[i][s];

	        //if the character is =, then we're able to split the attribute name and value
	        if (char === "=") {
	          attrParts.push(currentString);
	          currentString = '';
	        } else {
	          currentString += char;
	          lastChar = char;
	        }
	      }

	      if (currentString != "") {
	        attrParts.push(currentString);
	      }
	      if (attrParts.length > 1) {
	        var matches = attrParts[1].match(/__\$props__\[\d*\]/g);
	        if (matches !== null) {
	          attrs[attrParts[0]] = attrParts[1];
	        } else {
	          if (attrParts[0] === "key") {
	            key = attrParts[1];
	          } else {
	            attrs[attrParts[0]] = attrParts[1];
	          }
	        }
	      }
	    }

	    //return the attributes and the tag name
	    return {
	      tag: parts[0],
	      attrs: attrs,
	      key: key
	    }
	  };

	  function addNewScriptFunction(scriptString, templateKey) {
	    var funcCode = scriptString + '\n//# sourceURL=' + templateKey;
	    var scriptElement = document.createElement('script');
	    scriptElement.textContent = funcCode;
	    docHead.appendChild(scriptElement);
	  }

	  function createTemplateKey(tpl) {
	    var hash = 0,
	      i, chr, len;
	    if (tpl.length == 0) return tpl;
	    for (i = 0, len = tpl.length; i < len; i++) {
	      chr = tpl.charCodeAt(i);
	      hash = ((hash << 5) - hash) + chr;
	      hash |= 0;
	    }
	    return hash;
	  };

	  //main t7 compiling function
	  function t7(template) {
	    var fullHtml = null;
	    var i = 1;
	    var n = arguments.length;
	    var functionString = null;
	    var scriptString = null;
	    var scriptCode = "";
	    var templateKey = null;
	    var tpl = template[0];
	    var values = [].slice.call(arguments, 1);

	    //build the template string
	    for (; i < n; i++) {
	      tpl += template[i];
	    };
	    //set our unique key
	    templateKey = createTemplateKey(tpl);

	    //check if we have the template in cache
	    if (t7._cache[templateKey] == null) {
	      fullHtml = '';
	      //put our placeholders around the template parts
	      for (i = 0, n = template.length; i < n; i++) {
	        if (i === template.length - 1) {
	          fullHtml += template[i];
	        } else {
	          fullHtml += template[i] + "__$props__[" + i + "]";
	        }
	      }
	      //once we have our vDom array, build an optimal function to improve performance
	      functionString = [];
	      buildFunction(
	        //build a vDom from the HTML
	        getVdom(fullHtml, values),
	        functionString,
	        this,
	        templateKey
	      );
	      scriptCode = functionString.join(',');
	      //build a new Function and store it depending if on node or browser
	      if (precompile === true) {
	        if (output === t7.Outputs.Inferno) {
	          return {
	            templateKey: templateKey,
	            inlineObject: scriptCode
	          }
	        } else {
	          return {
	            templateKey: templateKey,
	            template: 'return ' + scriptCode
	          }
	        }
	        return;
	      } else {
	        if (isBrowser === true) {
	          scriptString = 't7._cache["' + templateKey + '"]=function(__$props__, __$components__, t7)';
	          scriptString += '{"use strict";return ' + scriptCode + '}';

	          addNewScriptFunction(scriptString, templateKey);
	        } else {
	          t7._cache[templateKey] = new Function('"use strict";var __$props__ = arguments[0];var __$components__ = arguments[1];var t7 = arguments[2];return ' + scriptCode);
	        }
	      }
	    }
	    return t7._cache[templateKey](values, this, t7);
	  };

	  var ARRAY_PROPS = {
	    length: 'number',
	    sort: 'function',
	    slice: 'function',
	    splice: 'function'
	  };

	  t7._cache = {};
	  t7._templateCache = {};

	  t7.Outputs = {
	    React: 1,
	    Universal: 2,
	    Inferno: 3,
	    Mithril: 4
	  };

	  t7.getTemplateCache = function(id) {
	    return t7._templateCache[id];
	  };

	  t7.getOutput = function() {
	    return output;
	  };

	  t7.setPrecompile = function(val) {
	    precompile = val;
	  };

	  t7.getVersion = function() {
	    return version;
	  };

	  //a lightweight flow control function
	  //expects truthy and falsey to be functions
	  t7.if = function(expression, truthy) {
	      if (expression) {
	        return {
	          else: function() {
	            return truthy();
	          }
	        };
	      } else {
	        return {
	          else: function(falsey) {
	            return falsey();
	          }
	        }
	      }
	    },

	    t7.setOutput = function(newOutput) {
	      output = newOutput;
	    };

	  t7.clearCache = function() {
	    t7._cache = {};
	    t7._templateCache = {};
	  };

	  t7.assign = function(compName) {
	    throw new Error("Error assigning component '" + compName + "'. You can only assign components from within a module. Please check documentation for t7.module().");
	  };

	  t7.module = function(callback) {
	    var components = {};

	    var instance = function() {
	      return t7.apply(components, arguments);
	    };

	    instance.assign = function(name, val) {
	      if (arguments.length === 2) {
	        components[name] = val;
	      } else {
	        for (var key in name) {
	          components[key] = name[key];
	        }
	      }
	    };

	    instance.loadComponent = function(name) {
	      return components[name];
	    }

	    instance.if = t7.if;
	    instance.Outputs = t7.Outputs;
	    instance.clearCache = t7.clearCache;
	    instance.setOutput = t7.setOutput;
	    instance.getOutput = t7.getOutput;
	    instance.precompile = t7.precompile;

	    callback(instance);
	  };

	  t7.precompile = function() {

	  };

	  //set the type to React as default if it exists in global scope
	  output = typeof React != "undefined" ? t7.Outputs.React : typeof Inferno != "undefined" ? t7.Outputs.Inferno : t7.Outputs.Universal;

	  return t7;
	})();

	if (typeof module != "undefined" && module.exports != null) {
	  module.exports = t7;
	}


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	        value: true
	});
	var _arguments = arguments;

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _createFragment = __webpack_require__(72);

	var _createFragment2 = _interopRequireDefault(_createFragment);

	var _fragmentTypes = __webpack_require__(16);

	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);

	var _browserTemplateAddAttributes = __webpack_require__(35);

	var _browserTemplateAddAttributes2 = _interopRequireDefault(_browserTemplateAddAttributes);

	//this was added so vdom lovers can still use their beloved vdom API from React :)
	//this won't be performant and should only be used for prototyping/testing/experimenting
	//note, props/attrs will not update with this current implementation

	var templateKeyMap = new WeakMap();

	exports["default"] = function (tag, props) {

	        for (var _len = _arguments.length, _children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {

	                _children[_key - 2] = _arguments[_key];
	        }

	        console.warn("Inferno.vdom.createElement() is purely experimental, " + "it's performance will be poor and attributes/properities will not update (as of yet)");

	        if (children.length === 1) {

	                children = children[0];
	        }
	        //we need to create a template for this
	        function template(fragment) {

	                var root = document.createElement(tag);
	                fragment.templateElement = root;

	                if (typeof children !== "object") {

	                        fragment.templateType = _fragmentTypes2["default"].TEXT;
	                        root.textContent = children;
	                } else {

	                        if (children instanceof Array) {

	                                fragment.templateType = _fragmentTypes2["default"].LIST;
	                        } else {

	                                fragment.templateType = _fragmentTypes2["default"].FRAGMENT;
	                        }
	                }

	                if (props) {

	                        Inferno.template.addAttributes(root, props);
	                }
	                fragment.dom = root;
	        }

	        return (0, _createFragment2["default"])(children, template);
	};

	module.exports = exports["default"];

/***/ },
/* 72 */
/***/ function(module, exports) {

	//this function is really only intended to be used for DEV purposes
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (values, template) {

	    if (template.key === undefined) {

	        if (templateKeyLookup === undefined) {

	            //this was considerably faster than Symbol()
	            template.key = "tpl" + Math.floor(Math.random() * 100000);
	        }
	    }
	    if (values instanceof Array) {

	        return {
	            dom: null,
	            key: null,
	            next: null,
	            template: template,
	            templateElements: null,
	            templateTypes: null,
	            templateValues: values
	        };
	    } else {

	        return {
	            dom: null,
	            key: null,
	            next: null,
	            template: template,
	            templateElement: null,
	            templateType: null,
	            templateValue: values
	        };
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 73 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var hooks = { add: {}, remove: {} };

	hooks.add.type = function (node, name, value) {

	    var val = node.value; // value will be lost in IE if type is changed

	    node.setAttribute(name, "" + value);
	    node.value = val;
	};

	exports["default"] = hooks;
	module.exports = exports["default"];

/***/ },
/* 74 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, name) {

	    node.removeAttribute(name);
	};

	module.exports = exports["default"];

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

	var _hooksAttrHook = __webpack_require__(73);

	var _hooksAttrHook2 = _interopRequireDefault(_hooksAttrHook);

	exports["default"] = function (node, name, value) {

	    if (_hooksAttrHook2["default"].add[name]) {

	        _hooksAttrHook2["default"].add(node, name, value);
	    } else {

	        node.setAttribute(name, "" + value);
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 76 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, name, attrValue) {

	    // don't set falsy values!
	    if (attrValue !== false) {
	        // booleans should always be lower cased
	        node.setAttribute(name, "" + (attrValue == true ? "" : attrValue).toLowerCase());
	    }
	};

	module.exports = exports["default"];

/***/ },
/* 77 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, propertyName, propertyValue) {
	    // TODO! Optimize for v8
	    node[propertyName] = !!propertyValue;
	};

	module.exports = exports["default"];

/***/ },
/* 78 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	exports["default"] = function (node, propertyName, propertyValue) {

	    node[propertyName] = propertyValue;
	};

	module.exports = exports["default"];

/***/ },
/* 79 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var _uppercasePattern = /([A-Z])/g;

	exports["default"] = function (string) {
	  return string.replace(_uppercasePattern, "-$1").toLowerCase();
	};

	module.exports = exports["default"];

/***/ },
/* 80 */
/***/ function(module, exports) {

	/**
	 * Support style names that may come passed in prefixed by adding permutations
	 * of vendor prefixes.
	 */
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = ["Webkit", "O", "Moz", "ms"];
	module.exports = exports["default"];

/***/ },
/* 81 */
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
	  return prefix + key.charAt(0).toUpperCase() + key.substring(1);
	};

	module.exports = exports["default"];

/***/ }
/******/ ]);