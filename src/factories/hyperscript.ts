// import { isStringOrNumber, isArray, isString } from '../shared';
// import { createVElement, createVComponent, VComponent, VElement } from '../core/shapes';

// function isChildren(x) {
// 	return isStringOrNumber(x) || (x && isArray(x));
// }

// function extractProps(_props, _tag) {

// }

// export default function hyperscript(_tag, _props, _children, _childrenType): VComponent | VElement {
// 	// If a child array or text node are passed as the second argument, shift them
// 	if (!_children && isChildren(_props)) {
// 		_children = _props;
// 		_props = {};
// 	}
// 	const { tag, props, key, ref, children, childrenType, hooks } = extractProps(_props, _tag);

// 	if (isString(tag)) {
// 		return createVElement(tag, props, children, key, ref, childrenType);
// 	} else {
// 		return createVComponent(tag, props, key, hooks, ref);
// 	}
// }