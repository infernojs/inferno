/*!
 * inferno-component vundefined
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoComponent = factory());
}(this, function () { 'use strict';

	var babelHelpers_classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	var babelHelpers_createClass = function () {
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

	var babelHelpers_extends = Object.assign || function (target) {
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

	function updateComponent(component, prevState, nextState, prevProps, nextProps, renderCallback) {
		if (!nextProps.children) {
			nextProps.children = prevProps.children;
		}
		if (prevProps !== nextProps || prevState !== nextState) {
			if (prevProps !== nextProps) {
				component._blockRender = true;
				component.componentWillReceiveProps(nextProps);
				component._blockRender = false;
			}
			var shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);

			if (shouldUpdate) {
				component._blockSetState = true;
				component.componentWillUpdate(nextProps, nextState);
				component._blockSetState = false;
				component.props = nextProps;
				component.state = nextState;
				var newDomNode = renderCallback();

				component.componentDidUpdate(prevProps, prevState);
				return newDomNode;
			}
		}
	}

	var noop = (function () {})

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
				var nextState = babelHelpers_extends({}, oldState, pendingState);

				component._pendingState = {};
				component._pendingSetState = false;
				updateComponent(component, oldState, nextState, component.props, component.props, component.forceUpdate, blockRender);

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
			babelHelpers_classCallCheck(this, Component);

			/** @type {object} */
			this.props = props || {};
			this._blockRender = false;
			this._blockSetState = false;
			this._deferSetState = false;
			this._pendingSetState = false;
			this._pendingState = {};
			this._lastRender = null;
			/** @type {object} */
			this.state = {};
			this.context = {};
		}

		babelHelpers_createClass(Component, [{
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
		}]);
		return Component;
	}();

	var index = {
		Component: Component,
		updateComponent: updateComponent
	};

	return index;

}));
//# sourceMappingURL=inferno-component.js.map