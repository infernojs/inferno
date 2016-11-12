import isValidElement from '../../../src/factories/isValidElement';
import createClass from '../../../src/component/createClass';
import infernoCreateElement from '../../../src/factories/createElement';
import cloneVNode from '../../../src/factories/cloneVNode';
import { render, findDOMNode } from '../../../src/DOM/rendering';
import { createVNode } from '../../../src/core/shapes';
import Component from '../../../src/component/es2015';
import { NO_OP } from '../../../src/shared';

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
