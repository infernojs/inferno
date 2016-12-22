import {
	isArray,
	isFunction,
	isInvalid,
	isNull,
	isNullOrUndef,
	isStringOrNumber,
	isUndefined,
	throwError,
	EMPTY_OBJ,
} from '../shared';
import { cloneVNode, isVNode } from '../core/VNodes';
import {
	appendChild,
	createStatefulComponentInstance,
	createStatelessComponentInput,
	documentCreateElement,
	setTextContent,
} from './utils';
import {
	recycleComponent,
	recycleElement,
} from './recycling';
import options from '../core/options';
import Lifecycle from './lifecycle';
import {
	VNodeFlags
} from '../core/structures';
import {
	copyPropsTo
} from '../core/normalization';
import { componentToDOMNodeMap } from './rendering';
import {
	patchProp,
	patchEvent
} from './patching';
import processElement from './wrappers/processElement';

export function mount(vNode, parentDom, lifecycle: Lifecycle, context, isSVG) {
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

export function mountElement(vNode, parentDom, lifecycle: Lifecycle, context, isSVG) {
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
			patchProp(prop, null, props[prop], dom, isSVG, lifecycle);
		}
	}
	if (!isNull(events)) {
		for (let name in events) {
			// do not add a hasOwnProperty check here, it affects performance
			patchEvent(name, null, events[name], dom, lifecycle);
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

export function mountArrayChildren(children, dom, lifecycle: Lifecycle, context, isSVG) {
	for (let i = 0; i < children.length; i++) {
		let child = children[i];

		if (!isInvalid(child)) {
			if (child.dom) {
				children[i] = child = cloneVNode(child);
			}
			mount(children[i], dom, lifecycle, context, isSVG);
		}
	}
}

export function mountComponent(vNode, parentDom, lifecycle: Lifecycle, context, isSVG: boolean, isClass: number) {
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
	const defaultProps = type.defaultProps;
	const ref = vNode.ref;
	let dom;

	if (!isUndefined(defaultProps)) {
		copyPropsTo(defaultProps, props);
		vNode.props = props;
	}
	if (isClass) {
		const instance = createStatefulComponentInstance(vNode, type, props, context, isSVG);
		// If instance does not have componentWillUnmount specified we can enable fastUnmount
		lifecycle.fastUnmount = isUndefined(instance.componentWillUnmount);
		const input = instance._lastInput;

		// we store the fastUnmount value, but we set it back to true on the lifecycle
		// we do this so we can determine if the component render has a fastUnmount or not
		instance._vNode = vNode;
		vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
		// we now create a lifecycle for this component and store the fastUnmount value
		const subLifecycle = instance._lifecycle = new Lifecycle();

		subLifecycle.fastUnmount = lifecycle.fastUnmount;
		if (!isNull(parentDom)) {
			appendChild(parentDom, dom);
		}
		mountStatefulComponentCallbacks(vNode, ref, instance, lifecycle);
		options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
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

export function mountStatefulComponentCallbacks(vNode, ref, instance, lifecycle: Lifecycle) {
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
	const cDM = instance.componentDidMount;
	const afterMount = options.afterMount;

	if (!isUndefined(cDM) || !isNull(afterMount)) {
		lifecycle.addListener(() => {
			afterMount && afterMount(vNode);
			cDM && instance.componentDidMount();
		});
	}
}

export function mountStatelessComponentCallbacks(ref, dom, lifecycle: Lifecycle) {
	if (ref) {
		if (!isNullOrUndef(ref.onComponentWillMount)) {
			ref.onComponentWillMount();
		}
		if (!isNullOrUndef(ref.onComponentDidMount)) {
			lifecycle.addListener(() => ref.onComponentDidMount(dom));
		}
		if (!isNullOrUndef(ref.onComponentWillUnmount)) {
			lifecycle.fastUnmount = false;
		}
	}
}

export function mountRef(dom, value, lifecycle: Lifecycle) {
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
