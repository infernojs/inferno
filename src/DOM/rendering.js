import Lifecycle from './lifecycle';
import { mount } from './mounting';
import { patch } from './patching';
import { getActiveNode, resetActiveNode } from './utils';
import { isUndefined } from '../core/utils';
import hydrate from './hydration';

const roots = new Map();
export const componentToDOMNodeMap = new Map();

export function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
}

export function render(node, parentDom) {
	const root = roots.get(parentDom);
	const lifecycle = new Lifecycle();

	if (isUndefined(root)) {
		let skipMount = true;

		if (!hydrate(node, parentDom, lifecycle)) {
			mount(node, parentDom, lifecycle, {}, null, false);
		}
		lifecycle.trigger();
		roots.set(parentDom, { node: node });
	} else {
		const activeNode = getActiveNode();

		patch(root.node, node, parentDom, lifecycle, {}, null, null, false);
		lifecycle.trigger();
		if (node === null) {
			roots.delete(parentDom);
		}
		root.node = node;
		resetActiveNode(activeNode);
	}
}
