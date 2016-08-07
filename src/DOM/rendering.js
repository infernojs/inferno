import Lifecycle from './lifecycle';
import { mount } from './mounting';
import { patch } from './patching';
import { getActiveNode, resetActiveNode } from './utils';
import { isUndefined, isInvalid } from '../core/utils';
import hydrate from './hydration';
import { unmount } from './unmounting';

const roots = new Map();
export const componentToDOMNodeMap = new Map();

export function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
}

export function render(input, parentDom) {
	const root = roots.get(parentDom);
	const lifecycle = new Lifecycle();

	if (isUndefined(root)) {
		if (!isInvalid(input)) {
			if (!hydrate(input, parentDom, lifecycle)) {
				mount(input, parentDom, lifecycle, {}, false);
			}
			lifecycle.trigger();
			roots.set(parentDom, { input: input });
		}
	} else {
		const activeNode = getActiveNode();

		if (isInvalid(input)) {
			unmount(root.input, parentDom);
			roots.delete(parentDom);
		} else {
			patch(root.input, input, parentDom, lifecycle, {}, false);
		}
		lifecycle.trigger();
		root.input = input;
		resetActiveNode(activeNode);
	}
}
