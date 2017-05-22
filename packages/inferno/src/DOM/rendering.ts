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
import { options, Root } from '../core/options';
import { directClone, InfernoChildren, InfernoInput, VNode } from '../core/VNodes';
import { hydrateRoot } from './hydration';
import { mount } from './mounting';
import { patch } from './patching';
import { unmount } from './unmounting';
import { EMPTY_OBJ } from './utils';

// rather than use a Map, like we did before, we can use an array here
// given there shouldn't be THAT many roots on the page, the difference
// in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
export const componentToDOMNodeMap = new Map();
const roots = options.roots;
/**
 * When inferno.options.findDOMNOdeEnabled is true, this function will return DOM Node by component instance
 * @param ref Component instance
 * @returns {*|null} returns dom node
 */
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
		const root = roots[ i ];

		if (root.dom === dom) {
			return root;
		}
	}
	return null;
}

function setRoot(dom: Element | SVGAElement, input: InfernoInput, lifecycle: LifecycleClass): Root {
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
		if (roots[ i ] === root) {
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
/**
 * Renders virtual node tree into parent node.
 * @param {VNode | null | string | number} input vNode to be rendered
 * @param parentDom DOM node which content will be replaced by virtual node
 * @returns {InfernoChildren} rendered virtual node
 */
export function render(input: InfernoInput, parentDom: Element | SVGAElement | DocumentFragment | null | HTMLElement | Node): InfernoChildren {
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
				input = directClone(input as VNode);
			}
			if (!hydrateRoot(input, parentDom as any, lifecycle)) {
				mount(input as VNode, parentDom as Element, lifecycle, EMPTY_OBJ, false);
			}
			root = setRoot(parentDom as any, input, lifecycle);
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
				input = directClone(input as VNode);
			}
			patch(root.input as VNode, input as VNode, parentDom as Element, lifecycle, EMPTY_OBJ, false, false);
		}
		root.input = input;
		lifecycle.trigger();
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
