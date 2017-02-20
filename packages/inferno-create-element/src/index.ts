import { createVNode, VNode, Props, InfernoChildren } from 'inferno';
import {
	isAttrAnEvent,
	isInvalid,
	isNullOrUndef,
	isObject,
	isStatefulComponent,
	isString,
	isUndefined
} from 'inferno-shared';
import Component from 'inferno-component';
import VNodeFlags from 'inferno-vnode-flags';

const componentHooks = {
	onComponentWillMount: true,
	onComponentDidMount: true,
	onComponentWillUnmount: true,
	onComponentShouldUpdate: true,
	onComponentWillUpdate: true,
	onComponentDidUpdate: true
};

export default function createElement<T>(
	name: string | Function | Component<any, any>,
	props?: T & Props,
	..._children: Array<InfernoChildren | any>): VNode {
	if (isInvalid(name) || isObject(name)) {
		throw new Error('Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class or function.');
	}
	let children: any = _children;
	let ref = null;
	let key = null;
	let events = null;
	let flags = 0;

	if (_children) {
		if (_children.length === 1) {
			children = _children[0];
		} else if (_children.length === 0) {
			children = undefined;
		}
	}
	if (isString(name)) {
		flags = VNodeFlags.HtmlElement;

		switch (name) {
			case 'svg':
				flags = VNodeFlags.SvgElement;
				break;
			case 'input':
				flags = VNodeFlags.InputElement;
				break;
			case 'textarea':
				flags = VNodeFlags.TextareaElement;
				break;
			case 'select':
				flags = VNodeFlags.SelectElement;
				break;
			default:
		}

		/*
		 This fixes de-optimisation:
		 uses object Keys for looping props to avoid deleting props of looped object
		 */
		if (!isNullOrUndef(props)) {
			const propKeys = Object.keys(props);

			for (let i = 0, len = propKeys.length; i < len; i++) {
				const propKey = propKeys[i];

				if (propKey === 'key') {
					key = props.key;
					delete props.key;
				} else if (propKey === 'children' && isUndefined(children)) {
					children = props.children; // always favour children args, default to props
				} else if (propKey === 'ref') {
					ref = props.ref;
				} else if (isAttrAnEvent(propKey)) {
					if (!events) {
						events = {};
					}
					events[propKey] = props[propKey];
					delete props[propKey];
				}
			}
		}
	} else {
		flags = isStatefulComponent(name) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
		if (!isUndefined(children)) {
			if (!props) {
				props = {} as T;
			}
			props.children = children;
			children = null;
		}

		if (!isNullOrUndef(props)) {
			/*
			 This fixes de-optimisation:
			 uses object Keys for looping props to avoid deleting props of looped object
			 */
			const propKeys = Object.keys(props);

			for (let i = 0, len = propKeys.length; i < len; i++) {
				const propKey = propKeys[i];

				if (componentHooks[propKey]) {
					if (!ref) {
						ref = {};
					}
					ref[propKey] = props[propKey];
				} else if (propKey === 'key') {
					key = props.key;
					delete props.key;
				}
			}
		}
	}
	return createVNode(
		flags,
		name as Function,
		props,
		children,
		events,
		key,
		ref
	);
}
