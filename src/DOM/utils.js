import { mountNode } from './mounting';
import { isArray, isNullOrUndefined, isInvalidNode, isStringOrNumber, replaceInArray } from './../core/utils';
import { recyclingEnabled, pool } from './recycling';

export const MathNamespace = 'http://www.w3.org/1998/Math/MathML';
export const SVGNamespace = 'http://www.w3.org/2000/svg';

function isVirtualFragment(obj) {
	return !isNullOrUndefined(obj.append);
}

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndefined(nextNode)) {
		if (isVirtualFragment(newNode)) {
			newNode.append(parentDom);
		} else {
			parentDom.appendChild(newNode);
		}
	} else {
		if (isVirtualFragment(newNode)) {
			newNode.insert(parentDom, nextNode);
		} else if (isVirtualFragment(nextNode)) {
			parentDom.insertBefore(newNode, nextNode.childNodes[0]);
		} else {
			parentDom.insertBefore(newNode, nextNode);
		}
	}
}

export function createElement(tag, namespace) {
	if (isNullOrUndefined(namespace)) {
		return document.createElement(tag);
	} else {
		return document.createElementNS(namespace, tag);
	}
}

export function appendText(text, parentDom, singleChild) {
	if (parentDom) {
		if (singleChild) {
			if (text !== '') {
				parentDom.textContent = text;
			} else {
				const textNode = document.createTextNode('');

				parentDom.appendChild(textNode);
				return textNode;
			}
		} else {
			const textNode = document.createTextNode(text);

			parentDom.appendChild(textNode);
			return textNode;
		}
	} else {
		return document.createTextNode(text);
	}
}

export function replaceNode(lastNode, nextNode, parentDom, namespace, lifecycle, context, instance) {
	let lastInstance = null;
	const instanceLastNode = lastNode._lastNode;

	if (!isNullOrUndefined(instanceLastNode)) {
		lastInstance = lastNode;
		lastNode = instanceLastNode;
	}
	const dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);

	nextNode.dom = dom;
	parentDom.replaceChild(dom, lastNode.dom);
	if (lastInstance !== null) {
		lastInstance._lastNode = nextNode;
	}
	detachNode(lastNode);
}

export function detachNode(node) {
	if (isInvalidNode(node) || isStringOrNumber(node)) {
		return;
	}
	const instance = node.instance;

	let instanceHooks = null;
	let instanceChildren = null;
	if (!isNullOrUndefined(instance)) {
		instanceHooks = instance.hooks;
		instanceChildren = instance.children;

		if (instance.render !== undefined) {
			instance.componentWillUnmount();
			instance._unmounted = true;
		}
	}
	const hooks = node.hooks || instanceHooks;
	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.willDetach)) {
			hooks.willDetach(node.dom);
		}
		if (!isNullOrUndefined(hooks.componentWillUnmount)) {
			hooks.componentWillUnmount(node.dom, hooks);
		}
	}
	const children = node.children || instanceChildren;
	if (!isNullOrUndefined(children)) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				detachNode(children[i]);
			}
		} else {
			detachNode(children);
		}
	}
}

export function createEmptyTextNode() {
	return document.createTextNode('');
}

export function remove(node, parentDom) {
	const dom = node.dom;
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
		}
	}
	detachNode(node);
}

export function removeEvents(lastEvents, dom) {
	for (let event in lastEvents) {
		dom[event] = null;
	}
}

function insertChildren(parentNode, childNodes, dom) {
	// we need to append all childNodes now
	for (let i = 0; i < childNodes.length; i++) {
		parentNode.insertBefore(childNodes[i], dom);
	}
}

// TODO: for node we need to check if document is valid
export function getActiveNode() {
	return document.activeElement;
}

export function resetActiveNode(activeNode) {
	if (activeNode !== document.body && document.activeElement !== activeNode) {
		activeNode.focus(); // TODO: verify are we doing new focus event, if user has focus listener this might trigger it
	}
}

