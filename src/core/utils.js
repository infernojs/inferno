export const NO_OP = '$NO_OP';
const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
// Runs only once in applications lifetime
export const isBrowser = typeof window !== 'undefined' && window.document;
export function toArray(children) {
    return isArray(children) ? children : (children ? [children] : children);
}
export function isArray(obj) {
    return obj instanceof Array;
}
export function isStatefulComponent(o) {
    const component = o.component;
    return !isUndefined(component.prototype) && !isUndefined(component.prototype.render);
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
export function throwError(message) {
    if (!message) {
        message = ERROR_MSG;
    }
    throw new Error(`Inferno Error: ${message}`);
}
export function warning(condition, message) {
    if (!condition) {
        console.error(message);
    }
}
export const EMPTY_OBJ = {};
//# sourceMappingURL=utils.js.map