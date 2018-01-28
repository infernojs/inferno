import { createTextVNode, createVNode, render } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import sinon from 'sinon';

describe('patching routine', () => {
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

  it('Should do nothing if lastVNode strictly equals nextVnode', () => {
    const yar = createVNode(VNodeFlags.HtmlElement, 'div', null, createTextVNode('123'), ChildFlags.HasVNodeChildren, null, null, null);
    const bar = createVNode(VNodeFlags.HtmlElement, 'div', null, createTextVNode('123'), ChildFlags.HasVNodeChildren, null, null, null);
    let foo = createVNode(VNodeFlags.HtmlElement, 'div', null, [bar, yar], ChildFlags.HasNonKeyedChildren, null, null, null);

    render(foo, container);
    expect(container.innerHTML).toEqual('<div><div>123</div><div>123</div></div>');

    foo = createVNode(VNodeFlags.HtmlElement, 'div', null, [bar, yar], ChildFlags.HasNonKeyedChildren, null, null, null);

    render(foo, container);
    expect(container.innerHTML).toEqual('<div><div>123</div><div>123</div></div>');
  });

  it('Should mount nextNode if lastNode crashed', () => {
    const validNode = createVNode(VNodeFlags.HtmlElement, 'span', null, createTextVNode('a'), ChildFlags.HasVNodeChildren, null, null, null);
    const invalidNode = createVNode(0, 'span');

    render(validNode, container);
    try {
      render(invalidNode, container);
    } catch (e) {
      expect(e.message.indexOf('Inferno Error: mount() received an object')).not.toEqual(-1);
    }
    expect(container.innerHTML).toEqual('<span>a</span>');

    render(validNode, container);
    expect(container.innerHTML).toEqual('<span>a</span>');
  });

  it('Should not access real DOM property when text does not change', () => {
    render(createTextVNode('a'), container);
    expect(container.innerHTML).toEqual('a');
    render(createTextVNode('a'), container);
    expect(container.innerHTML).toEqual('a');
  });

  it('Should not patch same innerHTML', () => {
    container.innerHTML = '<span><span><span>child</span></span></span>';

    const childelem = container.firstElementChild.firstElementChild;
    const props = { dangerouslySetInnerHTML: { __html: '<span>child</span>' } };

    const bar = createVNode(VNodeFlags.HtmlElement, 'span', null, null, ChildFlags.HasInvalidChildren, props, null, null);
    const foo = createVNode(VNodeFlags.HtmlElement, 'span', null, [bar], ChildFlags.HasNonKeyedChildren, null, null, null);

    render(foo, container);

    expect(childelem).toBe(container.firstElementChild.firstElementChild);
  });

  it('Should always unmount/mount if ReCreate flag is set', () => {
    const spyObj = { fn: () => {} };
    const spyObj2 = { fn: () => {} };
    const spy1 = sinon.spy(spyObj, 'fn');
    const spy2 = sinon.spy(spyObj2, 'fn');

    const div = createVNode(VNodeFlags.HtmlElement | VNodeFlags.ReCreate, 'div', null, createTextVNode('1'), ChildFlags.HasVNodeChildren, null, null, spy1);

    render(div, container);

    let firstDiv = container.firstChild;

    expect(container.innerHTML).toEqual('<div>1</div>');
    expect(spy1.callCount).toBe(1);
    expect(spy1.getCall(0).args.length).toBe(1);
    expect(spy1.getCall(0).args[0]).toEqual(firstDiv);

    const div2 = createVNode(VNodeFlags.HtmlElement | VNodeFlags.ReCreate, 'div', null, createTextVNode('1'), ChildFlags.HasVNodeChildren, null, null, spy2);

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
