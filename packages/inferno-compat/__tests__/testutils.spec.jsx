import { createComponentVNode, createElement } from 'inferno-compat';
import * as TestUtils from 'inferno-test-utils';
import { VNodeFlags } from 'inferno-vnode-flags';

describe('Inferno-compat: renderToSnapshot', () => {
  it('should return a snapshot with className prop, multiple children', () => {
    function TestComponent(props) {
      return createElement('div', null, [props.children, createElement('span', null, '1')]);
    }

    const snapshot = TestUtils.renderToSnapshot(
      createComponentVNode(VNodeFlags.ComponentFunction, TestComponent, {
        children: [
          createComponentVNode(VNodeFlags.ComponentFunction, TestComponent, {
            children: [createElement('span', null, 'a'), createElement('span', null, 'b')]
          }),
          createElement('span', null, 'a'),
          createElement('span', null, 'b')
        ]
      })
    );

    expect(JSON.stringify(snapshot)).toBe(
      '{"children":[{"children":[{"children":["a"],"props":{},"type":"span"},{"children":["b"],"props":{},"type":"span"},{"children":["1"],"props":{},"type":"span"}],"props":{},"type":"div"},{"children":["a"],"props":{},"type":"span"},{"children":["b"],"props":{},"type":"span"},{"children":["1"],"props":{},"type":"span"}],"props":{},"type":"div"}'
    );
  });

  it('should correctly handle null children', () => {
    function TestComponent(props) {
      return createElement('div', null, [props.children, createElement('span', null, '1')]);
    }

    const snapshot = TestUtils.renderToSnapshot(
      createComponentVNode(VNodeFlags.ComponentFunction, TestComponent, {
        children: [
          createComponentVNode(VNodeFlags.ComponentFunction, TestComponent, {
            children: [null, undefined]
          }),
          createElement('span', null, 'a'),
          createElement('span', null, 'b')
        ]
      })
    );

    expect(JSON.stringify(snapshot)).toBe(
      '{"children":[{"children":[{"children":["1"],"props":{},"type":"span"}],"props":{},"type":"div"},{"children":["a"],"props":{},"type":"span"},{"children":["b"],"props":{},"type":"span"},{"children":["1"],"props":{},"type":"span"}],"props":{},"type":"div"}'
    );
  });
});
