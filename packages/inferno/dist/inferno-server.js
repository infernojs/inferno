/*!
 * inferno-server v0.6.5
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoServer = factory());
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

	babelHelpers.extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	babelHelpers;

	function Lifecycle() {
		this._listeners = [];
	}

	Lifecycle.prototype = {
		addListener: function addListener(callback) {
			this._listeners.push(callback);
		},
		trigger: function trigger() {
			for (var i = 0; i < this._listeners.length; i++) {
				this._listeners[i]();
			}
		}
	};

	// TODO: for node we need to check if document is valid
	function getActiveNode() {
		return document.activeElement;
	}

	function resetActiveNode(activeNode) {
		if (activeNode !== document.body && document.activeElement !== activeNode) {
			activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
		}
	}

	function queueStateChanges(component, newState, callback) {
		for (var stateKey in newState) {
			component._pendingState[stateKey] = newState[stateKey];
		}
		if (component._pendingSetState === false) {
			component._pendingSetState = true;
			applyState(component, false, callback);
		}
	}

	function applyState(component, force, callback) {
		var blockRender = component._blockRender;

		if (component._deferSetState === false || force) {
			component._pendingSetState = false;
			var pendingState = component._pendingState;
			var oldState = component.state;
			var nextState = babelHelpers.extends({}, oldState, pendingState);

			component._pendingState = {};
			var nextNode = component._updateComponent(oldState, nextState, component.props, component.props, force);

			if (!blockRender) {
				(function () {
					var lastNode = component._lastNode;
					var parentDom = lastNode.dom.parentNode;

					var activeNode = getActiveNode();
					var subLifecycle = new Lifecycle();
					component._diffNodes(lastNode, nextNode, parentDom, null, subLifecycle, component.context, false, component.instance);
					component._lastNode = nextNode;
					subLifecycle.addListener(function () {
						subLifecycle.trigger();
						callback && callback();
					});
					resetActiveNode(activeNode);
				})();
			}
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
			this._blockRender = false;
			this._blockSetState = false;
			this._deferSetState = false;
			this._pendingSetState = false;
			this._pendingState = {};
			this._lastNode = null;
			this._unmounted = false;
			this.context = {};
			this._diffNodes = null;
		}

		babelHelpers.createClass(Component, [{
			key: 'render',
			value: function render() {}
		}, {
			key: 'forceUpdate',
			value: function forceUpdate(callback) {
				applyState(this, true, callback);
			}
		}, {
			key: 'setState',
			value: function setState(newState, callback) {
				if (this._blockSetState === false) {
					queueStateChanges(this, newState, callback);
				} else {
					throw Error('Inferno Error: Cannot update state via setState() in componentWillUpdate()');
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
						this._blockRender = true;
						this.componentWillReceiveProps(nextProps);
						this._blockRender = false;
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
			}
		}]);
		return Component;
	}();

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isStringOrNumber(obj) {
		return typeof obj === 'string' || typeof obj === 'number';
	}

	function isNullOrUndefined(obj) {
		return obj === undefined || obj === null;
	}

	function isInvalidNode(obj) {
		return obj === undefined || obj === null || obj === false;
	}

	function renderChildren(children) {
		if (children && isArray(children)) {
			var childrenResult = [];
			var insertComment = false;

			for (var i = 0; i < children.length; i++) {
				var child = children[i];

				if (isStringOrNumber(child)) {
					if (insertComment === true) {
						childrenResult.push('<!-- -->');
					}
					childrenResult.push(child);
					insertComment = true;
				} else {
					insertComment = false;
					childrenResult.push(renderNode(child));
				}
			}
			return childrenResult.join('');
		} else if (!isInvalidNode(children)) {
			if (isStringOrNumber(children)) {
				return children;
			} else {
				return renderNode(children);
			}
		}
	}

	function renderNode(node) {
		if (!isInvalidNode(node)) {
			var _ret = function () {
				var tag = node.tag;
				var outputAttrs = [];

				if (!isNullOrUndefined(node.className)) {
					outputAttrs.push('class="' + node.className + '"');
				}
				var attrs = node.attrs;

				if (!isNullOrUndefined(attrs)) {
					(function () {
						var attrsKeys = Object.keys(attrs);

						attrsKeys.forEach(function (attrsKey, i) {
							var attr = attrsKeys[i];

							outputAttrs.push(attr + '="' + attrs[attr] + '"');
						});
					})();
				}

				return {
					v: '<' + tag + (outputAttrs.length > 0 ? ' ' + outputAttrs.join(' ') : '') + '>' + (renderChildren(node.children) || '') + '</' + tag + '>'
				};
			}();

			if ((typeof _ret === 'undefined' ? 'undefined' : babelHelpers.typeof(_ret)) === "object") return _ret.v;
		}
	}

	function renderToString(node) {
		return renderNode(node);
	}

	var index = {
		renderToString: renderToString
	};

	return index;

}));