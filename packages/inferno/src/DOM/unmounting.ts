import {
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isObject, isUndefined,
	LifecycleClass,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { options } from '../core/options';
import { InfernoChildren, Ref, VNode } from '../core/VNodes';
import { isAttrAnEvent, patchEvent } from './patching';
import { poolComponent, poolElement } from './recycling';
import { componentToDOMNodeMap } from './rendering';
import { removeChild } from './utils';

export function unmount(vNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, canRecycle: boolean, isRecycling: boolean) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Component) {
		unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling);
	} else if (flags & VNodeFlags.Element) {
		unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling);
	} else if (flags & (VNodeFlags.Text | VNodeFlags.Void)) {
		unmountVoidOrText(vNode, parentDom);
	}
}

function unmountVoidOrText(vNode: VNode, parentDom: Element|null) {
	if (!isNull(parentDom)) {
		removeChild(parentDom, (vNode.dom as Element));
	}
}

export function unmountComponent(vNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, canRecycle: boolean, isRecycling: boolean) {
	const instance = vNode.children as any;
	const flags = vNode.flags;
	const isStatefulComponent = flags & VNodeFlags.ComponentClass;
	const ref = vNode.ref as any;
	const dom = vNode.dom as Element;

	if (!isRecycling) {
		if (isStatefulComponent) {
			if (!instance._unmounted) {
				instance._blockSetState = true;
				if (!isNull(options.beforeUnmount)) {
					options.beforeUnmount(vNode);
				}
				if (!isUndefined(instance.componentWillUnmount)) {
					instance.componentWillUnmount();
				}
				if (ref && !isRecycling) {
					ref(null);
				}
				instance._unmounted = true;
				if (options.findDOMNodeEnabled) {
					componentToDOMNodeMap.delete(instance);
				}

				unmount(instance._lastInput, null, instance._lifecycle, false, isRecycling);
			}
		} else {
			if (!isNullOrUndef(ref)) {
				if (!isNullOrUndef(ref.onComponentWillUnmount)) {
					ref.onComponentWillUnmount(dom);
				}
			}

			unmount(instance, null, lifecycle, false, isRecycling);
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

export function unmountElement(vNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, canRecycle: boolean, isRecycling: boolean) {
	const dom = vNode.dom as Element;
	const ref = vNode.ref as any;
	const props = vNode.props;

	if (ref && !isRecycling) {
		unmountRef(ref);
	}
	const children = vNode.children;

	if (!isNullOrUndef(children)) {
		unmountChildren(children, lifecycle, isRecycling);
	}

	if (!isNull(props)) {
		for (const name in props) {
			// do not add a hasOwnProperty check here, it affects performance
			if (props[ name ] !== null && isAttrAnEvent(name)) {
				patchEvent(name, props[ name ], null, dom);
				// We need to set this null, because same props otherwise come back if SCU returns false and we are recyling
				props[ name ] = null;
			}
		}
	}
	if (!isNull(parentDom)) {
		removeChild(parentDom, dom);
	}
	if (options.recyclingEnabled && (parentDom || canRecycle)) {
		poolElement(vNode);
	}
}

function unmountChildren(children: InfernoChildren, lifecycle: LifecycleClass, isRecycling: boolean) {
	if (isArray(children)) {
		for (let i = 0, len = (children as Array<string | number | VNode>).length; i < len; i++) {
			const child = children[ i ];

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
