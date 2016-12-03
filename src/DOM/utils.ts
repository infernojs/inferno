import {
	VNodeFlags,
	createVoidVNode,
} from '../core/shapes';
import {
	isArray,
	isInvalid,
	isNullOrUndef,
	isUndefined,
	throwError,
} from './../shared';

import cloneVNode from '../factories/cloneVNode';
import { componentToDOMNodeMap } from './rendering';
import { mount } from './mounting';
import { patch } from './patching';
import { svgNS } from './constants';
import {
	unmount,
} from './unmounting';

export function copyPropsTo(copyFrom, copyTo) {
	for (let prop in copyFrom) {
		if (isUndefined(copyTo[prop])) {
			copyTo[prop] = copyFrom[prop];
		}
	}
}

export function createStatefulComponentInstance(vNode, Component, props, context, isSVG, devToolsStatus) {
	if (isUndefined(context)) {
		context = {};
	}
	const instance = new Component(props, context);

	instance.context = context;
	instance._patch = patch;
	instance._devToolsStatus = devToolsStatus;
	instance._componentToDOMNodeMap = componentToDOMNodeMap;
	const childContext = instance.getChildContext();

	if (!isNullOrUndef(childContext)) {
		instance._childContext = Object.assign({}, context, childContext);
	} else {
		instance._childContext = context;
	}
	instance._unmounted = false;
	instance._pendingSetState = true;
	instance._isSVG = isSVG;
	instance.componentWillMount();
	instance._beforeRender && instance._beforeRender();
	let input = instance.render(props, instance.state, context);

	instance._afterRender && instance._afterRender();
	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
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
export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling) {
	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}

export function replaceVNode(parentDom, dom, vNode, lifecycle, isRecycling) {
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

export function createStatelessComponentInput(vNode, component, props, context) {
	let input = component(props, context);

	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
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

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, isRecycling) {
	let lastInstance: any = null;
	const instanceLastNode = lastNode._lastInput;

	if (!isNullOrUndef(instanceLastNode)) {
		lastInstance = lastNode;
		lastNode = instanceLastNode;
	}
	unmount(lastNode, null, lifecycle, false, false, isRecycling);
	const dom = mount(nextNode, null, lifecycle, context, isSVG);

	nextNode.dom = dom;
	replaceChild(parentDom, dom, lastNode.dom);
	if (lastInstance !== null) {
		lastInstance._lasInput = nextNode;
	}
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

export function removeAllChildren(dom, children, lifecycle, shallowUnmount, isRecycling) {
	dom.textContent = '';
	if (!lifecycle.fastUnmount) {
		removeChildren(null, children, lifecycle, shallowUnmount, isRecycling);
	}
}

export function removeChildren(dom, children, lifecycle, shallowUnmount, isRecycling) {
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
