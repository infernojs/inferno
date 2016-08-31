import { isNullOrUndef, isArray, isNull, isInvalid } from './../core/utils';
import { removeChild } from './utils';
import { componentToDOMNodeMap } from './rendering';
import {
	isVFragment,
	isVElement,
	isVComponent,
	isVTemplate,
	isVText,
	isVPlaceholder
} from '../core/shapes';
import {
	readFromVTemplate
} from './templates';
import {
	poolVTemplate,
	poolVComponent,
	recyclingEnabled
} from './recycling';

export function unmount(input, parentDom, lifecycle, canRecycle) {
	if (!isInvalid(input)) {
		if (isVTemplate(input)) {
			unmountVTemplate(input, parentDom, lifecycle, canRecycle);
		} else if (isVFragment(input)) {
			unmountVFragment(input, parentDom, true, lifecycle);
		} else if (isVElement(input)) {
			unmountVElement(input, parentDom, lifecycle);
		} else if (isVComponent(input)) {
			unmountVComponent(input, parentDom, lifecycle, canRecycle);
		} else if (isVText(input)) {
			unmountVText(input, parentDom);
		} else if (isVPlaceholder(input)) {
			unmountVPlaceholder(input, parentDom);
		}
	}
}

function unmountVPlaceholder(vPlaceholder, parentDom) {
	if (parentDom) {
		removeChild(parentDom, vPlaceholder.dom);
	}
}

function unmountVText(vText, parentDom) {
	if (parentDom) {
		removeChild(parentDom, vText.dom);
	}
}

function unmountVTemplate(vTemplate, parentDom, lifecycle, canRecycle) {
	const dom = vTemplate.dom;
	const templateReducers = vTemplate.tr;
	const unmount = templateReducers.unmount;

	if (!isNull(unmount)) {
		templateReducers.unmount(vTemplate, lifecycle);
	}
	if (!isNull(parentDom)) {
		removeChild(parentDom, dom);
	}
	if (recyclingEnabled && (parentDom || canRecycle)) {
		poolVTemplate(vTemplate);
	}
}

export function unmountVFragment(vFragment, parentDom, removePointer, lifecycle) {
	const children = vFragment.children;
	const childrenLength = children.length;
	const pointer = vFragment.pointer;

	if (childrenLength > 0) {
		for (let i = 0; i < childrenLength; i++) {
			const child = children[i];

			if (isVFragment(child)) {
				unmountVFragment(child, parentDom, true, lifecycle, false);
			} else {
				unmount(child, parentDom, lifecycle, false);
			}
		}
	}
	if (parentDom && removePointer) {
		removeChild(parentDom, pointer);
	}
}

export function unmountVComponent(vComponent, parentDom, lifecycle, canRecycle) {
	const instance = vComponent.instance;
	let instanceHooks = null;
	let instanceChildren = null;

	if (!isNullOrUndef(instance)) {
		const ref = vComponent.ref;

		if (ref) {
			ref(null);
		}
		instanceHooks = instance.hooks;
		instanceChildren = instance.children;
		if (instance.render !== undefined) {
			instance.componentWillUnmount();
			instance._unmounted = true;
			componentToDOMNodeMap.delete(instance);
			unmount(instance._lastInput, null, lifecycle, false);
		} else {
			unmount(instance, null, lifecycle, false);
		}
	}
	const hooks = vComponent.hooks || instanceHooks;

	if (!isNullOrUndef(hooks)) {
		if (!isNullOrUndef(hooks.onComponentWillUnmount)) {
			hooks.onComponentWillUnmount(hooks);
		}
	}
	if (parentDom) {
		removeChild(parentDom, vComponent.dom);
	}
	if (recyclingEnabled && (parentDom || canRecycle)) {
		poolVComponent(vComponent);
	}
}

export function unmountVElement(vElement, parentDom, lifecycle) {
	const hooks = vElement.hooks;
	const dom = vElement.dom;
	const ref = vElement.ref;

	if (ref) {
		ref(null);
	}
	const children = vElement.children;

	if (!isNullOrUndef(children)) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				unmount(children[i], null, lifecycle, false);
			}
		} else {
			unmount(children, null, lifecycle, false);
		}
	}
	if (parentDom) {
		removeChild(parentDom, dom);
	}
}

function unmountTemplateValue(value, lifecycle) {
	if (isArray(value)) {
		for (let i = 0; i < value.length; i++) {
			unmount(value[i], null, lifecycle, false);
		}
	} else {
		unmount(value, null, lifecycle, false);
	}
}

// TODO we can probably combine the below two functions, depends on if we can optimise with childrenType?
export function unmountVariableAsExpression(pointer) {
	return function unmountVariableAsExpression(vTemplate, lifecycle) {
		unmountTemplateValue(readFromVTemplate(vTemplate, pointer), lifecycle);
	};
}

export function unmountVariableAsChildren(pointer, childrenType) {
	return function unmountVariableAsChildren(vTemplate, lifecycle) {
		unmountTemplateValue(readFromVTemplate(vTemplate, pointer), lifecycle);
	};
}

export function unmountVariableAsText(pointer) {
	return function unmountVariableAsText(vTemplate, parentDom) {
		debugger;
	};
}
