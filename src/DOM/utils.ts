import {
	VNodeFlags,
	VNode
} from '../core/structures';
import {
	isArray,
	isInvalid,
	isStringOrNumber,
	isNullOrUndef,
	isUndefined,
	throwError,
	EMPTY_OBJ,
	process
} from '../shared';
import options from '../core/options';
import { cloneVNode, createVoidVNode, createTextVNode } from '../core/VNodes';
import { componentToDOMNodeMap } from './rendering';
import { mount } from './mounting';
import { patch } from './patching';
import { svgNS } from './constants';
import {
	unmount,
} from './unmounting';
import Lifecycle from "./lifecycle";

export function createClassComponentInstance(vNode: VNode, Component, props, context, isSVG: boolean) {
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
	instance.componentWillMount();

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
export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle: Lifecycle, context, isSVG, isRecycling) {
	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}

export function replaceVNode(parentDom, dom, vNode, lifecycle: Lifecycle, isRecycling) {
	let shallowUnmount = false;
	// we cannot cache nodeType here as vNode might be re-assigned below
	if (vNode.flags & VNodeFlags.Component) {
		// if we are accessing a stateful or stateless component, we want to access their last rendered input
		// accessing their DOM node is not useful to us here
		unmount(vNode, null, lifecycle, false, false, isRecycling);
		vNode = vNode.children._lastInput || vNode.children;
		shallowUnmount = true;
	}
	replaceChild(parentDom, dom, vNode.dom);
	unmount(vNode, null, lifecycle, false, shallowUnmount, isRecycling);
}

export function createFunctionalComponentInput(vNode, component, props, context) {
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

export function setTextContent(dom, text) {
	if (text !== '') {
		dom.textContent = text;
	} else {
		dom.appendChild(document.createTextNode(''));
	}
}

export function updateTextContent(dom, text) {
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

export function documentCreateElement(tag, isSVG) {
	if (isSVG === true) {
		return document.createElementNS(svgNS, tag);
	} else {
		return document.createElement(tag);
	}
}

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle: Lifecycle, context, isSVG, isRecycling) {
	unmount(lastNode, null, lifecycle, false, false, isRecycling);
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

export function removeChild(parentDom, dom) {
	parentDom.removeChild(dom);
}

export function removeAllChildren(dom, children, lifecycle: Lifecycle, shallowUnmount, isRecycling) {
	dom.textContent = '';
	if (!lifecycle.fastUnmount) {
		removeChildren(null, children, lifecycle, shallowUnmount, isRecycling);
	}
}

export function removeChildren(dom, children, lifecycle: Lifecycle, shallowUnmount, isRecycling) {
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (!isInvalid(child)) {
			unmount(child, dom, lifecycle, true, shallowUnmount, isRecycling);
		}
	}
}

export function isKeyed(lastChildren, nextChildren) {
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
