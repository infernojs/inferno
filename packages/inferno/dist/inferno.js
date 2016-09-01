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
	TEMPLATE: 1,
	TEXT: 2,
	FRAGMENT: 3
};

var TemplateValueTypes = {
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

function createVTemplate(bp, key, v0, v1, v2, v3) {
	return {
		bp: bp,
		dom: null,
		key: key,
		type: NodeTypes.TEMPLATE,
		v0: v0,
		v1: v1,
		v2: v2,
		v3: v3
	};
}

function createVText(text) {
	return {
		dom: null,
		text: text,
		type: NodeTypes.TEXT
	};
}

function createVFragment(children, childrenType) {
	return {
		type: NodeTypes.FRAGMENT,
		dom: null,
		pointer: null,
		children: children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN
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
	createVTemplate: createVTemplate,
	createVFragment: createVFragment,
	createVText: createVText,
	TemplateValueTypes: TemplateValueTypes,
	ChildrenTypes: ChildrenTypes
};

return index;

})));