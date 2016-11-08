import {
	isStringOrNumber,
	isArray,
	isString,
	isUndefined,
	isStatefulComponent
} from '../shared';
import {
	createVNode,
	VNode,
	VNodeFlags,
} from '../core/shapes';

const classIdSplit = /([\.#]?[a-zA-Z0-9_:-]+)/;
const notClassId = /^\.|#/;

function parseTag(tag, props) {
	if (!tag) {
		return 'div';
	}
	const noId = props && isUndefined(props.id);
	const tagParts = tag.split(classIdSplit);
	let tagName: null | string = null;

	if (notClassId.test(tagParts[1])) {
		tagName = "div";
	}
	let classes;

	for (let i = 0; i < tagParts.length; i++) {
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
	return tagName ? tagName.toLowerCase() : "div";
}

function isChildren(x) {
	return isStringOrNumber(x) || (x && isArray(x));
}

function extractProps(_props, _tag) {
	_props = _props || {};
	const tag = isString(_tag) ? parseTag(_tag, _props) : _tag;
	const props = {};
	let key = null;
	let ref = null;
	let children = null;

	for (let prop in _props) {
		if (prop === 'key') {
			key = _props[prop];
		} else if (prop === 'ref') {
			ref = _props[prop];
		} else if (prop.substr(0, 11) === 'onComponent') {
			if (!ref) {
				ref = {};
			}
			ref[prop] = _props[prop];
		} else if (prop === 'hooks') {
			ref = _props[prop];
		} else if (prop === 'children') {
			children = _props[prop];
		} else {
			props[prop] = _props[prop];
		}
	}
	return { tag, props, key, ref, children };
}

export default function hyperscript(_tag, _props?, _children?, _childrenType?): VNode {
	// If a child array or text node are passed as the second argument, shift them
	if (!_children && isChildren(_props)) {
		_children = _props;
		_props = {};
	}
	const { tag, props, key, ref, children } = extractProps(_props, _tag);

	if (isString(tag)) {
		let flags = VNodeFlags.HtmlElement;

		switch (tag) {
			case 'svg':
				flags = VNodeFlags.SvgElement;
				break;
			case 'input':
				flags = VNodeFlags.InputElement;
				break;
			case 'textarea':
				flags = VNodeFlags.TextAreaElement;
				break;
			case 'select':
				flags = VNodeFlags.SelectElement;
				break;
			default:
		}
		return createVNode(flags, tag, props, _children || children, key, ref);
	} else {
		const flags = isStatefulComponent(tag) ? VNodeFlags.ComponentClass : VNodeFlags.ComponentFunction;

		return createVNode(flags, tag, props, null, key, ref);
	}
}
