import Lifecycle from './lifecycle';
import { mount } from './mounting';
import { patch } from './patching';
import {
	isNull,
	isInvalid,
	isNullOrUndef,
	isBrowser,
	throwError,
	NO_OP
} from '../shared';
import hydrateRoot from './hydration';
import { unmount } from './unmounting';
import cloneVNode from '../factories/cloneVNode';
import { InfernoInput, VNode } from '../core/shapes';
import {
	devToolsStatus,
	sendRoots
} from './devtools';

interface Root {
	dom: Node | SVGAElement;
	input: InfernoInput;
}

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
export const roots: Array<Root> = [];
export const componentToDOMNodeMap = new Map();

export function findDOMNode(domNode) {
	return componentToDOMNodeMap.get(domNode) || null;
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

function setRoot(dom, input): void {
	roots.push({
		dom,
		input
	});
}

function removeRoot(root): void {
	for (let i = 0; i < roots.length; i++) {
		if (roots[i] === root) {
			roots.splice(i, 1);
			return;
		}
	}
}

const documetBody = isBrowser ? document.body : null;

export function render(input: InfernoInput, parentDom?: Node | SVGAElement) {
	if (documetBody === parentDom) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
		}
		throwError();
	}
	if ((input as any) === NO_OP) {
		return;
	}
	const root = getRoot(parentDom);
	const lifecycle = new Lifecycle();

	if (isNull(root)) {
		if (!isInvalid(input)) {
			if ((input as VNode).dom) {
				input = cloneVNode(input);
			}
			if (!hydrateRoot(input, parentDom, lifecycle)) {
				mount(input, parentDom, lifecycle, {}, false);
			}
			lifecycle.trigger();
			setRoot(parentDom, input);
		}
	} else {
		if (isNullOrUndef(input)) {
			unmount(root.input, parentDom, lifecycle, false, false);
			removeRoot(root);
		} else {
			if ((input as VNode).dom) {
				input = cloneVNode(input);
			}
			patch(root.input, input, parentDom, lifecycle, {}, false);
		}
		lifecycle.trigger();
		root.input = input;
	}
	if (devToolsStatus.connected) {
		sendRoots(window);
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
