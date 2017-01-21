import {
	EMPTY_OBJ,
	isArray,
	isFunction,
	isInvalid,
	isNullOrUndef,
	isStringOrNumber,
	isUndefined,
	throwError
} from 'inferno-helpers';
import options from '../core/options';
import { cloneVNode, createTextVNode, createVoidVNode } from '../core/VNodes';
import { svgNS } from './constants';
import Lifecycle from './lifecycle';
import { mount } from './mounting';
import { patch } from './patching';
import { componentToDOMNodeMap } from './rendering';
import {
	unmount
} from './unmounting';

export function createClassComponentInstance(vNode: VNode, Component, props: Props, context: Object, isSVG: boolean) {
	if (isUndefined(context)) {
		context = {};
	}
	const instance = new Component(props, context);

	instance.context = context;
	if (instance.props === EMPTY_OBJ) {
		instance.props = props;
	}
	instance._patch = patch;
	if (options.findDOMNodeEnabled) {
		instance._componentToDOMNodeMap = componentToDOMNodeMap;
	}

	instance._unmounted = false;
	instance._pendingSetState = true;
	instance._isSVG = isSVG;
	if (isFunction(instance.componentWillMount)) {
		instance.componentWillMount();
	}

	const childContext = instance.getChildContext();

	if (!isNullOrUndef(childContext)) {
		instance._childContext = Object.assign({}, context, childContext);
	} else {
		instance._childContext = context;
	}

	options.beforeRender && options.beforeRender(instance);
	let input = instance.render(props, instance.state, context);

	options.afterRender && options.afterRender(instance);
	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
	} else if (isStringOrNumber(input)) {
		input = createTextVNode(input);
	} else {
		if (input.dom) {
			input = cloneVNode(input);
		}
		if (input.flags & VNodeFlags.Component) {
			// if we have an input that is also a component, we run into a tricky situation
			// where the root vNode needs to always have the correct DOM entry
			// so we break monomorphism on our input and supply it our vNode as parentVNode
			// we can optimise this in the future, but this gets us out of a lot of issues
			input.parentVNode = vNode;
		}
	}
	instance._pendingSetState = false;
	instance._lastInput = input;
	return instance;
}
export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle: Lifecycle, context: Object, isSVG: boolean, isRecycling: boolean) {
	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}

export function replaceVNode(parentDom, dom, vNode, lifecycle: Lifecycle, isRecycling) {
	let shallowUnmount = false;
	// we cannot cache nodeType here as vNode might be re-assigned below
	if (vNode.flags & VNodeFlags.Component) {
		// if we are accessing a stateful or stateless component, we want to access their last rendered input
		// accessing their DOM node is not useful to us here
		unmount(vNode, null, lifecycle, false, isRecycling);
		vNode = vNode.children._lastInput || vNode.children;
		shallowUnmount = true;
	}
	replaceChild(parentDom, dom, vNode.dom);
	unmount(vNode, null, lifecycle, false, isRecycling);
}

export function createFunctionalComponentInput(vNode: VNode, component, props: Props, context: Object) {
	let input = component(props, context);

	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
	} else if (isStringOrNumber(input)) {
		input = createTextVNode(input);
	} else {
		if (input.dom) {
			input = cloneVNode(input);
		}
		if (input.flags & VNodeFlags.Component) {
			// if we have an input that is also a component, we run into a tricky situation
			// where the root vNode needs to always have the correct DOM entry
			// so we break monomorphism on our input and supply it our vNode as parentVNode
			// we can optimise this in the future, but this gets us out of a lot of issues
			input.parentVNode = vNode;
		}
	}
	return input;
}

export function setTextContent(dom, text: string | number) {
	if (text !== '') {
		dom.textContent = text;
	} else {
		dom.appendChild(document.createTextNode(''));
	}
}

export function updateTextContent(dom, text: string) {
	dom.firstChild.nodeValue = text;
}

export function appendChild(parentDom, dom) {
	parentDom.appendChild(dom);
}

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndef(nextNode)) {
		appendChild(parentDom, newNode);
	} else {
		parentDom.insertBefore(newNode, nextNode);
	}
}

export function documentCreateElement(tag, isSVG): Element {
	if (isSVG === true) {
		return document.createElementNS(svgNS, tag);
	} else {
		return document.createElement(tag);
	}
}

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle: Lifecycle, context: Object, isSVG: boolean, isRecycling: boolean) {
	unmount(lastNode, null, lifecycle, false, isRecycling);
	const dom = mount(nextNode, null, lifecycle, context, isSVG);

	nextNode.dom = dom;
	replaceChild(parentDom, dom, lastNode.dom);
}

export function replaceChild(parentDom, nextDom, lastDom) {
	if (!parentDom) {
		parentDom = lastDom.parentNode;
	}
	parentDom.replaceChild(nextDom, lastDom);
}

export function removeChild(parentDom: Element, dom: Element) {
	parentDom.removeChild(dom);
}

export function removeAllChildren(dom: Element, children, lifecycle: Lifecycle, isRecycling: boolean) {
	dom.textContent = '';
	if (!lifecycle.fastUnmount || (lifecycle.fastUnmount && options.recyclingEnabled && !isRecycling)) {
		removeChildren(null, children, lifecycle, isRecycling);
	}
}

export function removeChildren(dom: Element, children, lifecycle: Lifecycle, isRecycling: boolean) {
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (!isInvalid(child)) {
			unmount(child, dom, lifecycle, true, isRecycling);
		}
	}
}

export function isKeyed(lastChildren: VNode[], nextChildren: VNode[]): boolean {
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
