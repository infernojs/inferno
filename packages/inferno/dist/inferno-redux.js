/*!
 * inferno-redux v0.7.10
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.InfernoRedux = global.InfernoRedux || {})));
}(this, function (exports) { 'use strict';

  function isNullOrUndefined(obj) {
  	return obj === void 0 || obj === null;
  }

  function isInvalidNode(obj) {
  	return obj === null || obj === false || obj === void 0;
  }

  function isFunction(obj) {
  	return typeof obj === 'function';
  }

  function createNullNode() {
  	return {
  		null: true,
  		dom: document.createTextNode('')
  	};
  }

  function constructDefaults(string, object, value) {
  	/* eslint no-return-assign: 0 */
  	string.split(',').forEach(function (i) {
  		return object[i] = value;
  	});
  }

  var xlinkNS = 'http://www.w3.org/1999/xlink';
  var xmlNS = 'http://www.w3.org/XML/1998/namespace';
  var strictProps = {};
  var booleanProps = {};
  var namespaces = {};

  constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
  constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
  constructDefaults('volume,value', strictProps, true);
  constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);

  var screenWidth = window.screen.width;
  var screenHeight = window.screen.height;
  var scrollX = 0;
  var scrollY = 0;
  var lastScrollTime = 0;

  window.onscroll = function (e) {
  	scrollX = window.scrollX;
  	scrollY = window.scrollY;
  	lastScrollTime = performance.now();
  };

  window.resize = function (e) {
  	scrollX = window.scrollX;
  	scrollY = window.scrollY;
  	screenWidth = window.screen.width;
  	screenHeight = window.screen.height;
  	lastScrollTime = performance.now();
  };

  function Lifecycle() {
  	this._listeners = [];
  	this.scrollX = null;
  	this.scrollY = null;
  	this.screenHeight = screenHeight;
  	this.screenWidth = screenWidth;
  }

  Lifecycle.prototype = {
  	refresh: function refresh() {
  		this.scrollX = window.scrollX;
  		this.scrollY = window.scrollY;
  	},
  	addListener: function addListener(callback) {
  		this._listeners.push(callback);
  	},
  	trigger: function trigger() {
  		for (var i = 0; i < this._listeners.length; i++) {
  			this._listeners[i]();
  		}
  	}
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
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

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';

  // Copy of the util from dom/util, otherwise it makes massive bundles
  function getActiveNode() {
  	return document.activeElement;
  }

  // Copy of the util from dom/util, otherwise it makes massive bundles
  function resetActiveNode(activeNode) {
  	if (activeNode !== document.body && document.activeElement !== activeNode) {
  		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
  	}
  }

  function queueStateChanges(component, newState, callback) {
  	for (var stateKey in newState) {
  		component._pendingState[stateKey] = newState[stateKey];
  	}
  	if (!component._pendingSetState) {
  		component._pendingSetState = true;
  		applyState(component, false, callback);
  	} else {
  		var pendingState = component._pendingState;
  		var oldState = component.state;

  		component.state = Object.assign({}, oldState, pendingState);
  		component._pendingState = {};
  	}
  }

  function applyState(component, force, callback) {
  	if (!component._deferSetState || force) {
  		component._pendingSetState = false;
  		var pendingState = component._pendingState;
  		var oldState = component.state;
  		var nextState = Object.assign({}, oldState, pendingState);

  		component._pendingState = {};
  		var nextNode = component._updateComponent(oldState, nextState, component.props, component.props, force);

  		if (isInvalidNode(nextNode)) {
  			nextNode = createNullNode();
  		}
  		var lastNode = component._lastNode;
  		var parentDom = lastNode.dom.parentNode;

  		var activeNode = getActiveNode();
  		var subLifecycle = new Lifecycle();
  		component._patch(lastNode, nextNode, parentDom, subLifecycle, component.context, component, null);
  		component._lastNode = nextNode;
  		component._parentNode.dom = nextNode.dom;

  		subLifecycle.trigger();
  		if (!isNullOrUndefined(callback)) {
  			callback();
  		}
  		resetActiveNode(activeNode);
  	}
  }

  var Component$1 = function () {
  	function Component(props) {
  		classCallCheck(this, Component);

  		/** @type {object} */
  		this.props = props || {};

  		/** @type {object} */
  		this.state = {};

  		/** @type {object} */
  		this.refs = {};
  		this._blockSetState = false;
  		this._deferSetState = false;
  		this._pendingSetState = false;
  		this._pendingState = {};
  		this._parentNode = null;
  		this._lastNode = null;
  		this._unmounted = true;
  		this.context = {};
  		this._patch = null;
  		this._parentComponent = null;
  	}

  	createClass(Component, [{
  		key: 'render',
  		value: function render() {}
  	}, {
  		key: 'forceUpdate',
  		value: function forceUpdate(callback) {
  			if (this._unmounted) {
  				throw Error(noOp);
  			}
  			applyState(this, true, callback);
  		}
  	}, {
  		key: 'setState',
  		value: function setState(newState, callback) {
  			if (this._unmounted) {
  				throw Error(noOp);
  			}
  			if (this._blockSetState === false) {
  				queueStateChanges(this, newState, callback);
  			} else {
  				throw Error('Inferno Warning: Cannot update state via setState() in componentWillUpdate()');
  			}
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
  	}, {
  		key: 'getChildContext',
  		value: function getChildContext() {}
  	}, {
  		key: '_updateComponent',
  		value: function _updateComponent(prevState, nextState, prevProps, nextProps, force) {
  			if (this._unmounted === true) {
  				this._unmounted = false;
  				return false;
  			}
  			if (!isNullOrUndefined(nextProps) && isNullOrUndefined(nextProps.children)) {
  				nextProps.children = prevProps.children;
  			}
  			if (prevProps !== nextProps || prevState !== nextState || force) {
  				if (prevProps !== nextProps) {
  					this._blockSetState = true;
  					this.componentWillReceiveProps(nextProps);
  					this._blockSetState = false;
  				}
  				var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

  				if (shouldUpdate !== false) {
  					this._blockSetState = true;
  					this.componentWillUpdate(nextProps, nextState);
  					this._blockSetState = false;
  					this.props = nextProps;
  					this.state = nextState;
  					var node = this.render();

  					this.componentDidUpdate(prevProps, prevState);
  					return node;
  				}
  			}
  			return false;
  		}
  	}]);
  	return Component;
  }();

  /**
   * Prints a warning in the console if it exists.
   *
   * @param {String} message The warning message.
   * @returns {void}
   */
  function warning$1(message) {
  	/* eslint-disable no-console */
  	if (typeof console !== 'undefined' && typeof console.error === 'function') {
  		console.error(message);
  	}
  	/* eslint-enable no-console */
  	try {
  		// This error was thrown as a convenience so that if you enable
  		// "break on all exceptions" in your console,
  		// it would pause the execution at this line.
  		throw new Error(message);
  		/* eslint-disable no-empty */
  	} catch (e) {}
  	/* eslint-enable no-empty */
  }

  function shallowEqual(objA, objB) {
  	if (objA === objB) {
  		return true;
  	}
  	var keysA = Object.keys(objA);
  	var keysB = Object.keys(objB);

  	if (keysA.length !== keysB.length) {
  		return false;
  	}
  	// Test for A's keys different from B.
  	var hasOwn = Object.prototype.hasOwnProperty;
  	for (var i = 0; i < keysA.length; i++) {
  		if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
  			return false;
  		}
  	}
  	return true;
  }

  var didWarnAboutReceivingStore = false;
  function warnAboutReceivingStore() {
  	if (didWarnAboutReceivingStore) {
  		return;
  	}
  	didWarnAboutReceivingStore = true;

  	warning$1('<Provider> does not support changing `store` on the fly.');
  }

  var Provider = function (_Component) {
  	inherits(Provider, _Component);
  	createClass(Provider, [{
  		key: 'getChildContext',
  		value: function getChildContext() {
  			return { store: this.store };
  		}
  	}]);

  	function Provider(props, context) {
  		classCallCheck(this, Provider);

  		var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Provider).call(this, props, context));

  		_this.store = props.store;
  		return _this;
  	}

  	createClass(Provider, [{
  		key: 'render',
  		value: function render() {
  			return this.props.children;
  		}
  	}]);
  	return Provider;
  }(Component$1);

  if ('development' !== 'production') {
  	Provider.prototype.componentWillReceiveProps = function (nextProps) {
  		var store = this.store;
  		var nextStore = nextProps.store;


  		if (store !== nextStore) {
  			warnAboutReceivingStore();
  		}
  	};
  }

  function VNode(blueprint) {
  	this.bp = blueprint;
  	this.dom = null;
  	this.instance = null;
  	this.tag = null;
  	this.children = null;
  	this.style = null;
  	this.className = null;
  	this.attrs = null;
  	this.events = null;
  	this.hooks = null;
  	this.key = null;
  	this.clipData = null;
  }

  VNode.prototype = {
  	setAttrs: function setAttrs(attrs) {
  		this.attrs = attrs;
  		return this;
  	},
  	setTag: function setTag(tag) {
  		this.tag = tag;
  		return this;
  	},
  	setStyle: function setStyle(style) {
  		this.style = style;
  		return this;
  	},
  	setClassName: function setClassName(className) {
  		this.className = className;
  		return this;
  	},
  	setChildren: function setChildren(children) {
  		this.children = children;
  		return this;
  	},
  	setHooks: function setHooks(hooks) {
  		this.hooks = hooks;
  		return this;
  	},
  	setEvents: function setEvents(events) {
  		this.events = events;
  		return this;
  	},
  	setKey: function setKey(key) {
  		this.key = key;
  		return this;
  	}
  };

  function createVNode(bp) {
  	return new VNode(bp);
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var index = createCommonjsModule(function (module) {
  'use strict';

  var INFERNO_STATICS = {
      childContextTypes: true,
      contextTypes: true,
      defaultProps: true,
      displayName: true,
      getDefaultProps: true,
      propTypes: true,
      type: true
  };

  var KNOWN_STATICS = {
      name: true,
      length: true,
      prototype: true,
      caller: true,
      arguments: true,
      arity: true
  };

  var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

  module.exports = function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
      if (typeof sourceComponent !== 'string') {
          // don't hoist over string (html) components
          var keys = Object.getOwnPropertyNames(sourceComponent);

          /* istanbul ignore else */
          if (isGetOwnPropertySymbolsAvailable) {
              keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
          }

          for (var i = 0; i < keys.length; ++i) {
              if (!INFERNO_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                  try {
                      targetComponent[keys[i]] = sourceComponent[keys[i]];
                  } catch (error) {}
              }
          }
      }

      return targetComponent;
  };
  });

  var hoistStatics = (index && typeof index === 'object' && 'default' in index ? index['default'] : index);

  var errorObject = { value: null };
  var defaultMapStateToProps = function defaultMapStateToProps(state) {
  	return {};
  }; // eslint-disable-line no-unused-vars
  var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
  	return { dispatch: dispatch };
  };
  var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
  	return Object.assign({}, parentProps, stateProps, dispatchProps);
  };

  function tryCatch(fn, ctx) {
  	try {
  		return fn.apply(ctx);
  	} catch (e) {
  		errorObject.value = e;
  		return errorObject;
  	}
  }

  function getDisplayName(WrappedComponent) {
  	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
  }
  // Helps track hot reloading.
  var nextVersion = 0;

  function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
  	var options = arguments.length <= 3 || arguments[3] === void 0 ? {} : arguments[3];

  	var shouldSubscribe = Boolean(mapStateToProps);
  	var mapState = mapStateToProps || defaultMapStateToProps;
  	var mapDispatch = void 0;

  	if (isFunction(mapDispatchToProps)) {
  		mapDispatch = mapDispatchToProps;
  	} else if (!mapDispatchToProps) {
  		mapDispatch = defaultMapDispatchToProps;
  	} else {
  		mapDispatch = wrapActionCreators(mapDispatchToProps);
  	}
  	var finalMergeProps = mergeProps || defaultMergeProps;
  	var _options$pure = options.pure;
  	var pure = _options$pure === void 0 ? true : _options$pure;
  	var _options$withRef = options.withRef;
  	var withRef = _options$withRef === void 0 ? false : _options$withRef;

  	var checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;
  	// Helps track hot reloading.
  	var version = nextVersion++;

  	return function wrapWithConnect(WrappedComponent) {
  		var connectDisplayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';

  		function checkStateShape(props, methodName) {
  			if (!isPlainObject(props)) {
  				warning(methodName + '() in ' + connectDisplayName + ' must return a plain object. ' + ('Instead received ' + props + '.'));
  			}
  		}
  		function computeMergedProps(stateProps, dispatchProps, parentProps) {
  			var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
  			if ('development' !== 'production') {
  				checkStateShape(mergedProps, 'mergeProps');
  			}
  			return mergedProps;
  		}

  		var Connect = function (_Component) {
  			inherits(Connect, _Component);
  			createClass(Connect, [{
  				key: 'shouldComponentUpdate',
  				value: function shouldComponentUpdate() {
  					return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
  				}
  			}]);

  			function Connect(props, context) {
  				classCallCheck(this, Connect);

  				var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Connect).call(this, props, context));

  				_this.version = version;
  				_this.store = props.store || context.store;

  				invariant(_this.store, 'Could not find "store" in either the context or ' + ('props of "' + connectDisplayName + '". ') + 'Either wrap the root component in a <Provider>, ' + ('or explicitly pass "store" as a prop to "' + connectDisplayName + '".'));

  				var storeState = _this.store.getState();
  				_this.state = { storeState: storeState };
  				_this.clearCache();
  				return _this;
  			}

  			createClass(Connect, [{
  				key: 'computeStateProps',
  				value: function computeStateProps(store, props) {
  					if (!this.finalMapStateToProps) {
  						return this.configureFinalMapState(store, props);
  					}
  					var state = store.getState();
  					var stateProps = this.doStatePropsDependOnOwnProps ? this.finalMapStateToProps(state, props) : this.finalMapStateToProps(state);

  					return stateProps;
  				}
  			}, {
  				key: 'configureFinalMapState',
  				value: function configureFinalMapState(store, props) {
  					var mappedState = mapState(store.getState(), props);
  					var isFactory = isFunction(mappedState);

  					this.finalMapStateToProps = isFactory ? mappedState : mapState;
  					this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;
  					if (isFactory) {
  						return this.computeStateProps(store, props);
  					}
  					return mappedState;
  				}
  			}, {
  				key: 'computeDispatchProps',
  				value: function computeDispatchProps(store, props) {
  					if (!this.finalMapDispatchToProps) {
  						return this.configureFinalMapDispatch(store, props);
  					}
  					var dispatch = store.dispatch;

  					var dispatchProps = this.doDispatchPropsDependOnOwnProps ? this.finalMapDispatchToProps(dispatch, props) : this.finalMapDispatchToProps(dispatch);

  					return dispatchProps;
  				}
  			}, {
  				key: 'configureFinalMapDispatch',
  				value: function configureFinalMapDispatch(store, props) {
  					var mappedDispatch = mapDispatch(store.dispatch, props);
  					var isFactory = isFunction(mappedDispatch);

  					this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
  					this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;

  					if (isFactory) {
  						return this.computeDispatchProps(store, props);
  					}
  					return mappedDispatch;
  				}
  			}, {
  				key: 'updateStatePropsIfNeeded',
  				value: function updateStatePropsIfNeeded() {
  					var nextStateProps = this.computeStateProps(this.store, this.props);

  					if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
  						return false;
  					}
  					this.stateProps = nextStateProps;
  					return true;
  				}
  			}, {
  				key: 'updateDispatchPropsIfNeeded',
  				value: function updateDispatchPropsIfNeeded() {
  					var nextDispatchProps = this.computeDispatchProps(this.store, this.props);

  					if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
  						return false;
  					}
  					this.dispatchProps = nextDispatchProps;
  					return true;
  				}
  			}, {
  				key: 'updateMergedPropsIfNeeded',
  				value: function updateMergedPropsIfNeeded() {
  					var nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);

  					if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
  						return false;
  					}
  					this.mergedProps = nextMergedProps;
  					return true;
  				}
  			}, {
  				key: 'isSubscribed',
  				value: function isSubscribed() {
  					return isFunction(this.unsubscribe);
  				}
  			}, {
  				key: 'trySubscribe',
  				value: function trySubscribe() {
  					if (shouldSubscribe && !this.unsubscribe) {
  						this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
  						this.handleChange();
  					}
  				}
  			}, {
  				key: 'tryUnsubscribe',
  				value: function tryUnsubscribe() {
  					if (this.unsubscribe) {
  						this.unsubscribe();
  						this.unsubscribe = null;
  					}
  				}
  			}, {
  				key: 'componentDidMount',
  				value: function componentDidMount() {
  					this.trySubscribe();
  				}
  			}, {
  				key: 'componentWillReceiveProps',
  				value: function componentWillReceiveProps(nextProps) {
  					if (!pure || !shallowEqual(nextProps, this.props)) {
  						this.haveOwnPropsChanged = true;
  					}
  				}
  			}, {
  				key: 'componentWillUnmount',
  				value: function componentWillUnmount() {
  					this.tryUnsubscribe();
  					this.clearCache();
  				}
  			}, {
  				key: 'clearCache',
  				value: function clearCache() {
  					this.dispatchProps = null;
  					this.stateProps = null;
  					this.mergedProps = null;
  					this.haveOwnPropsChanged = true;
  					this.hasStoreStateChanged = true;
  					this.haveStatePropsBeenPrecalculated = false;
  					this.statePropsPrecalculationError = null;
  					this.renderedElement = null;
  					this.finalMapDispatchToProps = null;
  					this.finalMapStateToProps = null;
  				}
  			}, {
  				key: 'handleChange',
  				value: function handleChange() {
  					if (!this.unsubscribe) {
  						return;
  					}
  					var storeState = this.store.getState();
  					var prevStoreState = this.state.storeState;

  					if (pure && prevStoreState === storeState) {
  						return;
  					}
  					if (pure && !this.doStatePropsDependOnOwnProps) {
  						var haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
  						if (!haveStatePropsChanged) {
  							return;
  						}
  						if (haveStatePropsChanged === errorObject) {
  							this.statePropsPrecalculationError = errorObject.value;
  						}
  						this.haveStatePropsBeenPrecalculated = true;
  					}
  					this.hasStoreStateChanged = true;
  					this.setState({ storeState: storeState });
  				}
  			}, {
  				key: 'getWrappedInstance',
  				value: function getWrappedInstance() {
  					return this.refs.wrappedInstance;
  				}
  			}, {
  				key: 'render',
  				value: function render() {
  					var haveOwnPropsChanged = this.haveOwnPropsChanged;
  					var hasStoreStateChanged = this.hasStoreStateChanged;
  					var haveStatePropsBeenPrecalculated = this.haveStatePropsBeenPrecalculated;
  					var statePropsPrecalculationError = this.statePropsPrecalculationError;
  					var renderedElement = this.renderedElement;


  					this.haveOwnPropsChanged = false;
  					this.hasStoreStateChanged = false;
  					this.haveStatePropsBeenPrecalculated = false;
  					this.statePropsPrecalculationError = null;

  					if (statePropsPrecalculationError) {
  						throw statePropsPrecalculationError;
  					}
  					var shouldUpdateStateProps = true;
  					var shouldUpdateDispatchProps = true;

  					if (pure && renderedElement) {
  						shouldUpdateStateProps = hasStoreStateChanged || haveOwnPropsChanged && this.doStatePropsDependOnOwnProps;
  						shouldUpdateDispatchProps = haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
  					}
  					var haveStatePropsChanged = false;
  					var haveDispatchPropsChanged = false;

  					if (haveStatePropsBeenPrecalculated) {
  						haveStatePropsChanged = true;
  					} else if (shouldUpdateStateProps) {
  						haveStatePropsChanged = this.updateStatePropsIfNeeded();
  					}
  					if (shouldUpdateDispatchProps) {
  						haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
  					}
  					var haveMergedPropsChanged = true;

  					if (haveStatePropsChanged || haveDispatchPropsChanged || haveOwnPropsChanged) {
  						haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
  					} else {
  						haveMergedPropsChanged = false;
  					}

  					if (!haveMergedPropsChanged && renderedElement) {
  						return renderedElement;
  					}
  					if (withRef) {
  						this.renderedElement = createVNode().setTag(WrappedComponent).setAttrs(Object.assign({}, this.mergedProps, { ref: 'wrappedInstance' }));
  					} else {
  						this.renderedElement = createVNode().setTag(WrappedComponent).setAttrs(this.mergedProps);
  					}
  					return this.renderedElement;
  				}
  			}]);
  			return Connect;
  		}(Component);

  		Connect.displayName = connectDisplayName;
  		Connect.WrappedComponent = WrappedComponent;

  		if ('development' !== 'production') {
  			Connect.prototype.componentWillUpdate = function componentWillUpdate() {
  				if (this.version === version) {
  					return;
  				}
  				// We are hot reloading!
  				this.version = version;
  				this.trySubscribe();
  				this.clearCache();
  			};
  		}
  		return hoistStatics(Connect, WrappedComponent);
  	};
  }

  exports.Provider = Provider;
  exports.connect = connect;

  Object.defineProperty(exports, '__esModule', { value: true });

}));