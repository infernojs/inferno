import {
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isObject,
	Lifecycle,
	throwError
} from 'inferno-helpers';
import options from '../core/options';
import {
	patchEvent
} from './patching';
import {
	poolComponent,
	poolElement
} from './recycling';
import { componentToDOMNodeMap } from './rendering';
import { removeChild } from './utils';

export function unmount(vNode: VNode, parentDom: Element, lifecycle: Lifecycle, canRecycle: boolean, isRecycling: boolean) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling);
	} else if (flags & VNodeFlags.Element) {
		unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling);
	} else if (flags & (VNodeFlags.Text | VNodeFlags.Void)) {
		unmountVoidOrText(vNode, parentDom);
	}
}

function unmountVoidOrText(vNode: VNode, parentDom: Element) {
	if (parentDom) {
		removeChild(parentDom, vNode.dom);
	}
}

const alreadyUnmounted = new WeakMap();

export function unmountComponent(vNode: VNode, parentDom: Element, lifecycle: Lifecycle, canRecycle: boolean, isRecycling: boolean) {
	const instance = vNode.children as any;
	const flags = vNode.flags;
	const isStatefulComponent = flags & VNodeFlags.ComponentClass;
	const ref = vNode.ref as any;
	const dom = vNode.dom;

	if (alreadyUnmounted.has(vNode) && !isRecycling && !parentDom) {
		return;
	}
	alreadyUnmounted.set(vNode);

	if (!isRecycling) {
		if (isStatefulComponent) {
			if (!instance._unmounted) {
				instance._ignoreSetState = true;
				options.beforeUnmount && options.beforeUnmount(vNode);
				instance.componentWillUnmount && instance.componentWillUnmount();
				if (ref && !isRecycling) {
					ref(null);
				}
				instance._unmounted = true;
				options.findDOMNodeEnabled && componentToDOMNodeMap.delete(instance);

				const subLifecycle = instance._lifecycle;

				if (!subLifecycle.fastUnmount) {
					unmount(instance._lastInput, null, subLifecycle, false, isRecycling);
				}
			}
		} else {
			if (!isNullOrUndef(ref)) {
				if (!isNullOrUndef(ref.onComponentWillUnmount)) {
					ref.onComponentWillUnmount(dom);
				}
			}
			if (!lifecycle.fastUnmount) {
				unmount(instance, null, lifecycle, false, isRecycling);
			}
		}
	}
	if (parentDom) {
		let lastInput = instance._lastInput;

		if (isNullOrUndef(lastInput)) {
			lastInput = instance;
		}
		removeChild(parentDom, dom);
	}
	if (options.recyclingEnabled && !isStatefulComponent && (parentDom || canRecycle)) {
		poolComponent(vNode);
	}
}

export function unmountElement(vNode: VNode, parentDom: Element, lifecycle: Lifecycle, canRecycle: boolean, isRecycling: boolean) {
	const dom = vNode.dom;
	const ref = vNode.ref as any;
	const events = vNode.events;

	if (alreadyUnmounted.has(vNode) && !isRecycling && !parentDom) {
		return;
	}
	alreadyUnmounted.set(vNode);

	if (!lifecycle.fastUnmount) {
		if (ref && !isRecycling) {
			unmountRef(ref);
		}
		const children = vNode.children;

		if (!isNullOrUndef(children)) {
			unmountChildren(children, lifecycle, isRecycling);
		}
	}
	if (!isNull(events)) {
		for (let name in events) {
			// do not add a hasOwnProperty check here, it affects performance
			patchEvent(name, events[name], null, dom);
			events[name] = null;
		}
	}
	if (parentDom) {
		removeChild(parentDom, dom);
	}
	if (options.recyclingEnabled && (parentDom || canRecycle)) {
		poolElement(vNode);
	}
}

function unmountChildren(children: InfernoChildren, lifecycle: Lifecycle, isRecycling: boolean) {
	if (isArray(children)) {
		for (let i = 0; i < (children as Array<string | number | VNode>).length; i++) {
			const child = children[i];

			if (!isInvalid(child) && isObject(child)) {
				unmount(child as VNode, null, lifecycle, false, isRecycling);
			}
		}
	} else if (isObject(children)) {
		unmount(children as VNode, null, lifecycle, false, isRecycling);
	}
}

function unmountRef(ref: Ref) {
	if (isFunction(ref)) {
		ref(null);
	} else {
		if (isInvalid(ref)) {
			return;
		}
		if (process.env.NODE_ENV !== 'production') {
			throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
		}
		throwError();
	}
}
