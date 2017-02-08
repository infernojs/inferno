import PropTypes from 'proptypes';
import isValidElement from './isValidElement';
import createClass from 'inferno-create-class';
import infernoCreateElement from 'inferno-create-element';
import { createVNode, render, findDOMNode, options, cloneVNode, VNode, InfernoChildren, Props, EMPTY_OBJ } from 'inferno';
import { NO_OP } from 'inferno-shared';
import Component from 'inferno-component';
import { ClassicComponentClass, ComponentSpec } from 'inferno-create-class';
import _VNodeFlags from 'inferno-vnode-flags';

declare global {
	interface Event {
		persist: Function;
	}
}

options.findDOMNodeEnabled = true;

function unmountComponentAtNode(container: Element | SVGAElement | DocumentFragment): boolean {
	render(null, container);
	return true;
}

function isNullOrUndef(children: any) {
	return children === null || children === undefined;
}

const ARR = [];

export type IterateChildrenFn = (value: InfernoChildren | any, index: number, array: Array<InfernoChildren | any>) => any;

const Children = {
	map(children: Array<InfernoChildren | any>, fn: IterateChildrenFn, ctx: any): any[] {
		if (isNullOrUndef(children)) {
			return children;
		}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {
			fn = fn.bind(ctx);
		}
		return children.map(fn);
	},
	forEach(children: Array<InfernoChildren | any>, fn: IterateChildrenFn, ctx: any): void {
		if (isNullOrUndef(children)) {
			return;
		}
		children = Children.toArray(children);
		if (ctx && ctx !== children) {
			fn = fn.bind(ctx);
		}
		children.forEach(fn);
	},
	count(children: Array<InfernoChildren | any>): number {
		children = Children.toArray(children);
		return children.length;
	},
	only(children: Array<InfernoChildren | any>): InfernoChildren | any {
		children = Children.toArray(children);
		if (children.length !== 1) {
			throw new Error('Children.only() expects only one child.');
		}
		return children[0];
	},
	toArray(children: Array<InfernoChildren | any>): Array<InfernoChildren | any> {
		if (isNullOrUndef(children)) {
			return [];
		}
		return Array.isArray && Array.isArray(children) ? children : ARR.concat(children);
	}
};

(Component.prototype as any).isReactComponent = {};

let currentComponent = null;

options.beforeRender = function (component): void {
	currentComponent = component;
};
options.afterRender = function (): void {
	currentComponent = null;
};

const version = '15.4.1';

const xlinkAttrs = {
	xlinkActuate: 'xlink:actuate',
	xlinkArcrole: 'xlink:arcrole',
	xlinkHref: 'xlink:href',
	xlinkRole: 'xlink:role',
	xlinkShow: 'xlink:show',
	xlinkTitle: 'xlink:title',
	xlinkType: 'xlink:type'
};

function normalizeProps(name: string, props: Props | any) {
	if ((name === 'input' || name === 'textarea') && props.onChange) {
		const type = props.type;
		let eventName;

		if (type === 'checkbox') {
			eventName = 'onclick';
		} else if (type === 'file') {
			eventName = 'onchange';
		} else {
			eventName = 'oninput';
		}
		if (!props[eventName]) {
			props[eventName] = props.onChange;
			delete props.onChange;
		}
	}
	for (let prop in props) {
		if (prop === 'onDoubleClick') {
			props.onDblClick = props[prop];
			delete props[prop];
		}
		if (xlinkAttrs[prop]) {
			props[xlinkAttrs[prop]] = props[prop];
			delete props[prop];
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

const injectStringRefs = function (originalFunction) {
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

options.createVNode = (vNode: VNode): void => {
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
function shallowDiffers(a, b): boolean {
	for (let i in a) {
		if (!(i in b)) {
			return true;
		}
	}
	for (let i in b) {
		if (a[i] !== b[i]) {
			return true;
		}
	}
	return false;
}

function PureComponent(props, context) {
	Component.call(this, props, context);
}

PureComponent.prototype = new Component({}, {});
PureComponent.prototype.shouldComponentUpdate = function (props, state) {
	return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};

class WrapperComponent<P, S> extends Component<P, S> {
	getChildContext() {
		// tslint:disable-next-line
		return this.props['context'];
	}
	render(props) {
		return props.children;
	}
}

function unstable_renderSubtreeIntoContainer(parentComponent, vNode, container, callback) {
	const wrapperVNode: VNode = createVNode(4, WrapperComponent, { context: parentComponent.context, children: vNode });
	const component = render(wrapperVNode, container);

	if (callback) {
		// callback gets the component as context, no other argument.
		callback.call(component);
	}
	return component;
}

// Credit: preact-compat - https://github.com/developit/preact-compat
const ELEMENTS = 'a abbr address area article aside audio b base bdi bdo big blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link main map mark menu menuitem meta meter nav noscript object ol optgroup option output p param picture pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track u ul var video wbr circle clipPath defs ellipse g image line linearGradient mask path pattern polygon polyline radialGradient rect stop svg text tspan'.split(' ');

function createFactory(type) {
	return createElement.bind(null, type);
}

const DOM = {};
for (let i = ELEMENTS.length; i--; ) {
	DOM[ELEMENTS[i]] = createFactory(ELEMENTS[i]);
}

export {
	// Bc we're trying to generate a complete declaration file
	// See: https://github.com/Microsoft/TypeScript/issues/6307
	ClassicComponentClass,
	ComponentSpec,

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
	unstable_renderSubtreeIntoContainer,
	createFactory,
	DOM,
	EMPTY_OBJ
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
	unstable_renderSubtreeIntoContainer,
	createFactory,
	DOM,
	EMPTY_OBJ
};

// To please the TS God
// https://github.com/Microsoft/TypeScript/issues/6307
export declare const VNodeFlags: _VNodeFlags;
