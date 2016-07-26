import { isNullOrUndefined } from './utils';

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


export function createBlueprint(shape, childrenType) {
	const tag = shape.tag || null;
	const tagIsDynamic = tag && tag.arg !== undefined ? true : false;

	const children = isNullOrUndefined(shape.children) ? null : shape.children;
	const childrenIsDynamic = children && children.arg !== undefined ? true : false;

	const attrs = shape.attrs || null;
	const attrsIsDynamic = attrs && attrs.arg !== undefined ? true : false;

	const hooks = shape.hooks || null;
	const hooksIsDynamic = hooks && hooks.arg !== undefined ? true : false;

	const events = shape.events || null;
	const eventsIsDynamic = events && events.arg !== undefined ? true : false;

	const key = shape.key === undefined ? null : shape.key;
	const keyIsDynamic = !isNullOrUndefined(key) && !isNullOrUndefined(key.arg);

	const style = shape.style || null;
	const styleIsDynamic = style && style.arg !== undefined ? true : false;

	const className = shape.className === undefined ? null : shape.className;
	const classNameIsDynamic = className && className.arg !== undefined ? true : false;

	const spread = shape.spread === undefined ? null : shape.spread;
	const hasSpread = shape.spread !== undefined;

	const blueprint = {
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
		const vNode = new VNode(blueprint);

		if (tagIsDynamic === true) {
			vNode.tag = arguments[tag.arg];
		}
		if (childrenIsDynamic === true) {
			vNode.children = arguments[children.arg];
		}
		if (hasSpread) {
			const _spread = arguments[spread.arg];
			let attrs;
			let events;
			let hooks;
			let attrKeys = [];
			let eventKeys = [];

			for (let prop in _spread) {
				const value = _spread[prop];

				if (prop === 'className' || (prop === 'class' && !blueprint.isSVG)) {
					vNode.className = value;
					blueprint.hasClassName = true;
				} else if (prop === 'style') {
					vNode.style = value;
					blueprint.hasStyle = true;
				} else if (prop === 'key') {
					vNode.key = value;
				} else if (isAttrAHook(prop) || isAttrAComponentHook(prop)) {
					if (!hooks) {
						hooks = {};
					}
					hooks[prop[2].toLowerCase() + prop.substring(3)] = value;
				} else if (isAttrAnEvent(prop)) {
					if (!events) {
						events = {};
					}
					eventKeys.push(prop.toLowerCase());
					events[prop.toLowerCase()] = value;
				} else if (prop === 'children') {
					vNode.children = value;
					blueprint.childrenType = blueprint.childrenType || 5;
				} else {
					if (!attrs) {
						attrs = {};
					}
					attrKeys.push(prop);
					attrs[prop] = value;
				}
			}
			if (attrs) {
				vNode.attrs = attrs;
				blueprint.attrKeys = attrKeys;
				blueprint.hasAttrs = true;
			}
			if (events) {
				vNode.events = events;
				blueprint.eventKeys = eventKeys;
				blueprint.hasEvents = true;
			}
			if (hooks) {
				vNode.hooks = hooks;
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

function VPlaceholder() {
	this.placeholder = true;
	this.dom = null;
}

function VList(items) {
	this.dom = null;
	this.pointer = null;
	this.items = items;
}

export function createVText(text) {
	return new VText(text);
}

export function createVPlaceholder() {
	return new VPlaceholder();
}

export function createVList(items) {
	return new VList(items);
}
