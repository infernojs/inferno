import { InfernoInput, VNode, VNodeFlags } from '../core/shapes';
import {
	NO_OP,
	isBrowser,
	isInvalid,
	isNull,
	isNullOrUndef,
	throwError,
} from '../shared';
import {
	devToolsStatus,
	sendRoots,
} from './devtools';
import Lifecycle from './lifecycle';
import cloneVNode from '../factories/cloneVNode';
import hydrateRoot from './hydration';
import { mount } from './mounting';
import { patch } from './patching';
import { unmount } from './unmounting';

interface Root {
	dom: Node | SVGAElement;
	input: InfernoInput;
	lifecycle: Lifecycle;
}

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
export const roots: Root[] = [];
export const componentToDOMNodeMap = new Map();
export let findDOMNodeEnabled = false;

export function enableFindDOMNode() {
	findDOMNodeEnabled = true;
}

export function findDOMNode(ref) {
	if (!findDOMNodeEnabled) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('findDOMNode() has been disabled, use enableFindDOMNode() enabled findDOMNode(). Warning this can significantly impact performance!');
		}
		throwError();
	}
	const dom = ref && ref.nodeType ? ref : null;

	return componentToDOMNodeMap.get(ref) || dom;
}

function getRoot(dom): Root | null {
	for (let i = 0; i < roots.length; i++) {
		const root = roots[i];

		if (root.dom === dom) {
			return root;
		}
	}
	return null;
}

function setRoot(dom, input, lifecycle): Root {
	const root = {
		dom,
		input,
		lifecycle
	};

	roots.push(root);
	return root;
}

function removeRoot(root): void {
	for (let i = 0; i < roots.length; i++) {
		if (roots[i] === root) {
			roots.splice(i, 1);
			return;
		}
	}
}

const documentBody = isBrowser ? document.body : null;

export function render(input: InfernoInput, parentDom?: Node | SVGAElement) {
	if (documentBody === parentDom) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
		}
		throwError();
	}
	if ((input as any) === NO_OP) {
		return;
	}
	let root = getRoot(parentDom);

	if (isNull(root)) {
		const lifecycle = new Lifecycle();

		if (!isInvalid(input)) {
			if ((input as VNode).dom) {
				input = cloneVNode(input as VNode);
			}
			if (!hydrateRoot(input, parentDom, lifecycle)) {
				mount(input, parentDom, lifecycle, {}, false);
			}
			lifecycle.trigger();
			root = setRoot(parentDom, input, lifecycle);
		}
	} else {
		const lifecycle = root.lifecycle;

		lifecycle.listeners = [];
		if (isNullOrUndef(input)) {
			unmount(root.input, parentDom, lifecycle, false, false, false);
			removeRoot(root);
		} else {
			if ((input as VNode).dom) {
				input = cloneVNode(input as VNode);
			}
			patch(root.input, input, parentDom, lifecycle, {}, false, false);
		}
		lifecycle.trigger();
		root.input = input;
	}
	if (devToolsStatus.connected) {
		sendRoots(window);
	}
	if (root) {
		const rootInput = root.input;

		if (rootInput && ((rootInput as VNode).flags & VNodeFlags.Component)) {
			return (rootInput as VNode).children;
		}
	}
}

export function createRenderer(_parentDom) {
	let parentDom = _parentDom || null;

	return function renderer(lastInput, nextInput) {
		if (!parentDom) {
			parentDom = lastInput;
		}
		render(nextInput, parentDom);
	};
}
