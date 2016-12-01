import {
	EMPTY_OBJ,
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isStringOrNumber,
	isUndefined,
	throwError,
} from '../shared';
import { VNodeFlags, isVNode } from '../core/shapes';
import {
	appendChild,
	copyPropsTo,
	createStatefulComponentInstance,
	createStatelessComponentInput,
	documentCreateElement,
	setTextContent,
} from './utils';
import {
	recycleComponent,
	recycleElement,
	recyclingEnabled,
} from './recycling';

import Lifecycle from './lifecycle';
import cloneVNode from '../factories/cloneVNode';
import { componentToDOMNodeMap } from './rendering';
import { devToolsStatus } from './devtools';
import {
	patchProp,
} from './patching';
import processElement from './wrappers/processElement';

export function mount(vNode, parentDom, lifecycle, context, isSVG) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Element) {
		return mountElement(vNode, parentDom, lifecycle, context, isSVG);
	} else if (flags & VNodeFlags.Component) {
		return mountComponent(vNode, parentDom, lifecycle, context, isSVG, flags & VNodeFlags.ComponentClass);
	} else if (flags & VNodeFlags.Void) {
		return mountVoid(vNode, parentDom);
	} else if (flags & VNodeFlags.Text) {
		return mountText(vNode, parentDom);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			throwError(`mount() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
		}
		throwError();
	}
}

export function mountText(vNode, parentDom) {
	const dom = document.createTextNode(vNode.children);

	vNode.dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVoid(vNode, parentDom) {
	const dom = document.createTextNode('');

	vNode.dom = dom;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
	if (recyclingEnabled) {
		const dom = recycleElement(vNode, lifecycle, context, isSVG);

		if (!isNull(dom)) {
			if (!isNull(parentDom)) {
				appendChild(parentDom, dom);
			}
			return dom;
		}
	}
	const tag = vNode.type;
	const flags = vNode.flags;

	if (isSVG || (flags & VNodeFlags.SvgElement)) {
		isSVG = true;
	}
	const dom = documentCreateElement(tag, isSVG);
	const children = vNode.children;
	const props = vNode.props;
	const ref = vNode.ref;

	vNode.dom = dom;
	if (!isNull(children)) {
		if (isStringOrNumber(children)) {
			setTextContent(dom, children);
		} else if (isArray(children)) {
			mountArrayChildren(children, dom, lifecycle, context, isSVG);
		} else if (isVNode(children)) {
			mount(children, dom, lifecycle, context, isSVG);
		}
	}
	if (!(flags & VNodeFlags.HtmlElement)) {
		processElement(flags, vNode, dom);
	}
	if (!isNull(props)) {
		for (let prop in props) {
			// do not add a hasOwnProperty check here, it affects performance
			patchProp(prop, null, props[prop], dom, isSVG);
		}
	}
	if (!isNull(ref)) {
		mountRef(dom, ref, lifecycle);
	}
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountArrayChildren(children, dom, lifecycle, context, isSVG) {
	for (let [ i, child ] of children.entries()) {
		if (!isInvalid(child)) {
			if (child.dom) {
				children[i] = child = cloneVNode(child);
			}
			mount(children[i], dom, lifecycle, context, isSVG);
		}
	}
}

export function mountComponent(vNode, parentDom, lifecycle, context, isSVG, isClass) {
	if (recyclingEnabled) {
		const dom = recycleComponent(vNode, lifecycle, context, isSVG);

		if (!isNull(dom)) {
			if (!isNull(parentDom)) {
				appendChild(parentDom, dom);
			}
			return dom;
		}
	}
	const type = vNode.type;
	const props = vNode.props || EMPTY_OBJ;
	const ref = vNode.ref;
	let dom;

	if (isClass) {
		const defaultProps = type.defaultProps;

		lifecycle.fastUnmount = false;
		if (!isUndefined(defaultProps)) {
			copyPropsTo(defaultProps, props);
			vNode.props = props;
		}
		const instance = createStatefulComponentInstance(vNode, type, props, context, isSVG, devToolsStatus);
		const input = instance._lastInput;
		const fastUnmount = lifecycle.fastUnmount;

		// we store the fastUnmount value, but we set it back to true on the lifecycle
		// we do this so we can determine if the component render has a fastUnmount or not
		lifecycle.fastUnmount = true;
		instance._vNode = vNode;
		vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
		// we now create a lifecycle for this component and store the fastUnmount value
		const subLifecycle = instance._lifecycle = new Lifecycle();

		subLifecycle.fastUnmount = lifecycle.fastUnmount;
		// we then set the lifecycle fastUnmount value back to what it was before the mount
		lifecycle.fastUnmount = fastUnmount;
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		mountStatefulComponentCallbacks(ref, instance, lifecycle);
		componentToDOMNodeMap.set(instance, dom);
		vNode.children = instance;
	} else {
		const input = createStatelessComponentInput(vNode, type, props, context);

		vNode.dom = dom = mount(input, null, lifecycle, context, isSVG);
		vNode.children = input;
		mountStatelessComponentCallbacks(ref, dom, lifecycle);
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
	}
	return dom;
}

export function mountStatefulComponentCallbacks(ref, instance, lifecycle) {
	if (ref) {
		if (isFunction(ref)) {
			ref(instance);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
			}
			throwError();
		}
	}
	if (!isNull(instance.componentDidMount)) {
		lifecycle.addListener(() => {
			instance.componentDidMount();
		});
	}
}

export function mountStatelessComponentCallbacks(ref, dom, lifecycle) {
	if (ref) {
		if (!isNullOrUndef(ref.onComponentWillMount)) {
			lifecycle.fastUnmount = false;
			ref.onComponentWillMount();
		}
		if (!isNullOrUndef(ref.onComponentDidMount)) {
			lifecycle.fastUnmount = false;
			lifecycle.addListener(() => ref.onComponentDidMount(dom));
		}
	}
}

export function mountRef(dom, value, lifecycle) {
	if (isFunction(value)) {
		lifecycle.fastUnmount = false;
		lifecycle.addListener(() => value(dom));
	} else {
		if (isInvalid(value)) {
			return;
		}
		if (process.env.NODE_ENV !== 'production') {
			throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
		}
		throwError();
	}
}
