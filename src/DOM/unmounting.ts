import {
	isArray,
	isFunction,
	isInvalid,
	isNullOrUndef,
	isObject,
	throwError,
	isNull,
} from '../shared';
import {
	poolComponent,
	poolElement,
	recyclingEnabled,
} from './recycling';
import {
	patchEvent
} from './patching';

import { VNodeFlags } from '../core/shapes';
import { componentToDOMNodeMap, findDOMNodeEnabled } from './rendering';
import { removeChild } from './utils';

export function unmount(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling);
	} else if (flags & VNodeFlags.Element) {
		unmountElement(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling);
	} else if (flags & VNodeFlags.Text) {
		unmountText(vNode, parentDom);
	} else if (flags & VNodeFlags.Void) {
		unmountVoid(vNode, parentDom);
	}
}

function unmountVoid(vNode, parentDom) {
	if (parentDom) {
		removeChild(parentDom, vNode.dom);
	}
}

function unmountText(vNode, parentDom) {
	if (parentDom) {
		removeChild(parentDom, vNode.dom);
	}
}

export function unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling) {
	const instance = vNode.children;
	const flags = vNode.flags;
	const isStatefulComponent = flags & VNodeFlags.ComponentClass;
	const ref = vNode.ref;
	const dom = vNode.dom;

	if (!isRecycling) {
		if (!shallowUnmount) {
			if (isStatefulComponent) {
				const subLifecycle = instance._lifecycle;

				if (!subLifecycle.fastUnmount) {
					unmount(instance._lastInput, null, lifecycle, false, shallowUnmount, isRecycling);
				}
			} else {
				if (!lifecycle.fastUnmount) {
					unmount(instance, null, lifecycle, false, shallowUnmount, isRecycling);
				}
			}
		}
		if (isStatefulComponent) {
			instance._ignoreSetState = true;
			instance.componentWillUnmount();
			if (ref && !isRecycling) {
				ref(null);
			}
			instance._unmounted = true;
			findDOMNodeEnabled && componentToDOMNodeMap.delete(instance);
		} else if (!isNullOrUndef(ref)) {
			if (!isNullOrUndef(ref.onComponentWillUnmount)) {
				ref.onComponentWillUnmount(dom);
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
	if (recyclingEnabled && !isStatefulComponent && (parentDom || canRecycle)) {
		poolComponent(vNode);
	}
}

export function unmountElement(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling) {
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
			patchEvent(name, null, null, dom, lifecycle);
		}
	}
	if (parentDom) {
		removeChild(parentDom, dom);
	}
	if (recyclingEnabled && (parentDom || canRecycle)) {
		poolElement(vNode);
	}
}

function unmountChildren(children, lifecycle, shallowUnmount, isRecycling) {
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
