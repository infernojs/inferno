import Lifecycle from '../core/lifecycle';
import { mountNode } from './mounting';
import { patchNode } from './patching';
import { isNullOrUndefined } from '../core/utils';

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
			return true;
		}
	}
	return false;
}

export function render(node, parentDom) {
	const root = getRoot(parentDom);
	const lifecycle = new Lifecycle();

	if (isNullOrUndefined(root)) {
		mountNode(node, parentDom, lifecycle, {});
		lifecycle.trigger();
		roots.push({ node: node, dom: parentDom });
	} else {
		patchNode(root.node, node, parentDom, lifecycle, {});
		lifecycle.trigger();
		if (node === null) {
			removeRoot(root);
		}
		root.node = node;
	}
}