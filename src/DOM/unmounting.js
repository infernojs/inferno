import { isNullOrUndef, isArray } from './../core/utils';
import { removeChild } from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	isVFragment,
	isVElement,
	isVComponent
} from '../core/shapes';

export function unmount(input, parentDom) {
	if (isVFragment(input)) {
		unmountVFragment(input, parentDom, true);
	} else if (isVElement(input)) {
		unmountVElement(input, parentDom);
	} else if (isVComponent(input)) {
		unmountVComponent(input, parentDom);
	}
}

export function unmountVFragment(vFragment, parentDom, removePointer) {
	const items = vFragment._items;
	const itemsLength = items.length;
	const pointer = items._pointer;

	if (itemsLength > 0) {
		for (let i = 0; i < itemsLength; i++) {
			const item = items[i];

			if (isVFragment(item)) {
				unmountVFragment(item, parentDom, true);
			} else {
				if (parentDom) {
					removeChild(parentDom, item._dom);
				}
				unmount(item, null);
			}
		}
	}
	if (parentDom && removePointer) {
		removeChild(parentDom, pointer);
	}
}

export function unmountVComponent(vComponent, parentDom) {
	const instance = vComponent._instance;
	let instanceHooks = null;
	let instanceChildren = null;

	if (!isNullOrUndef(instance)) {
		instanceHooks = instance._hooks;
		instanceChildren = instance._children;

		if (instance.render !== undefined) {
			instance.componentWillUnmount();
			instance._unmounted = true;
			componentToDOMNodeMap.delete(instance);
			unmount(instance._lastInput, null);
		}
	}
	const hooks = vComponent._hooks || instanceHooks;

	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
			hooks.onComponentWillUnmount(vComponent._dom, hooks);
		}
	}
}

export function unmountVElement(vElement, parentDom) {
	const hooks = vElement._hooks;

	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onWillDetach)) {
			hooks.onWillDetach(vElement._dom);
		}
	}
	const children = vElement._children;

	if (!isNullOrUndef(children)) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				unmount(children[i], null);
			}
		} else {
			unmount(children, null);
		}
	}
}