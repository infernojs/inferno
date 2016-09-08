/*!
 * inferno-create-element v0.7.27
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoCreateElement = factory());
}(this, (function () { 'use strict';

function isArray(obj) {
	return obj instanceof Array;
}

function isNullOrUndefined(obj) {
	return isUndefined(obj) || isNull(obj);
}

function isInvalidNode(obj) {
	return isNull(obj) || obj === false || obj === true || isUndefined(obj);
}

function isFunction(obj) {
	return typeof obj === 'function';
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

function isAttrAHook$1(hook) {
	return hook === 'onCreated'
		|| hook === 'onAttached'
		|| hook === 'onWillDetach'
		|| hook === 'onWillUpdate'
		|| hook === 'onDidUpdate';
}

function isAttrAComponentHook$1(hook) {
	return hook === 'onComponentWillMount'
		|| hook === 'onComponentDidMount'
		|| hook === 'onComponentWillUnmount'
		|| hook === 'onComponentShouldUpdate'
		|| hook === 'onComponentWillUpdate'
		|| hook === 'onComponentDidUpdate';
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
			} else if (isAttrAHook$1(prop) && !isFunction(tag)) {
				if (isNullOrUndefined(hooks)) {
					hooks = {};
				}
				hooks[prop.substring(2).toLowerCase()] = props[prop];
				delete props[prop];
			} else if (isAttrAnEvent$1(prop) && !isFunction(tag)) {
				if (isNullOrUndefined(events)) {
					events = {};
				}
				events[prop.toLowerCase()] = props[prop];
				delete props[prop];
			} else if (isAttrAComponentHook$1(prop) && isFunction(tag)) {
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

function createChild(ref) {
	var tag = ref.tag;
	var attrs = ref.attrs;
	var children = ref.children;
	var className = ref.className;
	var style = ref.style;
	var events = ref.events;
	var hooks = ref.hooks;

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
	var vNode = createVNode();

	className = className || attrsAndEvents.className;
	style = style || attrsAndEvents.style;

	vNode.tag = tag || null;
	vNode.attrs = attrsAndEvents.attrs || null;
	vNode.events = attrsAndEvents.events || events;
	vNode.hooks = attrsAndEvents.hooks || hooks;
	vNode.children = children === undefined ? null : children;
	vNode.key = key === undefined ? null : key;
	vNode.className = className === undefined ? null : className;
	vNode.style = style === undefined ? null : style;

	return vNode;
}

function createChildren(children) {
	var childrenDefined = !isNullOrUndefined(children);
	if (childrenDefined && isArray(children)) {
		var newChildren = [];

		for (var i = 0; i < children.length; i++) {
			var child = children[i];
			if (!isNullOrUndefined(child) && typeof child === 'object') {
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
	} else if (childrenDefined && typeof children === 'object') {
		return children.dom === undefined ? createChild(children) : children;
	}
	return children;
}

function createElement(tag, props) {
	var children = [], len = arguments.length - 2;
	while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

	return createChild({ tag: tag, attrs: props, children: children });
}

return createElement;

})));