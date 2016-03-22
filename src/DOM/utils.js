import { mountNode } from './mounting';
import { isArray, isNullOrUndefined, isInvalidNode, isStringOrNumber } from '../core/utils';
import { recyclingEnabled, pool } from './recycling';
import { removeEventFromRegistry } from './events';

export const MathNamespace = 'http://www.w3.org/1998/Math/MathML';
export const SVGNamespace = 'http://www.w3.org/2000/svg';

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (isNullOrUndefined(nextNode)) {
		parentDom.appendChild(newNode);
	} else {
		parentDom.insertBefore(newNode, nextNode);
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
			parentDom.appendChild(document.createTextNode(''));
		}
	} else {
		const textNode = document.createTextNode(text);

		parentDom.appendChild(textNode);
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
		detachNode(lastNode);
		parentDom.replaceChild(dom, lastNode.dom);
	}
}

export function detachNode(node) {
	if (isInvalidNode(node)) {
		return;
	}
	const instance = node.instance;
	if (!isNullOrUndefined(instance) && instance.render !== undefined) {
		instance.componentWillUnmount();
		instance._unmounted = true;
	}
	const hooks = node.hooks || !isNullOrUndefined(instance) && instance.hooks;
	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.willDetach)) {
			hooks.willDetach(node.dom);
		}
		if (!isNullOrUndefined(hooks.componentWillUnmount)) {
			hooks.componentWillUnmount(node.dom, hooks);
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
	}
}

export function remove(node, parentDom) {
	detachNode(node);
	const dom = node.dom;
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
		}
	}
}
