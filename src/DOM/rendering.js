import Lifecycle from './lifecycle';
import { mount } from './mounting';
import { patch } from './patching';
import { getActiveNode, resetActiveNode } from './utils';
import { isUndefined } from '../core/utils';
import hydrate from './hydration';

try {
	var foo = new Map();
} catch (e) {
	throw new Error('Inferno Error: Inferno requires ES2015 Map objects. Please add a Map polyfill for environments with no support. \nhttps://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map');
}

const roots = new Map();
export const componentDomNodes = new Map();

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