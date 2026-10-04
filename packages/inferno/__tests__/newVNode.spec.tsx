import {
  Component,
  createComponentVNode,
  createFragment,
  createTextVNode,
  createVNode,
  forwardRef,
  newComponentVNode,
  newFragment,
  newTextVNode,
  newVNode,
  render,
  type VNode,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

// The new factories take flags with the child bit packed in, the deprecated create* factories pack it
describe('New vNode factories', () => {
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

  const childCases: Array<[VNodeFlags, () => unknown, string]> = [
    [VNodeFlags.HasInvalidChildren, () => null, '<div></div>'],
    [VNodeFlags.HasVNodeChildren, () => <span />, '<div><span></span></div>'],
    [
      VNodeFlags.HasNonKeyedChildren,
      () => [<span />, <b />],
      '<div><span></span><b></b></div>',
    ],
    [
      VNodeFlags.HasKeyedChildren,
      () => [<span key="a" />, <b key="b" />],
      '<div><span></span><b></b></div>',
    ],
    [VNodeFlags.HasTextChildren, () => 'text', '<div>text</div>'],
  ];

  function normalizedChildBit(children): number {
    return (
      newVNode(VNodeFlags.HtmlElement, 'div', null, children).flags &
      VNodeFlags.ChildFlagsMask
    );
  }

  describe('newVNode', () => {
    it('should keep the flags it is given and render the children', () => {
      for (let i = 0, len = childCases.length; i < len; ++i) {
        const [childBit, children, html] = childCases[i];
        const vNode = newVNode(
          VNodeFlags.HtmlElement | childBit,
          'div',
          null,
          children() as any,
        );

        expect(vNode.flags).toBe(VNodeFlags.HtmlElement | childBit);
        render(vNode, container);
        expect(container.innerHTML).toBe(html);
        render(null, container);
      }
    });

    it('should normalize the children when the flags have no child bit', () => {
      expect(normalizedChildBit(null)).toBe(VNodeFlags.HasInvalidChildren);
      expect(normalizedChildBit(undefined)).toBe(VNodeFlags.HasInvalidChildren);
      expect(normalizedChildBit([])).toBe(VNodeFlags.HasInvalidChildren);
      expect(normalizedChildBit('text')).toBe(VNodeFlags.HasTextChildren);
      expect(normalizedChildBit(<span />)).toBe(VNodeFlags.HasVNodeChildren);
      expect(normalizedChildBit([<span />, 'text'])).toBe(
        VNodeFlags.HasKeyedChildren,
      );
    });

    it('should set className, props, key and ref', () => {
      const ref = jasmine.createSpy('ref');
      const vNode = newVNode(
        VNodeFlags.HtmlElement | VNodeFlags.HasTextChildren,
        'div',
        'foo',
        'text',
        { id: 'bar' },
        'k',
        ref,
      );

      expect(vNode.key).toBe('k');
      render(vNode, container);
      expect(container.innerHTML).toBe('<div class="foo" id="bar">text</div>');
      expect(ref).toHaveBeenCalledWith(container.firstChild);
    });

    it('should move keyed children when patching', () => {
      function list(keys: string[]): VNode {
        return newVNode(
          VNodeFlags.HtmlElement | VNodeFlags.HasKeyedChildren,
          'ul',
          null,
          keys.map((key) =>
            newVNode(
              VNodeFlags.HtmlElement | VNodeFlags.HasTextChildren,
              'li',
              null,
              key,
              null,
              key,
            ),
          ),
        );
      }

      render(list(['a', 'b', 'c']), container);
      const first = container.firstChild.firstChild;

      render(list(['c', 'a', 'b']), container);
      expect(container.innerHTML).toBe(
        '<ul><li>c</li><li>a</li><li>b</li></ul>',
      );
      expect(container.firstChild.childNodes[1]).toBe(first);
    });
  });

  describe('newComponentVNode', () => {
    class ClassCom extends Component {
      public render() {
        return <div>class</div>;
      }
    }

    function FunctionCom() {
      return <div>function</div>;
    }

    const ForwardCom = forwardRef(function Forward() {
      return <div>forward</div>;
    });

    it('should resolve an unknown component type to flags with the child bit', () => {
      const cases: Array<[any, VNodeFlags, string]> = [
        [ClassCom, VNodeFlags.ComponentClass, '<div>class</div>'],
        [FunctionCom, VNodeFlags.ComponentFunction, '<div>function</div>'],
        [ForwardCom, VNodeFlags.ForwardRefComponent, '<div>forward</div>'],
      ];

      for (let i = 0, len = cases.length; i < len; ++i) {
        const [type, flags, html] = cases[i];
        const vNode = newComponentVNode(VNodeFlags.ComponentUnknown, type);

        expect(vNode.flags).toBe(flags | VNodeFlags.HasInvalidChildren);
        render(vNode, container);
        expect(container.innerHTML).toBe(html);
        render(null, container);
      }
    });

    it('should keep the flags of a known component type', () => {
      const vNode = newComponentVNode(
        VNodeFlags.ComponentFunction | VNodeFlags.HasInvalidChildren,
        FunctionCom,
      );

      expect(vNode.flags).toBe(
        VNodeFlags.ComponentFunction | VNodeFlags.HasInvalidChildren,
      );
      render(vNode, container);
      expect(container.innerHTML).toBe('<div>function</div>');
    });

    it('should merge defaultProps and defaultHooks', () => {
      function Defaults(props) {
        return <div>{props.a + props.b}</div>;
      }

      Defaults.defaultProps = { a: 'a', b: 'default' };
      Defaults.defaultHooks = { onComponentDidMount() {} };
      const spy = spyOn(Defaults.defaultHooks, 'onComponentDidMount');

      const vNode = newComponentVNode(VNodeFlags.ComponentUnknown, Defaults, {
        b: 'b',
      });

      expect(vNode.props).toEqual({ a: 'a', b: 'b' });
      render(vNode, container);
      expect(container.innerHTML).toBe('<div>ab</div>');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('newTextVNode', () => {
    it('should create text vNodes', () => {
      const vNode = newTextVNode('text', 'k');

      expect(vNode.flags).toBe(VNodeFlags.Text | VNodeFlags.HasInvalidChildren);
      expect(vNode.children).toBe('text');
      expect(vNode.key).toBe('k');
      expect(newTextVNode(0).children).toBe(0);
      expect(newTextVNode().key).toBe(null);
    });

    it('should turn invalid text into an empty string', () => {
      expect(newTextVNode(null).children).toBe('');
      expect(newTextVNode(undefined).children).toBe('');
      expect(newTextVNode(false).children).toBe('');
      expect(newTextVNode(true).children).toBe('');
    });
  });

  describe('newFragment', () => {
    it('should give a fragment without children an empty text child', () => {
      const fragment = newFragment(
        VNodeFlags.Fragment | VNodeFlags.HasInvalidChildren,
        null,
        'k',
      );

      expect(fragment.flags).toBe(
        VNodeFlags.Fragment | VNodeFlags.HasVNodeChildren,
      );
      expect((fragment.children as VNode).flags & VNodeFlags.Text).toBe(
        VNodeFlags.Text,
      );
      expect(fragment.key).toBe('k');
    });

    it('should put the text of a fragment into a text vNode', () => {
      const fragment = newFragment(
        VNodeFlags.Fragment | VNodeFlags.HasTextChildren,
        'text',
      );

      expect(fragment.flags).toBe(
        VNodeFlags.Fragment | VNodeFlags.HasNonKeyedChildren,
      );
      render(<div>{fragment}</div>, container);
      expect(container.innerHTML).toBe('<div>text</div>');
    });

    it('should keep keyed children of a fragment', () => {
      const children = [<span key="a" />, <b key="b" />];
      const fragment = newFragment(
        VNodeFlags.Fragment | VNodeFlags.HasKeyedChildren,
        children,
      );

      expect(fragment.flags).toBe(
        VNodeFlags.Fragment | VNodeFlags.HasKeyedChildren,
      );
      expect(fragment.children).toBe(children);
    });

    it('should normalize the children of a fragment without a child bit', () => {
      const fragment = newFragment(VNodeFlags.Fragment, [<span />, 'text']);

      expect(fragment.flags & VNodeFlags.ChildFlagsMask).toBe(
        VNodeFlags.HasKeyedChildren,
      );
      render(<div>{fragment}</div>, container);
      expect(container.innerHTML).toBe('<div><span></span>text</div>');
    });
  });

  describe('Deprecated create factories', () => {
    const childFlagsValues: Array<ChildFlags | undefined> = [
      undefined,
      ChildFlags.UnknownChildren,
      ChildFlags.HasInvalidChildren,
      ChildFlags.HasVNodeChildren,
      ChildFlags.HasNonKeyedChildren,
      ChildFlags.HasKeyedChildren,
      ChildFlags.HasTextChildren,
    ];

    function childrenFor(childFlags: ChildFlags | undefined): any {
      switch (childFlags) {
        case ChildFlags.HasVNodeChildren:
          return <span />;
        case ChildFlags.HasNonKeyedChildren:
          return [<span />, <b />];
        case ChildFlags.HasKeyedChildren:
        case ChildFlags.UnknownChildren:
          return [<span key="a" />, <b key="b" />];
        case ChildFlags.HasTextChildren:
          return 'text';
        default:
          return null;
      }
    }

    // The VNodeFlags child bit of the same name, an omitted ChildFlags is HasInvalidChildren
    function packed(childFlags: ChildFlags | undefined): VNodeFlags {
      switch (childFlags) {
        case undefined:
        case ChildFlags.HasInvalidChildren:
          return VNodeFlags.HasInvalidChildren;
        case ChildFlags.HasVNodeChildren:
          return VNodeFlags.HasVNodeChildren;
        case ChildFlags.HasNonKeyedChildren:
          return VNodeFlags.HasNonKeyedChildren;
        case ChildFlags.HasKeyedChildren:
          return VNodeFlags.HasKeyedChildren;
        case ChildFlags.HasTextChildren:
          return VNodeFlags.HasTextChildren;
        default:
          return VNodeFlags.Unknown;
      }
    }

    it('createVNode should give the flags of newVNode', () => {
      for (let i = 0, len = childFlagsValues.length; i < len; ++i) {
        const childFlags = childFlagsValues[i];

        expect(
          createVNode(
            VNodeFlags.HtmlElement,
            'div',
            null,
            childrenFor(childFlags),
            childFlags,
          ).flags,
        ).toBe(
          newVNode(
            VNodeFlags.HtmlElement | packed(childFlags),
            'div',
            null,
            childrenFor(childFlags),
          ).flags,
        );
      }
    });

    it('createFragment should give the flags of newFragment', () => {
      for (let i = 0, len = childFlagsValues.length; i < len; ++i) {
        const childFlags = childFlagsValues[i];

        expect(
          createFragment(childrenFor(childFlags), childFlags as ChildFlags)
            .flags,
        ).toBe(
          newFragment(
            VNodeFlags.Fragment | packed(childFlags),
            childrenFor(childFlags),
          ).flags,
        );
      }
    });

    it('createComponentVNode should give the flags of newComponentVNode', () => {
      function Com() {
        return null;
      }

      expect(createComponentVNode(VNodeFlags.ComponentUnknown, Com).flags).toBe(
        newComponentVNode(VNodeFlags.ComponentUnknown, Com).flags,
      );
      expect(
        createComponentVNode(VNodeFlags.ComponentFunction, Com).flags,
      ).toBe(VNodeFlags.ComponentFunction | VNodeFlags.HasInvalidChildren);
    });

    it('createTextVNode should give the vNode of newTextVNode', () => {
      const text = createTextVNode(null, 'k');

      expect(text.flags).toBe(newTextVNode(null, 'k').flags);
      expect(text.children).toBe('');
      expect(text.key).toBe('k');
    });

    it('should not take the child bits of flags copied from another vNode', () => {
      function Com() {
        return <div>com</div>;
      }
      const copied =
        VNodeFlags.ComponentFunction |
        VNodeFlags.HasKeyedChildren |
        VNodeFlags.Validated;
      const vNode = createComponentVNode(copied, Com);

      expect(vNode.flags).toBe(
        VNodeFlags.ComponentFunction | VNodeFlags.HasInvalidChildren,
      );
      render(vNode, container);
      expect(container.innerHTML).toBe('<div>com</div>');
    });
  });
});
