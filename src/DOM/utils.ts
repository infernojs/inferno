import { mount } from './mounting';
import {
	isArray,
	isNullOrUndef,
	isInvalid,
	isStringOrNumber,
	isNull,
	isUndefined
} from './../shared';
import {
	unmountVFragment,
	unmount
} from './unmounting';
import {
	createVText,
	createVPlaceholder,
	createVFragment,
	isVNode
} from '../core/shapes';
import {
	COMPONENT,
	FRAGMENT
} from '../core/NodeTypes';
import cloneVNode from '../factories/cloneVNode';
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
	let input = instance.render(props, context);

	if (isArray(input)) {
		input = createVFragment(input, null);
	} else if (isInvalid(input)) {
		input = createVPlaceholder();
	}
	instance._pendingSetState = false;
	instance._lastInput = input;
	return instance;
}

export function replaceVNode(parentDom, dom, vNode, shallowUnmount, lifecycle) {
	// we cannot cache nodeType here as vNode might be re-assigned below
	if (vNode.nodeType === COMPONENT) {
		// if we are accessing a stateful or stateless component, we want to access their last rendered input
		// accessing their DOM node is not useful to us here
		vNode = vNode.instance._lastInput || vNode.instance;
	}
	if (vNode.nodeType === FRAGMENT) {
		replaceVFragmentWithNode(parentDom, vNode, dom, lifecycle, shallowUnmount);
	} else {
		replaceChild(parentDom, dom, vNode.dom);
		unmount(vNode, null, lifecycle, false, shallowUnmount);
	}
}

export function createStatelessComponentInput(component, props, context) {
	let input = component(props, context);

	if (isArray(input)) {
		input = createVFragment(input, null);
	} else if (isInvalid(input)) {
		input = createVPlaceholder();
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

export function replaceVFragmentWithNode(parentDom, vFragment, dom, lifecycle, shallowUnmount) {
	const pointer = vFragment.pointer;

	unmountVFragment(vFragment, parentDom, false, lifecycle, shallowUnmount);
	replaceChild(parentDom, dom, pointer);
}

export function getPropFromOptElement(optVElement, valueType) {
	const bp = optVElement.bp;

	// TODO check "prop" and "spread"
	if (!isNull(bp.v0)) {
		if (bp.v0 === valueType) {
			return optVElement.v0;
		}
		if (!isNull(bp.v1)) {
			if (bp.v1 === valueType) {
				return optVElement.v1;
			}
			if (!isNull(bp.v2)) {
				if (bp.v2 === valueType) {
					return optVElement.v2;
				}
			}
		}
	}
}

export function documentCreateElement(tag, isSVG) {
	let dom;

	if (isSVG === true) {
		dom = document.createElementNS(svgNS, tag);
	} else {
		dom = document.createElement(tag);
	}
	return dom;
}

export function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, shallowUnmount) {
	let lastInstance: any = null;
	const instanceLastNode = lastNode._lastInput;

	if (!isNullOrUndef(instanceLastNode)) {
		lastInstance = lastNode;
		lastNode = instanceLastNode;
	}
	unmount(lastNode, null, lifecycle, true, shallowUnmount);
	const dom = mount(nextNode, null, lifecycle, context, isSVG, shallowUnmount);

	nextNode.dom = dom;
	replaceChild(parentDom, dom, lastNode.dom);
	if (lastInstance !== null) {
		lastInstance._lasInput = nextNode;
	}
}

export function replaceChild(parentDom, nextDom, lastDom) {
	parentDom.replaceChild(nextDom, lastDom);
}

export function normalise(object) {
	if (isStringOrNumber(object)) {
		return createVText(object);
	} else if (isInvalid(object)) {
		return createVPlaceholder();
	} else if (isArray(object)) {
		return createVFragment(object, null);
	} else if (isVNode(object) && object.dom) {
		return cloneVNode(object);
	}
	return object;
}

export function normaliseChild(children, i) {
	const child = children[i];

	children[i] = normalise(child);
	return children[i];
}

export function removeChild(parentDom, dom) {
	parentDom.removeChild(dom);
}

export function removeAllChildren(dom, children, lifecycle, shallowUnmount) {
	dom.textContent = '';
	for (let i = 0; i < children.length; i++) {
		const child = children[i];

		if (!isInvalid(child)) {
			unmount(child, null, lifecycle, true, shallowUnmount);
		}
	}
}

export function isKeyed(lastChildren, nextChildren) {
	if (lastChildren.complex) {
		return false;
	}
	return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key)
		&& lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
}

function formSelectValueFindOptions(dom, value, isMap) {
	let child = dom.firstChild;

	while (child) {
		const tagName = child.tagName;

		if (tagName === 'OPTION') {
			child.selected = !!((!isMap && child.value === value) || (isMap && value.get(child.value)));
		} else if (tagName === 'OPTGROUP') {
			formSelectValueFindOptions(child, value, isMap);
		}
		child = child.nextSibling;
	}
}

export function formSelectValue(dom, value) {
	let isMap = false;

	if (!isNullOrUndef(value)) {
		if (isArray(value)) {
			// Map vs Object v using reduce here for perf?
			value = value.reduce((o, v) => o.set(v, true), new Map());
			isMap = true;
		} else {
			// convert to string
			value = value + '';
		}
		formSelectValueFindOptions(dom, value, isMap);
	}
}

export function resetFormInputProperties(dom) {
	if (dom.checked) {
		dom.checked = false;
	}
	if (dom.disabled) {
		dom.disabled = false;
	}
}
