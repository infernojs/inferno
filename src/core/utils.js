
export const NO_OP = 'NO_OP';

// Runs only once in applications lifetime
export const isBrowser = typeof window !== 'undefined' && window.document;

export function toArray(children) {
	return isArray(children) ? children : (children ? [children] : children);
}

export function isArray(obj) {
	return obj instanceof Array;
}

export function isStatefulComponent(o) {
	return isTrue(o._isStateful);
}

export function isStringOrNumber(obj) {
	return isString(obj) || isNumber(obj);
}

export function isNullOrUndef(obj) {
	return isUndefined(obj) || isNull(obj);
}

export function isInvalid(obj) {
	return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}

export function isFunction(obj) {
	return typeof obj === 'function';
}

export function isAttrAnEvent(attr) {
	return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}

export function isString(obj) {
	return typeof obj === 'string';
}

export function isNumber(obj) {
	return typeof obj === 'number';
}

export function isNull(obj) {
	return obj === null;
}

export function isTrue(obj) {
	return obj === true;
}

export function isUndefined(obj) {
	return obj === undefined;
}

export function isObject(o) {
	return typeof o === 'object';
}

function deepScanChildrenForNode(children, node) {
	if (!isInvalid(children)) {
		if (isArray(children)) {
			for (let i = 0; i < children.length; i++) {
				const child = children[i];

				if (!isInvalid(child)) {
					if (child === node) {
						return true;
					} else if (child.children) {
						return deepScanChildrenForNode(child.children, node);
					}
				}
			}
		} else {
			if (children === node) {
				return true;
			} else if (children.children) {
				return deepScanChildrenForNode(children.children, node);
			}
		}
	}
	return false;
}