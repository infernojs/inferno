/*!
 * inferno v1.0.0-alpha1
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, (function () { 'use strict';

var NO_OP = '$NO_OP';

function warning(condition, message) {
	if (!condition) {
		console.error(message);
	}
}

var NodeTypes = {
	ELEMENT: 1,
	OPT_ELEMENT: 2,
	TEXT: 3,
	FRAGMENT: 4,
	OPT_BLUEPRINT: 5
};

var ValueTypes = {
	CHILDREN: 1,
	PROP_CLASS_NAME: 2,
	PROP_STYLE: 3,
	PROP_DATA: 4,
	PROP: 5
};

var ChildrenTypes = {
	NON_KEYED: 1,
	KEYED: 2,
	NODE: 3,
	TEXT: 4,
	UNKNOWN: 5
};

function createOptBlueprint(staticVElement, v0, d0, v1, d1, v2, d2) {
	return {
		clone: null,
		d0: d0,
		d1: d1,
		d2: d2,
		pools: {
			nonKeyed: [],
			keyed: new Map()
		},
		staticVElement: staticVElement,
		type: NodeTypes.OPT_BLUEPRINT,
		v0: v0,
		v1: v1,
		v2: v2
	};
}

function createVComponent(component, props, key, hooks, ref) {
	return {
		component: component,
		dom: null,
		hooks: hooks || null,
		key: key,
		props: props,
		ref: ref || null,
		type: NodeTypes.COMPONENT
	};
}

function createVText(text) {
	return {
		dom: null,
		text: text,
		type: NodeTypes.TEXT
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

function createStaticVElement(tag, props, children) {
	return {
		children: children,
		props: props,
		tag: tag,
		type: NodeTypes.ELEMENT
	};
}

function createVFragment(children, childrenType) {
	return {
		children: children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN,
		dom: null,
		pointer: null,
		type: NodeTypes.FRAGMENT
	};
}

if ("development" !== 'production') {
	var testFunc = function testFn() {};
	warning(
		(testFunc.name || testFunc.toString()).indexOf('testFn') !== -1,
		'It looks like you\'re using a minified copy of the development build ' +
		'of Inferno. When deploying Inferno apps to production, make sure to use ' +
		'the production build which skips development warnings and is faster. ' +
		'See http://infernojs.org for more details.'
	);
}

var index = {
	createOptBlueprint: createOptBlueprint,
	createVElement: createVElement,
	createStaticVElement: createStaticVElement,
	createVFragment: createVFragment,
	createVComponent: createVComponent,
	createVText: createVText,
	ValueTypes: ValueTypes,
	ChildrenTypes: ChildrenTypes,
	NodeTypes: NodeTypes,
	NO_OP: NO_OP
};

return index;

})));