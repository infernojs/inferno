import {
  createFragment,
  createTextVNode,
  createVNode,
  getChildFlags,
  render,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

// ChildFlags are kept in bits of vNode.flags, a vNode has no field of its own for them
describe('ChildFlags in vNode flags', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('should have a VNodeFlags child bit for each ChildFlags value', () => {
    const shift = VNodeFlags.ChildFlagsShift;

    expect(VNodeFlags.HasInvalidChildren).toBe(
      ChildFlags.HasInvalidChildren << shift,
    );
    expect(VNodeFlags.HasVNodeChildren).toBe(
      ChildFlags.HasVNodeChildren << shift,
    );
    expect(VNodeFlags.HasNonKeyedChildren).toBe(
      ChildFlags.HasNonKeyedChildren << shift,
    );
    expect(VNodeFlags.HasKeyedChildren).toBe(
      ChildFlags.HasKeyedChildren << shift,
    );
    expect(VNodeFlags.HasTextChildren).toBe(
      ChildFlags.HasTextChildren << shift,
    );
    expect(VNodeFlags.MultipleChildren).toBe(
      ChildFlags.MultipleChildren << shift,
    );
  });

  it('should keep the ChildFlags given to createVNode', () => {
    const cases: Array<[ChildFlags, unknown]> = [
      [ChildFlags.HasInvalidChildren, null],
      [ChildFlags.HasVNodeChildren, <span />],
      [ChildFlags.HasNonKeyedChildren, [<span />, <span />]],
      [ChildFlags.HasKeyedChildren, [<span key="a" />, <span key="b" />]],
      [ChildFlags.HasTextChildren, 'text'],
    ];

    for (let i = 0, len = cases.length; i < len; ++i) {
      const [childFlags, children] = cases[i];
      const vNode = createVNode(
        VNodeFlags.HtmlElement,
        'div',
        null,
        children as any,
        childFlags,
      );

      expect(getChildFlags(vNode)).toBe(childFlags);
      expect(vNode.flags & VNodeFlags.ChildFlagsMask).toBe(
        childFlags << VNodeFlags.ChildFlagsShift,
      );
      expect(vNode.flags & VNodeFlags.HtmlElement).toBe(VNodeFlags.HtmlElement);
    }
  });

  it('should set the ChildFlags of normalized children', () => {
    function normalized(children): ChildFlags {
      return getChildFlags(
        createVNode(
          VNodeFlags.HtmlElement,
          'div',
          null,
          children,
          ChildFlags.UnknownChildren,
        ),
      );
    }

    expect(normalized(null)).toBe(ChildFlags.HasInvalidChildren);
    expect(normalized([])).toBe(ChildFlags.HasInvalidChildren);
    expect(normalized('text')).toBe(ChildFlags.HasTextChildren);
    expect(normalized(<span />)).toBe(ChildFlags.HasVNodeChildren);
    expect(normalized([<span />, 'text'])).toBe(ChildFlags.HasKeyedChildren);
  });

  it('should set the ChildFlags of fragments and text', () => {
    expect(
      getChildFlags(createFragment(null, ChildFlags.HasInvalidChildren)),
    ).toBe(ChildFlags.HasVNodeChildren);
    expect(
      getChildFlags(createFragment('text', ChildFlags.HasTextChildren)),
    ).toBe(ChildFlags.HasNonKeyedChildren);
    expect(
      getChildFlags(
        createFragment([<span />, <span />], ChildFlags.UnknownChildren),
      ),
    ).toBe(ChildFlags.HasKeyedChildren);
    expect(getChildFlags(createTextVNode('text'))).toBe(
      ChildFlags.HasInvalidChildren,
    );
  });

  it('should not take the ChildFlags of flags copied from another vNode', () => {
    const list = createVNode(
      VNodeFlags.HtmlElement,
      'div',
      null,
      [<span key="a" />, <span key="b" />],
      ChildFlags.HasKeyedChildren,
    );
    const text = createVNode(
      list.flags,
      'div',
      null,
      'text',
      ChildFlags.HasTextChildren,
    );

    expect(getChildFlags(text)).toBe(ChildFlags.HasTextChildren);
    render(text, container);
    expect(container.innerHTML).toBe('<div>text</div>');
  });

  it('should patch an element in place when the shape of its children changes', () => {
    render(<div>text</div>, container);
    const dom = container.firstChild;

    render(<div>{[<span key="a" />, <b key="b" />]}</div>, container);
    expect(container.firstChild).toBe(dom);
    expect(container.innerHTML).toBe('<div><span></span><b></b></div>');

    render(
      <div>
        <i />
      </div>,
      container,
    );
    expect(container.firstChild).toBe(dom);
    expect(container.innerHTML).toBe('<div><i></i></div>');

    render(<div />, container);
    expect(container.firstChild).toBe(dom);
    expect(container.innerHTML).toBe('<div></div>');
  });
});
