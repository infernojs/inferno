import { isUndefined } from './utils';

export const NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5
};

function VElement(tag) {
	this._type = NodeTypes.ELEMENT;
	this._dom = null;
	this._tag = tag;
	this._children = null;
	this._key = null;
	this._props = null;
	this._hooks = null;
}

VElement.prototype = {
	children(children) {
		this._children = children;
	},
	key(key) {
		this._key = key;
	},
	attrs(attrs) {
		this._attrs = attrs;
	},
	hooks(hooks) {
		this._hooks = hooks;
	},
	events(events) {
		this._events = events;
	}
};

function VComponent(component) {
	this._type = NodeTypes.COMPONENT;
	this._dom = null;
	this._component = component;
	this._props = null;
	this._hooks = null;
	this._key = null;
	this._isStateful = !isUndefined(component.prototype) && !isUndefined(component.prototype.render);
}

VComponent.prototype = {
	key(key) {
		this._key = key;
	},
	props(props) {
		this._props = props;
	},
	hooks(hooks) {
		this._hooks = hooks;
	}
};

function VTemplate(bp, v0, v1, v2) {
	this._type = NodeTypes.TEMPLATE;
	this._dom = null;
	this._bp = bp;
	this._key = null;
	this._v0 = v0;
	this._v1 = v1;
	this._v2 = v2;
}

function VText(text) {
	this._type = NodeTypes.TEXT;
	this._text = text;
	this._dom = null;
}

function VPlaceholder() {
	this._type = NodeTypes.PLACEHOLDER;
	this._dom = null;
}

function VFragment(items) {
	this._type = NodeTypes.FRAGMENT;
	this._dom = null;
	this._pointer = null;
	this._items = items;
}

export function createVTemplate(bp, v0, v1, v2) {
	return new VTemplate(bp, v0, v1, v2);
}

export function createVComponent(component) {
	return new VComponent(component);
}

export function createVElement(tag) {
	return new VElement(tag);
}

export function createVText(text) {
	return new VText(text);
}

export function createVPlaceholder() {
	return new VPlaceholder();
}

export function createVFragment(items) {
	return new VFragment(items);
}

export function isVText(o) {
	return o._type === NodeTypes.TEXT;
}

export function isVPlaceholder(o) {
	return o._type === NodeTypes.PLACEHOLDER;
}

export function isVFragment(o) {
	return o._type === NodeTypes.FRAGMENT;
}

export function isVElement(o) {
	return o._type === NodeTypes.ELEMENT;
}

export function isVTemplate(o) {
	return o._type === NodeTypes.TEMPLATE;
}

export function isVComponent(o) {
	return o._type === NodeTypes.COMPONENT;
}
