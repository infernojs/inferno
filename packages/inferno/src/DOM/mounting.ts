import {
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isObject,
	isStringOrNumber,
	isUndefined,
	LifecycleClass,
	throwError
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';
import { options } from '../core/options';
import { directClone, isVNode, VNode } from '../core/VNodes';
import { patchProp } from './patching';
import { recycleComponent, recycleElement } from './recycling';
import { componentToDOMNodeMap } from './rendering';
import {
	appendChild,
	createClassComponentInstance,
	createFunctionalComponentInput,
	documentCreateElement,
	EMPTY_OBJ,
	setTextContent
} from './utils';
import { isControlledFormElement, processElement } from './wrappers/processElement';

export function mount(vNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
	const flags = vNode.flags;

	if (flags & VNodeFlags.Element) {
		return mountElement(vNode, parentDom, lifecycle, context, isSVG);
	} else if (flags & VNodeFlags.Component) {
		return mountComponent(vNode, parentDom, lifecycle, context, isSVG, (flags & VNodeFlags.ComponentClass) > 0);
	} else if (flags & VNodeFlags.Void) {
		return mountVoid(vNode, parentDom);
	} else if (flags & VNodeFlags.Text) {
		return mountText(vNode, parentDom);
	} else {
		if (process.env.NODE_ENV !== 'production') {
			if (typeof vNode === 'object') {
				throwError(`mount() received an object that's not a valid VNode, you should stringify it first. Object: "${ JSON.stringify(vNode) }".`);
			} else {
				throwError(`mount() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
			}
		}
		throwError();
	}
}

export function mountText(vNode: VNode, parentDom: Element|null): any {
	const dom = document.createTextNode(vNode.children as string);

	vNode.dom = dom as any;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}

	return dom;
}

export function mountVoid(vNode: VNode, parentDom: Element|null) {
	const dom = document.createTextNode('');

	vNode.dom = dom as any;
	if (!isNull(parentDom)) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountElement(vNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
	if (options.recyclingEnabled) {
		const dom = recycleElement(vNode, lifecycle, context, isSVG);

		if (!isNull(dom)) {
			if (!isNull(parentDom)) {
				appendChild(parentDom, dom);
			}
			return dom;
		}
	}
	const flags = vNode.flags;

	isSVG = isSVG || (flags & VNodeFlags.SvgElement) > 0;
	const dom = documentCreateElement(vNode.type, isSVG);
	const children = vNode.children;
	const props = vNode.props;
	const className = vNode.className;
	const ref = vNode.ref;

	vNode.dom = dom;

	if (!isInvalid(children)) {
		if (isStringOrNumber(children)) {
			setTextContent(dom, children as string | number);
		} else if (isArray(children)) {
			mountArrayChildren(children, dom, lifecycle, context, isSVG);
		} else if (isVNode(children as any)) {
			mount(children as VNode, dom, lifecycle, context, isSVG);
		}
	}
	if (!isNull(props)) {
		let hasControlledValue = false;
		const isFormElement = (flags & VNodeFlags.FormElement) > 0;
		if (isFormElement) {
			hasControlledValue = isControlledFormElement(props);
		}
		for (const prop in props) {
			// do not add a hasOwnProperty check here, it affects performance
			patchProp(prop, null, props[ prop ], dom, isSVG, hasControlledValue);
		}
		if (isFormElement) {
			processElement(flags, vNode, dom, props, true, hasControlledValue);
		}
	}

	if (className !== null) {
		if (isSVG) {
			dom.setAttribute('class', className);
		} else {
			dom.className = className;
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

export function mountArrayChildren(children, dom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
	for (let i = 0, len = children.length; i < len; i++) {
		let child = children[ i ];

		// Verify can string/number be here. might cause de-opt. - Normalization takes care of it.
		if (!isInvalid(child)) {
			if (child.dom) {
				children[ i ] = child = directClone(child);
			}
			mount(children[ i ], dom, lifecycle, context, isSVG);
		}
	}
}

export function mountComponent(vNode: VNode, parentDom: Element|null, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isClass: boolean) {
	if (options.recyclingEnabled) {
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
		const instance = createClassComponentInstance(vNode, type, props, context, isSVG, lifecycle);
		const input = instance._lastInput;
		instance._vNode = vNode;
		vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
		instance._updating = false;
		if (options.findDOMNodeEnabled) {
			componentToDOMNodeMap.set(instance, dom);
		}
	} else {
		const input = createFunctionalComponentInput(vNode, type, props, context);

		vNode.dom = dom = mount(input, null, lifecycle, context, isSVG);
		vNode.children = input;
		mountFunctionalComponentCallbacks(ref, dom, lifecycle);
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
	}
	return dom;
}

export function mountClassComponentCallbacks(vNode: VNode, ref, instance, lifecycle: LifecycleClass) {
	if (ref) {
		if (isFunction(ref)) {
			ref(instance);
		} else {
			if (process.env.NODE_ENV !== 'production') {
				if (isStringOrNumber(ref)) {
					throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
				} else if (isObject(ref) && (vNode.flags & VNodeFlags.ComponentClass)) {
					throwError('functional component lifecycle events are not supported on ES2015 class components.');
				} else {
					throwError(`a bad value for "ref" was used on component: "${ JSON.stringify(ref) }"`);
				}
			}
			throwError();
		}
	}
	const hasDidMount = !isUndefined(instance.componentDidMount);
	const afterMount = options.afterMount;

	if (hasDidMount || !isNull(afterMount)) {
		lifecycle.addListener(() => {
			instance._updating = true;
			if (afterMount) {
				afterMount(vNode);
			}
			if (hasDidMount) {
				instance.componentDidMount();
			}
			instance._updating = false;
		});
	}
}

export function mountFunctionalComponentCallbacks(ref, dom, lifecycle: LifecycleClass) {
	if (ref) {
		if (!isNullOrUndef(ref.onComponentWillMount)) {
			ref.onComponentWillMount();
		}
		if (!isNullOrUndef(ref.onComponentDidMount)) {
			lifecycle.addListener(() => ref.onComponentDidMount(dom));
		}
	}
}

export function mountRef(dom: Element, value, lifecycle: LifecycleClass) {
	if (isFunction(value)) {
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
