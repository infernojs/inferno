import { isArray, isInvalid, isNullOrUndef, isStringOrNumber, LifecycleClass, throwError } from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { options } from '../core/options';
import { createTextVNode, createVoidVNode, directClone, VNode } from '../core/VNodes';
import { svgNS } from './constants';
import { mount } from './mounting';
import { unmount } from './unmounting';

// We need EMPTY_OBJ defined in one place.
// Its used for comparison so we cant inline it into shared
export const EMPTY_OBJ = {};

if (process.env.NODE_ENV !== 'production') {
	Object.freeze(EMPTY_OBJ);
}

export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isRecycling: boolean) {
	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
}

export function replaceVNode(parentDom, dom, vNode, lifecycle: LifecycleClass, isRecycling) {
	unmount(vNode, null, lifecycle, false, isRecycling);
	replaceChild(parentDom, dom, vNode.dom);
}

export function handleComponentInput(input, parentVNode: VNode) {
	let out;

	if (isInvalid(input)) {
		out = createVoidVNode();
	} else if (isStringOrNumber(input)) {
		out = createTextVNode(input, null);
	} else if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else {
		// It's vNode
		if (input.dom) {
			out = directClone(input);
		} else {
			out = input;
		}
		if ((out.flags & VNodeFlags.Component) > 0) {
			// if we have an input that is also a component, we run into a tricky situation
			// where the root vNode needs to always have the correct DOM entry
			// so we break monomorphism on our input and supply it our vNode as parentVNode
			// we can optimise this in the future, but this gets us out of a lot of issues
			out.parentVNode = parentVNode;
		}
	}
	return out;
}

export function setTextContent(dom, text: string | number) {
	if (text !== '') {
		dom.textContent = text;
	} else {
		dom.appendChild(document.createTextNode(''));
	}
}

export function updateTextContent(dom, text: string | number) {
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
	if (!options.recyclingEnabled || (options.recyclingEnabled && !isRecycling)) {
		removeChildren(null, children, lifecycle, isRecycling);
	}
	dom.textContent = '';
}

export function removeChildren(dom: Element | null, children, lifecycle: LifecycleClass, isRecycling: boolean) {
	for (let i = 0, len = children.length; i < len; i++) {
		const child = children[i];

		if (!isInvalid(child)) {
			unmount(child, dom, lifecycle, true, isRecycling);
		}
	}
}

export function isKeyed(lastChildren: VNode[], nextChildren: VNode[]): boolean {
	return nextChildren.length > 0 && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length > 0 && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
