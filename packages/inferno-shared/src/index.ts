export const NO_OP = '$NO_OP';
export const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

// This should be boolean and not reference to window.document
export const isBrowser = !!(typeof window !== 'undefined' && window.document);

export function toArray(children): any[] {
  return isArray(children) ? children : children ? [children] : children;
}

// this is MUCH faster than .constructor === Array and instanceof Array
// in Node 7 and the later versions of V8, slower in older versions though
export const isArray = Array.isArray;

export function isStringOrNumber(o: any): o is string | number {
  const type = typeof o;

  return type === 'string' || type === 'number';
}

export function isNullOrUndef(o: any): o is undefined | null {
  return isUndefined(o) || isNull(o);
}

export function isInvalid(o: any): o is null | false | true | undefined {
  return isNull(o) || o === false || isTrue(o) || isUndefined(o);
}

export function isFunction(o: any): o is Function {
  return typeof o === 'function';
}

export function isString(o: any): o is string {
  return typeof o === 'string';
}

export function isNumber(o: any): o is number {
  return typeof o === 'number';
}

export function isNull(o: any): o is null {
  return o === null;
}

export function isTrue(o: any): o is true {
  return o === true;
}

export function isUndefined(o: any): o is undefined {
  return o === void 0;
}

export function isDefined(o: any) {
  return o !== void 0;
}

export function isObject(o: any): o is object {
  return typeof o === 'object';
}

export function throwError(message?: string) {
  if (!message) {
    message = ERROR_MSG;
  }
  throw new Error(`Inferno Error: ${message}`);
}

export function warning(message: string) {
  // tslint:disable-next-line:no-console
  console.error(message);
}

export function combineFrom(first?: {} | null, second?: {} | null): object {
  const out = {};
  if (first) {
    for (const key in first) {
      out[key] = first[key];
    }
  }
  if (second) {
    for (const key in second) {
      out[key] = second[key];
    }
  }
  return out;
}
