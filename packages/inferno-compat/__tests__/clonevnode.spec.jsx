import { createVNode, directClone } from 'inferno-compat';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

describe('directClone inferno-compat', () => {
  it('Should not lose props when cloning multiple times', () => {
    const vNode = createVNode(
      VNodeFlags.HtmlElement,
      'stop',
      null,
      null,
      ChildFlags.HasInvalidChildren,
      {
        offset: 0,
        stopColor: 'white',
        stopOpacity: 0.5
      },
      null,
      null
    );

    const cloned = directClone(vNode);
    const cloned2 = directClone(cloned);

    expect(cloned2.props['stop-color']).toBe('white');
    expect(cloned2.props['stop-opacity']).toBe(0.5);
    expect(cloned2.props['offset']).toBe(0);
  });
});
