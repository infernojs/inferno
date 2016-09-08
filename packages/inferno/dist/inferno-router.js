/*!
 * inferno-router v0.7.27
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoRouter = factory());
}(this, (function () { 'use strict';

var NO_RENDER = 'NO_RENDER';

// Runs only once in applications lifetime
var isBrowser = typeof window !== 'undefined' && window.document;

function isArray(obj) {
	return obj instanceof Array;
}

function isNullOrUndefined(obj) {
	return isUndefined(obj) || isNull(obj);
}

function isNull(obj) {
	return obj === null;
}

function isUndefined(obj) {
	return obj === undefined;
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

function VPlaceholder() {
	this.placeholder = true;
	this.dom = null;
}

function createVPlaceholder() {
	return new VPlaceholder();
}

var documetBody = isBrowser ? document.body : null;

function constructDefaults(string, object, value) {
	/* eslint no-return-assign: 0 */
	string.split(',').forEach(function (i) { return object[i] = value; });
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

var screenWidth = isBrowser && window.screen.width;
var screenHeight = isBrowser && window.screen.height;
var scrollX = 0;
var scrollY = 0;
var lastScrollTime = 0;

if (isBrowser) {
	window.onscroll = function () {
		scrollX = window.scrollX;
		scrollY = window.scrollY;
		lastScrollTime = performance.now();
	};

	window.resize = function () {
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
		var this$1 = this;

		for (var i = 0; i < this._listeners.length; i++) {
			this$1._listeners[i]();
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
		component.state = Object.assign({}, component.state, component._pendingState);
		component._pendingState = {};
	}
}

function applyState(component, force, callback) {
	if ((!component._deferSetState || force) && !component._blockRender) {
		component._pendingSetState = false;
		var pendingState = component._pendingState;
		var prevState = component.state;
		var nextState = Object.assign({}, prevState, pendingState);
		var props = component.props;

		component._pendingState = {};
		var nextNode = component._updateComponent(prevState, nextState, props, props, force);

		if (nextNode === NO_RENDER) {
			nextNode = component._lastNode;
		} else if (isNullOrUndefined(nextNode)) {
			nextNode = createVPlaceholder();
		}
		var lastNode = component._lastNode;
		var parentDom = lastNode.dom.parentNode;
		var activeNode = getActiveNode();
		var subLifecycle = new Lifecycle();

		component._patch(lastNode, nextNode, parentDom, subLifecycle, component.context, component, null);
		component._lastNode = nextNode;
		component._componentToDOMNodeMap.set(component, nextNode.dom);
		component._parentNode.dom = nextNode.dom;
		component.componentDidUpdate(props, prevState);
		subLifecycle.trigger();
		if (!isNullOrUndefined(callback)) {
			callback();
		}
		resetActiveNode(activeNode);
	}
}

var Component = function Component(props, context) {
	if ( context === void 0 ) context = {};

	/** @type {object} */
	this.props = props || {};

	/** @type {object} */
	this.state = {};

	/** @type {object} */
	this.refs = {};
	this._blockRender = false;
	this._blockSetState = false;
	this._deferSetState = false;
	this._pendingSetState = false;
	this._pendingState = {};
	this._parentNode = null;
	this._lastNode = null;
	this._unmounted = true;
	this.context = context;
	this._patch = null;
	this._parentComponent = null;
	this._componentToDOMNodeMap = null;
};

Component.prototype.render = function render () {
};

Component.prototype.forceUpdate = function forceUpdate (callback) {
	if (this._unmounted) {
		throw Error(noOp);
	}
	applyState(this, true, callback);
};

Component.prototype.setState = function setState (newState, callback) {
	if (this._unmounted) {
		throw Error(noOp);
	}
	if (this._blockSetState === false) {
		queueStateChanges(this, newState, callback);
	} else {
		throw Error('Inferno Warning: Cannot update state via setState() in componentWillUpdate()');
	}
};

Component.prototype.componentDidMount = function componentDidMount () {
};

Component.prototype.componentWillMount = function componentWillMount () {
};

Component.prototype.componentWillUnmount = function componentWillUnmount () {
};

Component.prototype.componentDidUpdate = function componentDidUpdate () {
};

Component.prototype.shouldComponentUpdate = function shouldComponentUpdate () {
	return true;
};

Component.prototype.componentWillReceiveProps = function componentWillReceiveProps () {
};

Component.prototype.componentWillUpdate = function componentWillUpdate () {
};

Component.prototype.getChildContext = function getChildContext () {
};

Component.prototype._updateComponent = function _updateComponent (prevState, nextState, prevProps, nextProps, force) {
	if (this._unmounted === true) {
		this._unmounted = false;
		return false;
	}
	if (!isNullOrUndefined(nextProps) && isNullOrUndefined(nextProps.children)) {
		nextProps.children = prevProps.children;
	}
	if (prevProps !== nextProps || prevState !== nextState || force) {
		if (prevProps !== nextProps) {
			this._blockRender = true;
			this.componentWillReceiveProps(nextProps);
			this._blockRender = false;
			if (this._pendingSetState) {
				nextState = Object.assign({}, nextState, this._pendingState);
				this._pendingSetState = false;
				this._pendingState = {};
			}
		}
		var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

		if (shouldUpdate !== false || force) {
			this._blockSetState = true;
			this.componentWillUpdate(nextProps, nextState);
			this._blockSetState = false;
			this.props = nextProps;
			this.state = nextState;
			return this.render();
		}
	}
	return NO_RENDER;
};

var ASYNC_STATUS = {
	pending: 'pending',
	fulfilled: 'fulfilled',
	rejected: 'rejected'
};

var Route = (function (Component) {
	function Route(props, context) {
		Component.call(this, props, context);
		this.state = {
			async: null
		};
	}

	if ( Component ) Route.__proto__ = Component;
	Route.prototype = Object.create( Component && Component.prototype );
	Route.prototype.constructor = Route;

	Route.prototype.async = function async () {
		var this$1 = this;

		var async = this.props.async;

		if (async) {
			this.setState({
				async: { status: ASYNC_STATUS.pending }
			});
			async(this.props.params).then(function (value) {
				this$1.setState({
					async: {
						status: ASYNC_STATUS.fulfilled,
						value: value
					}
				});
			}, this.reject).catch(this.reject);
		}
	};

	Route.prototype.reject = function reject (value) {
		this.setState({
			async: {
				status: ASYNC_STATUS.rejected,
				value: value
			}
		});
	};

	Route.prototype.componentWillReceiveProps = function componentWillReceiveProps () {
		this.async();
	};

	Route.prototype.componentWillMount = function componentWillMount () {
		this.async();
	};

	Route.prototype.render = function render () {
		var ref = this.props;
		var component = ref.component;
		var params = ref.params;

		return createVNode().setTag(component).setAttrs({ params: params, async: this.state.async });
	};

	return Route;
}(Component));

var EMPTY = {};

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
// Wildcard support is added on top of that.
function exec(url, route, opts) {
	if ( opts === void 0 ) opts = EMPTY;

	var reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches = {},
		ret;
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
	var hasWildcard = false;

	for (var i$1 = 0; i$1 < max; i$1++) {
		if (route[i$1] && route[i$1].charAt(0) === ':') {
			var param = route[i$1].replace(/(^\:|[+*?]+$)/g, ''),
				flags = (route[i$1].match(/[+*?]+$/) || EMPTY)[0] || '',
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i$1] || '';
			if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
				ret = false;
				break;
			}
			matches[param] = decodeURIComponent(val);
			if (plus || star) {
				matches[param] = url.slice(i$1).map(decodeURIComponent).join('/');
				break;
			}
		}
		else if (route[i$1] !== url[i$1] && !hasWildcard) {
			if (route[i$1] === '*' && route.length === i$1 + 1) {
				hasWildcard = true;
			} else {
				ret = false;
				break;
			}
		}
	}
	if (opts.default !== true && ret === false) {
		return false;
	}
	return matches;
}

