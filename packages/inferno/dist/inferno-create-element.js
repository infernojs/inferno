/*!
 * inferno-create-element v0.7.7
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoCreateElement = factory());
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

	function isArray(obj) {
		return obj instanceof Array;
	}

	function isNullOrUndefined(obj) {
		return obj === void 0 || obj === null;
	}

	function isInvalidNode(obj) {
		return obj === null || obj === false || obj === void 0;
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
					events[prop.toLowerCase()] = props[prop];
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

		if (tag === void 0 && !isNullOrUndefined(attrs) && !attrs.tpl && !isNullOrUndefined(children) && children.length === 0) {
			return null;
		}
		var key = !isNullOrUndefined(attrs) && !isNullOrUndefined(attrs.key) ? attrs.key : void 0;

		if (!isNullOrUndefined(children) && children.length === 0) {
			children = null;
		} else if (!isInvalidNode(children)) {
			children = isArray(children) && children.length === 1 ? createChildren(children[0]) : createChildren(children);
		}

		if (key !== void 0) {
			delete attrs.key;
		}
		var attrsAndEvents = createAttrsAndEvents(attrs, tag);
		var vNode = createVNode();

		className = className || attrsAndEvents.className;
		style = style || attrsAndEvents.style;

		vNode.tag = tag || null;
		vNode.attrs = attrsAndEvents.attrs || null;
		vNode.events = attrsAndEvents.events || events;
		vNode.hooks = attrsAndEvents.hooks || hooks;
		vNode.children = children === void 0 ? null : children;
		vNode.key = key === void 0 ? null : key;
		vNode.className = className === void 0 ? null : className;
		vNode.style = style === void 0 ? null : style;

		return vNode;
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
			return children.dom === void 0 ? createChild(children) : children;
		}
		return children;
	}

	function createElement(tag, props) {
		for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			children[_key - 2] = arguments[_key];
		}

		return createChild({ tag: tag, attrs: props, children: children });
	}

	return createElement;

}));