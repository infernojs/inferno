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
// import {
// 	poolOptVElement,
// 	poolVComponent,
// 	recyclingEnabled
// } from './recycling';
import { VNodeFlags } from '../core/shapes';

export function unmount(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount);
	} else if (flags & VNodeFlags.Element) {
		unmountElement(vNode, parentDom, lifecycle, shallowUnmount);
	} else if (flags & VNodeFlags.Fragment) {
		unmountFragment(vNode, parentDom, true, lifecycle, shallowUnmount);
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

export function unmountFragment(vNode, parentDom, removePointer, lifecycle, shallowUnmount) {
	const children = vNode.children;
	const childrenLength = children.length;
	// const pointer = vNode.pointer;

	if (!shallowUnmount && childrenLength > 0) {
		for (let i = 0; i < childrenLength; i++) {
			const child = children[i];

			if (child.flags === VNodeFlags.Fragment) {
				unmountFragment(child, parentDom, true, lifecycle, false);
			} else {
				unmount(child, parentDom, lifecycle, false, shallowUnmount);
			}
		}
	}
	// if (parentDom && removePointer) {
	// 	removeChild(parentDom, pointer);
	// }
}

export function unmountComponent(vNode, parentDom, lifecycle, canRecycle, shallowUnmount) {
	const instance = vNode.children;

	if (!shallowUnmount) {
		let instanceHooks = null;

		vNode.unmounted = true;
		if (!isNullOrUndef(instance)) {
			instanceHooks = instance.ref;
			if (instance.render !== undefined) {
				const ref = vNode.ref;

				if (ref) {
					ref(null);
				}
				instance.componentWillUnmount();
				instance._unmounted = true;
				componentToDOMNodeMap.delete(instance);
				unmount(instance._lastInput, null, lifecycle, false, shallowUnmount);
			} else {
				unmount(instance, null, lifecycle, false, shallowUnmount);
			}
		}
		const hooks = vNode.ref || instanceHooks;

		if (!isNullOrUndef(hooks)) {
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
		if (lastInput.flags === VNodeFlags.Fragment) {
			unmountFragment(lastInput, parentDom, true, lifecycle, true);
		} else {
			removeChild(parentDom, vNode.dom);
		}
	}
	// if (recyclingEnabled && (parentDom || canRecycle)) {
	// 	poolVComponent(vComponent);
	// }
}

export function unmountElement(vNode, parentDom, lifecycle, shallowUnmount) {
	const dom = vNode.dom;
	const ref = vNode.ref;

	if (!shallowUnmount) {
		if (ref) {
			unmountRef(ref);
		}
		const children = vNode.children;

		if (!isNullOrUndef(children)) {
			unmountChildren(children, lifecycle, shallowUnmount);
		}
	}
	if (parentDom) {
		removeChild(parentDom, dom);
	}
}

function unmountChildren(children, lifecycle, shallowUnmount) {
	if (isArray(children)) {
		for (let i = 0; i < children.length; i++) {
			const child = children[i];

			if (isObject(child)) {
				unmount(child, null, lifecycle, false, shallowUnmount);
			}
		}
	} else if (isObject(children)) {
		unmount(children, null, lifecycle, false, shallowUnmount);
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
			throwError('string "refs" are not supported in Inferno 0.8+. Use callback "refs" instead.');
		}
		throwError();
	}
}
