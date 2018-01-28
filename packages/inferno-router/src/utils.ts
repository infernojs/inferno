import { VNodeFlags } from 'inferno-vnode-flags';
import { isArray, isNull, isNullOrUndef, isObject } from 'inferno-shared';

export function warning(condition, message) {
  if (!condition) {
    // tslint:disable-next-line:no-console
    console.error(message);
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

export function invariant(condition, format, a?, b?, c?, d?, e?, f?) {
  if (!condition) {
    let error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      const args = [a, b, c, d, e, f];
      let argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() {
          return args[argIndex++];
        })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

const ARR = [];

export const Children = {
  forEach(children: any[], fn: Function): void {
    if (isNullOrUndef(children)) {
      return;
    }
    children = Children.toArray(children);
    for (let i = 0, len = children.length; i < len; i++) {
      fn(children[i], i, children);
    }
  },

  count(children: any[]): number {
    return Children.toArray(children).length;
  },

  only(children: any[]): any {
    children = Children.toArray(children);
    if (children.length !== 1) {
      throw new Error('Children.only() expects only one child.');
    }
    return children[0];
  },

  toArray(children: any[]): any[] {
    return isNullOrUndef(children) ? [] : isArray(children) ? children : ARR.concat(children);
  }
};
