declare module 'inferno-helpers' {
  export const NO_OP: string;
  export const ERROR_MSG: string;
  export const EMPTY_OBJ: {};

  export const isBrowser: boolean;

  export function toArray(children): Array<any>;
  export function isArray(arg: any): arg is Array<any>;
  export function isStatefulComponent(o: any): boolean;
  export function isStringOrNumber(obj: any): boolean;
  export function isNullOrUndef(obj: any): boolean;
  export function isInvalid(obj: any): boolean;
  export function isFunction(obj: any): boolean;
  export function isAttrAnEvent(attr: string): boolean;
  export function isString(obj: any): boolean;
  export function isNumber(obj: any): boolean;
  export function isNull(obj: any): boolean;
  export function isTrue(obj: any): boolean;
  export function isUndefined(obj: any): boolean;
  export function isObject(o: any): boolean;
  export function throwError(message?: string): void;
  export function warning(condition: boolean, message: string): void;
}
