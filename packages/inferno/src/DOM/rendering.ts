import {
	isBrowser,
	isInvalid,
	isNull,
	isNullOrUndef,
	Lifecycle,
	LifecycleClass,
	NO_OP,
	throwError,
	warning
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import options from '../core/options';
import { cloneVNode, InfernoInput, VNode, InfernoChildren } from '../core/VNodes';
import hydrateRoot from './hydration';
import { mount } from './mounting';
import { patch } from './patching';
import { unmount } from './unmounting';
import { EMPTY_OBJ } from './utils';

export interface Root {
	dom: Node | SVGAElement;
	input: InfernoInput;
	lifecycle: LifecycleClass;
}

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
export const roots: Root[] = [];
export const componentToDOMNodeMap = new Map();

options.roots = roots;

export function findDOMNode(ref) {
	if (!options.findDOMNodeEnabled) {
		if (process.env.NODE_ENV !== 'production') {
			throwError('findDOMNode() has been disabled, use Inferno.options.findDOMNodeEnabled = true; enabled findDOMNode(). Warning this can significantly impact performance!');
		}
		throwError();
	}
	const dom = ref && ref.nodeType ? ref : null;

	return componentToDOMNodeMap.get(ref) || dom;
}

function getRoot(dom): Root | null {
	for (let i = 0, len = roots.length; i < len; i++) {
		const root = roots[i];

		if (root.dom === dom) {
			return root;
		}
	}
	return null;
}

function setRoot(dom: Node | SVGAElement, input: InfernoInput, lifecycle: LifecycleClass): Root {
	const root: Root = {
		dom,
		input,
		lifecycle
	};

	roots.push(root);
	return root;
}

function removeRoot(root: Root): void {
	for (let i = 0, len = roots.length; i < len; i++) {
		if (roots[i] === root) {
			roots.splice(i, 1);
			return;
		}
	}
}

if (process.env.NODE_ENV !== 'production') {
	if (isBrowser && document.body === null) {
		warning('Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.');
	}
}

const documentBody = isBrowser ? document.body : null;

export function render(input: InfernoInput, parentDom?: Element | SVGAElement | DocumentFragment): InfernoChildren {
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
				mount(input as VNode, parentDom as Element, lifecycle, EMPTY_OBJ, false);
			}
			root = setRoot(parentDom, input, lifecycle);
			lifecycle.trigger();
		}
	} else {
		const lifecycle = root.lifecycle;

		lifecycle.listeners = [];
		if (isNullOrUndef(input)) {
			unmount(root.input as VNode, parentDom as Element, lifecycle, false, false);
			removeRoot(root);
		} else {
			if ((input as VNode).dom) {
				input = cloneVNode(input as VNode);
			}
			patch(root.input as VNode, input as VNode, parentDom as Element, lifecycle, EMPTY_OBJ, false, false);
		}
		lifecycle.trigger();
		root.input = input;
	}
	if (root) {
		const rootInput: VNode = root.input as VNode;

		if (rootInput && (rootInput.flags & VNodeFlags.Component)) {
			return rootInput.children;
		}
	}
}

export function createRenderer(parentDom?) {
	return function renderer(lastInput, nextInput) {
		if (!parentDom) {
			parentDom = lastInput;
		}
		render(nextInput, parentDom);
	};
}
