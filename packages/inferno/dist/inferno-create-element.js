/*!
 * inferno-create-element v0.8.0-alpha4
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.InfernoCreateElement = factory());
}(this, (function () { 'use strict';

var testFunc = function testFn() {};
warning(
	(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
	'It looks like you\'re using a minified copy of the development build ' +
	'of Inferno. When deploying Inferno apps to production, make sure to use ' +
	'the production build which skips development warnings and is faster. ' +
	'See http://infernojs.org for more details.'
);

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

function warning(condition, message) {
	if (!condition) {
		console.error(message);
	}
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
	if (!o.props) {
		o.props = {};
	}
}

var VElement = function VElement($tag) {
	this._type = NodeTypes.ELEMENT;
	this.dom = null;
	this.tag = $tag;
	this.children = null;
	this.key = null;
	this.props = null;
	this.ref = null;
	this.childrenType = ChildrenTypes.UNKNOWN;
};
VElement.prototype.children = function children ($children) {
	this.children = $children;
	return this;
};
VElement.prototype.key = function key ($key) {
	this.key = $key;
	return this;
};
VElement.prototype.props = function props ($props) {
	this.props = $props;
	if (!isUndefined($props.children)) {
		delete $props.children;
		this.children = $props.children;
	}
	return this;
};
VElement.prototype.ref = function ref ($ref) {
	this.ref = $ref;
	return this;
};
VElement.prototype.events = function events ($events) {
	this._events = $events;
	return this;
};
VElement.prototype.childrenType = function childrenType ($childrenType) {
	this.childrenType = $childrenType;
	return this;
};
VElement.prototype.className = function className ($className) {
	initProps(this);
	this.props.className = $className;
	return this;
};
VElement.prototype.style = function style ($style) {
	initProps(this);
	this.props.style = $style;
	return this;
};
VElement.prototype.events = function events () {
	initProps(this);
	return this;
};

var VComponent = function VComponent($component) {
	this._type = NodeTypes.COMPONENT;
	this.dom = null;
	this._component = $component;
	this.props = {};
	this.hooks = null;
	this.key = null;
	this.ref = null;
	this.isStateful = !isUndefined($component.prototype) && !isUndefined($component.prototype.render);
};
VComponent.prototype.key = function key ($key) {
	this.key = $key;
	return this;
};
VComponent.prototype.props = function props ($props) {
	this.props = $props;
	return this;
};
VComponent.prototype.hooks = function hooks ($hooks) {
	this.hooks = $hooks;
	return this;
};
VComponent.prototype.ref = function ref ($ref) {
	this.ref = $ref;
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
		vNode.props = props;
		if (!isUndefined(children)) {
			vNode.children = children;
		}
		if (hooks) {
			vNode.hooks = hooks;
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
		vNode.props = props;
		if (hooks$1) {
			vNode.hooks = hooks$1;
		}
	}
	return vNode;
}

return createElement;

})));