/*!
 * inferno-component v0.7.12
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoComponent = factory());
}(this, function () { 'use strict';

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

	babelHelpers.inherits = function (subClass, superClass) {
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

	babelHelpers.possibleConstructorReturn = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && (typeof call === "object" || typeof call === "function") ? call : self;
	};

	babelHelpers;

	var NO_RENDER = 'NO_RENDER';

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function isNullOrUndefined(obj) {
		return obj === void 0 || isNull(obj);
	}

	function isNull(obj) {
		return obj === null;
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
	var isUnitlessNumber = {};

	constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
	constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
	constructDefaults('volume,value', strictProps, true);
	constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,selected,readonly,multiple,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate', booleanProps, true);
	constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);

	function createNullNode() {
		return {
			null: true,
			dom: document.createTextNode('')
		};
	}

	var screenWidth = isBrowser && window.screen.width;
	var screenHeight = isBrowser && window.screen.height;
	var scrollX = 0;
	var scrollY = 0;
	var lastScrollTime = 0;

	if (isBrowser) {
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
	}

	function Lifecycle() {
		this._listeners = [];
		this.scrollX = null;
		this.scrollY = null;
		this.screenHeight = screenHeight;
		this.screenWidth = screenWidth;
	}

	Lifecycle.prototype = {
		refresh: function refresh() {
			this.scrollX = isBrowser && window.scrollX;
			this.scrollY = isBrowser && window.scrollY;
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

			if (nextNode === NO_RENDER) {
				nextNode = component._lastNode;
			} else if (isNullOrUndefined(nextNode)) {
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

	var Component = function () {
		function Component(props) {
			babelHelpers.classCallCheck(this, Component);

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

		babelHelpers.createClass(Component, [{
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
				return NO_RENDER;
			}
		}]);
		return Component;
	}();

	return Component;

}));