import { cloneElement, createElement } from 'react';
export { findDOMNode, render } from 'react-dom';

export function createVNode(flags, type, className?, children?, props?, key?, ref?, noNormalise?) {
	return createElement(
		type,
		{
			className,
      key,
      ref,
			...props
		},
		children
	);
}

export function cloneVNode(vNodeToClone, props?, ..._children) {
	return cloneElement(vNodeToClone, props, ..._children);
}

export const EMPTY_OBJ = {};
export const NO_OP = () => ({});
