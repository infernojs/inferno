var Inferno =
/******/ (function(modules) { // webpackBootstrap
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
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)['default'];
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _universalClassComponent = __webpack_require__(2);
	
	var _universalClassComponent2 = _interopRequireDefault(_universalClassComponent);
	
	var _browserCoreRender = __webpack_require__(8);
	
	var _browserCoreRender2 = _interopRequireDefault(_browserCoreRender);
	
	var _InfernoVersion = __webpack_require__(36);
	
	var _InfernoVersion2 = _interopRequireDefault(_InfernoVersion);
	
	var _universalCoreUnmountComponentAtNode = __webpack_require__(37);
	
	var _universalCoreUnmountComponentAtNode2 = _interopRequireDefault(_universalCoreUnmountComponentAtNode);
	
	var _universalCoreFragmentTypes = __webpack_require__(21);
	
	var _universalCoreFragmentTypes2 = _interopRequireDefault(_universalCoreFragmentTypes);
	
	var _browserTemplateTemplate = __webpack_require__(38);
	
	var _browserTemplateTemplate2 = _interopRequireDefault(_browserTemplateTemplate);
	
	var _otherSetT7Dependency = __webpack_require__(34);
	
	var _otherSetT7Dependency2 = _interopRequireDefault(_otherSetT7Dependency);
	
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
	
	exports['default'] = Inferno;
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
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	// TODO! Finish this
	
	var _createClass = __webpack_require__(3)["default"];
	
	var _classCallCheck = __webpack_require__(7)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
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
	
	var _Object$defineProperty = __webpack_require__(4)["default"];
	
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
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(5), __esModule: true };

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 6 */
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

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	exports["default"] = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	
	exports.__esModule = true;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _eventsAddRootListener = __webpack_require__(9);
	
	var _eventsAddRootListener2 = _interopRequireDefault(_eventsAddRootListener);
	
	var _eventsSharedInitialisedListeners = __webpack_require__(10);
	
	var _eventsSharedInitialisedListeners2 = _interopRequireDefault(_eventsSharedInitialisedListeners);
	
	var _varsContexts = __webpack_require__(12);
	
	var _varsContexts2 = _interopRequireDefault(_varsContexts);
	
	var _universalCoreGetContext = __webpack_require__(13);
	
	var _universalCoreGetContext2 = _interopRequireDefault(_universalCoreGetContext);
	
	var _universalCoreAttachFragment = __webpack_require__(14);
	
	var _universalCoreAttachFragment2 = _interopRequireDefault(_universalCoreAttachFragment);
	
	var _universalCoreUpdateFragment = __webpack_require__(17);
	
	var _universalCoreUpdateFragment2 = _interopRequireDefault(_universalCoreUpdateFragment);
	
	var _universalCoreMaintainFocus = __webpack_require__(35);
	
	var _universalCoreMaintainFocus2 = _interopRequireDefault(_universalCoreMaintainFocus);
	
	exports["default"] = function (fragment, dom, component) {
	
	    var context = undefined,
	        generatedFragment = undefined;
	
	    if (component) {
	
	        if (component.context) {
	
	            generatedFragment = fragment();
	            context = component.context;
	            (0, _universalCoreUpdateFragment2["default"])(context, context.fragment, generatedFragment, dom, component, false);
	            context.fragment = generatedFragment;
	        } else {
	
	            generatedFragment = fragment();
	            context = component.context = {
	                fragment: generatedFragment,
	                dom: dom,
	                shouldRecycle: true
	            };
	            component.componentWillMount();
	            (0, _universalCoreAttachFragment2["default"])(context, generatedFragment, dom, component);
	            component.componentDidMount();
	        }
	    } else {
	
	        if ((0, _eventsSharedInitialisedListeners2["default"])() === false) {
	            (0, _eventsAddRootListener2["default"])();
	            (0, _eventsSharedInitialisedListeners2["default"])(true);
	        }
	
	        context = (0, _universalCoreGetContext2["default"])(dom);
	
	        if (context) {
	
	            var activeElement = document.activeElement;
	            (0, _universalCoreUpdateFragment2["default"])(context, context.fragment, fragment, dom, component, false);
	            context.fragment = fragment;
	
	            // TODO! Move to moveFragment()
	            (0, _universalCoreMaintainFocus2["default"])(activeElement);
	        } else {
	
	            context = {
	                fragment: fragment,
	                dom: dom,
	                shouldRecycle: true
	            };
	            (0, _universalCoreAttachFragment2["default"])(context, fragment, dom, component);
	            _varsContexts2["default"].push(context);
	        }
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _sharedInitialisedListeners = __webpack_require__(10);
	
	var _sharedInitialisedListeners2 = _interopRequireDefault(_sharedInitialisedListeners);
	
	var _sharedRootListeners = __webpack_require__(11);
	
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
/* 10 */
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
/* 11 */
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
/* 12 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = [];
	module.exports = exports["default"];

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _varsContexts = __webpack_require__(12);
	
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _getRecycledFragment = __webpack_require__(15);
	
	var _getRecycledFragment2 = _interopRequireDefault(_getRecycledFragment);
	
	var _updateFragment = __webpack_require__(17);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _attachFragmentList = __webpack_require__(24);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _fragmentTypes = __webpack_require__(21);
	
	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);
	
	var _insertFragment = __webpack_require__(33);
	
	var _insertFragment2 = _interopRequireDefault(_insertFragment);
	
	var _browserCoreRender = __webpack_require__(8);
	
	var _browserCoreRender2 = _interopRequireDefault(_browserCoreRender);
	
	var _otherSetT7Dependency = __webpack_require__(34);
	
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
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _varsRecycledFragments = __webpack_require__(16);
	
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
/* 16 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = {};
	module.exports = exports["default"];

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _removeFragment = __webpack_require__(18);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragment = __webpack_require__(14);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragmentValue = __webpack_require__(20);
	
	var _updateFragmentValue2 = _interopRequireDefault(_updateFragmentValue);
	
	var _updateFragmentValues = __webpack_require__(29);
	
	var _updateFragmentValues2 = _interopRequireDefault(_updateFragmentValues);
	
	var _unmountComponentAtFragment = __webpack_require__(30);
	
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
	        if (fragment.templateValue !== undefined) {
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
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _destroyFragment = __webpack_require__(19);
	
	var _destroyFragment2 = _interopRequireDefault(_destroyFragment);
	
	exports["default"] = function (context, parentDom, item) {
	
	    var domItem = item.dom;
	    (0, _destroyFragment2["default"])(context, item);
	    parentDom.removeChild(domItem);
	};
	
	module.exports = exports["default"];

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _removeFragment = __webpack_require__(18);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _varsRecycledFragments = __webpack_require__(16);
	
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
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _updateFragment = __webpack_require__(17);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _fragmentTypes = __webpack_require__(21);
	
	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);
	
	var _updateFragmentList = __webpack_require__(22);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _browserEventsClearEventListeners = __webpack_require__(26);
	
	var _browserEventsClearEventListeners2 = _interopRequireDefault(_browserEventsClearEventListeners);
	
	var _browserEventsAddEventListener = __webpack_require__(28);
	
	var _browserEventsAddEventListener2 = _interopRequireDefault(_browserEventsAddEventListener);
	
	var _browserEventsSharedEvents = __webpack_require__(27);
	
	var _browserEventsSharedEvents2 = _interopRequireDefault(_browserEventsSharedEvents);
	
	exports["default"] = function (context, oldFragment, fragment, parentDom, component) {
	
	    var element = oldFragment.templateElement;
	    var type = oldFragment.templateType;
	
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
/* 21 */
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
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _removeFragments = __webpack_require__(23);
	
	var _removeFragments2 = _interopRequireDefault(_removeFragments);
	
	var _removeFragment = __webpack_require__(18);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _attachFragmentList = __webpack_require__(24);
	
	var _attachFragmentList2 = _interopRequireDefault(_attachFragmentList);
	
	var _attachFragment = __webpack_require__(14);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	var _updateFragment = __webpack_require__(17);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _moveFragment = __webpack_require__(25);
	
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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _removeFragment = __webpack_require__(18);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	exports["default"] = function (context, parentDom, fragments, i, to) {
	
	    for (; i < to; i++) {
	
	        (0, _removeFragment2["default"])(context, parentDom, fragments[i]);
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _attachFragment = __webpack_require__(14);
	
	var _attachFragment2 = _interopRequireDefault(_attachFragment);
	
	exports["default"] = function (context, list, parentDom, component) {
	    for (var i = 0; i < list.length; i++) {
	        (0, _attachFragment2["default"])(context, list[i], parentDom, component);
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 25 */
/***/ function(module, exports) {

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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _sharedRootListeners = __webpack_require__(11);
	
	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);
	
	var _sharedEvents = __webpack_require__(27);
	
	var _sharedEvents2 = _interopRequireDefault(_sharedEvents);
	
	exports["default"] = function (parentDom, listenerName) {
	    var listeners = _sharedRootListeners2["default"][_sharedEvents2["default"][listenerName]],
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
/* 27 */
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _sharedRootListeners = __webpack_require__(11);
	
	var _sharedRootListeners2 = _interopRequireDefault(_sharedRootListeners);
	
	var _sharedEvents = __webpack_require__(27);
	
	var _sharedEvents2 = _interopRequireDefault(_sharedEvents);
	
	exports["default"] = function (parentDom, listenerName, callback) {
	
	    _sharedRootListeners2["default"][_sharedEvents2["default"][listenerName]].push({
	        target: parentDom,
	        callback: callback
	    });
	};
	
	module.exports = exports["default"];

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _updateFragment = __webpack_require__(17);
	
	var _updateFragment2 = _interopRequireDefault(_updateFragment);
	
	var _fragmentTypes = __webpack_require__(21);
	
	var _fragmentTypes2 = _interopRequireDefault(_fragmentTypes);
	
	var _updateFragmentList = __webpack_require__(22);
	
	var _updateFragmentList2 = _interopRequireDefault(_updateFragmentList);
	
	var _browserEventsClearEventListeners = __webpack_require__(26);
	
	var _browserEventsClearEventListeners2 = _interopRequireDefault(_browserEventsClearEventListeners);
	
	var _browserEventsAddEventListener = __webpack_require__(28);
	
	var _browserEventsAddEventListener2 = _interopRequireDefault(_browserEventsAddEventListener);
	
	var _browserEventsSharedEvents = __webpack_require__(27);
	
	var _browserEventsSharedEvents2 = _interopRequireDefault(_browserEventsSharedEvents);
	
	//TODO updateFragmentValue and updateFragmentValues uses *similar* code, that could be
	//refactored to by more DRY. although, this causes a significant performance cost
	//on the v8 compiler. need to explore how to refactor without introducing this performance cost
	
	exports["default"] = function (context, oldFragment, fragment, parentDom, component) {
	    var componentsToUpdate = [];
	
	    for (var i = 0, _length = fragment.templateValues.length; i < _length; i++) {
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
	};
	
	module.exports = exports["default"];

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _removeContext = __webpack_require__(31);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _badUpdate = __webpack_require__(32);
	
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
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _varsContexts = __webpack_require__(12);
	
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
/* 32 */
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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _destroyFragment = __webpack_require__(19);
	
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
/* 34 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Both a setter & getter for t7 dependency
	 */
	
	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var t7dependency = false;
	
	if (global.t7) {
	    t7dependency = true;
	}
	
	exports["default"] = function (set7dependency) {
	    if (set7dependency === true) {
	        t7dependency = true;
	    } else {
	        return t7dependency;
	    }
	};
	
	module.exports = exports["default"];
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 35 */
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
/* 36 */
/***/ function(module, exports) {

	
	'use strict';
	
	// TODO! Fix so this get automaticly pulled in from package.json
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports["default"] = "0.2.4";
	module.exports = exports["default"];

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _removeFragment = __webpack_require__(18);
	
	var _removeFragment2 = _interopRequireDefault(_removeFragment);
	
	var _removeContext = __webpack_require__(31);
	
	var _removeContext2 = _interopRequireDefault(_removeContext);
	
	var _getContext = __webpack_require__(13);
	
	var _getContext2 = _interopRequireDefault(_getContext);
	
	var _unmountComponentAtFragment = __webpack_require__(30);
	
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
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _addAttributes = __webpack_require__(39);
	
	var _addAttributes2 = _interopRequireDefault(_addAttributes);
	
	var _addProperties = __webpack_require__(68);
	
	var _addProperties2 = _interopRequireDefault(_addProperties);
	
	var _utilIsBrowser = __webpack_require__(71);
	
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
	    }
	};
	module.exports = exports["default"];

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _eventsSharedEvents = __webpack_require__(27);
	
	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);
	
	var _eventsClearEventListeners = __webpack_require__(26);
	
	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);
	
	var _eventsAddEventListener = __webpack_require__(28);
	
	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);
	
	var _cfgDOMAttrCfg = __webpack_require__(40);
	
	var _cfgDOMAttrCfg2 = _interopRequireDefault(_cfgDOMAttrCfg);
	
	var _utilForIn = __webpack_require__(43);
	
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
	                (0, _cfgDOMAttrCfg2["default"])(attrName).set(node, attrName, attrVal);
	            }
	        }
	    });
	};
	
	module.exports = exports["default"];

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _attrsCfg = __webpack_require__(41);
	
	var _attrsCfg2 = _interopRequireDefault(_attrsCfg);
	
	var _defaultAttrCfg = __webpack_require__(64);
	
	var _defaultAttrCfg2 = _interopRequireDefault(_defaultAttrCfg);
	
	exports["default"] = function (attrName) {
	  return _attrsCfg2["default"][attrName] || _defaultAttrCfg2["default"];
	};
	
	module.exports = exports["default"];

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersSetObjStyle = __webpack_require__(42);
	
	var _settersSetObjStyle2 = _interopRequireDefault(_settersSetObjStyle);
	
	var _settersRemoveProp = __webpack_require__(45);
	
	var _settersRemoveProp2 = _interopRequireDefault(_settersRemoveProp);
	
	var _settersSetPropWithCheck = __webpack_require__(51);
	
	var _settersSetPropWithCheck2 = _interopRequireDefault(_settersSetPropWithCheck);
	
	var _boolPropCfg = __webpack_require__(52);
	
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
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _utilForIn = __webpack_require__(43);
	
	var _utilForIn2 = _interopRequireDefault(_utilForIn);
	
	var _hooksStyleHook = __webpack_require__(44);
	
	var _hooksStyleHook2 = _interopRequireDefault(_hooksStyleHook);
	
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
	
	        (0, _utilForIn2["default"])(value, function (styleName, styleValue) {
	
	            var style = node[propertyName],
	                setter = _hooksStyleHook2["default"].set[styleName] || _hooksStyleHook2["default"].find(styleName, style);
	
	            if (value == null) {
	                value = "";
	            }
	
	            if (typeof setter === "function") {
	                setter(value, style);
	            } else {
	                style[setter] = typeof value === "number" ? value + "px" : value + ""; // cast to string
	            }
	        });
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 43 */
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
/* 44 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];
	
	// Helper for CSS properties access
	var reDash = /\-./g,
	    hooks = { set: {}, find: function find(name, style) {
	
	        var propName = name.replace(reDash, function (str) {
	            return str[1].toUpperCase();
	        });
	
	        if (!(propName in style)) {
	            propName = VENDOR_PREFIXES.map(function (prefix) {
	                return prefix + propName[0].toUpperCase() + propName.slice(1);
	            }).filter(function (prop) {
	                return prop in style;
	            })[0];
	        }
	
	        return this.set[name] = propName;
	    } };
	
	// Exclude the following css properties from adding px
	"float fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" ").forEach(function (propName) {
	    var stylePropName = propName.replace(reDash, function (str) {
	        return str[1].toUpperCase();
	    });
	
	    hooks.set[propName] = function (value, style) {
	        style[stylePropName] = value.toString();
	    };
	});
	
	exports["default"] = hooks;
	module.exports = exports["default"];

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _hooksPropHook = __webpack_require__(46);
	
	var _hooksPropHook2 = _interopRequireDefault(_hooksPropHook);
	
	exports["default"] = function (node, name) {
	
	    var hook = _hooksPropHook2["default"].remove[name];
	
	    if (hook) {
	
	        hook[name](node, name);
	    } else {
	        // 'className' is a edge case, and has to be set as empty string
	        node[name] = name === "className" ? "" : null;
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersSetSelectValue = __webpack_require__(47);
	
	var _settersSetSelectValue2 = _interopRequireDefault(_settersSetSelectValue);
	
	var _settersRemoveSelectValue = __webpack_require__(50);
	
	var _settersRemoveSelectValue2 = _interopRequireDefault(_settersRemoveSelectValue);
	
	var _utilIsArray = __webpack_require__(49);
	
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
	            node[name] = null;
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
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _utilInArray = __webpack_require__(48);
	
	var _utilInArray2 = _interopRequireDefault(_utilInArray);
	
	var _utilIsArray = __webpack_require__(49);
	
	var _utilIsArray2 = _interopRequireDefault(_utilIsArray);
	
	exports["default"] = function (node, value) {
	
	    var isMultiple = (0, _utilIsArray2["default"])(value),
	        options = node.options,
	        len = options.length;
	
	    var idx = 0,
	        optionNode = undefined;
	
	    if (value != null) {
	
	        while (idx < len) {
	
	            optionNode = options[idx++];
	
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
	
	exports["default"] = function (value) {
	  return value.constructor === Array;
	};
	
	module.exports = exports["default"];

/***/ },
/* 50 */
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
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _hooksPropHook = __webpack_require__(46);
	
	var _hooksPropHook2 = _interopRequireDefault(_hooksPropHook);
	
	exports["default"] = function (node, name, value) {
	
	    var hook = _hooksPropHook2["default"].set[name];
	
	    if (hook) {
	
	        hook(node, name, value);
	    } else {
	
	        if (node[name] !== value) {
	
	            node[name] = value;
	        }
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersSetBooleanProp = __webpack_require__(53);
	
	var _settersSetBooleanProp2 = _interopRequireDefault(_settersSetBooleanProp);
	
	var _settersRemoveBooleanProp = __webpack_require__(54);
	
	var _settersRemoveBooleanProp2 = _interopRequireDefault(_settersRemoveBooleanProp);
	
	exports["default"] = {
	    set: _settersSetBooleanProp2["default"],
	    remove: _settersRemoveBooleanProp2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 53 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports["default"] = function (node, propName, value) {
	    // Legacy browsers would fuck this up if we don't force
	    // the value to be a boolean
	    node[propName] = !!value;
	};
	
	module.exports = exports["default"];

/***/ },
/* 54 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
					value: true
	});
	
	exports["default"] = function (node, propName) {
					// Set corresponding property to false
					node[propName] = false;
	
					// Remove the attribute
	
					// Todo! Should we remove boolean attrs here as well?
	
					//    node.removeAttribute(propName);
	};
	
	module.exports = exports["default"];

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersSetProp = __webpack_require__(56);
	
	var _settersSetProp2 = _interopRequireDefault(_settersSetProp);
	
	var _settersRemoveProp = __webpack_require__(45);
	
	var _settersRemoveProp2 = _interopRequireDefault(_settersRemoveProp);
	
	exports["default"] = {
	    set: _settersSetProp2["default"],
	    remove: _settersRemoveProp2["default"]
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
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersRemoveBooleanAttr = __webpack_require__(58);
	
	var _settersRemoveBooleanAttr2 = _interopRequireDefault(_settersRemoveBooleanAttr);
	
	var _settersSetBooleanAttr = __webpack_require__(59);
	
	var _settersSetBooleanAttr2 = _interopRequireDefault(_settersSetBooleanAttr);
	
	exports["default"] = {
	    set: _settersSetBooleanAttr2["default"],
	    remove: _settersRemoveBooleanAttr2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 58 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	exports["default"] = function (node, propName) {
	    // Set corresponding property to false
	    node[propName] = false;
	    // Remove the attribute
	    node.removeAttribute(propName);
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
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
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
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
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
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersSetAttributes = __webpack_require__(65);
	
	var _settersSetAttributes2 = _interopRequireDefault(_settersSetAttributes);
	
	var _settersRemoveAttr = __webpack_require__(67);
	
	var _settersRemoveAttr2 = _interopRequireDefault(_settersRemoveAttr);
	
	exports["default"] = {
	    set: _settersSetAttributes2["default"],
	    remove: _settersRemoveAttr2["default"]
	};
	module.exports = exports["default"];

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _hooksAttrHook = __webpack_require__(66);
	
	var _hooksAttrHook2 = _interopRequireDefault(_hooksAttrHook);
	
	exports["default"] = function (node, name, value) {
	
	    var hook = _hooksAttrHook2["default"].add[name];
	
	    if (hook) {
	
	        hook(node, name, value);
	    } else {
	
	        node.setAttribute(name, "" + value); // cast to string
	    }
	};
	
	module.exports = exports["default"];

/***/ },
/* 66 */
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
/* 67 */
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
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _eventsSharedEvents = __webpack_require__(27);
	
	var _eventsSharedEvents2 = _interopRequireDefault(_eventsSharedEvents);
	
	var _eventsClearEventListeners = __webpack_require__(26);
	
	var _eventsClearEventListeners2 = _interopRequireDefault(_eventsClearEventListeners);
	
	var _eventsAddEventListener = __webpack_require__(28);
	
	var _eventsAddEventListener2 = _interopRequireDefault(_eventsAddEventListener);
	
	var _cfgDOMPropsCfg = __webpack_require__(69);
	
	var _cfgDOMPropsCfg2 = _interopRequireDefault(_cfgDOMPropsCfg);
	
	var _utilForIn = __webpack_require__(43);
	
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
	                (0, _cfgDOMPropsCfg2["default"])(propName).set(node, propName, propVal);
	            }
	        }
	    });
	};
	
	module.exports = exports["default"];

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _propsCfg = __webpack_require__(70);
	
	var _propsCfg2 = _interopRequireDefault(_propsCfg);
	
	var _defaultPropCfg = __webpack_require__(55);
	
	var _defaultPropCfg2 = _interopRequireDefault(_defaultPropCfg);
	
	exports["default"] = function (propName) {
	  return _propsCfg2["default"][propName] || _defaultPropCfg2["default"];
	};
	
	module.exports = exports["default"];

/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _interopRequireDefault = __webpack_require__(1)["default"];
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _settersSetObjStyle = __webpack_require__(42);
	
	var _settersSetObjStyle2 = _interopRequireDefault(_settersSetObjStyle);
	
	var _settersRemoveProp = __webpack_require__(45);
	
	var _settersRemoveProp2 = _interopRequireDefault(_settersRemoveProp);
	
	var _settersSetPropWithCheck = __webpack_require__(51);
	
	var _settersSetPropWithCheck2 = _interopRequireDefault(_settersSetPropWithCheck);
	
	var _boolPropCfg = __webpack_require__(52);
	
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
/* 71 */
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

/***/ }
/******/ ]);
//# sourceMappingURL=inferno.js.map