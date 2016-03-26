import { mountNode } from './mounting';
import { isArray, isNullOrUndefined, isInvalidNode, isStringOrNumber, replaceInArray } from '../core/utils';
import { recyclingEnabled, pool } from './recycling';
import { removeEventFromRegistry, doesNotBubble, removeEventFromNode } from './events';

export const MathNamespace = 'http://www.w3.org/1998/Math/MathML';
export const SVGNamespace = 'http://www.w3.org/2000/svg';

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndefined(nextNode)) {
		if (newNode.append) {
			newNode.append(parentDom);
		} else {
			parentDom.appendChild(newNode);
		}
	} else {
		if (newNode.insert) {
			newNode.insert(parentDom, nextNode);
		} else if (nextNode.insert) {
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
	detachNode(lastNode, recyclingEnabled && !isNullOrUndefined(lastNode.tpl));
}

export function detachNode(node, recycling) {
	if (isInvalidNode(node) || isStringOrNumber(node)) {
		return;
	}
	const instance = node.instance;
	const instanceDefined = !isNullOrUndefined(instance);

	let instanceHooks = null;
	let instanceEvents = null;
	let instanceChildren = null;
	if (instanceDefined) {
		instanceHooks = instance.hooks;
		instanceEvents = instance.events;
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
		if (recycling === false) {
			if (!isNullOrUndefined(instanceHooks)) {
				instance.hooks = null;
			} else {
				node.hooks = null;
			}
		}
	}
	const events = node.events || instanceEvents;
	// Remove all events to free memory
	if (!isNullOrUndefined(events)) {
		for (let event in events) {
			if (doesNotBubble(event)) {
				removeEventFromNode(event, node, events[event]);
			} else {
				removeEventFromRegistry(event, events[event]);
			}
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
		if (recycling === false) {
			node.children = null;

			/*
			TODO: This might be overkill
			node.dom = null;
			if (instanceDefined) {
				node.instance.dom = null;
			}
			*/

			const domChildren = node.domChildren;
			if (!isNullOrUndefined(domChildren)) {
				node.domChildren = null;
			}
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
		detachNode(node, recyclingEnabled && !isNullOrUndefined(node.tpl));
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
			detachNode(node, !isNullOrUndefined(node.tpl));
		} else {
			detachNode(node, false);
		}
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
		activeNode.focus();
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
