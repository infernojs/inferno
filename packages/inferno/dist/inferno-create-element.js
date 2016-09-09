/*!
 * inferno-create-element v1.0.0-alpha2
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

var NodeTypes = {
	ELEMENT: 1,
	OPT_ELEMENT: 2,
	TEXT: 3,
	FRAGMENT: 4,
	OPT_BLUEPRINT: 5,
	COMPONENT: 6,
	PLACEHOLDER: 7
};

var ChildrenTypes = {
	NON_KEYED: 1,
	KEYED: 2,
	NODE: 3,
	TEXT: 4,
	UNKNOWN: 5
};

function createVComponent(component, props, key, hooks, ref) {
	return {
		component: component,
		dom: null,
		hooks: hooks || null,
		instance: null,
		key: key,
		props: props,
		ref: ref || null,
		type: NodeTypes.COMPONENT
	};
}

function createVElement(tag, props, children, key, ref, childrenType) {
	return {
		children: children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN,
		dom: null,
		key: key,
		props: props,
		ref: ref || null,
		tag: tag,
		type: NodeTypes.ELEMENT
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