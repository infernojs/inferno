import PropTypes from 'proptypes';
import isValidElement from '../../../build/factories/isValidElement';
import createClass from '../../../build/component/createClass';
import infernoCreateElement from '../../../build/factories/createElement';
import { createVNode, NO_OP, render, findDOMNode, options, cloneVNode } from 'inferno';
import Component from 'inferno-component';

options.findDOMNodeEnabled = true;

function unmountComponentAtNode(container) {
	render(null, container);
	return true;
}

function isNullOrUndef(children) {
	return children === null || children === undefined;
}

const ARR = [];

const Children = {
	map(children, fn, ctx) {
		if (isNullOrUndef(children)) {return children;}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {fn = fn.bind(ctx);}
		return children.map(fn);
	},
	forEach(children, fn, ctx) {
		if (isNullOrUndef(children)) {return children;}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {fn = fn.bind(ctx);}
		children.forEach(fn);
	},
	count(children) {
		children = Children.toArray(children);
		return children.length;
	},
	only(children) {
		children = Children.toArray(children);
		if (children.length !== 1) {throw new Error('Children.only() expects only one child.');}
		return children[0];
	},
	toArray(children) {
		if (isNullOrUndef(children)) {return [];}
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

let currentComponent = null;

Component.prototype.isReactComponent = {};
options.beforeRender = function (component) {
	currentComponent = component;
};
options.afterRender = function () {
	currentComponent = null;
};

const version = '15.4.1';

function normalizeProps(name, props) {
	if ((name === 'input' || name === 'textarea') && props.onChange) {
		const eventName = props.type === 'checkbox' ? 'onclick' : 'oninput';

		if (!props[eventName]) {
			props[eventName] = props.onChange;
			delete props.onChange;
		}
	}
}

// we need to add persist() to Event (as React has it for synthetic events)
// this is a hack and we really shouldn't be modifying a global object this way,
// but there isn't a performant way of doing this apart from trying to proxy
// every prop event that starts with "on", i.e. onClick or onKeyPress
// but in reality devs use onSomething for many things, not only for
// input events
if (typeof Event !== 'undefined' && !Event.prototype.persist) {
	Event.prototype.persist = function () {};
}

const injectStringRefs = (originalFunction) => {
	return function (name, _props, ...children) {
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
		return originalFunction(name, props, ...children);
	};
};

const createElement = injectStringRefs(infernoCreateElement);
const cloneElement = injectStringRefs(cloneVNode);

const oldCreateVNode = options.createVNode;

options.createVNode = (vNode) => {
	const children = vNode.children;
	let props = vNode.props;

	if (isNullOrUndef(vNode.props)) {
		props = vNode.props = {};
	}
	if (!isNullOrUndef(children) && isNullOrUndef(props.children)) {
		props.children = children;
	}
	if (oldCreateVNode) {
		oldCreateVNode(vNode);
	}
};

// Credit: preact-compat - https://github.com/developit/preact-compat :)
function shallowDiffers(a, b) {
	for (let i in a) {if (!(i in b)) {return true;}}
	for (let i in b) {if (a[i] !== b[i]) {return true;}}
	return false;
}

function PureComponent(props, context) {
	Component.call(this, props, context);
}

PureComponent.prototype = new Component({}, {});
PureComponent.prototype.shouldComponentUpdate = function (props, state) {
	return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};

class WrapperComponent extends Component {
	getChildContext() {
		return this.props.context;
	}
	render(props) {
		return props.children;
	}
}

function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
	const wrapperVNode = createVNode(4, WrapperComponent, { context: parentComponent.context, children: vNode });
	const component = render(wrapperVNode, container);

	if (callback) {
		callback(component);
	}
	return component;
}

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
	version,
	unstable_renderSubtreeIntoContainer
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
	version,
	unstable_renderSubtreeIntoContainer
};
