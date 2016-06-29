/*!
 * inferno-router v0.7.12
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.InfernoRouter = factory());
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

    function isArray(obj) {
    	return obj instanceof Array;
    }

    function isNullOrUndefined(obj) {
    	return obj === void 0 || isNull(obj);
    }

    function isNull(obj) {
    	return obj === null;
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

    var ASYNC_STATUS = {
    	pending: 'pending',
    	fulfilled: 'fulfilled',
    	rejected: 'rejected'
    };

    var Route = function (_Component) {
    	babelHelpers.inherits(Route, _Component);

    	function Route(props) {
    		babelHelpers.classCallCheck(this, Route);

    		var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Route).call(this, props));

    		_this.state = {
    			async: null
    		};
    		return _this;
    	}

    	babelHelpers.createClass(Route, [{
    		key: 'async',
    		value: function async() {
    			var _this2 = this;

    			var async = this.props.async;

    			if (async) {
    				this.setState({
    					async: { status: ASYNC_STATUS.pending }
    				});
    				async(this.props.params).then(function (value) {
    					_this2.setState({
    						async: {
    							status: ASYNC_STATUS.fulfilled,
    							value: value
    						}
    					});
    				}, this.reject).catch(this.reject);
    			}
    		}
    	}, {
    		key: 'reject',
    		value: function reject(value) {
    			this.setState({
    				async: {
    					status: ASYNC_STATUS.rejected,
    					value: value
    				}
    			});
    		}
    	}, {
    		key: 'componentWillReceiveProps',
    		value: function componentWillReceiveProps() {
    			this.async();
    		}
    	}, {
    		key: 'componentWillMount',
    		value: function componentWillMount() {
    			this.async();
    		}
    	}, {
    		key: 'render',
    		value: function render() {
    			var _props = this.props;
    			var component = _props.component;
    			var params = _props.params;


    			return createVNode().setTag(component).setAttrs({ params: params, async: this.state.async });
    		}
    	}]);
    	return Route;
    }(Component);

    var EMPTY$1 = {};

    function segmentize(url) {
    	return strip(url).split('/');
    }

    function strip(url) {
    	return url.replace(/(^\/+|\/+$)/g, '');
    }

    function convertToHashbang(url) {
    	if (url.indexOf('#') === -1) {
    		url = '/';
    	} else {
    		var splitHashUrl = url.split('#!');
    		splitHashUrl.shift();
    		url = splitHashUrl.join('');
    	}
    	return url;
    }

    // Thanks goes to Preact for this function: https://github.com/developit/preact-router/blob/master/src/util.js#L4
    function exec(url, route) {
    	var opts = arguments.length <= 2 || arguments[2] === void 0 ? EMPTY$1 : arguments[2];

    	var reg = /(?:\?([^#]*))?(#.*)?$/,
    	    c = url.match(reg),
    	    matches = {},
    	    ret = void 0;
    	if (c && c[1]) {
    		var p = c[1].split('&');
    		for (var i = 0; i < p.length; i++) {
    			var r = p[i].split('=');
    			matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
    		}
    	}
    	url = segmentize(url.replace(reg, ''));
    	route = segmentize(route || '');
    	var max = Math.max(url.length, route.length);
    	for (var _i = 0; _i < max; _i++) {
    		if (route[_i] && route[_i].charAt(0) === ':') {
    			var param = route[_i].replace(/(^\:|[+*?]+$)/g, ''),
    			    flags = (route[_i].match(/[+*?]+$/) || EMPTY$1)[0] || '',
    			    plus = ~flags.indexOf('+'),
    			    star = ~flags.indexOf('*'),
    			    val = url[_i] || '';
    			if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
    				ret = false;
    				break;
    			}
    			matches[param] = decodeURIComponent(val);
    			if (plus || star) {
    				matches[param] = url.slice(_i).map(decodeURIComponent).join('/');
    				break;
    			}
    		} else if (route[_i] !== url[_i]) {
    			ret = false;
    			break;
    		}
    	}
    	if (opts.default !== true && ret === false) {
    		return false;
    	}
    	return matches;
    }

    function pathRankSort(a, b) {
    	var aAttr = a.attrs || EMPTY$1,
    	    bAttr = b.attrs || EMPTY$1;
    	var diff = rank(aAttr.path) - rank(bAttr.path);
    	return diff || aAttr.path.length - bAttr.path.length;
    }

    function rank(url) {
    	return (strip(url).match(/\/+/g) || '').length;
    }

    var Router = function (_Component) {
    	babelHelpers.inherits(Router, _Component);

    	function Router(props) {
    		babelHelpers.classCallCheck(this, Router);

    		var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Router).call(this, props));

    		if (!props.history) {
    			throw new Error('Inferno Error: "inferno-router" Router components require a "history" prop passed.');
    		}
    		_this._didRoute = false;
    		_this.state = {
    			url: props.url || props.history.getCurrentUrl()
    		};
    		return _this;
    	}

    	babelHelpers.createClass(Router, [{
    		key: 'getChildContext',
    		value: function getChildContext() {
    			return {
    				history: this.props.history,
    				hashbang: this.props.hashbang
    			};
    		}
    	}, {
    		key: 'componentWillMount',
    		value: function componentWillMount() {
    			this.props.history.addRouter(this);
    		}
    	}, {
    		key: 'componentWillUnmount',
    		value: function componentWillUnmount() {
    			this.props.history.removeRouter(this);
    		}
    	}, {
    		key: 'routeTo',
    		value: function routeTo(url) {
    			this._didRoute = false;
    			this.setState({ url: url });
    			return this._didRoute;
    		}
    	}, {
    		key: 'render',
    		value: function render() {
    			var children = isArray(this.props.children) ? this.props.children : [this.props.children];
    			var url = this.props.url || this.state.url;
    			var wrapperComponent = this.props.component;
    			var hashbang = this.props.hashbang;

    			children.sort(pathRankSort);

    			for (var i = 0; i < children.length; i++) {
    				var child = children[i];
    				var path = child.attrs.path;

    				var params = exec(hashbang ? convertToHashbang(url) : url, path);

    				if (params) {
    					if (wrapperComponent) {
    						return createVNode().setTag(wrapperComponent).setChildren(child).setAttrs({
    							params: params
    						});
    					}
    					return child.setAttrs(Object.assign({}, { params: params }, child.attrs));
    				}
    			}
    			return wrapperComponent ? createVNode().setTag(wrapperComponent) : null;
    		}
    	}]);
    	return Router;
    }(Component);

    function Link(_ref, _ref2) {
    	var to = _ref.to;
    	var children = _ref.children;
    	var hashbang = _ref2.hashbang;
    	var history = _ref2.history;

    	return createVNode().setAttrs({
    		href: hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to
    	}).setTag('a').setChildren(children);
    }

    var routers = [];

    function getCurrentUrl() {
    	var url = typeof location !== 'undefined' ? location : EMPTY;

    	return '' + (url.pathname || '') + (url.search || '') + (url.hash || '');
    }

    function getHashbangRoot() {
    	var url = typeof location !== 'undefined' ? location : EMPTY;

    	return '' + (url.protocol + '//' || '') + (url.host || '') + (url.pathname || '') + (url.search || '') + '#!';
    }

    function routeTo(url) {
    	var didRoute = false;
    	for (var i = 0; i < routers.length; i++) {
    		if (routers[i].routeTo(url) === true) {
    			didRoute = true;
    		}
    	}
    	return didRoute;
    }

    window.addEventListener('popstate', function () {
    	return routeTo(getCurrentUrl());
    });

    var browserHistory = {
    	addRouter: function addRouter(router) {
    		routers.push(router);
    	},
    	removeRouter: function removeRouter(router) {
    		roouters.splice(routers.indexOf(router), 1);
    	},

    	getCurrentUrl: getCurrentUrl,
    	getHashbangRoot: getHashbangRoot
    };

    var index = {
        Route: Route,
        Router: Router,
        Link: Link,
        browserHistory: browserHistory
    };

    return index;

}));