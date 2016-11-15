import isValidElement from '../../../build/factories/isValidElement';
import createClass from '../../../build/component/createClass';
import infernoCreateElement from '../../../build/factories/createElement';
import cloneVNode from '../../../build/factories/cloneVNode';
import { render, findDOMNode } from '../../../build/DOM/rendering';
import { createVNode } from '../../../build/core/shapes';
import Component from 'inferno-component';
import { NO_OP } from '../../../build/shared';

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
const version = '15.3.4';

function normalizeProps(name, props) {
	if (name === 'input' && props.onChange) {
		const eventName = props.type === 'checkbox' ? 'onclick' : 'oninput'
		
		if (!props[eventName]) {
			props[eventName] = props.onChange;
			delete props.onChange; 
		}
	}
}

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
	if (typeof name === 'string') {
		normalizeProps(name, props);
	}
	return infernoCreateElement(name, props, ...children);
};

export {
	createVNode,
	render,
	isValidElement,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	createClass,
	findDOMNode,
	Children,
	cloneVNode,
	NO_OP,
	version
};

export default {
	createVNode,
	render,
	isValidElement,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	createClass,
	findDOMNode,
	Children,
	cloneVNode,
	NO_OP,
	version
};
