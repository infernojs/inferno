export const ChildrenTypes = {
	KEYED_LIST: 1,
	NON_KEYED_LIST: 2,
	TEXT: 3,
	NODE: 4,
	UNKNOWN: 5,
	STATIC_TEXT: 6
};

export function isKeyedListChildrenType(o) {
	return o === ChildrenTypes.KEYED_LIST;
}

export function isNonKeyedListChildrenType(o) {
	return o === ChildrenTypes.NON_KEYED_LIST;
}

export function isTextChildrenType(o) {
	return o === ChildrenTypes.TEXT || o === ChildrenTypes.STATIC_TEXT;
}

export function isNodeChildrenType(o) {
	return o === ChildrenTypes.NODE;
}

export function isUnknownChildrenType(o) {
	return o === ChildrenTypes.UNKNOWN;
}