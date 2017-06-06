/**
 * @module Inferno-Redux
 */ /** TypeDoc Comment */

// From https://github.com/lodash/lodash/blob/es
function overArg(func, transform) {
	return function(arg) {
		return func(transform(arg));
	};
}

const getPrototype = overArg(Object.getPrototypeOf, Object);

function isObjectLike(value) {
	return value != null && typeof value === 'object';
}

const objectTag = '[object Object]';
const funcProto = Function.prototype;
const objectProto = Object.prototype;

const funcToString = funcProto.toString;
const hasOwnProperty = objectProto.hasOwnProperty;
const objectCtorString = funcToString.call(Object);
const objectToString = objectProto.toString;

export function isPlainObject(value) {
	if (!isObjectLike(value) || objectToString.call(value) !== objectTag) {
		return false;
	}
	const proto = getPrototype(value);
	if (proto === null) {
		return true;
	}
	const Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	return typeof Ctor === 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
}
