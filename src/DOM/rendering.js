import Lifecycle from '../core/lifecycle';
import { mountNode } from './mounting';
import { patchNode } from './patching';
import { getActiveNode, resetActiveNode } from './utils';

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

	if (root === null) {
		mountNode(node, parentDom, null, lifecycle, {}, null);
		lifecycle.trigger();
		roots.push({ node: node, dom: parentDom });
	} else {
		const activeNode = getActiveNode();

		patchNode(root.node, node, parentDom, null, lifecycle, {}, null, null);
		lifecycle.trigger();
		if (node === null) {
			removeRoot(root);
		}
		root.node = node;
		resetActiveNode(activeNode);
	}
}
