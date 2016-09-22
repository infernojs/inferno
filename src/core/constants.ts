
export const ValueTypes = {
	CHILDREN: 1,
	PROP_CLASS_NAME: 2,
	PROP_STYLE: 3,
	PROP_DATA: 4,
	PROP_REF: 5,
	PROP_SPREAD: 6,
	PROP_VALUE: 7,
	PROP: 8
};

export const ChildrenTypes = {
	NON_KEYED: 1,
	KEYED: 2,
	NODE: 3,
	TEXT: 4,
	UNKNOWN: 5
};

export const NodeTypes = {
	ELEMENT: 1,
	OPT_ELEMENT: 2,
	TEXT: 3,
	FRAGMENT: 4,
	OPT_BLUEPRINT: 5,
	COMPONENT: 6,
	PLACEHOLDER: 7
};

export function isUnknownChildrenType(o: number): boolean {
	return o === ChildrenTypes.UNKNOWN;
}

export function isKeyedListChildrenType(o: number): boolean {
	return o === ChildrenTypes.KEYED;
}

export function isNonKeyedListChildrenType(o: number): boolean {
	return o === ChildrenTypes.NON_KEYED;
}

export function isTextChildrenType(o: number): boolean {
	return o === ChildrenTypes.TEXT;
}

export function isNodeChildrenType(o: number): boolean {
	return o === ChildrenTypes.NODE;
}
