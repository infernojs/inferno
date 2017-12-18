import { createVNode, render } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import sinon from 'sinon';

describe('patching routine (JSX)', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should always unmount/mount if ReCreate flag is set', () => {
    const spyObj = { fn: () => {} };
    const spyObj2 = { fn: () => {} };
    const spy1 = sinon.spy(spyObj, 'fn');
    const spy2 = sinon.spy(spyObj2, 'fn');

    const div = (
      <div $ReCreate ref={spy1}>
        1
      </div>
    );

    render(div, container);

    let firstDiv = container.firstChild;

    expect(container.innerHTML).toEqual('<div>1</div>');
    expect(spy1.callCount).toBe(1);
    expect(spy1.getCall(0).args.length).toBe(1);
    expect(spy1.getCall(0).args[0]).toEqual(firstDiv);

    const div2 = (
      <div $ReCreate ref={spy2}>
        1
      </div>
    );

    render(div2, container);

    expect(firstDiv).not.toBe(container.firstChild); // Div is different

    // Html is the same
    expect(container.innerHTML).toEqual('<div>1</div>');

    // Verify all callbacks were called
    expect(spy1.callCount).toBe(2);
    expect(spy1.getCall(1).args.length).toBe(1);
    expect(spy1.getCall(1).args[0]).toEqual(null);

    expect(spy2.callCount).toBe(1);
    expect(spy2.getCall(0).args.length).toBe(1);
    expect(spy2.getCall(0).args[0]).toEqual(container.firstChild);
  });
});
