/*!
 * inferno-compat v1.0.0-beta7
 * (c) 2016 Dominic Gannaway
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('proptypes'), require('./inferno-create-class'), require('./inferno-create-element'), require('./inferno-server'), require('./inferno'), require('./inferno-component')) :
	typeof define === 'function' && define.amd ? define(['exports', 'proptypes', 'inferno-create-class', 'inferno-create-element', 'inferno-server', 'inferno', 'inferno-component'], factory) :
	(factory((global.InfernoCompat = global.InfernoCompat || {}),global.PropTypes,global.createClass,global.infernoCreateElement,global.renderToString,global.Inferno,global.Component));
}(this, (function (exports,PropTypes,createClass,infernoCreateElement,renderToString,Inferno,Component) { 'use strict';

PropTypes = 'default' in PropTypes ? PropTypes['default'] : PropTypes;
createClass = 'default' in createClass ? createClass['default'] : createClass;
infernoCreateElement = 'default' in infernoCreateElement ? infernoCreateElement['default'] : infernoCreateElement;
var renderToString__default = 'default' in renderToString ? renderToString['default'] : renderToString;
Inferno = 'default' in Inferno ? Inferno['default'] : Inferno;
Component = 'default' in Component ? Component['default'] : Component;

var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';











function isNull(obj) {
    return obj === null;
}


function isObject(o) {
    return typeof o === 'object';
}

var ELEMENT = 1;
var OPT_ELEMENT = 2;
var TEXT = 3;
var FRAGMENT = 4;
var OPT_BLUEPRINT = 5;
var COMPONENT = 6;
var PLACEHOLDER = 7;
var NodeTypes = {
    ELEMENT: ELEMENT,
    OPT_ELEMENT: OPT_ELEMENT,
    TEXT: TEXT,
    FRAGMENT: FRAGMENT,
    OPT_BLUEPRINT: OPT_BLUEPRINT,
    COMPONENT: COMPONENT,
    PLACEHOLDER: PLACEHOLDER
};

function isValidElement(obj) {
    var isNotANullObject = isObject(obj) && isNull(obj) === false;
    if (isNotANullObject === false) {
        return false;
    }
    var nodeType = obj.nodeType;
    return nodeType === ELEMENT || nodeType === COMPONENT || nodeType === OPT_ELEMENT;
}

var CHILDREN = 1;
var PROP_CLASS_NAME = 2;
var PROP_STYLE = 3;
var PROP_DATA = 4;
var PROP_REF = 5;
var PROP_SPREAD = 6;
var PROP_VALUE = 7;
var PROP = 8;
var ValueTypes = {
    CHILDREN: CHILDREN,
    PROP_CLASS_NAME: PROP_CLASS_NAME,
    PROP_STYLE: PROP_STYLE,
    PROP_DATA: PROP_DATA,
    PROP_REF: PROP_REF,
    PROP_SPREAD: PROP_SPREAD,
    PROP_VALUE: PROP_VALUE,
    PROP: PROP
};

var NON_KEYED = 1;
var KEYED = 2;
var NODE = 3;
var TEXT$1 = 4;
var UNKNOWN = 5;
var ChildrenTypes = {
    NON_KEYED: NON_KEYED,
    KEYED: KEYED,
    NODE: NODE,
    TEXT: TEXT$1,
    UNKNOWN: UNKNOWN
};

var infernoCreateVComponent = Inferno.createVComponent;
var createVElement = Inferno.createVElement;
var createStaticVElement = Inferno.createStaticVElement;
var createOptBlueprint = Inferno.createOptBlueprint;
var createOptVElement = Inferno.createOptVElement;
var createVFragment = Inferno.createVFragment;
var createVPlaceholder = Inferno.createVPlaceholder;
var createVText = Inferno.createVText;
var cloneVNode = Inferno.cloneVNode;
var findDOMNode = Inferno.findDOMNode;
var render = Inferno.render;
var NO_OP = Inferno.NO_OP;

function unmountComponentAtNode(container) {
	render(null, container);
	return true;
}

var ARR = [];

var Children = {
	map: function map(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) { fn = fn.bind(ctx); }
		return children.map(fn);
	},
	forEach: function forEach(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) { fn = fn.bind(ctx); }
		children.forEach(fn);
	},
	count: function count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only: function only(children) {
		children = Children.toArray(children);
		if (children.length!==1) { throw new Error('Children.only() expects only one child.'); }
		return children[0];
	},
	toArray: function toArray(children) {
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

var currentComponent = null;

Component.prototype.isReactComponent = {};
Component.prototype.beforeRender = function() {
	currentComponent = this;
};
Component.prototype.afterRender = function() {
	currentComponent = null;
};

var cloneElement = cloneVNode;
var version = '15.3.1';

var createElement = function (name, _props) {
	var children = [], len = arguments.length - 2;
	while ( len-- > 0 ) children[ len ] = arguments[ len + 2 ];

	var props = _props || {};
	var ref = props.ref;

	if (typeof ref === 'string') {
		props.ref = function (val) {
			if (this && this.refs) {
				this.refs[ref] = val;
			}
		}.bind(currentComponent || null);
	}
	return infernoCreateElement.apply(void 0, [ name, props ].concat( children ));
};

var createVComponent = function (type, props, key, hooks, ref) { return infernoCreateVComponent(type, props || {}, key, hooks, ref); };

var index = {
	render: render,
	isValidElement: isValidElement,
	createElement: createElement,
	Component: Component,
	unmountComponentAtNode: unmountComponentAtNode,
	cloneElement: cloneElement,
	PropTypes: PropTypes,
	createClass: createClass,
	findDOMNode: findDOMNode,
	renderToString: renderToString__default,
	renderToStaticMarkup: renderToString.renderToStaticMarkup,
	createVElement: createVElement,
	createStaticVElement: createStaticVElement,
	createOptBlueprint: createOptBlueprint,
	createVComponent: createVComponent,
	ValueTypes: ValueTypes,
	ChildrenTypes: ChildrenTypes,
	NodeTypes: NodeTypes,
	Children: Children,
	createOptVElement: createOptVElement,
	createVFragment: createVFragment,
	createVPlaceholder: createVPlaceholder,
	createVText: createVText,
	cloneVNode: cloneVNode,
	NO_OP: NO_OP,
	version: version
};

exports.render = render;
exports.isValidElement = isValidElement;
exports.createElement = createElement;
exports.Component = Component;
exports.unmountComponentAtNode = unmountComponentAtNode;
exports.cloneElement = cloneElement;
exports.PropTypes = PropTypes;
exports.createClass = createClass;
exports.findDOMNode = findDOMNode;
exports.renderToString = renderToString__default;
exports.renderToStaticMarkup = renderToString.renderToStaticMarkup;
exports.createVElement = createVElement;
exports.createStaticVElement = createStaticVElement;
exports.createOptBlueprint = createOptBlueprint;
exports.createVComponent = createVComponent;
exports.ValueTypes = ValueTypes;
exports.ChildrenTypes = ChildrenTypes;
exports.NodeTypes = NodeTypes;
exports.Children = Children;
exports.createOptVElement = createOptVElement;
exports.createVFragment = createVFragment;
exports.createVPlaceholder = createVPlaceholder;
exports.createVText = createVText;
exports.cloneVNode = cloneVNode;
exports.NO_OP = NO_OP;
exports.version = version;
exports['default'] = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
