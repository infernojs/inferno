/*!
 * inferno-test-utils v0.5.21
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoTestUtils = factory());
}(this, function () { 'use strict';

	var babelHelpers = {};

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

	var canUseDOM = !!(typeof window !== 'undefined' &&
	// Nwjs doesn't add document as a global in their node context, but does have it on window.document,
	// As a workaround, check if document is undefined
	typeof document !== 'undefined' && window.document.createElement);

	var ExecutionEnvironment = {
		canUseDOM: canUseDOM,
		canUseWorkers: typeof Worker !== 'undefined',
		canUseEventListeners: canUseDOM && !!window.addEventListener,
		canUseViewport: canUseDOM && !!window.screen,
		canUseSymbol: typeof Symbol === 'function' && typeof Symbol['for'] === 'function'
	};

	var noop = (function () {})

	// Server side workaround
	var requestAnimationFrame = noop;
	var cancelAnimationFrame = noop;

	if (ExecutionEnvironment.canUseDOM) {
		(function () {

			var lastTime = 0;

			var nativeRequestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

			var nativeCancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame;

			requestAnimationFrame = nativeRequestAnimationFrame || function (callback) {
				var currTime = Date.now();
				var timeDelay = Math.max(0, 16 - (currTime - lastTime)); // 1000 / 60 = 16.666

				lastTime = currTime + timeDelay;
				return window.setTimeout(function () {
					callback(Date.now());
				}, timeDelay);
			};

			cancelAnimationFrame = nativeCancelAnimationFrame || function (frameId) {
				window.clearTimeout(frameId);
			};
		})();
	}

	function applyState(component) {
		var blockRender = component._blockRender;

		requestAnimationFrame(function () {
			if (component._deferSetState === false) {
				var activeNode = undefined;

				if (ExecutionEnvironment.canUseDOM) {
					activeNode = document.activeElement;
				}

				component._pendingSetState = false;
				var pendingState = component._pendingState;
				var oldState = component.state;
				var nextState = babelHelpers.extends({}, oldState, pendingState);

				component._pendingState = {};
				component._pendingSetState = false;
				component._updateComponent(oldState, nextState, component.props, component.props, blockRender);

				if (ExecutionEnvironment.canUseDOM && activeNode !== document.body && document.activeElement !== activeNode) {
					activeNode.focus();
				}
			} else {
				applyState(component);
			}
		});
	}

	function queueStateChanges(component, newState) {
		for (var stateKey in newState) {
			component._pendingState[stateKey] = newState[stateKey];
		}
		if (component._pendingSetState === false) {
			component._pendingSetState = true;
			applyState(component);
		}
	}

	/** Base Component class, for he ES6 Class method of creating Components
	 *	@public
	 *
	 *	@example
	 *	class MyFoo extends Component {
	 *		render(props, state) {
	 *			return <div />;
	 *		}
	 *	}
	 */

	var Component = function () {
		function Component(props) {
			babelHelpers.classCallCheck(this, Component);

			/** @type {object} */
			this.props = props || {};

			/** @type {object} */
			this.state = {};

			this._blockRender = false;
			this._blockSetState = false;
			this._deferSetState = false;
			this._pendingSetState = false;
			this._pendingState = {};
			this._lastRender = null;
			this.context = {};
		}

		babelHelpers.createClass(Component, [{
			key: 'render',
			value: function render() {}
		}, {
			key: 'forceUpdate',
			value: function forceUpdate() {}
		}, {
			key: 'setState',
			value: function setState(newState /* , callback */) {
				// TODO the callback
				if (this._blockSetState === false) {
					queueStateChanges(this, newState);
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
			value: function _updateComponent(prevState, nextState, prevProps, nextProps) {
				if (!nextProps.children) {
					nextProps.children = prevProps.children;
				}
				if (prevProps !== nextProps || prevState !== nextState) {
					if (prevProps !== nextProps) {
						this._blockRender = true;
						this.componentWillReceiveProps(nextProps);
						this._blockRender = false;
					}
					var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState);

					if (shouldUpdate) {
						this._blockSetState = true;
						this.componentWillUpdate(nextProps, nextState);
						this._blockSetState = false;
						this.props = nextProps;
						this.state = nextState;
						var newDomNode = this.forceUpdate();

						this.componentDidUpdate(prevProps, prevState);
						return newDomNode;
					}
				}
			}
		}]);
		return Component;
	}();

	var index = {
		Component: Component
	};

	return index;

}));