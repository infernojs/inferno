import isValidElement from '../../../build/factories/isValidElement';
import createClass from '../../../build/component/createClass';
import infernoCreateElement from '../../../build/factories/createElement';
import cloneVNode from '../../../build/factories/cloneVNode';
import { render, findDOMNode } from '../../../build/DOM/rendering';
import { createVNode } from '../../../build/core/shapes';
import Component from '../../../build/component/es2015';
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

export {
	createVNode,
	render,
	isValidElement,
	createElement,
	Component,
	unmountComponentAtNode,
	cloneElement,
	PropTypes,
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
	PropTypes,
	createClass,
	findDOMNode,
	Children,
	cloneVNode,
	NO_OP,
	version
};
