export const ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';

export const isArray = Array.isArray;

export function isStringOrNumber(o: any): o is string | number {
  const type = typeof o;

  return type === 'string' || type === 'number';
}

export function isNullOrUndef(o: any): o is undefined | null {
  return o === void 0 || o === null;
}

export function isInvalid(o: any): o is null | boolean | undefined {
  return o === null || o === false || o === true || o === void 0;
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

export function isUndefined(o: any): o is undefined {
  return o === void 0;
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

export function combineFrom(first: {} | null, second: {} | null): object {
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
