/*!
 * inferno-component v0.7.22
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoComponent = factory());
}(this, function () { 'use strict';

	var NO_RENDER = 'NO_RENDER';

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function isNullOrUndefined(obj) {
		return isUndefined(obj) || isNull(obj);
	}

	function isNull(obj) {
		return obj === null;
	}

	function isUndefined(obj) {
		return obj === undefined;
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

	var Component = function Component(props) {
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
		this.context = {};
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

	return Component;

}));