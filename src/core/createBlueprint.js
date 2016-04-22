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
	this.clipData = null;
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

export function createVNode(bp) {
	return new VNode(bp);
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
		lazy: shape.lazy || false,
		dom: null,
		pools: {
			keyed: {},
			nonKeyed: []
		},
		tag: !tagIsDynamic ? tag : null,
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
