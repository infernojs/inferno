/*!
 * inferno v0.8.0-alpha6
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Inferno = factory());
}(this, (function () { 'use strict';

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
	CHILDREN_KEYED: 1,
	CHILDREN_NON_KEYED: 2,
	CHILDREN_TEXT: 3,
	CHILDREN_NODE: 4,
	PROPS_CLASS_NAME: 5
};

var ChildrenTypes = {
	NON_KEYED: 1,
	KEYED: 2,
	NODE: 3,
	TEXT: 4,
	UNKNOWN: 5
};

function createOptBlueprint(staticVElement, v0, v1, v2) {
	return {
		clone: null,
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
		key: key || null,
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
	createVText: createVText,
	ValueTypes: ValueTypes,
	ChildrenTypes: ChildrenTypes,
	NodeTypes: NodeTypes
};

return index;

})));