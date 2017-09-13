import { VNode } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import { isArray, isObject, isNull, isNullOrUndef } from "inferno-shared";

export function warning(condition, message) {
  if (!condition) {
    console.warn(message);
  }
}

export function invariant(condition, format, a?, b?, c?, d?, e?, f?) {
  if (process.env.NODE_ENV !== "production") {
    if (format === undefined) {
      throw new Error("invariant requires an error message argument");
    }
  }

  if (!condition) {
    let error;
    if (format === undefined) {
      error = new Error(
        "Minified exception occurred; use the non-minified dev environment " +
          "for the full error message and additional helpful warnings."
      );
    } else {
      const args = [a, b, c, d, e, f];
      let argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++];
        })
      );
      error.name = "Invariant Violation";
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

export function isValidElement(obj: VNode): boolean {
  const isNotANullObject = isObject(obj) && isNull(obj) === false;
  if (isNotANullObject === false) {
    return false;
  }
  const flags = obj.flags;

  return (flags & (VNodeFlags.Component | VNodeFlags.Element)) > 0;
}

const ARR = [];

export const Children = {
  forEach(children: Array<any>, fn: Function, ctx?: any): void {
    if (isNullOrUndef(children)) {
      return;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    for (let i = 0, len = children.length; i < len; i++) {
      fn(children[i], i, children);
    }
  },

  count(children: Array<any>): number {
    children = Children.toArray(children);
    return children.length;
  },

  only(children: Array<any>): any {
    children = Children.toArray(children);
    if (children.length !== 1) {
      throw new Error("Children.only() expects only one child.");
    }
    return children[0];
  },

  toArray(children: Array<any>): Array<any> {
    if (isNullOrUndef(children)) {
      return [];
    }
    return isArray(children) ? children : ARR.concat(children);
  }
};
