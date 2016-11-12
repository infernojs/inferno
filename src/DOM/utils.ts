import { mount } from './mounting';
import { patch } from './patching';
import {
	isArray,
	isNullOrUndef,
	isInvalid,
	isUndefined,
	throwError
} from './../shared';
import {
	unmount
} from './unmounting';
import {
	VNodeFlags,
	createVoidVNode
} from '../core/shapes';
import { componentToDOMNodeMap } from './rendering';
import { svgNS } from './constants';

export function copyPropsTo(copyFrom, copyTo) {
	for (let prop in copyFrom) {
		if (isUndefined(copyTo[prop])) {
			copyTo[prop] = copyFrom[prop];
		}
	}
}

export function createStatefulComponentInstance(Component, props, context, isSVG, devToolsStatus) {
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
	instance.beforeRender && instance.beforeRender();
	let input = instance.render(props, context);

	instance.afterRender && instance.afterRender();
	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
	}
	instance._pendingSetState = false;
	instance._lastInput = input;
	return instance;
}
export function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG) {
	replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle);
}

export function replaceVNode(parentDom, dom, vNode, lifecycle) {
	let shallowUnmount = false;
	// we cannot cache nodeType here as vNode might be re-assigned below
	if (vNode.flags & VNodeFlags.Component) {
		// if we are accessing a stateful or stateless component, we want to access their last rendered input
		// accessing their DOM node is not useful to us here
		unmount(vNode, null, lifecycle, false, false);
		vNode = vNode.children._lastInput || vNode.children;
		shallowUnmount = true;
	}
	replaceChild(parentDom, dom, vNode.dom);
	unmount(vNode, null, lifecycle, false, shallowUnmount);
}

export function createStatelessComponentInput(component, props, context) {
	let input = component(props, context);

	if (isArray(input)) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
		}
		throwError();
	} else if (isInvalid(input)) {
		input = createVoidVNode();
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

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG) {
	let lastInstance: any = null;
	const instanceLastNode = lastNode._lastInput;

	if (!isNullOrUndef(instanceLastNode)) {
		lastInstance = lastNode;
		lastNode = instanceLastNode;
	}
	unmount(lastNode, null, lifecycle, false, false);
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

export function removeAllChildren(dom, children, lifecycle, shallowUnmount) {
	dom.textContent = '';
	removeChildren(null, children, lifecycle, shallowUnmount);
}

export function removeChildren(dom, children, lifecycle, shallowUnmount) {
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (!isInvalid(child)) {
			unmount(child, dom, lifecycle, true, shallowUnmount);
		}
	}
}

export function isKeyed(lastChildren, nextChildren) {
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}
