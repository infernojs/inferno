import { isUndefined, isNull } from './utils';

export const NULL_INDEX = -1;
export const ROOT_INDEX = -2;

export const NodeTypes = {
	TEMPLATE: 1,
	TEXT: 2,
	FRAGMENT: 3
};

export const TemplateValueTypes = {
	CHILDREN_KEYED: 1,
	CHILDREN_NON_KEYED: 2,
	CHILDREN_TEXT: 3,
	CHILDREN_NODE: 4,
	PROPS_CLASS_NAME: 5
};

export const ChildrenTypes = {
	NON_KEYED: 1,
	KEYED: 2,
	NODE: 3,
	TEXT: 4,
	UNKNOWN: 5
};

export function createVTemplate(bp, key, v0, v1, v2, v3) {
	return {
		bp,
		dom: null,
		key,
		type: NodeTypes.TEMPLATE,
		v0,
		v1,
		v2,
		v3
	};
}

export function createVText(text) {
	return {
		dom: null,
		text,
		type: NodeTypes.TEXT
	};
}

export function createVFragment(children, childrenType) {
	return {
		type: NodeTypes.FRAGMENT,
		dom: null,
		pointer: null,
		children,
		childrenType: childrenType || ChildrenTypes.UNKNOWN
	};
}

export function isVTemplate(o) {
	return o.type === NodeTypes.TEMPLATE;
}

export function isVText(o) {
	return o.type === NodeTypes.TEXT;
}

export function isVFragment(o) {
	return o.type === NodeTypes.FRAGMENT;
}

export function isUnknownChildrenType(o) {
	return o === ChildrenTypes.UNKNOWN;
}

export function isKeyedListChildrenType(o) {
	return o === ChildrenTypes.KEYED;
}

export function isNonKeyedListChildrenType(o) {
	return o === ChildrenTypes.NON_KEYED;
}

export function isTextChildrenType(o) {
	return o === ChildrenTypes.TEXT;
}

export function isNodeChildrenType(o) {
	return o === ChildrenTypes.NODE;
}