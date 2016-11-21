import {
	isNullOrUndef,
	isArray,
	// isNull,
	isInvalid,
	isFunction,
	throwError,
	isObject
} from '../shared';
import { removeChild } from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	poolElement,
	poolComponent,
	recyclingEnabled
} from './recycling';
import { VNodeFlags } from '../core/shapes';

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
	let hooks = vNode.ref;

	if (!isRecycling) {
		if (!shallowUnmount && !lifecycle.fastUnmount) {
			if (isStatefulComponent) {
				if (!instance._unmounted) {
					const ref = vNode.ref;

					if (ref && !isRecycling) {
						ref(null);
					}
					instance.componentWillUnmount();
					componentToDOMNodeMap.delete(instance);
					unmount(instance._lastInput, null, lifecycle, false, shallowUnmount, isRecycling);
				}
			} else {
				unmount(instance, null, lifecycle, false, shallowUnmount, isRecycling);
			}
			hooks = vNode.ref || instance.ref;
		}
		if (isStatefulComponent) {
			instance._unmounted = true;
		} else if (!isNullOrUndef(hooks)) {
			if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
				hooks.onComponentWillUnmount();
			}
		}
	}

	if (parentDom) {
		let lastInput = instance._lastInput;

		if (isNullOrUndef(lastInput)) {
			lastInput = instance;
		}
		removeChild(parentDom, vNode.dom);
	}
	if (recyclingEnabled && (parentDom || canRecycle)) {
		poolComponent(vNode);
	}
}

export function unmountElement(vNode, parentDom, lifecycle, canRecycle, shallowUnmount, isRecycling) {
	const dom = vNode.dom;
	const ref = vNode.ref;

	if (!shallowUnmount && !lifecycle.fastUnmount) {
		if (ref && !isRecycling) {
			unmountRef(ref);
		}
		const children = vNode.children;

		if (!isNullOrUndef(children)) {
			unmountChildren(children, lifecycle, shallowUnmount, isRecycling);
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

			if (isObject(child)) {
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
