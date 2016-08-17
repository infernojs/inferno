/*!
 * inferno v0.8.0-alpha3
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, (function () { 'use strict';

function isUndefined(obj) {
	return obj === undefined;
}

var ChildrenTypes = {
	KEYED_LIST: 0,
	NON_KEYED_LIST: 1,
	TEXT: 2,
	NODE: 3,
	UNKNOWN: 4,
	STATIC_TEXT: 5
};

var NULL_INDEX = -1;
var ROOT_INDEX = -2;

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

var VTemplate = function VTemplate($templateReducers, $key, $v0, $v1) {
	this._type = NodeTypes.TEMPLATE;
	this._dom = null;
	this._tr = $templateReducers;
	this._key = $key;
	this._v0 = $v0;
	this._v1 = $v1;
};
VTemplate.prototype.read = function read (index) {
	var value;
	if (index === ROOT_INDEX) {
		value = this._dom;
	} else if (index === 0) {
		value = this._v0;
	} else {
		value = this._v1[index - 1];
	}
	return value;
};
VTemplate.prototype.write = function write (index, value) {
	if (index === ROOT_INDEX) {
		this._dom = value;
	} else if (index === 0) {
		this._v0 = value;
	} else {
		var array = this._v1;
		if (!array) {
			this._v1 = [value];
		} else {
			array[index - 1] = value;
		}
	}
};

var VText = function VText($text) {
	this._type = NodeTypes.TEXT;
	this._text = $text;
	this._dom = null;
};

var VFragment = function VFragment($children) {
	this._type = NodeTypes.FRAGMENT;
	this._dom = null;
	this._pointer = null;
	this._children = $children;
	this._childrenType = ChildrenTypes.UNKNOWN;
};
VFragment.prototype.childrenType = function childrenType ($childrenType) {
	this._childrenType = $childrenType;
	return this;
};

var Variable = function Variable($pointer) {
	this._type = NodeTypes.VARIABLE;
	this._pointer = $pointer;
};

function createVTemplate(schema, renderer) {
	var argCount = schema.length;
	var parameters = [];

	for (var i = 0; i < argCount; i++) {
		parameters.push(new Variable(i));
	}
	var vNode = schema.apply(void 0, parameters);
	var templateReducers = renderer.createTemplateReducers(vNode, true, { length: argCount }, null, false, false, 0, '');
	var keyIndex = templateReducers._keyIndex;

	templateReducers._schema = schema;
	switch (argCount) {
		case 0:
			return function () { return new VTemplate(templateReducers, null, null, null); };
		case 1:
			if (keyIndex === 0) {
				return function (v0) { return new VTemplate(templateReducers, v0, v0, null); };
			} else {
				return function (v0) { return new VTemplate(templateReducers, null, v0, null); };
			}
		default:
			if (keyIndex === NULL_INDEX) {
				return function (v0) {
					var v1 = [], len = arguments.length - 1;
					while ( len-- > 0 ) v1[ len ] = arguments[ len + 1 ];

					return new VTemplate(templateReducers, null, v0, v1);
				};
			} else if (keyIndex === 0) {
				return function (v0) {
					var v1 = [], len = arguments.length - 1;
					while ( len-- > 0 ) v1[ len ] = arguments[ len + 1 ];

					return new VTemplate(templateReducers, v0, v0, v1);
				};
			} else {
				return function (v0) {
					var v1 = [], len = arguments.length - 1;
					while ( len-- > 0 ) v1[ len ] = arguments[ len + 1 ];

					return new VTemplate(templateReducers, v1[keyIndex - 1], v0, v1);
				};
			}
	}
}

function createVComponent(component) {
	return new VComponent(component);
}

function createVElement(tag) {
	return new VElement(tag);
}

function createVText(text) {
	return new VText(text);
}

function createVFragment(items) {
	return new VFragment(items);
}

var index = {
	createVTemplate: createVTemplate,
	createVComponent: createVComponent,
	createVElement: createVElement,
	createVText: createVText,
	createVFragment: createVFragment,
	ChildrenTypes: ChildrenTypes
};

return index;

})));