import { createVElement, createVComponent } from '../core/shapes';
import {
	isAttrAnEvent,
	isString,
	isInvalid,
	isUndefined,
	isObject
} from './../shared';

const elementHooks = {
	onCreated: true,
	onAttached: true,
	onWillUpdate: true,
	onDidUpdate: true,
	onWillDetach: true
};

const componentHooks = {
	onComponentWillMount: true,
	onComponentDidMount: true,
	onComponentWillUnmount: true,
	onComponentShouldUpdate: true,
	onComponentWillUpdate: true,
	onComponentDidUpdate: true
};

export default function createElement(name: string | Function, props: any, ..._children) {
	if (isInvalid(name) || isObject(name)) {
		throw new Error('Inferno Error: createElement() name paramater cannot be undefined, null, false or true, It must be a string, class or function.');
	}
	let children: any = _children;
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
		vNode = createVElement(name, null, null, null, null, null);

		for (let prop in props) {
			if (prop === 'key') {
				vNode.key = props.key;
				delete props.key;
			} else if (prop === 'children') {
				vNode.children = children;
			} else if (elementHooks[prop]) {
				if (!hooks) {
					hooks = {};
				}
				hooks[prop] = props[prop];
				delete props[prop];
			} else if (isAttrAnEvent(prop)) {
				const lowerCase = prop.toLowerCase();

				if (lowerCase !== prop) {
					props[prop.toLowerCase()] = props[prop];
					delete props[prop];
				}
			}
		}
		vNode.props = props;
		if (!isUndefined(children)) {
			vNode.children = children;
		}
		if (hooks) {
			vNode.hooks = hooks;
		}
	} else {
		let hooks;
		vNode = createVComponent(name, null, null, null, null);

		if (!isUndefined(children)) {
			if (!props) {
				props = {};
			}
			props.children = children;
		}
		for (let prop in props) {
			if (componentHooks[prop]) {
				if (!hooks) {
					hooks = {};
				}
				hooks[prop] = props[prop];
			} else if (prop === 'key') {
				vNode.key = props.key;
				delete props.key;
			}
		}
		vNode.props = props;
		if (hooks) {
			vNode.hooks = hooks;
		}
	}
	return vNode;
}
