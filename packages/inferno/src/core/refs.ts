import { isFunction, warning } from 'inferno-shared';
import { safeCall1 } from '../DOM/utils/common';
import type { Inferno, RefObject } from './types';

export function createRef<T = Element>(): RefObject<T> {
  return {
    current: null
  };
}

// TODO: Make this return value typed
export function forwardRef<T = any, P = {}>(
  render: (props: Readonly<{ children?: Inferno.InfernoNode | undefined }> & Readonly<P>, ref: RefObject<T>) => Inferno.InfernoNode
): any {
  if (process.env.NODE_ENV !== 'production') {
    if (!isFunction(render)) {
      warning(`forwardRef requires a render function but was given ${render === null ? 'null' : typeof render}.`);

      // @ts-ignore
      return;
    }
  }

  const ref = {
    render
  };

  // @ts-ignore
  return ref;
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
