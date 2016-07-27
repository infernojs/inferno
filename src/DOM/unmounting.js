import { isNullOrUndef, isArray, isNull } from './../core/utils';
import { removeChild } from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	isVFragment,
	isVElement,
	isVComponent,
	isVTemplate
} from '../core/shapes';
import { poolVTemplate, recyclingEnabled } from './templates';

export function unmount(input, parentDom, lifecycle) {
	if (isVTemplate(input)) {
		unmountVTemplate(input, parentDom);
	} else if (isVFragment(input)) {
		unmountVFragment(input, parentDom, true);
	} else if (isVElement(input)) {
		unmountVElement(input, parentDom);
	} else if (isVComponent(input)) {
		unmountVComponent(input, parentDom);
	}
}

function unmountVTemplate(vTemplate, parentDom) {
	const dom = vTemplate._dom;
	const templateReducers = vTemplate._tr;
	templateReducers.unmount(vTemplate);
	if (!isNull(parentDom)) {
		removeChild(parentDom, dom);
	}
	if (recyclingEnabled) {
		poolVTemplate(vTemplate);
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
	const dom = vElement._dom;

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
	if (parentDom) {
		removeChild(parentDom, dom);
	}
}

export function unmountVariable(variable, isChildren) {
	return function unmountVariable(vTemplate) {
		// TODO
	};
}