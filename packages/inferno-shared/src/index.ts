export const NO_OP = '$NO_OP';
export const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

// This should be boolean and not reference to window.document
export const isBrowser = !!(typeof window !== 'undefined' && window.document);

export function toArray(children): any[] {
	return isArray(children) ? children : (children ? [ children ] : children);
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

export function combineFrom(first: {}, second: {}): any {
	const obj = {};
	let key;
	if (first) {
		for (key in first) {
			obj[ key ] = first[ key ];
		}
	}
	if (second) {
		for (key in second) {
			obj[ key ] = second[ key ];
		}
	}
	return obj;
}

/*
 * This is purely a tiny event-emitter/pubsub
 */
export interface LifecycleClass {
	listeners: Array<() => void>;
	addListener(callback: Function): void;
	trigger(): void;
}

export function Lifecycle() {
	this.listeners = [];
}

Lifecycle.prototype.addListener = function addListener(callback) {
	this.listeners.push(callback);
};
Lifecycle.prototype.trigger = function trigger() {
	const listeners = this.listeners;

	let listener;
	// We need to remove current listener from array when calling it, because more listeners might be added
	while (listener = listeners.shift()) {
		listener();
	}
};
