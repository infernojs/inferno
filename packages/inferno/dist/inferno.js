/*!
 * inferno v0.7.25
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, function () { 'use strict';

	// Runs only once in applications lifetime
	var isBrowser = typeof window !== 'undefined' && window.document;

	function isNullOrUndefined(obj) {
		return isUndefined(obj) || isNull(obj);
	}

	function isAttrAnEvent$1(attr) {
		return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	}

	function isNull(obj) {
		return obj === null;
	}

	function isUndefined(obj) {
		return obj === undefined;
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

	function isAttrAnEvent(attr) {
		return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	}

	function isAttrAHook(hook) {
		return hook === 'onCreated'
			|| hook === 'onAttached'
			|| hook === 'onWillDetach'
			|| hook === 'onWillUpdate'
			|| hook === 'onDidUpdate';
	}

	function isAttrAComponentHook(hook) {
		return hook === 'onComponentWillMount'
			|| hook === 'onComponentDidMount'
			|| hook === 'onComponentWillUnmount'
			|| hook === 'onComponentShouldUpdate'
			|| hook === 'onComponentWillUpdate'
			|| hook === 'onComponentDidUpdate';
	}


	function createBlueprint(shape, childrenType) {
		var tag = shape.tag || null;
		var tagIsDynamic = tag && tag.arg !== undefined ? true : false;

		var children = isNullOrUndefined(shape.children) ? null : shape.children;
		var childrenIsDynamic = children && children.arg !== undefined ? true : false;

		var attrs = shape.attrs || null;
		var attrsIsDynamic = attrs && attrs.arg !== undefined ? true : false;

		var hooks = shape.hooks || null;
		var hooksIsDynamic = hooks && hooks.arg !== undefined ? true : false;

		var events = shape.events || null;
		var eventsIsDynamic = events && events.arg !== undefined ? true : false;

		var key = shape.key === undefined ? null : shape.key;
		var keyIsDynamic = !isNullOrUndefined(key) && !isNullOrUndefined(key.arg);

		var style = shape.style || null;
		var styleIsDynamic = style && style.arg !== undefined ? true : false;

		var className = shape.className === undefined ? null : shape.className;
		var classNameIsDynamic = className && className.arg !== undefined ? true : false;

		var spread = shape.spread === undefined ? null : shape.spread;
		var hasSpread = shape.spread !== undefined;

		var blueprint = {
			lazy: shape.lazy || false,
			dom: null,
			pool: [],
			tag: tagIsDynamic ? null : tag,
			className: className !== '' && className ? className : null,
			style: style !== '' && style ? style : null,
			isComponent: tagIsDynamic,
			hasAttrs: attrsIsDynamic || (attrs ? true : false),
			hasHooks: hooksIsDynamic,
			hasEvents: eventsIsDynamic,
			hasStyle: styleIsDynamic || (style !== '' && style ? true : false),
			hasClassName: classNameIsDynamic || (className !== '' && className ? true : false),
			childrenType: childrenType === undefined ? (children ? 5 : 0) : childrenType,
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
			if (hasSpread) {
				var _spread = arguments[spread.arg];
				var attrs$1;
				var events$1;
				var hooks$1;
				var attrKeys = [];
				var eventKeys = [];

				for (var prop in _spread) {
					var value = _spread[prop];

					if (prop === 'className' || (prop === 'class' && !blueprint.isSVG)) {
						vNode.className = value;
						blueprint.hasClassName = true;
					} else if (prop === 'style') {
						vNode.style = value;
						blueprint.hasStyle = true;
					} else if (prop === 'key') {
						vNode.key = value;
					} else if (isAttrAHook(prop) || isAttrAComponentHook(prop)) {
						if (!hooks$1) {
							hooks$1 = {};
						}
						hooks$1[prop[2].toLowerCase() + prop.substring(3)] = value;
					} else if (isAttrAnEvent(prop)) {
						if (!events$1) {
							events$1 = {};
						}
						eventKeys.push(prop.toLowerCase());
						events$1[prop.toLowerCase()] = value;
					} else if (prop === 'children') {
						vNode.children = value;
						blueprint.childrenType = blueprint.childrenType || 5;
					} else {
						if (!attrs$1) {
							attrs$1 = {};
						}
						attrKeys.push(prop);
						attrs$1[prop] = value;
					}
				}
				if (attrs$1) {
					vNode.attrs = attrs$1;
					blueprint.attrKeys = attrKeys;
					blueprint.hasAttrs = true;
				}
				if (events$1) {
					vNode.events = events$1;
					blueprint.eventKeys = eventKeys;
					blueprint.hasEvents = true;
				}
				if (hooks$1) {
					vNode.hooks = hooks$1;
					blueprint.hasHooks = true;
				}
			} else {
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
				} else {
					vNode.key = key;
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
			}
			return vNode;
		};
	}

	function VText(text) {
		this.text = text;
		this.dom = null;
	}

	function createVText(text) {
		return new VText(text);
	}

	// Copy of the util from dom/util, otherwise it makes massive bundles
	function documentCreateElement(tag, isSVG) {
		var dom;

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
				} else if (!isNullOrUndefined(value) && value !== false && !isAttrAnEvent$1(attr)) {
					dom.setAttribute(attr, value);
				}
			}
		}
	}

	var index = {
		createBlueprint: createBlueprint,
		createVNode: createVNode,
		createVText: createVText,
		universal: {
			createElement: createUniversalElement
		}
	};

	return index;

}));