import { isStringOrNumber, isArray, isString, isUndefined } from '../shared';
import { createVElement, createVComponent, VComponent, VElement } from '../core/shapes';
import { ChildrenTypes } from '../core/constants';

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
	const tag = isString(_tag) ? parseTag(_tag, _props) : _tag;
	const props = {};
	let key = null;
	let ref = null;
	let hooks: null | Object = null;
	let children = null;
	let childrenType = ChildrenTypes.UNKNOWN;

	for (let prop in _props) {
		if (prop === 'key') {
			key = _props[prop];
		} else if (prop === 'ref') {
			ref = _props[prop];
		} else if (prop.substr(0, 11) === 'onComponent') {
			if (!hooks) {
				hooks = {};
			}
			hooks[prop] = _props[prop];
		} else if (prop === 'hooks') {
			hooks = _props[prop];
		} else if (prop === 'children') {
			children = _props[prop];
		} else if (prop === 'childrenType') {
			childrenType = _props[prop];
		} else {
			props[prop] = _props[prop];
		}
	}
	return { tag, props, key, ref, children, childrenType, hooks };
}

export default function hyperscript(_tag, _props, _children, _childrenType): VComponent | VElement {
	// If a child array or text node are passed as the second argument, shift them
	if (!_children && isChildren(_props)) {
		_children = _props;
		_props = {};
	}
	const { tag, props, key, ref, children, childrenType, hooks } = extractProps(_props, _tag);

	if (isString(tag)) {
		return createVElement(tag, props, _children || children, key, ref, _childrenType || childrenType);
	} else {
		return createVComponent(tag, props, key, hooks, ref);
	}
}
