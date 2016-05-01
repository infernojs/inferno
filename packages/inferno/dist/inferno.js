/*!
 * inferno v0.7.6
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

	function isNullOrUndefined(obj) {
		return obj === void 0 || obj === null;
	}

	function isAttrAnEvent(attr) {
		return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
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

	function createBlueprint(shape, childrenType) {
		var tag = shape.tag || null;
		var tagIsDynamic = tag && tag.arg !== void 0 ? true : false;

		var children = isNullOrUndefined(shape.children) ? null : shape.children;
		var childrenIsDynamic = children && children.arg !== void 0 ? true : false;

		var attrs = shape.attrs || null;
		var attrsIsDynamic = attrs && attrs.arg !== void 0 ? true : false;

		var hooks = shape.hooks || null;
		var hooksIsDynamic = hooks && hooks.arg !== void 0 ? true : false;

		var events = shape.events || null;
		var eventsIsDynamic = events && events.arg !== void 0 ? true : false;

		var key = shape.key === void 0 ? null : shape.key;
		var keyIsDynamic = !isNullOrUndefined(key) && !isNullOrUndefined(key.arg);

		var style = shape.style || null;
		var styleIsDynamic = style && style.arg !== void 0 ? true : false;

		var className = shape.className === void 0 ? null : shape.className;
		var classNameIsDynamic = className && className.arg !== void 0 ? true : false;

		var blueprint = {
			lazy: shape.lazy || false,
			dom: null,
			pools: {
				keyed: {},
				nonKeyed: []
			},
			tag: tagIsDynamic ? null : tag,
			className: className !== '' && className ? className : null,
			style: style !== '' && style ? style : null,
			isComponent: tagIsDynamic,
			hasAttrs: attrsIsDynamic || (attrs ? true : false),
			hasHooks: hooksIsDynamic,
			hasEvents: eventsIsDynamic,
			hasStyle: styleIsDynamic || (style !== '' && style ? true : false),
			hasClassName: classNameIsDynamic || (className !== '' && className ? true : false),
			childrenType: childrenType === void 0 ? children ? 5 : 0 : childrenType,
			attrKeys: null,
			eventKeys: null,
			isSVG: shape.isSVG || false
		};

		return function () {
			var vNode = new VNode(blueprint);

			if (tagIsDynamic === true) {
				vNode.tag = arguments[tag.arg];
			}
			if (childrenIsDynamic === true) {
				vNode.children = arguments[children.arg];
			}
			if (attrsIsDynamic === true) {
				vNode.attrs = arguments[attrs.arg];
			} else {
				vNode.attrs = attrs;
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
			} else {
				vNode.style = blueprint.style;
			}
			if (classNameIsDynamic === true) {
				vNode.className = arguments[className.arg];
			} else {
				vNode.className = blueprint.className;
			}

			return vNode;
		};
	}

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	// Copy of the util from dom/util, otherwise it makes massive bundles
	function documentCreateElement(tag, isSVG) {
		var dom = void 0;

		if (isSVG === true) {
			dom = document.createElementNS('http://www.w3.org/2000/svg', tag);
		} else {
			dom = document.createElement(tag);
		}
		return dom;
	}

	function createUniversalElement(tag, attrs, isSVG) {
		if (isBrowser) {
			var dom = documentCreateElement(tag, isSVG);
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

	var index = {
		createBlueprint: createBlueprint,
		createVNode: createVNode,
		universal: {
			createElement: createUniversalElement
		}
	};

	return index;

}));