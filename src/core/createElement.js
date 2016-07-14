import { createVNode, createVElement, createVComponent } from '../core/shapes';
import {
	isAttrAnEvent,
	isArray,
	isString,
	isFunction,
	isInvalid,
	isAttrAComponentHook,
	isAttrAHook,
	isUndefined,
	isObject
} from './../core/utils';

const elementHooks = {
	onCreated: true,
	onAttached: true,
	onWillUpdate: true,
	onDidUpdate: true,
	onWillDetach: true
};

export default function createElement(name, props, ..._children) {
	if (isInvalid(name) || isObject(name)) {
		throw new Error('Inferno Error: createElement() name paramater cannot be undefined, null, false or true, It must be a string, class or function.');
	}
	let children = _children;
	let vNode;

	if (_children) {
		if (_children.length === 1) {
			children = _children[0];
		} else if (_children.length === 0) {
			children = null;
		}
	}
	if (isString(name)) {
		let hooks;
		vNode = createVElement(name);

		for (let prop in props) {
			if (prop === 'key') {
				vNode.key = props.key;
				delete props.key;
			} else if (elementHooks[prop]) {
				if (!hooks) {
					hooks = {};
				}
				hooks[prop] = props[prop];
				delete props[prop];
			}
		}
		vNode._props = props;
		if (children) {
			vNode._children = children;
		}
		if (hooks) {
			vNode._props = props;
		}
	} else {
		vNode = createVComponent(name);

		if (!isUndefined(children)) {
			if (!props) {
				props = {};
			}
			props.children = children;
		}
		if (props && props.key) {
			vNode.key = props.key;
			delete props.key;
		}
		vNode._props = props;
	}
	return vNode;
}
