import {
	Props,
	InfernoChildren,
	VNodeFlags,
	VNode
} from '../core/structures';
import { createVNode } from 'inferno';
import {
	isAttrAnEvent,
	isString,
	isInvalid,
	isUndefined,
	isObject,
	isStatefulComponent
} from '../shared';

const componentHooks = {
	onComponentWillMount: true,
	onComponentDidMount: true,
	onComponentWillUnmount: true,
	onComponentShouldUpdate: true,
	onComponentWillUpdate: true,
	onComponentDidUpdate: true
};

export default function createElement<T>(
	name: string | Function,
	props?: T & Props,
	..._children: InfernoChildren[]
): VNode {
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
		for (let prop in props) {
			if (prop === 'key') {
				key = props.key;
				delete props.key;
			} else if (prop === 'children' && isUndefined(children)) {
				children = props.children; // always favour children args, default to props
			} else if (prop === 'ref') {
				ref = props.ref;
			} else if (isAttrAnEvent(prop)) {
				if (!events) {
					events = {};
				}
				events[prop] = props[prop];
				delete props[prop];
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
		for (let prop in props) {
			if (componentHooks[prop as string]) {
				if (!ref) {
					ref = {};
				}
				ref[prop] = props[prop];
			} else if (prop === 'key') {
				key = props.key;
				delete props.key;
			}
		}
	}
	return createVNode(
		flags,
		name,
		props,
		children,
		events,
		key,
		ref
	);
}
