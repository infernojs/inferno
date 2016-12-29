import {
	isArray,
	isFunction,
	isInvalid,
	isNullOrUndef,
	isObject,
	throwError,
	isNull
} from '../shared';
import {
	poolComponent,
	poolElement
} from './recycling';
import options from '../core/options';
import {
	patchEvent
} from './patching';
import { VNodeFlags } from '../core/structures';
import { componentToDOMNodeMap } from './rendering';
import { removeChild } from './utils';
import Lifecycle from "./lifecycle";

export function unmount(vNode, parentDom, lifecycle: Lifecycle, canRecycle, shallowUnmount, isRecycling) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling);
	} else if (flags & VNodeFlags.Element) {
		unmountElement(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling);
	} else if (flags & (VNodeFlags.Text | VNodeFlags.Void)) {
		unmountVoidOrText(vNode, parentDom);
	}
}

function unmountVoidOrText(vNode, parentDom) {
	if (parentDom) {
		removeChild(parentDom, vNode.dom);
	}
}

export function unmountComponent(vNode, parentDom, lifecycle: Lifecycle, canRecycle, shallowUnmount, isRecycling) {
	const instance = vNode.children;
	const flags = vNode.flags;
	const isStatefulComponent = flags & VNodeFlags.ComponentClass;
	const ref = vNode.ref;
	const dom = vNode.dom;

	if (!isRecycling) {
		if (isStatefulComponent) {
			instance._ignoreSetState = true;
			options.beforeUnmount && options.beforeUnmount(vNode);
			instance.componentWillUnmount && instance.componentWillUnmount();
			if (ref && !isRecycling) {
				ref(null);
			}
			instance._unmounted = true;
			options.findDOMNodeEnabled && componentToDOMNodeMap.delete(instance);
		} else if (!isNullOrUndef(ref)) {
			if (!isNullOrUndef(ref.onComponentWillUnmount)) {
				ref.onComponentWillUnmount(dom);
			}
		}
		if (!shallowUnmount) {
			if (isStatefulComponent) {
				const subLifecycle = instance._lifecycle;

				if (!subLifecycle.fastUnmount) {
					unmount(instance._lastInput, null, subLifecycle, false, shallowUnmount, isRecycling);
				}
			} else {
				if (!lifecycle.fastUnmount) {
					unmount(instance, null, lifecycle, false, shallowUnmount, isRecycling);
				}
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

export function unmountElement(vNode, parentDom, lifecycle: Lifecycle, canRecycle, shallowUnmount, isRecycling) {
	const dom = vNode.dom;
	const ref = vNode.ref;
	const events = vNode.events;

	if (!shallowUnmount && !lifecycle.fastUnmount) {
		if (ref && !isRecycling) {
			unmountRef(ref);
		}
		const children = vNode.children;

		if (!isNullOrUndef(children)) {
			unmountChildren(children, lifecycle, shallowUnmount, isRecycling);
		}
	}
	if (!isNull(events)) {
		for (let name in events) {
			// do not add a hasOwnProperty check here, it affects performance
			patchEvent(name, events[name], null, dom, lifecycle);
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

function unmountChildren(children, lifecycle: Lifecycle, shallowUnmount, isRecycling) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (!isInvalid(child) && isObject(child)) {
				unmount(child, null, lifecycle, false, shallowUnmount, isRecycling);
			}
		}
	} else if (isObject(children)) {
		unmount(children, null, lifecycle, false, shallowUnmount, isRecycling);
	}
}

function unmountRef(ref) {
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
