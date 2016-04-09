/*!
 * inferno v0.7.0
 * (c) 2016 Dominic Gannaway
 * Released under the MPL-2.0 License.
 */
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

function isNullOrUndefined(obj) {
	return obj === undefined || obj === null;
}

function isAttrAnEvent(attr) {
	return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}

function createElement(tag, namespace) {
	if (isNullOrUndefined(namespace)) {
		return document.createElement(tag);
	} else {
		return document.createElementNS(namespace, tag);
	}
}

// Runs only once in applications lifetime
var isBrowser = typeof window !== 'undefined' && window.document;

function createUniversalElement(tag, attrs) {
	if (isBrowser) {
		var dom = createElement(tag);
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
	createTemplate: createTemplate,
	createVNode: createVNode,
	universal: {
		createElement: createUniversalElement
	}
};

export default index;