function pathRankSort(a, b) {
	var aAttr = a.attrs || EMPTY,
		bAttr = b.attrs || EMPTY;
	var diff = rank(bAttr.path) - rank(aAttr.path);
	return diff || (bAttr.path.length - aAttr.path.length);
}

function rank(url) {
	return (strip(url).match(/\/+/g) || '').length;
}

var Router = (function (Component) {
	function Router(props, context) {
		Component.call(this, props, context);
		if (!props.history) {
			throw new Error('Inferno Error: "inferno-router" Router components require a "history" prop passed.');
		}
		this._didRoute = false;
		this.state = {
			url: props.url || props.history.getCurrentUrl()
		};
	}

	if ( Component ) Router.__proto__ = Component;
	Router.prototype = Object.create( Component && Component.prototype );
	Router.prototype.constructor = Router;

	Router.prototype.getChildContext = function getChildContext () {
		return {
			history: this.props.history,
			hashbang: this.props.hashbang
		};
	};

	Router.prototype.componentWillMount = function componentWillMount () {
		this.props.history.addRouter(this);
	};

	Router.prototype.componentWillUnmount = function componentWillUnmount () {
		this.props.history.removeRouter(this);
	};

	Router.prototype.handleRoutes = function handleRoutes (routes, url, hashbang, wrapperComponent, lastPath) {
		var this$1 = this;

		routes.sort(pathRankSort);

		for (var i = 0; i < routes.length; i++) {
			var route = routes[i];
			var ref = route.attrs;
			var path = ref.path;
			var fullPath = lastPath + path;
			var params = exec(hashbang ? convertToHashbang(url) : url, fullPath);
			var children = toArray$1(route.children);

			if (children) {
				var subRoute = this$1.handleRoutes(children, url, hashbang, wrapperComponent, fullPath);

				if (!isNull(subRoute)) {
					return subRoute;
				}
			}
			if (params) {
				if (wrapperComponent) {
					return createVNode().setTag(wrapperComponent).setChildren(route).setAttrs({
						params: params
					});
				}
				return route.setAttrs(Object.assign({}, { params: params }, route.attrs));
			}
		}
		if (!lastPath && wrapperComponent) {
			this._didRoute = true;
			return createVNode().setTag(wrapperComponent);
		}
		return null;
	};

	Router.prototype.routeTo = function routeTo (url) {
		this._didRoute = false;
		this.setState({ url: url });
		return this._didRoute;
	};

	Router.prototype.render = function render () {
		var children = toArray$1(this.props.children);
		var url = this.props.url || this.state.url;
		var wrapperComponent = this.props.component;
		var hashbang = this.props.hashbang;

		return this.handleRoutes(children, url, hashbang, wrapperComponent, '');
	};

	return Router;
}(Component));

