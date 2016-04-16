import { isNullOrUndefined } from './utils';
import { createUniversalElement } from './universal';

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
}

VNode.prototype = {
	setAttrs(attrs) {
		this.attrs = attrs;
		return this;
	},
	setTag(tag) {
		this.tag = tag;
		return this;
	},
	setStyle(style) {
		this.style = style;
		return this;
	},
	setClassName(className) {
		this.className = className;
		return this;
	},
	setChildren(children) {
		this.children = children;
		return this;
	},
	setHooks(hooks) {
		this.hooks = hooks;
		return this;
	},
	setEvents(events) {
		this.events = events;
		return this;
	},
	setKey(key) {
		this.key = key;
		return this;
	}
};

export function createVNode(tpl) {
	return new VNode(tpl);
}

export function createBlueprint(shape, childrenType) {
	const tag = shape.tag || null;
	const tagIsDynamic = tag && tag.arg !== undefined ? true : false;

	const children = !isNullOrUndefined(shape.children) ? shape.children : null;
	const childrenIsDynamic = children && children.arg !== undefined ? true : false;

	const attrs = shape.attrs || null;
	const attrsIsDynamic = attrs && attrs.arg !== undefined ? true : false;

	const hooks = shape.hooks || null;
	const hooksIsDynamic = hooks && hooks.arg !== undefined ? true : false;

	const events = shape.events || null;
	const eventsIsDynamic = events && events.arg !== undefined ? true : false;

	const key = shape.key !== undefined ? shape.key : null;
	const keyIsDynamic = !isNullOrUndefined(key) && !isNullOrUndefined(key.arg);

	const style = shape.style || null;
	const styleIsDynamic = style && style.arg !== undefined ? true : false;

	const className = shape.className !== undefined ? shape.className : null;
	const classNameIsDynamic = className && className.arg !== undefined ? true : false;

	const blueprint = {
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: !tagIsDynamic ? tag : null,
		className: className !== '' && className ? className: null,
		isComponent: tagIsDynamic,
		hasAttrs: attrsIsDynamic,
		hasHooks: hooksIsDynamic,
		hasEvents: eventsIsDynamic,
		hasStyle: styleIsDynamic,
		hasClassName: classNameIsDynamic || (className !== '' && className ? true : false),
		childrenType: childrenType === undefined ? (children ? 5 : 0) : childrenType,
		attrKeys: null,
		eventKeys: null
	};

	return function () {
		const vNode = new VNode(blueprint);

		if (tagIsDynamic === true) {
			vNode.tag = arguments[tag.arg];
		}
		if (childrenIsDynamic === true) {
			vNode.children = arguments[children.arg];
		}
		if (attrsIsDynamic === true) {
			vNode.attrs = arguments[attrs.arg];
		} else {
			if (tagIsDynamic && attrs) {
				vNode.attrs = attrs;
			}
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
