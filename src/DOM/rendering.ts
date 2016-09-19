import Lifecycle from './lifecycle';
import { mountChildrenWithUnknownType } from './mounting';
import { patchChildrenWithUnknownType } from './patching';
import { getActiveNode, resetActiveNode } from './utils';
import {
	isUndefined,
	isInvalid,
	isNullOrUndef,
	isBrowser,
	throwError,
	NO_OP
} from '../shared';
import hydrateRoot from './hydration';
import { unmount } from './unmounting';
import cloneVNode from '../factories/cloneVNode';

const roots = new Map<Node | SVGAElement, { input: any }>();
export const componentToDOMNodeMap = new Map();

export function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
}

const documetBody = isBrowser ? document.body : null;

export function render(input: any, parentDom: Node | SVGAElement) {
	const root = roots.get(parentDom);
	const lifecycle = new Lifecycle();

	if (documetBody === parentDom) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
		}
		throwError();
	}
	if (input === NO_OP) {
		return;
	}
	if (isUndefined(root)) {
		if (!isInvalid(input)) {
			if (input.dom) {
				input = cloneVNode(input);
			}
			if (!hydrateRoot(input, parentDom, lifecycle)) {
				mountChildrenWithUnknownType(input, parentDom, lifecycle, {}, false, false);
			}
			lifecycle.trigger();
			roots.set(parentDom, { input });
		}
	} else {
		const activeNode = getActiveNode();

		if (isNullOrUndef(input)) {
			unmount(root.input, parentDom, lifecycle, false, false);
			roots.delete(parentDom);
		} else {
			if (input.dom) {
				input = cloneVNode(input);
			}
			patchChildrenWithUnknownType(root.input, input, parentDom, lifecycle, {}, false, false);
		}
		lifecycle.trigger();
		root.input = input;
		resetActiveNode(activeNode);
	}
}

export function createRenderer() {
	let parentDom;

	return function renderer(lastInput, nextInput) {
		if (!parentDom) {
			parentDom = lastInput;
		}
		render(nextInput, parentDom);
	};
}
