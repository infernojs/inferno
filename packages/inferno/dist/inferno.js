/*!
 * inferno v0.6.5
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
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

	function createElement$1(tag, namespace) {
		if (isNullOrUndefined(namespace)) {
			return document.createElement(tag);
		} else {
			return document.createElementNS(namespace, tag);
		}
	}

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

	function isNullOrUndefined(obj) {
		return obj === undefined || obj === null;
	}

	function isInvalidNode(obj) {
		return obj === undefined || obj === null || obj === false;
	}

	function isFunction(obj) {
		return typeof obj === 'function';
	}

	function isAttrAnEvent(attr) {
		return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	}

	function isAttrAHook(hook) {
		return hook === 'onCreated' || hook === 'onAttached' || hook === 'onWillDetach' || hook === 'onWillUpdate' || hook === 'onDidUpdate';
	}

	function isAttrAComponentHook(hook) {
		return hook === 'onComponentWillMount' || hook === 'onComponentDidMount' || hook === 'onComponentWillUnmount' || hook === 'onComponentShouldUpdate' || hook === 'onComponentWillUpdate' || hook === 'onComponentDidUpdate';
	}

	function createAttrsAndEvents(props, tag) {
		var events = null;
		var hooks = null;
		var attrs = null;
		var className = null;
		var style = null;

		if (!isNullOrUndefined(props)) {
			if (isArray(props)) {
				return props;
			}
			for (var prop in props) {
				if (prop === 'className') {
					className = props[prop];
				} else if (prop === 'style') {
					style = props[prop];
				} else if (isAttrAHook(prop) && !isFunction(tag)) {
					if (isNullOrUndefined(hooks)) {
						hooks = {};
					}
					hooks[prop.substring(2).toLowerCase()] = props[prop];
					delete props[prop];
				} else if (isAttrAnEvent(prop) && !isFunction(tag)) {
					if (isNullOrUndefined(events)) {
						events = {};
					}
					events[prop.substring(2).toLowerCase()] = props[prop];
					delete props[prop];
				} else if (isAttrAComponentHook(prop) && isFunction(tag)) {
					if (isNullOrUndefined(hooks)) {
						hooks = {};
					}
					hooks['c' + prop.substring(3)] = props[prop];
					delete props[prop];
				} else if (!isFunction(tag)) {
					if (isNullOrUndefined(attrs)) {
						attrs = {};
					}
					attrs[prop] = props[prop];
				} else {
					attrs = props;
				}
			}
		}
		return { attrs: attrs, events: events, className: className, style: style, hooks: hooks };
	}

	function createChild(_ref) {
		var tag = _ref.tag;
		var attrs = _ref.attrs;
		var children = _ref.children;
		var className = _ref.className;
		var style = _ref.style;
		var events = _ref.events;
		var hooks = _ref.hooks;

		if (tag === undefined && !isNullOrUndefined(attrs) && !attrs.tpl && !isNullOrUndefined(children) && children.length === 0) {
			return null;
		}
		var key = !isNullOrUndefined(attrs) && !isNullOrUndefined(attrs.key) ? attrs.key : undefined;

		if (!isNullOrUndefined(children) && children.length === 0) {
			children = null;
		} else if (!isInvalidNode(children)) {
			children = isArray(children) && children.length === 1 ? createChildren(children[0]) : createChildren(children);
		}

		if (key !== undefined) {
			delete attrs.key;
		}
		var attrsAndEvents = createAttrsAndEvents(attrs, tag);

		return {
			dom: null,
			tag: tag,
			key: key,
			attrs: attrsAndEvents.attrs,
			events: events || attrsAndEvents.events,
			hooks: hooks || attrsAndEvents.hooks,
			className: className || attrsAndEvents.className,
			style: style || attrsAndEvents.style,
			children: children,
			instance: null
		};
	}

	function createChildren(children) {
		var childrenDefined = !isNullOrUndefined(children);
		if (childrenDefined && isArray(children)) {
			var newChildren = [];

			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (!isNullOrUndefined(child) && (typeof child === 'undefined' ? 'undefined' : babelHelpers.typeof(child)) === 'object') {
					if (isArray(child)) {
						if (child.length > 0) {
							newChildren.push(createChildren(child));
						} else {
							newChildren.push(null);
						}
					} else {
						newChildren.push(createChild(child));
					}
				} else {
					newChildren.push(child);
				}
			}
			return newChildren;
		} else if (childrenDefined && (typeof children === 'undefined' ? 'undefined' : babelHelpers.typeof(children)) === 'object') {
			return children.dom === undefined ? createChild(children) : children;
		}
		return children;
	}

	function createElement(tag, props) {
		for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			children[_key - 2] = arguments[_key];
		}

		return createChild({ tag: tag, attrs: props, children: children });
	}

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function createUniversalElement(tag, attrs) {
		if (isBrowser) {
			var dom = createElement$1(tag);
			if (attrs) {
				createStaticAttributes(attrs, dom);
			}
			return dom;
		}
		return null;
	}

	function createStaticAttributes(attrs, dom) {
		var attrKeys = Object.keys(attrs);

		for (var i = 0; i < attrKeys.length; i++) {
			var attr = attrKeys[i];
			var value = attrs[attr];

			if (attr === 'className') {
				dom.className = value;
			} else {
				if (value === true) {
					dom.setAttribute(attr, attr);
				} else if (!isNullOrUndefined(value) && value !== false && !isAttrAnEvent(attr)) {
					dom.setAttribute(attr, value);
				}
			}
		}
	}

	function VNode(tpl) {
		this.tpl = tpl;
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

	function createVNode(tpl) {
		return new VNode(tpl);
	}

	function createTemplate(shape, childrenType) {
		var tag = shape.tag || null;
		var tagIsDynamic = tag && tag.arg !== undefined ? true : false;

		var children = !isNullOrUndefined(shape.children) ? shape.children : null;
		var childrenIsDynamic = children && children.arg !== undefined ? true : false;

		var attrs = shape.attrs || null;
		var attrsIsDynamic = attrs && attrs.arg !== undefined ? true : false;

		var hooks = shape.hooks || null;
		var hooksIsDynamic = hooks && hooks.arg !== undefined ? true : false;

		var events = shape.events || null;
		var eventsIsDynamic = events && events.arg !== undefined ? true : false;

		var key = shape.key !== undefined ? shape.key : null;
		var keyIsDynamic = !isNullOrUndefined(key) && !isNullOrUndefined(key.arg);

		var style = shape.style || null;
		var styleIsDynamic = style && style.arg !== undefined ? true : false;

		var className = shape.className !== undefined ? shape.className : null;
		var classNameIsDynamic = className && className.arg !== undefined ? true : false;

		var dom = null;

		if (typeof tag === 'string') {
			var newAttrs = Object.assign({}, className ? { className: className } : {}, shape.attrs || {});
			dom = createUniversalElement(tag, newAttrs);
		}

		var tpl = {
			dom: dom,
			pools: {
				keyed: {},
				nonKeyed: []
			},
			tag: !tagIsDynamic ? tag : null,
			isComponent: tagIsDynamic,
			hasAttrs: attrsIsDynamic,
			hasHooks: hooksIsDynamic,
			hasEvents: eventsIsDynamic,
			hasStyle: styleIsDynamic,
			hasClassName: classNameIsDynamic,
			childrenType: childrenType === undefined ? children ? 5 : 0 : childrenType
		};

		return function () {
			var vNode = new VNode(tpl);

			if (tagIsDynamic === true) {
				vNode.tag = arguments[tag.arg];
			}
			if (childrenIsDynamic === true) {
				vNode.children = arguments[children.arg];
			}
			if (attrsIsDynamic === true) {
				vNode.attrs = arguments[attrs.arg];
			}
			if (hooksIsDynamic === true) {
				vNode.hooks = arguments[hooks.arg];
			}
			if (eventsIsDynamic === true) {
				vNode.events = arguments[events.arg];
			}
			if (keyIsDynamic === true) {
				vNode.key = arguments[key.arg];
			}
			if (styleIsDynamic === true) {
				vNode.style = arguments[style.arg];
			}
			if (classNameIsDynamic === true) {
				vNode.className = arguments[className.arg];
			}

			return vNode;
		};
	}

	var index = {
		createElement: createElement,
		createTemplate: createTemplate,
		createVNode: createVNode,
		universal: {
			createElement: createUniversalElement
		}
	};

	return index;

}));