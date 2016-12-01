import PropTypes from 'proptypes';
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
Component.prototype._beforeRender = function() {
	currentComponent = this;
};
Component.prototype._afterRender = function() {
	currentComponent = null;
};

const cloneElement = cloneVNode;
const version = '15.4.1';

function normalizeProps(name, props) {
	if ((name === 'input' || name === 'textarea') && props.onChange) {
		const eventName = props.type === 'checkbox' ? 'onclick' : 'oninput'
		
		if (!props[eventName]) {
			props[eventName] = props.onChange;
			delete props.onChange; 
		}
	}
	for (let prop in props) {
		if (prop[0] === 'o' && prop[1] === 'n' && prop.length > 4) {
			const value = props[prop];

			if (typeof value === 'function') {
				proxyEvent(props, prop, value);
			}
		}
	}
}

function proxyEvent(props, prop, oldValue) {
	props[prop] = e => {
		e.persist = () => {};
		oldValue(e);
	};
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

// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers (a, b) {
	for (let i in a) if (!(i in b)) return true;
	for (let i in b) if (a[i] !== b[i]) return true;
	return false;
}

module.exports = function (instance, nextProps, nextState) {
	return (
		shallowDiffers(instance.props, nextProps) ||
		shallowDiffers(instance.state, nextState)
	)
}


function PureComponent(props, context) {
	Component.call(this, props, context);
}

PureComponent.prototype = new Component({});
PureComponent.prototype.shouldComponentUpdate = (props, state) =>
	shallowDiffers(this.props, props) || shallowDiffers(this.state, state);

export {
	createVNode,
	render,
	isValidElement,
	createElement,
	Component,
	PureComponent,
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
	PureComponent,
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
