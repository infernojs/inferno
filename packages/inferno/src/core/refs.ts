import { isFunction, warning } from 'inferno-shared';
import { safeCall1 } from '../DOM/utils/common';

export function createRef() {
  return {
    current: null
  };
}

export function forwardRef(render) {
  if (process.env.NODE_ENV !== 'production') {
    if (!isFunction(render)) {
      warning(`forwardRef requires a render function but was given ${render === null ? 'null' : typeof render}.`);

      return;
    }
  }

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
