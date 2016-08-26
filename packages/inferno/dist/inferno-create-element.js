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

function createVComponent(
	component,
	props,
	key,
	hooks,
	ref
) {
	if ( props === void 0 ) props = null;
	if ( key === void 0 ) key = null;
	if ( hooks === void 0 ) hooks = null;
	if ( ref === void 0 ) ref = null;

	return {
		type: NodeTypes.COMPONENT,
		dom: null,
		component: component,
		props: props,
		hooks: hooks,
		key: key,
		ref: ref,
		isStateful: !isUndefined(component.prototype) && !isUndefined(component.prototype.render)
	};
}

function createVElement(
	tag,
	props,
	children,
	key,
	ref,
	childrenType
) {
	if ( props === void 0 ) props = null;
	if ( children === void 0 ) children = null;
	if ( key === void 0 ) key = null;
	if ( ref === void 0 ) ref = null;
	if ( childrenType === void 0 ) childrenType = null;

	return {
		type: NodeTypes.ELEMENT,
		dom: null,
		tag: tag,
		children: children,
		key: key,
		props: props,
		ref: ref,
		childrenType: childrenType || ChildrenTypes.UNKNOWN
	};
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