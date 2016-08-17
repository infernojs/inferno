/*!
 * inferno-create-element v0.8.0-alpha3
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoCreateElement = factory());
}(this, (function () { 'use strict';

function isInvalid(obj) {
	return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}

function isAttrAnEvent(attr) {
	return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}

function isString(obj) {
	return typeof obj === 'string';
}

function isNull(obj) {
	return obj === null;
}

function isTrue(obj) {
	return obj === true;
}

function isUndefined(obj) {
	return obj === undefined;
}

function isObject(o) {
	return typeof o === 'object';
}

var ChildrenTypes = {
	KEYED_LIST: 0,
	NON_KEYED_LIST: 1,
	TEXT: 2,
	NODE: 3,
	UNKNOWN: 4,
	STATIC_TEXT: 5
};

var NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5,
	VARIABLE: 6
};

// added $ before all argument names to stop a silly Safari bug
function initProps(o) {
	if (!o._props) {
		o._props = {};
	}
}

var VElement = function VElement($tag) {
	this._type = NodeTypes.ELEMENT;
	this._dom = null;
	this._tag = $tag;
	this._children = null;
	this._key = null;
	this._props = null;
	this._ref = null;
	this._childrenType = ChildrenTypes.UNKNOWN;
};
VElement.prototype.children = function children ($children) {
	this._children = $children;
	return this;
};
VElement.prototype.key = function key ($key) {
	this._key = $key;
	return this;
};
VElement.prototype.props = function props ($props) {
	this._props = $props;
	return this;
};
VElement.prototype.ref = function ref ($ref) {
	this._ref = $ref;
	return this;
};
VElement.prototype.events = function events ($events) {
	this._events = $events;
	return this;
};
VElement.prototype.childrenType = function childrenType ($childrenType) {
	this._childrenType = $childrenType;
	return this;
};
VElement.prototype.className = function className ($className) {
	initProps(this);
	this._props.className = $className;
	return this;
};
VElement.prototype.style = function style ($style) {
	initProps(this);
	this._props.style = $style;
	return this;
};
VElement.prototype.events = function events () {
	initProps(this);
	debugger;
	return this;
};

var VComponent = function VComponent($component) {
	this._type = NodeTypes.COMPONENT;
	this._dom = null;
	this._component = $component;
	this._props = {};
	this._hooks = null;
	this._key = null;
	this._ref = null;
	this._isStateful = !isUndefined($component.prototype) && !isUndefined($component.prototype.render);
};
VComponent.prototype.key = function key ($key) {
	this._key = $key;
	return this;
};
VComponent.prototype.props = function props ($props) {
	this._props = $props;
	return this;
};
VComponent.prototype.hooks = function hooks ($hooks) {
	this._hooks = $hooks;
	return this;
};
VComponent.prototype.ref = function ref ($ref) {
	this._ref = $ref;
	return this;
};

function createVComponent(component) {
	return new VComponent(component);
}

function createVElement(tag) {
	return new VElement(tag);
}

var elementHooks = {
	onCreated: true,
	onAttached: true,
	onWillUpdate: true,
	onDidUpdate: true,
	onWillDetach: true
};

var componentHooks = {
	onComponentWillMount: true,
	onComponentDidMount: true,
	onComponentWillUnmount: true,
	onComponentShouldUpdate: true,
	onComponentWillUpdate: true,
	onComponentDidUpdate: true
};

function createElement(name, props) {
	var _children = [], len = arguments.length - 2;
	while ( len-- > 0 ) _children[ len ] = arguments[ len + 2 ];

	if (isInvalid(name) || isObject(name)) {
		throw new Error('Inferno Error: createElement() name paramater cannot be undefined, null, false or true, It must be a string, class or function.');
	}
	var children = _children;
	var vNode;

	if (_children) {
		if (_children.length === 1) {
			children = _children[0];
		} else if (_children.length === 0) {
			children = undefined;
		}
	}
	if (isString(name)) {
		var hooks;
		vNode = createVElement(name);

		for (var prop in props) {
			if (prop === 'key') {
				vNode.key = props.key;
				delete props.key;
			} else if (elementHooks[prop]) {
				if (!hooks) {
					hooks = {};
				}
				hooks[prop] = props[prop];
				delete props[prop];
			} else if (isAttrAnEvent(prop)) {
				var lowerCase = prop.toLowerCase();

				if (lowerCase !== prop) {
					props[prop.toLowerCase()] = props[prop];
					delete props[prop];
				}
			}
		}
		vNode._props = props;
		if (!isUndefined(children)) {
			vNode._children = children;
		}
		if (hooks) {
			vNode._hooks = hooks;
		}
	} else {
		var hooks$1;
		vNode = createVComponent(name);

		if (!isUndefined(children)) {
			if (!props) {
				props = {};
			}
			props.children = children;
		}
		for (var prop$1 in props) {
			if (componentHooks[prop$1]) {
				if (!hooks$1) {
					hooks$1 = {};
				}
				hooks$1[prop$1] = props[prop$1];
			} else if (prop$1 === 'key') {
				vNode.key = props.key;
				delete props.key;
			}
		}
		vNode._props = props;
		if (hooks$1) {
			vNode._hooks = hooks$1;
		}
	}
	return vNode;
}

return createElement;

})));