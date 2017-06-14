import { SinonStub, spy as createSpy, stub as createStub } from 'sinon';

import { render } from 'inferno';

export const renderInDiv = (node) => {
  const div = document.createElement('div');
  render(node, div);
};

export { createSpy };

export const spyOn = (obj, name, fn) => {
  const stub = createStub(obj, name);
  let destroy = true;
  try {
    const ret = fn(stub);
    if (ret && ret.then) {
      destroy = false;
      return ret.then(res => {
        stub.restore();
        return ret;
      });
    } else {
      return ret;
    }
  } finally {
    if (destroy) {
      stub.restore();
    }
  }
};

export { spy } from 'sinon';
export const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

export const Children = {
  only: (e) => {
    if (Array.isArray(e)) {
      if (e.length > 1) {
        throw new Error('Can only accept a single element.');
      }

      return e[0];
    }

    if (!e) {
      throw new Error('Requires a child');
    }

    return e;
  }
};
