import VNodeFlags from "inferno-vnode-flags";
import { isArray, isObject, isNull, isNullOrUndef } from "inferno-shared";

export function warning(condition, message) {
  if (!condition) {
    // tslint:disable-next-line:no-console
    console.warn(message);
  }
}

export function isValidElement(obj: any): boolean {
  const isNotANullObject = isObject(obj) && isNull(obj) === false;
  if (isNotANullObject === false) {
    return false;
  }
  const flags = obj.flags;

  return (flags & (VNodeFlags.Component | VNodeFlags.Element)) > 0;
}

const ARR = [];

export const Children = {
  count(children: any[]): number {
    return Children.toArray(children).length;
  },

  only(children: any[]): any {
    children = Children.toArray(children);
    if (children.length !== 1) {
      throw new Error("Children.only() expects only one child.");
    }
    return children[0];
  },

  toArray(children: any[]): any[] {
    return isNullOrUndef(children)
      ? []
      : isArray(children) ? children : ARR.concat(children);
  }
};
