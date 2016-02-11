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
	babelHelpers;

	function isArray$1(obj) {
		return obj.constructor === Array;
	}

	function isNullOrUndefined(obj) {
		return obj === undefined || obj === null;
	}

	function isFunction(obj) {
		return typeof obj === 'function';
	}

	function isAttrAnEvent(attr) {
		return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	}

	var globalNonStatic = {
		static: {
			keyed: false,
			nonKeyed: false
		},
		dom: null,
		tag: null,
		key: null,
		attrs: null,
		events: null,
		children: null,
		nextNode: null,
		instance: null
	};

	function createAttrsAndEvents(props, tag) {
		var events = null;
		var attrs = null;

		if (props) {
			if (!isArray$1(props)) {
				for (var prop in props) {
					if (isAttrAnEvent(prop)) {
						if (!events) {
							events = {};
						}
						events[prop[2].toLowerCase() + prop.substring(3)] = props[prop];
						delete props[prop];
					} else if (!isFunction(tag)) {
						if (!attrs) {
							attrs = [];
						}
						attrs.push({ name: prop, value: props[prop] });
					} else {
						attrs = props;
					}
				}
			} else {
				return props;
			}
		}
		return { attrs: attrs, events: events };
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

		if (!isNullOrUndefined(children)) {
			children = isArray$1(children) && children.length === 1 ? createChildren(children[0]) : createChildren(children);
		}
		return {
			static: globalNonStatic,
			dom: null,
			tag: tag,
			key: key,
			attrs: attrsAndEvents.attrs,
			events: attrsAndEvents.events,
			children: children || text,
			nextNode: null,
			instance: null
		};
	}

	function createChildren(children) {
		if (children && isArray$1(children)) {
			var newChildren = [];

			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				if (!isNullOrUndefined(child)) {
					newChildren.push(createChild(child));
				} else {
					newChildren.push(child);
				}
			}
			return newChildren;
		} else if ((typeof children === 'undefined' ? 'undefined' : babelHelpers.typeof(children)) === 'object') {
			return createChild(children);
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

	var isBrowser = typeof window !== 'undefined' && window.document;

	function createStaticElement(tag, attrs) {
		if (isBrowser) {
			var dom = document.createElement(tag);
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