import {
	combineFrom,
	isArray,
	isInvalid, isNull,
	isNullOrUndef,
	isStringOrNumber,
	isUndefined,
	LifecycleClass,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { options } from '../core/options';
import { createTextVNode, createVoidVNode, directClone, Props, VNode } from '../core/VNodes';
import { svgNS } from './constants';
import { mount } from './mounting';
import { unmount } from './unmounting';

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};

if (process.env.NODE_ENV !== 'production') {
	Object.freeze(EMPTY_OBJ);
}

export function createClassComponentInstance(vNode: VNode, Component, props: Props, context: Object, isSVG: boolean, lifecycle: LifecycleClass) {
	if (isUndefined(context)) {
		context = EMPTY_OBJ; // Context should not be mutable
	}
	const instance = new Component(props, context);
	vNode.children = instance;
	instance._blockSetState = false;
	instance.context = context;
	if (instance.props === EMPTY_OBJ) {
		instance.props = props;
	}
	// setState callbacks must fire after render is done when called from componentWillReceiveProps or componentWillMount
	instance._lifecycle = lifecycle;

	instance._unmounted = false;
	instance._pendingSetState = true;
	instance._isSVG = isSVG;
	if (!isUndefined(instance.componentWillMount)) {
		instance._blockRender = true;
		instance.componentWillMount();
		instance._blockRender = false;
	}

	let childContext;
	if (!isUndefined(instance.getChildContext)) {
		childContext = instance.getChildContext();
	}

	if (isNullOrUndef(childContext)) {
		instance._childContext = context;
	} else {
		instance._childContext = combineFrom(context, childContext);
	}

	if (!isNull(options.beforeRender)) {
		options.beforeRender(instance);
	}

	let input = instance.render(props, instance.state, context);

	if (!isNull(options.afterRender)) {
		options.afterRender(instance);
	}
	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
	} else if (isStringOrNumber(input)) {
		input = createTextVNode(input, null);
	} else {
		if (input.dom) {
			input = directClone(input);
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
export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}

export function replaceVNode(parentDom, dom, vNode, lifecycle: LifecycleClass, isRecycling) {
	unmount(vNode, null, lifecycle, false, isRecycling);
	replaceChild(parentDom, dom, vNode.dom);
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
		input = createTextVNode(input, null);
	} else {
		if (input.dom) {
			input = directClone(input);
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

export function updateTextContent(dom, text: string|number) {
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

export function documentCreateElement(tag, isSVG: boolean): Element {
	if (isSVG === true) {
		return document.createElementNS(svgNS, tag);
	} else {
		return document.createElement(tag);
	}
}

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
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

export function removeAllChildren(dom: Element, children, lifecycle: LifecycleClass, isRecycling: boolean) {
	dom.textContent = '';
	if (!options.recyclingEnabled || (options.recyclingEnabled && !isRecycling)) {
		removeChildren(null, children, lifecycle, isRecycling);
	}
}

export function removeChildren(dom: Element|null, children, lifecycle: LifecycleClass, isRecycling: boolean) {
	for (let i = 0, len = children.length; i < len; i++) {
		const child = children[ i ];

		if (!isInvalid(child)) {
			unmount(child, dom, lifecycle, true, isRecycling);
		}
	}
}

export function isKeyed(lastChildren: VNode[], nextChildren: VNode[]): boolean {
	return nextChildren.length > 0 && !isNullOrUndef(nextChildren[ 0 ]) && !isNullOrUndef(nextChildren[ 0 ].key)
		&& lastChildren.length > 0 && !isNullOrUndef(lastChildren[ 0 ]) && !isNullOrUndef(lastChildren[ 0 ].key);
}
