import { mount } from './mounting';
import { patch } from './patching';
import {
	isArray,
	isNullOrUndef,
	isInvalid,
	// isStringOrNumber,
	// isNull,
	isUndefined
} from './../shared';
import {
	unmountFragment,
	unmount
} from './unmounting';
import {
	// isVNode,
	VNodeFlags,
	createFragmentVNode,
	createVoidVNode
} from '../core/shapes';
// import cloneVNode from '../factories/cloneVNode';
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
		input = createFragmentVNode(input);
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
		// #related to below: unsure about this, but this prevents the lifeycle of components from being fired twice
		unmount(vNode, null, lifecycle, false, false);
		vNode = vNode.children._lastInput || vNode.children;
		// #related to above: unsure about this, but this prevents the lifeycle of components from being fired twice
		if (!(vNode.flags & VNodeFlags.Fragment)) {
			shallowUnmount = true;
		}
	}
	if (vNode.flags === VNodeFlags.Fragment) {
		replaceFragmentWithNode(parentDom, vNode, dom, lifecycle, shallowUnmount);
	} else {
		replaceChild(parentDom, dom, vNode.dom);
		unmount(vNode, null, lifecycle, false, shallowUnmount);
	}
}

export function createStatelessComponentInput(component, props, context) {
	let input = component(props, context);

	if (isArray(input)) {
		input = createFragmentVNode(input);
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

export function replaceFragmentWithNode(parentDom, vFragment, dom, lifecycle, shallowUnmount) {
	const pointer = vFragment.pointer;

	unmountFragment(vFragment, parentDom, false, lifecycle, shallowUnmount);
	replaceChild(parentDom, dom, pointer);
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

// export function normalise(object) {
// 	if (isStringOrNumber(object)) {
// 		return createVText(object);
// 	} else if (isInvalid(object)) {
// 		return createVPlaceholder();
// 	} else if (isArray(object)) {
// 		return createVFragment(object, null);
// 	} else if (isVNode(object) && object.dom) {
// 		return cloneVNode(object);
// 	}
// 	return object;
// }

// export function normaliseChild(children, i) {
// 	const child = children[i];

// 	children[i] = normalise(child);
// 	return children[i];
// }

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

// function formSelectValueFindOptions(dom, value, isMap) {
// 	let child = dom.firstChild;

// 	while (child) {
// 		const tagName = child.tagName;

// 		if (tagName === 'OPTION') {
// 			child.selected = !!((!isMap && child.value === value) || (isMap && value.get(child.value)));
// 		} else if (tagName === 'OPTGROUP') {
// 			formSelectValueFindOptions(child, value, isMap);
// 		}
// 		child = child.nextSibling;
// 	}
// }

// export function formSelectValue(dom, value) {
// 	let isMap = false;

// 	if (!isNullOrUndef(value)) {
// 		if (isArray(value)) {
// 			// Map vs Object v using reduce here for perf?
// 			value = value.reduce((o, v) => o.set(v, true), new Map());
// 			isMap = true;
// 		} else {
// 			// convert to string
// 			value = value + '';
// 		}
// 		formSelectValueFindOptions(dom, value, isMap);
// 	}
// }

// export function resetFormInputProperties(dom) {
// 	if (dom.checked) {
// 		dom.checked = false;
// 	}
// 	if (dom.disabled) {
// 		dom.disabled = false;
// 	}
// }
