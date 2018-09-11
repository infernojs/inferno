import { isFunction, warning } from 'inferno-shared';

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
