import { isFunction, warning } from 'inferno-shared';

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
    if (isFunction(ref)) {
      ref(null);
    } else if (ref.current) {
      ref.current = null;
    }
  }
}

export function mountRef(ref, value, lifecycle: Function[]) {
  if (ref && (isFunction(ref) || ref.current !== void 0)) {
    lifecycle.push(() => {
      if (isFunction(ref)) {
        ref(value);
      } else if (ref.current !== void 0) {
        ref.current = value;
      }
    });
  }
}
