import { mountNode } from './mounting';
import { isArray, isNullOrUndefined, isInvalidNode, isStringOrNumber } from '../core/utils';
import { recyclingEnabled, pool } from './recycling';
import { removeEventFromRegistry } from './events';

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
	if (isStringOrNumber(nextNode)) {
		const dom = document.createTextNode(nextNode);
		parentDom.replaceChild(dom, dom);
	} else if (isStringOrNumber(lastNode)) {
		const dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);
		nextNode.dom = dom;
		parentDom.replaceChild(dom, parentDom.firstChild);
	} else {
		const dom = mountNode(nextNode, null, namespace, lifecycle, context, instance);
		nextNode.dom = dom;
		parentDom.replaceChild(dom, lastNode.dom);
		detachNode(lastNode, recyclingEnabled && !isNullOrUndefined(lastNode.tpl));
	}
}

export function detachNode(node, recycling) {
	if (isInvalidNode(node) || isStringOrNumber(node)) {
		return;
	}
	const instance = node.instance;
	if (!isNullOrUndefined(instance) && instance.render !== undefined) {
		instance.componentWillUnmount();
		instance._unmounted = true;
	}
	let instanceHooks = false;
	const hooks = node.hooks || !isNullOrUndefined(instance) && (instanceHooks = true) && instance.hooks;
	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.willDetach)) {
			hooks.willDetach(node.dom);
		}
		if (!isNullOrUndefined(hooks.componentWillUnmount)) {
			hooks.componentWillUnmount(node.dom, hooks);
		}
		if (recycling === false) {
			if (instanceHooks) {
				instance.hooks = null;
			} else {
				node.hooks = null;
			}
		}
	}
	const events = node.events;
	// Remove all events to free memory
	if (!isNullOrUndefined(events)) {
		for (let event in events) {
			removeEventFromRegistry(event, events[event]);
		}
	}

	const children = node.children;
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

			const domChildren = node.domChildren;
			if (!isNullOrUndefined(domChildren)) {
				node.domChildren = null;
			}
		}
	}
	if (recycling === false) {
		node.dom = null;
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
			pool(node)
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

export function createVirtualFragment() {
	const childNodes = [];
	const dom = document.createTextNode('');
	let parentNode = null;

	const fragment = {
		childNodes,
		appendChild(domNode) {
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
		}
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