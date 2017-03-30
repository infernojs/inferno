import { createVNode, VNode, InfernoChildren } from 'inferno';
import {
	isArray,
	isStatefulComponent,
	isString,
	isStringOrNumber,
	isUndefined
} from 'inferno-shared';
import VNodeFlags from 'inferno-vnode-flags';

const classIdSplit = /([.#]?[a-zA-Z0-9_:-]+)/;
const notClassId = /^\.|#/;

function parseTag(tag: string | null, props: any): string {
	if (!tag) {
		return 'div';
	}
	const noId = props && isUndefined(props.id);
	const tagParts = tag.split(classIdSplit);
	let tagName: null | string = null;

	if (notClassId.test(tagParts[1])) {
		tagName = 'div';
	}
	let classes;

	for (let i = 0, len = tagParts.length; i < len; i++) {
		const part = tagParts[i];

		if (!part) {
			continue;
		}
		const type = part.charAt(0);

		if (!tagName) {
			tagName = part;
		} else if (type === '.') {
			classes = classes || [];
			classes.push(part.substring(1, part.length));
		} else if (type === '#' && noId) {
			props.id = part.substring(1, part.length);
		}
	}
	if (classes) {
		if (props.className) {
			classes.push(props.className);
		}
		props.className = classes.join(' ');
	}
	return tagName || 'div';
}

function isChildren(x: any): boolean {
	return isStringOrNumber(x) || (x && isArray(x));
}

function extractProps(_props: any, _tag: string | VNode): any {
	_props = _props || {};
	const isComponent = !isString(_tag);
	const tag = !isComponent ? parseTag(_tag as string, _props) : _tag;
	const newProps = {};
	let key = null;
	let ref = null;
	let children = null;
	let className = null;

	for (const prop in _props) {
		if (prop === 'className' || prop === 'class') {
			className = _props[prop];
		} else if (prop === 'key') {
			key = _props[prop];
		} else if (prop === 'ref') {
			ref = _props[prop];
		} else if (prop.substr(0, 11) === 'onComponent' && isComponent) {
			if (!ref) {
				ref = {};
			}
			ref[prop] = _props[prop];
		} else if (prop === 'hooks') {
			ref = _props[prop];
		} else if (prop === 'children') {
			children = _props[prop];
		} else {
			newProps[prop] = _props[prop];
		}
	}
	return { tag, props: newProps, key, ref, children, className };
}

export default function hyperscript(_tag: string | VNode | Function, _props?: any, _children?: InfernoChildren): VNode {
	// If a child array or text node are passed as the second argument, shift them
	if (!_children && isChildren(_props)) {
		_children = _props;
		_props = {};
	}
	const { tag, props, key, ref, children, className } = extractProps(_props, _tag as VNode);

	if (isString(tag)) {
		let flags;

		switch (tag) {
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
				flags = VNodeFlags.HtmlElement;
				break;
		}
		return createVNode(flags, tag, className, _children || children, props, key, ref);
	} else {
		const flags = isStatefulComponent(tag) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;

		if (children || _children) {
			(props as any).children = children || _children;
		}
		return createVNode(flags, tag, className, null, props, key, ref);
	}
}
