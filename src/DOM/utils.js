import { mountNode } from './mounting';

export function insertOrAppend(parentDom, newNode, nextNode) {
	if (nextNode) {
		parentDom.insertBefore(newNode, nextNode);
	} else {
		parentDom.appendChild(newNode);
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

export function replaceNode(lastNode, nextNode, parentDom, lifecycle, context) {
	const dom = mountNode(nextNode, null, lifecycle, context);
	parentDom.replaceChild(dom, lastNode.dom);
	nextNode.dom = dom;
}

export function dettachNode(node) {
	if (isStatefulComponent(node.instance)) {
		node.instance.componentWillUnmount();
		node.instance._unmounted = true;
	}
	if (node.events && node.events.willDetach) {
		node.events.willDetach(node.dom);
	}
	if (node.events && node.events.componentWillUnmount) {
		node.events.componentWillUnmount(node.dom, node.events);
	}
	const children = node.children;

	if (children) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				dettachNode(children[i]);
			}
		} else {
			dettachNode(children);
		}
	}
}

export function remove(node, parentDom) {
	const dom = node.dom;

	dettachNode(node);
	if (dom === parentDom) {
		dom.innerHTML = '';
	} else {
		parentDom.removeChild(dom);
		if (recyclingEnabled) {
			pool(node);
		}
	}
}