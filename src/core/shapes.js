import { isUndefined } from './utils';

function VElement(tag) {
	this._dom = null;
	this._tag = tag;
	this._children = null;
	this._key = null;
	this._attrs = null;
	this._hooks = null;
	this._events = null;
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
	this._dom = null;
	this._ref = null;
	this._component = component;
	this._props = null;
	this._hooks = null;
	this._key = null;
	this._isStateful = !isUndefined(component.prototype.render);
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
	this._dom = null;
	this._bp = bp;
	this._key = null;
	this._v0 = v0;
	this._v1 = v1;
	this._v2 = v2;
}

function VText(text) {
	this._text = text;
	this._dom = null;
}

function VPlaceholder() {
	this._placeholder = true;
	this._dom = null;
}

function VList(items) {
	this._dom = null;
	this._pointer = null;
	this._items = items;
}

export function createVTemplate(bp, v0, v1, v2) {
	return new VTemplate(bp, v0, v1, v2);
}

export function createVComponent(tag) {
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

export function createVList(items) {
	return new VList(items);
}
