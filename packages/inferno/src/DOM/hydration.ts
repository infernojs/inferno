import {
	isArray,
	isNull,
	isNullOrUndef,
	isObject,
	isStringOrNumber,
	LifecycleClass,
	throwError,
	warning
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { options } from '../core/options';
import { InfernoChildren, VNode } from '../core/VNodes';
import { svgNS } from './constants';
import {
	mount,
	mountClassComponentCallbacks,
	mountElement,
	mountFunctionalComponentCallbacks,
	mountRef,
	mountText
} from './mounting';
import { patchProp } from './patching';
import { componentToDOMNodeMap } from './rendering';
import { createClassComponentInstance, createFunctionalComponentInput, EMPTY_OBJ, replaceChild } from './utils';
import { isControlledFormElement, processElement } from './wrappers/processElement';

export function normalizeChildNodes(parentDom) {
	let dom = parentDom.firstChild;

	while (dom) {
		if (dom.nodeType === 8) {
			if (dom.data === '!') {
				const placeholder = document.createTextNode('');

				parentDom.replaceChild(placeholder, dom);
				dom = dom.nextSibling;
			} else {
				const lastDom = dom.previousSibling;

				parentDom.removeChild(dom);
				dom = lastDom || parentDom.firstChild;
			}
		} else {
			dom = dom.nextSibling;
		}
	}
}

function hydrateComponent(vNode: VNode, dom: Element, lifecycle: LifecycleClass, context, isSVG: boolean, isClass: boolean): Element {
	const type = vNode.type;
	const ref = vNode.ref;

	vNode.dom = dom;

	const props = vNode.props || EMPTY_OBJ;

	if (isClass) {
		const _isSVG = dom.namespaceURI === svgNS;
		const instance = createClassComponentInstance(vNode, type, props, context, _isSVG, lifecycle);
		const input = instance._lastInput;

		instance._vNode = vNode;
		hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
		mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
		instance._updating = false; // Mount finished allow going sync
		if (options.findDOMNodeEnabled) {
			componentToDOMNodeMap.set(instance, dom);
		}
	} else {
		const input = createFunctionalComponentInput(vNode, type, props, context);
		hydrate(input, dom, lifecycle, context, isSVG);
		vNode.children = input;
		vNode.dom = input.dom;
		mountFunctionalComponentCallbacks(ref, dom, lifecycle);
	}
	return dom;
}

function hydrateElement(vNode: VNode, dom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean): Element {
	const children = vNode.children;
	const props = vNode.props;
	const className = vNode.className;
	const flags = vNode.flags;
	const ref = vNode.ref;

	isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
	if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== vNode.type) {
		if (process.env.NODE_ENV !== 'production') {
			warning('Inferno hydration: Server-side markup doesn\'t match client-side markup or Initial render target is not empty');
		}
		const newDom = mountElement(vNode, null, lifecycle, context, isSVG);

		vNode.dom = newDom;
		replaceChild(dom.parentNode, newDom, dom);
		return newDom as Element;
	}
	vNode.dom = dom;
	if (children) {
		hydrateChildren(children, dom, lifecycle, context, isSVG);
	}
	if (props) {
		let hasControlledValue = false;
		const isFormElement = (flags & VNodeFlags.FormElement) > 0;
		if (isFormElement) {
			hasControlledValue = isControlledFormElement(props);
		}
		for (const prop in props) {
			// do not add a hasOwnProperty check here, it affects performance
			patchProp(prop, null, props[ prop ], dom, isSVG, hasControlledValue);
		}
		if (isFormElement) {
			processElement(flags, vNode, dom, props, true, hasControlledValue);
		}
	}
	if (isNullOrUndef(className)) {
		dom.removeAttribute('class');
	} else {
		if (isSVG) {
			dom.setAttribute('class', className);
		} else {
			dom.className = className;
		}
	}
	if (ref) {
		mountRef(dom, ref, lifecycle);
	}
	return dom;
}

function hydrateChildren(children: InfernoChildren, parentDom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean): void {
	normalizeChildNodes(parentDom);
	let dom = parentDom.firstChild;

	if (isArray(children)) {
		for (let i = 0, len = (children as Array<string | number | VNode>).length; i < len; i++) {
			const child = children[ i ];

			if (!isNull(child) && isObject(child)) {
				if (!isNull(dom)) {
					dom = (hydrate(child as VNode, dom as Element, lifecycle, context, isSVG) as Element).nextSibling;
				} else {
					mount(child as VNode, parentDom, lifecycle, context, isSVG);
				}
			}
		}
	} else if (isStringOrNumber(children)) {
		if (dom && dom.nodeType === 3) {
			if (dom.nodeValue !== children) {
				dom.nodeValue = children as string;
			}
		} else if (children) {
			parentDom.textContent = children as string;
		}
		dom = (dom as Element).nextSibling;
	} else if (isObject(children)) {
		hydrate(children as VNode, dom as Element, lifecycle, context, isSVG);
		dom = (dom as Element).nextSibling;
	}
	// clear any other DOM nodes, there should be only a single entry for the root
	while (dom) {
		const nextSibling = dom.nextSibling;
		parentDom.removeChild(dom);
		dom = nextSibling;
	}
}

function hydrateText(vNode: VNode, dom: Element): Element {
	if (dom.nodeType !== 3) {
		const newDom = mountText(vNode, null);

		vNode.dom = newDom;
		replaceChild(dom.parentNode, newDom, dom);
		return newDom;
	}
	const text = vNode.children;

	if (dom.nodeValue !== text) {
		dom.nodeValue = text as string;
	}
	vNode.dom = dom;
	return dom;
}

function hydrateVoid(vNode: VNode, dom: Element): Element {
	vNode.dom = dom;
	return dom;
}

function hydrate(vNode: VNode, dom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean): Element|undefined {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		return hydrateComponent(vNode, dom, lifecycle, context, isSVG, (flags & VNodeFlags.ComponentClass) > 0);
	} else if (flags & VNodeFlags.Element) {
		return hydrateElement(vNode, dom, lifecycle, context, isSVG);
	} else if (flags & VNodeFlags.Text) {
		return hydrateText(vNode, dom);
	} else if (flags & VNodeFlags.Void) {
		return hydrateVoid(vNode, dom);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError(`hydrate() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
		}
		throwError();
	}
}

export function hydrateRoot(input, parentDom: Element|null, lifecycle: LifecycleClass) {
	if (!isNull(parentDom)) {
		let dom = (parentDom.firstChild as Element);

		if (!isNull(dom)) {
			hydrate(input, dom, lifecycle, EMPTY_OBJ, false);
			dom = parentDom.firstChild as Element;
			// clear any other DOM nodes, there should be only a single entry for the root
			while (dom = dom.nextSibling as Element) {
				parentDom.removeChild(dom);
			}
			return true;
		}
	}

	return false;
}
