import { isFunction, warning } from 'inferno-shared';
import { LIFECYCLE } from '../DOM/utils/common';

export function createRef() {
  return {
    current: null
  };
}

export function forwardRef(render) {
  if (process.env.NODE_ENV === 'production') {
    return {
      render
    };
  }

  if (!isFunction(render)) {
    warning(`forwardRef requires a render function but was given ${render === null ? 'null' : typeof render}.`);

    return;
  }

  const fwRef = {
    render
  };

  Object.seal(fwRef);

  return fwRef;
}

export function pushRef(dom: Element | null, value) {
  LIFECYCLE.push(() => value(dom));
}

export function unshiftRef(dom, value) {
  LIFECYCLE.unshift(() => value(dom));
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

export function mountRef(ref, value) {
  if (ref) {
    if (isFunction(ref)) {
      pushRef(value, ref);
    } else if (ref.current !== void 0) {
      ref.current = value;
    }
  }
}
