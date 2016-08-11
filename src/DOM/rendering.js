import Lifecycle from './lifecycle';
import { mountChildrenWithUnknownType } from './mounting';
import { patchChildrenWithUnknownType } from './patching';
import { getActiveNode, resetActiveNode } from './utils';
import { isUndefined, isInvalid, isNull, isBrowser } from '../core/utils';
import hydrateRoot from './hydration';
import { unmount } from './unmounting';

const roots = new Map();
export const componentToDOMNodeMap = new Map();

export function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
}

const documetBody = isBrowser ? document.body : null;

export function render(input, parentDom) {
	const root = roots.get(parentDom);
	const lifecycle = new Lifecycle();

	if (documetBody === parentDom) {
		throw Error('Inferno Error: you cannot render() to the "document.body". Use an empty element as a container instead.');
	}

	if (isUndefined(root)) {
		if (!isInvalid(input)) {
			if (!hydrateRoot(input, parentDom, lifecycle)) {
				mountChildrenWithUnknownType(input, parentDom, lifecycle, {}, false);
			}
			lifecycle.trigger();
			roots.set(parentDom, { input: input });
		}
	} else {
		const activeNode = getActiveNode();

		if (isNull(input)) {
			unmount(root.input, parentDom);
			roots.delete(parentDom);
		} else {
			patchChildrenWithUnknownType(root.input, input, parentDom, lifecycle, {}, false);
		}
		lifecycle.trigger();
		root.input = input;
		resetActiveNode(activeNode);
	}
}