function toArray$1(children) {
	return isArray(children) ? children : (children ? [children] : children);
}

function Link(props, ref) {
	var hashbang = ref.hashbang;
	var history = ref.history;

	var activeClassName = props.activeClassName;
	var activeStyle = props.activeStyle;
	var className = props.className;
	var to = props.to;
	var element = createVNode();
	var href = hashbang ? history.getHashbangRoot() + convertToHashbang('#!' + to) : to;

	if (className) {
		element.setClassName(className);
	}

	if (history.isActive(to, hashbang)) {
		if (activeClassName) {
			element.setClassName((className ? className + ' ' : '') + activeClassName);
		}
		if (activeStyle) {
			element.setStyle(Object.assign({}, props.style, activeStyle));
		}
	}

	if (!hashbang) {
		element.setEvents({
			onclick: function navigate(e) {
				e.preventDefault();
				var target = e.target;
				window.history.pushState(null, target.textContent, to);
				history.routeTo(to);
			}
		});
	}

	return element.setTag('a').setAttrs({ href: href }).setChildren(props.children);
}

var routers = [];

function getCurrentUrl() {
	var url = typeof location !== 'undefined' ? location : EMPTY;

	return ("" + (url.pathname || '') + (url.search || '') + (url.hash || ''));
}

function getHashbangRoot() {
	var url = typeof location !== 'undefined' ? location : EMPTY;

	return ("" + (url.protocol + '//' || '') + (url.host || '') + (url.pathname || '') + (url.search || '') + "#!");
}

function isActive(path, hashbang) {
	if (isBrowser) {
		if (hashbang) {
			var currentURL = getCurrentUrl() + (getCurrentUrl().indexOf('#!') === -1 ? '#!' : '');
			var matchURL = currentURL.match(/#!(.*)/);
			var matchHash = matchURL && typeof matchURL[1] !== 'undefined' && (matchURL[1] || '/');
			return matchHash === path;
		}
		return location.pathname === path;
	}
	return false;
}

function routeTo(url) {
	for (var i = 0; i < routers.length; i++) {
		if (routers[i].routeTo(url) === true) {
			return true;
		}
	}
	return false;
}

if (isBrowser) {
	window.addEventListener('popstate', function () { return routeTo(getCurrentUrl()); });
}

var browserHistory = {
	addRouter: function addRouter(router) {
		routers.push(router);
	},
	removeRouter: function removeRouter(router) {
		routers.splice(routers.indexOf(router), 1);
	},
	getCurrentUrl: getCurrentUrl,
	getHashbangRoot: getHashbangRoot,
	isActive: isActive,
	routeTo: routeTo
};

var index = {
	Route: Route,
	Router: Router,
	Link: Link,
	browserHistory: browserHistory
};

return index;

})));