export const ChildrenTypes = {
	KEYED_LIST: 0,
	NON_KEYED_LIST: 1,
	TEXT: 2,
	NODE: 3,
	UNKNOWN: 4
};

export function isKeyedListChildrenType(o) {
	return o === ChildrenTypes.KEYED_LIST;
}

export function isNonKeyedListChildrenType(o) {
	return o === ChildrenTypes.NON_KEYED_LIST;
}

export function isTextChildrenType(o) {
	return o === ChildrenTypes.TEXT;
}

export function isNodeChildrenType(o) {
	return o === ChildrenTypes.NODE;
}

export function isUnknownChildrenType(o) {
	return o === ChildrenTypes.UNKNOWN;
}