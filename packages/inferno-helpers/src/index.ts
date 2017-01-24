export const NO_OP = '$NO_OP';
export const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

export const isBrowser = typeof window !== 'undefined' && window.document;

export function toArray(children): any[] {
	return isArray(children) ? children : (children ? [children] : children);
}

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
export const isArray = Array.isArray;

export function isStatefulComponent(o: any): boolean {
	return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
}

export function isStringOrNumber(obj: any): boolean {
	const type = typeof obj;

	return type === 'string' || type === 'number';
}

export function isNullOrUndef(obj: any): boolean {
	return isUndefined(obj) || isNull(obj);
}

export function isInvalid(obj: any): boolean {
	return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
}

export function isFunction(obj: any): boolean {
	return typeof obj === 'function';
}

export function isAttrAnEvent(attr: string): boolean {
	return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
}

export function isString(obj: any): boolean {
	return typeof obj === 'string';
}

export function isNumber(obj: any): boolean {
	return typeof obj === 'number';
}

export function isNull(obj: any): boolean {
	return obj === null;
}

export function isTrue(obj: any): boolean {
	return obj === true;
}

export function isUndefined(obj: any): boolean {
	return obj === undefined;
}

export function isObject(o: any): boolean {
	return typeof o === 'object';
}

export function throwError(message?: string) {
	if (!message) {
		message = ERROR_MSG;
	}
	throw new Error(`Inferno Error: ${ message }`);
}

export function warning(message: string) {
	console.warn(message);
}

export const EMPTY_OBJ = {};

// So that Lifecycle gets tree-shaked properly https://gitlab.com/Rich-Harris/buble/issues/181
export class Dummy {}

/**
 * This is purely a tiny event-emitter/pubsub
 */
export class Lifecycle extends Dummy {
	public listeners: Function[] = [];
	public fastUnmount = true;

	addListener(callback) {
		this.listeners.push(callback);
	}
	trigger() {
		for (let i = 0; i < this.listeners.length; i++) {
			this.listeners[i]();
		}
	}
}
