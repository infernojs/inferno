/*!
 * inferno-component v0.6.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
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

// TODO! Use object literal or at least prototype? --- class is prototype (jsperf needed for perf verification)

var Lifecycle = function () {
	function Lifecycle() {
		babelHelpers.classCallCheck(this, Lifecycle);

		this._listeners = [];
	}

	babelHelpers.createClass(Lifecycle, [{
		key: "addListener",
		value: function addListener(callback) {
			this._listeners.push(callback);
		}
	}, {
		key: "trigger",
		value: function trigger() {
			for (var i = 0; i < this._listeners.length; i++) {
				this._listeners[i]();
			}
		}
	}]);
	return Lifecycle;
}();

function queueStateChanges(component, newState) {
	for (var stateKey in newState) {
		component._pendingState[stateKey] = newState[stateKey];
	}
	if (component._pendingSetState === false) {
		component._pendingSetState = true;
		applyState(component);
	}
}

function applyState(component) {
	var blockRender = component._blockRender;

	requestAnimationFrame(function () {
		if (component._deferSetState === false) {
			(function () {
				var activeNode = document.activeElement;

				component._pendingSetState = false;
				var pendingState = component._pendingState;
				var oldState = component.state;
				var nextState = babelHelpers.extends({}, oldState, pendingState);

				component._pendingState = {};
				component._pendingSetState = false;
				var nextNode = component._updateComponent(oldState, nextState, component.props, component.props, blockRender);
				var lastNode = component._lastNode;
				var parentDom = lastNode.dom.parentNode;

				var subLifecycle = new Lifecycle();
				component._diffNodes(lastNode, nextNode, parentDom, subLifecycle, false);
				subLifecycle.addListener(function () {
					subLifecycle.trigger();
				});

				if (activeNode !== document.body && document.activeElement !== activeNode) {
					activeNode.focus();
				}
			})();
		} else {
			applyState(component);
		}
	});
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
		value: function forceUpdate() {}
	}, {
		key: 'setState',
		value: function setState(newState) {
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
			if (this._unmounted === true) {
				this._unmounted = false;
				return false;
			}
			if (nextProps && !nextProps.children) {
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
					var node = this.render();

					this.componentDidUpdate(prevProps, prevState);
					return node;
				}
			}
		}
	}]);
	return Component;
}();

var index = {
	Component: Component
};

export default index;