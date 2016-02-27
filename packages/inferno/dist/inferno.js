/*!
 * inferno v0.6.0
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

	function isArray$1(obj) {
		return obj.constructor === Array;
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

	function isAttrAComponentEvent(attr) {
		return attr.substring(0, 11) === 'onComponent' && attr.length > 12;
	}

	function createAttrsAndEvents(props, tag) {
		var events = null;
		var attrs = null;
		var className = null;
		var style = null;

		if (props) {
			if (!isArray$1(props)) {
				for (var prop in props) {
					if (prop === 'className') {
						className = props[prop];
					} else if (prop === 'style') {
						style = props[prop];
					} else if (isAttrAnEvent(prop) && !isFunction(tag)) {
						if (!events) {
							events = {};
						}
						events[prop.substring(2).toLowerCase()] = props[prop];
						delete props[prop];
					} else if (isAttrAComponentEvent(prop) && isFunction(tag)) {
						if (!events) {
							events = {};
						}
						events['c' + prop.substring(3)] = props[prop];
						delete props[prop];
					} else if (!isFunction(tag)) {
						if (!attrs) {
							attrs = {};
						}
						attrs[prop] = props[prop];
					} else {
						attrs = props;
					}
				}
			} else {
				return props;
			}
		}
		return { attrs: attrs, events: events, className: className, style: style };
	}

	function createChild(_ref) {
		var tag = _ref.tag;
		var attrs = _ref.attrs;
		var children = _ref.children;
		var text = _ref.text;

		var key = attrs && !isNullOrUndefined(attrs.key) ? attrs.key : null;

		if (key !== null) {
			delete attrs.key;
		}
		var attrsAndEvents = createAttrsAndEvents(attrs, tag);

		if (!isInvalidNode(children)) {
			children = isArray$1(children) && children.length === 1 ? createChildren(children[0]) : createChildren(children);
		}
		return {
			dom: null,
			tag: tag,
			key: key,
			attrs: attrsAndEvents.attrs,
			events: attrsAndEvents.events,
			className: attrsAndEvents.className,
			style: attrsAndEvents.style,
			children: children || text,
			instance: null
		};
	}

	function createChildren(children) {
		if (children && isArray$1(children)) {
			var newChildren = [];

			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (!isNullOrUndefined(child) && (typeof child === 'undefined' ? 'undefined' : babelHelpers.typeof(child)) === 'object') {
					newChildren.push(createChild(child));
				} else {
					newChildren.push(child);
				}
			}
			return newChildren;
		} else if (children && (typeof children === 'undefined' ? 'undefined' : babelHelpers.typeof(children)) === 'object') {
			return children.dom === undefined ? createChild(children) : children;
		} else {
			return children;
		}
	}

	function createElement(tag, props) {
		for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
			children[_key - 2] = arguments[_key];
		}

		return createChild({ tag: tag, attrs: props, children: children });
	}

	function createElement$1(tag, namespace) {
		if (namespace) {
			return document.createElementNS(namespace, tag);
		} else {
			return document.createElement(tag);
		}
	}

	var isBrowser = typeof window !== 'undefined' && window.document;

	function createStaticElement(tag, attrs) {
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
				if (!isNullOrUndefined(value) && value !== false && value !== true && !isAttrAnEvent(attr)) {
					dom.setAttribute(attr, value);
				} else if (value === true) {
					dom.setAttribute(attr, attr);
				}
			}
		}
	}

	var index = {
		createElement: createElement,
		staticCompiler: {
			createElement: createStaticElement
		}
	};

	return index;

}));