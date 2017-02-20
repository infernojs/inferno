import {
	copyPropsTo,
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
import { VNode } from '../core/VNodes';
import options from '../core/options';
import { cloneVNode, isVNode } from '../core/VNodes';
import {
	patchEvent,
	patchProp
} from './patching';
import {
	recycleComponent,
	recycleElement
} from './recycling';
import { componentToDOMNodeMap } from './rendering';
import {
	appendChild,
	createClassComponentInstance,
	createFunctionalComponentInput,
	documentCreateElement,
	setTextContent,
	EMPTY_OBJ
} from './utils';
import processElement from './wrappers/processElement';

export function mount(vNode: VNode, parentDom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
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
			if (typeof vNode === 'object') {
				throwError(`mount() received an object that's not a valid VNode, you should stringify it first. Object: "${ JSON.stringify(vNode) }".`);
			} else {
				throwError(`mount() expects a valid VNode, instead it received an object with the type "${ typeof vNode }".`);
			}
		}
		throwError();
	}
}

export function mountText(vNode: VNode, parentDom: Element): any {
	const dom = document.createTextNode(vNode.children as string);

	vNode.dom = dom as any;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountVoid(vNode: VNode, parentDom: Element) {
	const dom = document.createTextNode('');

	vNode.dom = dom as any;
	if (parentDom) {
		appendChild(parentDom, dom);
	}
	return dom;
}

export function mountElement(vNode: VNode, parentDom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean) {
	if (options.recyclingEnabled) {
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
	const events = vNode.events;
	const ref = vNode.ref;

	vNode.dom = dom;
	if (!isNull(children)) {
		if (isStringOrNumber(children)) {
			setTextContent(dom, children as string | number);
		} else if (isArray(children)) {
			mountArrayChildren(children, dom, lifecycle, context, isSVG);
		} else if (isVNode(children as any)) {
			mount(children as VNode, dom, lifecycle, context, isSVG);
		}
	}
	let hasControlledValue = false;
	if (!(flags & VNodeFlags.HtmlElement)) {
		hasControlledValue = processElement(flags, vNode, dom, true);
	}
	if (!isNull(props)) {
		for (let prop in props) {
			// do not add a hasOwnProperty check here, it affects performance
			patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
		}
	}
	if (!isNull(events)) {
		for (let name in events) {
			// do not add a hasOwnProperty check here, it affects performance
			patchEvent(name, null, events[name], dom);
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
		let child = children[i];

		// TODO: Verify can string/number be here. might cause de-opt
		if (!isInvalid(child)) {
			if (child.dom) {
				children[i] = child = cloneVNode(child);
			}
			mount(children[i], dom, lifecycle, context, isSVG);
		}
	}
}

export function mountComponent(vNode: VNode, parentDom: Element, lifecycle: LifecycleClass, context: Object, isSVG: boolean, isClass: number) {
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
	const defaultProps = (type as any).defaultProps;
	let props;
	if (!isUndefined(defaultProps)) {
		// When defaultProps are used we need to create new Object
		props = vNode.props || {};
		copyPropsTo(defaultProps, props);
		vNode.props = props;
	} else {
		props = vNode.props || EMPTY_OBJ;
	}

	const ref = vNode.ref;
	let dom;
	if (isClass) {
		const instance = createClassComponentInstance(vNode, type, props, context, isSVG);
		const input = instance._lastInput;
		instance._vNode = vNode;
		vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
		options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
		vNode.children = instance;
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
	const cDM = instance.componentDidMount;
	const afterMount = options.afterMount;

	if (!isUndefined(cDM) || !isNull(afterMount)) {
		lifecycle.addListener(() => {
			afterMount && afterMount(vNode);
			cDM && instance.componentDidMount();
			instance._syncSetState = true;
		});
	} else {
		instance._syncSetState = true;
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
