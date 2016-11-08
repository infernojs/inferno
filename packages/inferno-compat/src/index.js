import isValidElement from '../../../src/factories/isValidElement';
import PropTypes from 'proptypes';
import ValueTypes from '../../../src/core/ValueTypes';
import ChildrenTypes from '../../../src/core/ChildrenTypes';
import NodeTypes from '../../../src/core/NodeTypes';
import createClass from 'inferno-create-class';
import infernoCreateElement from 'inferno-create-element';
import renderToString, { renderToStaticMarkup } from 'inferno-server';
import { default as Inferno } from 'inferno';
import Component from 'inferno-component';
const {
	createVComponent: infernoCreateVComponent,
	createVElement,
	createStaticVElement,
	createOptBlueprint,
	createOptVElement,
	createVFragment,
	createVPlaceholder,
	createVText,
	cloneVNode,
	findDOMNode,
	render,
	NO_OP
} = Inferno;

function unmountComponentAtNode(container) {
	render(null, container);
	return true;
}

const ARR = [];

const Children = {
	map(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) fn = fn.bind(ctx);
		return children.map(fn);
	},
	forEach(children, fn, ctx) {
		children = Children.toArray(children);
		if (ctx && ctx!==children) fn = fn.bind(ctx);
		children.forEach(fn);
	},
	count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only(children) {
		children = Children.toArray(children);
		if (children.length!==1) throw new Error('Children.only() expects only one child.');
		return children[0];
	},
	toArray(children) {
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

let currentComponent = null;

Component.prototype.isReactComponent = {};
Component.prototype.beforeRender = function() {
	currentComponent = this;
};
Component.prototype.afterRender = function() {
	currentComponent = null;
};

const cloneElement = cloneVNode;
const version = '15.3.1';

const createElement = (name, _props, ...children) => {
	let props = _props || {};
	const ref = props.ref;

	if (typeof ref === 'string') {
		props.ref = function (val) {
			if (this && this.refs) {
				this.refs[ref] = val;
			}
		}.bind(currentComponent || null);
	}
	return infernoCreateElement(name, props, ...children);
}

const createVComponent = (type, props, key, hooks, ref) =>
	infernoCreateVComponent(type, props || {}, key, hooks, ref);

export {
	render,
	isValidElement,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	PropTypes,
	createClass,
	findDOMNode,
	renderToString,
	renderToStaticMarkup,
	createVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ValueTypes,
	ChildrenTypes,
	NodeTypes,
	Children,
	createOptVElement,
	createVFragment,
	createVPlaceholder,
	createVText,
	cloneVNode,
	NO_OP,
	version
};

export default {
	render,
	isValidElement,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	PropTypes,
	createClass,
	findDOMNode,
	renderToString,
	renderToStaticMarkup,
	createVElement,
	createStaticVElement,
	createOptBlueprint,
	createVComponent,
	ValueTypes,
	ChildrenTypes,
	NodeTypes,
	Children,
	createOptVElement,
	createVFragment,
	createVPlaceholder,
	createVText,
	cloneVNode,
	NO_OP,
	version
};
