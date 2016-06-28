import Lifecycle from './lifecycle';
import { mount } from './mounting';
import { patch } from './patching';
import { getActiveNode, resetActiveNode } from './utils';
import { isNull } from '../core/utils';
import hydrate from './hydration';

const roots = [];

function getRoot(parentDom) {
	for (let i = 0; i < roots.length; i++) {
		const root = roots[i];

		if (root.dom === parentDom) {
			return root;
		}
	}
	return null;
}

function removeRoot(rootNode) {
	for (let i = 0; i < roots.length; i++) {
		const root = roots[i];

		if (root === rootNode) {
			roots.splice(i, 1);
			return;
		}
	}
}

export function render(node, parentDom) {
	const root = getRoot(parentDom);
	const lifecycle = new Lifecycle();

	if (isNull(root)) {
		let skipMount = true;

		if (!hydrate(node, parentDom, lifecycle)) {
			mount(node, parentDom, lifecycle, {}, null, false);
		}
		lifecycle.trigger();
		roots.push({ node: node, dom: parentDom });
	} else {
		const activeNode = getActiveNode();

		patch(root.node, node, parentDom, lifecycle, {}, null, null, false);
		lifecycle.trigger();
		if (node === null) {
			removeRoot(root);
		}
		root.node = node;
		resetActiveNode(activeNode);
	}
}
