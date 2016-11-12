import {
	createVNode,
	VNodeFlags,
	VNode
} from '../core/shapes';
import {
	isAttrAnEvent,
	isString,
	isInvalid,
	isUndefined,
	isObject,
	isStatefulComponent
} from './../shared';

const componentHooks = {
	onComponentWillMount: true,
	onComponentDidMount: true,
	onComponentWillUnmount: true,
	onComponentShouldUpdate: true,
	onComponentWillUpdate: true,
	onComponentDidUpdate: true
};

export default function createElement(name: string | Function, props?: any, ..._children): VNode {
	if (isInvalid(name) || isObject(name)) {
		throw new Error('Inferno Error: createElement() name paramater cannot be undefined, null, false or true, It must be a string, class or function.');
	}
	let children: any = _children;
	let vNode = createVNode(0);
	let ref = null;
	let key = null;
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
				const lowerCase = prop.toLowerCase();

				if (lowerCase !== prop) {
					props[prop.toLowerCase()] = props[prop];
					delete props[prop];
				}
			}
		}
	} else {
		flags = isStatefulComponent(name) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;
		if (!isUndefined(children)) {
			if (!props) {
				props = {};
			}
			props.children = children;
		}
		for (let prop in props) {
			if (componentHooks[prop]) {
				if (!ref) {
					ref = {};
				}
				ref[prop] = props[prop];
			} else if (prop === 'key') {
				key = props.key;
				delete props.key;
			}
		}
		vNode.props = props;
	}
	return createVNode(
		flags,
		name,
		props,
		children,
		key,
		ref
	);
}
