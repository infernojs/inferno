import { isFunction, warning } from 'inferno-shared';
import { safeCall1 } from '../DOM/utils/common';
import type { ForwardRef, RefObject, SFC } from './types';

export function createRef<T = Element>(): RefObject<T> {
  return {
    current: null
  };
}

export function forwardRef(render: Function): SFC & ForwardRef {
  if (process.env.NODE_ENV !== 'production') {
    if (!isFunction(render)) {
      warning(`forwardRef requires a render function but was given ${render === null ? 'null' : typeof render}.`);

      // @ts-ignore
      return;
    }
  }

  // @ts-ignore
  return {
    render
  };
}

export function unmountRef(ref) {
  if (ref) {
    if (!safeCall1(ref, null) && ref.current) {
      ref.current = null;
    }
  }
}

export function mountRef(ref, value, lifecycle: Function[]) {
  if (ref && (isFunction(ref) || ref.current !== void 0)) {
    lifecycle.push(() => {
      if (!safeCall1(ref, value) && ref.current !== void 0) {
        ref.current = value;
      }
    });
  }
}