export function createVirtualFragment() {
	const childNodes = [];
	const dom = document.createTextNode('');
	let parentNode = null;

	const fragment = {
		childNodes,
		appendChild(domNode) {
			// TODO we need to check if the domNode already has a parentNode of VirtualFragment so we can remove it
			childNodes.push(domNode);
			if (parentNode) {
				parentNode.insertBefore(domNode, dom);
			}
		},
		removeChild(domNode) {
			if (parentNode) {
				parentNode.removeChild(domNode);
			}
			childNodes.splice(childNodes.indexOf(domNode), 1);
		},
		insertBefore(domNode, refNode) {
			if (parentNode) {
				parentNode.insertBefore(domNode, refNode);
			}
			childNodes.splice(childNodes.indexOf(refNode), 0, domNode);
		},
		replaceChild(domNode, refNode) {
			parentNode.replaceChild(domNode, refNode);
			replaceInArray(childNodes, refNode, domNode);
		},
		append(parentDom) {
			parentDom.appendChild(dom);
			parentNode = parentDom;
			insertChildren(parentNode, childNodes, dom);
		},
		insert(parentDom, refNode) {
			parentDom.insertBefore(dom, refNode);
			parentNode = parentDom;
			insertChildren(parentNode, childNodes, dom);
		},
		remove() {
			parentNode.removeChild(dom);
			for (let i = 0; i < childNodes.length; i++) {
				parentNode.removeChild(childNodes[i]);
			}
			parentNode = null;
		},
		// here to emulate not being a TextNode
		getElementsByTagName: null
	};

	Object.defineProperty(fragment, 'parentNode', {
		get() {
			return parentNode;
		}
	});
	Object.defineProperty(fragment, 'firstChild', {
		get() {
			return childNodes[0];
		}
	});

	return fragment;
}

export function isKeyed(lastChildren, nextChildren) {
	return nextChildren.length && !isNullOrUndefined(nextChildren[0]) && !isNullOrUndefined(nextChildren[0].key)
		|| lastChildren.length && !isNullOrUndefined(lastChildren[0]) && !isNullOrUndefined(lastChildren[0].key);
}

function selectOptionValueIfNeeded(vdom, values) {
	if (vdom.tag !== 'option') {
		for (let i = 0, len = vdom.children.length; i < len; i++) {
			selectOptionValueIfNeeded(vdom.children[i], values);
		}
	// NOTE! Has to be a return here to catch optGroup elements
		return;
	}

	const value = vdom.attrs && vdom.attrs.value;

	if (values[value]) {
		vdom.attrs = vdom.attrs || {};
		vdom.attrs.selected = 'selected';
	}
}

export function selectValue(vdom) {
	if (vdom.tag !== 'select') {
		return;
	}
	let value = vdom.attrs && vdom.attrs.value;

	if (isNullOrUndefined(value)) {
		return;
	}

	let values = {};
	if (!isArray(value)) {
		values[value] = value;
	} else {
		for (let i = 0, len = value.length; i < len; i++) {
			values[value[i]] = value[i];
		}
	}
	selectOptionValueIfNeeded(vdom, values);

	if (vdom.attrs && vdom.attrs[value]) {
		delete vdom.attrs.value; // TODO! Avoid deletion here. Set to null or undef. Not sure what you want to usev
	}
}

export function placeholder(node, parentDom) {
	const dom = createEmptyTextNode();

	if (parentDom !== null) {
		parentDom.appendChild(dom);
	}
	if (!isInvalidNode(node)) {
		node.dom = dom;
	}
	return dom;
}

export function handleAttachedHooks(hooks, lifecycle, dom) {
	if (!isNullOrUndefined(hooks.created)) {
		hooks.created(dom);
	}
	if (!isNullOrUndefined(hooks.attached)) {
		lifecycle.addListener(() => {
			hooks.attached(dom);
		});
	}
}
