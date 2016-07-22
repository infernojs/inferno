import { isNullOrUndefined, isArray } from './../core/utils';
import { removeChild, isVList, isVNode } from './utils';
import { componentToDOMNodeMap } from './rendering';

export function unmount(input, parentDom) {
	if (isVList(input)) {
		unmountVList(input, parentDom, true);
	} else if (isVNode(input)) {
		unmountVNode(input, parentDom, false);
	}
}

export function unmountVList(vList, parentDom, removePointer) {
	const items = vList.items;
	const itemsLength = items.length;
	const pointer = vList.pointer;

	if (itemsLength > 0) {
		for (let i = 0; i < itemsLength; i++) {
			const item = items[i];

			if (isVList(item)) {
				unmountVList(item, parentDom, true);
			} else {
				if (parentDom) {
					removeChild(parentDom, item.dom);
				}
				unmount(item, null);
			}
		}
	}
	if (parentDom && removePointer) {
		removeChild(parentDom, pointer);
	}
}

export function unmountVNode(node, parentDom, shallow) {
	const instance = node.instance;
	let instanceHooks = null;
	let instanceChildren = null;

	if (!isNullOrUndefined(instance)) {
		instanceHooks = instance.hooks;
		instanceChildren = instance.children;

		if (instance.render !== undefined) {
			instance.componentWillUnmount();
			instance._unmounted = true;
			componentToDOMNodeMap.delete(instance);
			!shallow && unmount(instance._lastNode, null);
		}
	}
	const hooks = node.hooks || instanceHooks;

	if (!isNullOrUndefined(hooks)) {
		if (!isNullOrUndefined(hooks.willDetach)) {
			hooks.willDetach(node.dom);
		}
		if (!isNullOrUndefined(hooks.componentWillUnmount)) {
			hooks.componentWillUnmount(node.dom, hooks);
		}
	}
	const children = (isNullOrUndefined(instance) ? node.children : null) || instanceChildren;

	if (!isNullOrUndefined(children)) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				unmount(children[i], null);
			}
		} else {
			unmount(children, null);
		}
	}
}