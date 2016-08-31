/*!
 * inferno v0.8.0-alpha5
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

function warning(condition, message) {
	if (!condition) {
		console.error(message);
	}
}

var ChildrenTypes = {
	KEYED_LIST: 1,
	NON_KEYED_LIST: 2,
	TEXT: 3,
	NODE: 4,
	UNKNOWN: 5,
	STATIC_TEXT: 6
};

var NULL_INDEX = -1;
var NodeTypes = {
	ELEMENT: 0,
	COMPONENT: 1,
	TEMPLATE: 2,
	TEXT: 3,
	PLACEHOLDER: 4,
	FRAGMENT: 5,
	VARIABLE: 6
};

function cloneVNode(vNodeToClone, props) {
	var children = [], len = arguments.length - 2;
	while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

	if (!props) {
		props = {};
	}
	if (children.length > 0) {
		if (children.length === 1) {
			children = children[0];
		}
		if (!props.children) {
			props.children = children;
		} else {
			if (isArray(children)) {
				if (isArray(props.children)) {
					props.children = props.children.concat(children);
				} else {
					props.children = [props.children].concat(children);
				}
			} else {
				if (isArray(props.children)) {
					props.children.push(children);
				} else {
					props.children = [props.children];
					props.children.push(children);
				}
			}
		}
	}
	if (isVComponent(vNodeToClone)) {
		return createVComponent(vNodeToClone.component,
			Object.assign({}, vNodeToClone.props, props),
			vNodeToClone.key,
			vNodeToClone.hooks,
			vNodeToClone.ref
		);
	} else if (isVElement(vNodeToClone)) {
		return createVElement(vNodeToClone.tag,
			Object.assign({}, vNodeToClone.props, props),
			props.children || children || vNodeToClone.children,
			vNodeToClone.key,
			vNodeToClone.ref,
			ChildrenTypes.UNKNOWN
		);
	} else if (isVTemplate(vNodeToClone)) {
		return cloneVNode(convertVTemplate(vNodeToClone, props, children));
	}
}

function getTemplateValues(vTemplate) {
	var values = [];
	var v0 = vTemplate.v0;
	var v1 = vTemplate.v1;

	if (v0) {
		values.push(v0);
	}
	if (v1) {
		values.push.apply(values, v1);
	}
	return values;
}

function convertVTemplate(vTemplate) {
	return vTemplate.tr.schema.apply(null, getTemplateValues(vTemplate));
}

function createVTemplateFactory(schema, renderer) {
	var argCount = schema.length;
	var parameters = [];

	for (var i = 0; i < argCount; i++) {
		parameters.push(createVariable(i));
	}
	var vNode = schema.apply(void 0, parameters);
	var templateReducers = renderer.createTemplateReducers(
		vNode,
		true,
		{ length: argCount },
		null,
		false,
		false,
		0,
		''
	);
	var keyIndex = templateReducers.keyIndex;

	templateReducers.schema = schema;
	switch (argCount) {
		case 0:
			return function () { return creaetVTemplate(templateReducers, null, null, null); };
		case 1:
			if (keyIndex === 0) {
				return function (v0) { return creaetVTemplate(templateReducers, v0, v0, null); };
			} else {
				return function (v0) { return creaetVTemplate(templateReducers, null, v0, null); };
			}
		default:
			if (keyIndex === NULL_INDEX) {
				return function (v0) {
					var v1 = [], len = arguments.length - 1;
					while ( len-- > 0 ) v1[ len ] = arguments[ len + 1 ];

					return creaetVTemplate(templateReducers, null, v0, v1);
				};
			} else if (keyIndex === 0) {
				return function (v0) {
					var v1 = [], len = arguments.length - 1;
					while ( len-- > 0 ) v1[ len ] = arguments[ len + 1 ];

					return creaetVTemplate(templateReducers, v0, v0, v1);
				};
			} else {
				return function (v0) {
					var v1 = [], len = arguments.length - 1;
					while ( len-- > 0 ) v1[ len ] = arguments[ len + 1 ];

					return creaetVTemplate(templateReducers, v1[keyIndex - 1], v0, v1);
				};
			}
	}
}

function creaetVTemplate(tr, key, v0, v1) {
	return {
		type: NodeTypes.TEMPLATE,
		dom: null,
		tr: tr,
		key: key,
		v0: v0,
		v1: v1
	};
}

function createVariable(pointer) {
	return {
		type: NodeTypes.VARIABLE,
		pointer: pointer
	};
}

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

function createVText(text) {
	return {
		type: NodeTypes.TEXT,
		text: text,
		dom: null
	};
}

function createVFragment(
	children,
	childrenType
) {
	if ( childrenType === void 0 ) childrenType = ChildrenTypes.UNKNOWN;

	return {
		type: NodeTypes.FRAGMENT,
		dom: null,
		pointer: null,
		children: children,
		childrenType: childrenType
	};
}

function isVElement(o) {
	return o.type === NodeTypes.ELEMENT;
}

function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}

function isVComponent(o) {
	return o.type === NodeTypes.COMPONENT;
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
	createVTemplate: createVTemplateFactory,
	createVComponent: createVComponent,
	createVElement: createVElement,
	createVText: createVText,
	createVFragment: createVFragment,
	ChildrenTypes: ChildrenTypes,
	cloneVNode: cloneVNode,
	convertVTemplate: convertVTemplate
};

return index;

})));