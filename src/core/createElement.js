import { createVNode } from '../core/shapes';
import {
	isAttrAnEvent,
	isArray,
	isNullOrUndefined,
	isFunction,
	isInvalidNode,
	isAttrAComponentHook,
	isAttrAHook
} from './../core/utils';

export function createAttrsAndEvents(props, tag) {
	let events = null;
	let hooks = null;
	let attrs = null;
	let className = null;
	let style = null;

	if (!isNullOrUndefined(props)) {
		if (isArray(props)) {
			return props;
		}
		for (let prop in props) {
			if (prop === 'className') {
				className = props[prop];
			} else if (prop === 'style') {
				style = props[prop];
			} else if (isAttrAHook(prop) && !isFunction(tag)) {
				if (isNullOrUndefined(hooks)) {
					hooks = {};
				}
				hooks[prop.substring(2).toLowerCase()] = props[prop];
				delete props[prop];
			} else if (isAttrAnEvent(prop) && !isFunction(tag)) {
				if (isNullOrUndefined(events)) {
					events = {};
				}
				events[prop.toLowerCase()] = props[prop];
				delete props[prop];
			} else if (isAttrAComponentHook(prop) && isFunction(tag)) {
				if (isNullOrUndefined(hooks)) {
					hooks = {};
				}
				hooks['c' + prop.substring(3)] = props[prop];
				delete props[prop];
			} else if (!isFunction(tag)) {
				if (isNullOrUndefined(attrs)) {
					attrs = {};
				}
				attrs[prop] = props[prop];
			} else {
				attrs = props;
			}
		}
	}
	return { attrs, events, className, style, hooks };
}

function createChild({ tag, attrs, children, className, style, events, hooks }) {
	if (tag === undefined && !isNullOrUndefined(attrs) && !attrs.tpl && !isNullOrUndefined(children) && children.length === 0) {
		return null;
	}
	const key = !isNullOrUndefined(attrs) && !isNullOrUndefined(attrs.key) ? attrs.key : undefined;

	if (!isNullOrUndefined(children) && children.length === 0) {
		children = null;
	} else if (!isInvalidNode(children)) {
		children = isArray(children) && children.length === 1 ? createChildren(children[0]) : createChildren(children);
	}

	if (key !== undefined) {
		delete attrs.key;
	}
	const attrsAndEvents = createAttrsAndEvents(attrs, tag);
	const vNode = createVNode();

	className = className || attrsAndEvents.className;
	style = style || attrsAndEvents.style;

	vNode.tag = tag || null;
	vNode.attrs = attrsAndEvents.attrs || null;
	vNode.events = attrsAndEvents.events || events;
	vNode.hooks = attrsAndEvents.hooks || hooks;
	vNode.children = children === undefined ? null : children;
	vNode.key = key === undefined ? null : key;
	vNode.className = className === undefined ? null : className;
	vNode.style = style === undefined ? null : style;

	return vNode;
}

export function createChildren(children) {
	const childrenDefined = !isNullOrUndefined(children);
	if (childrenDefined && isArray(children)) {
		const newChildren = [];

		for (let i = 0; i < children.length; i++) {
			const child = children[i];
			if (!isNullOrUndefined(child) && typeof child === 'object') {
				if (isArray(child)) {
					if (child.length > 0) {
						newChildren.push(createChildren(child));
					} else {
						newChildren.push(null);
					}
				} else {
					newChildren.push(createChild(child));
				}
			} else {
				newChildren.push(child);
			}
		}
		return newChildren;
	} else if (childrenDefined && typeof children === 'object') {
		return children.dom === undefined ? createChild(children) : children;
	}
	return children;
}

export default function createElement(tag, props, ...children) {
	return createChild({ tag, attrs: props, children });
}
