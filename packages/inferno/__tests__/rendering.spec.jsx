import { Component, createTextVNode, createVNode, render, hydrate } from 'inferno';
import { NO_OP } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { triggerEvent } from 'inferno-utils';
import sinon from 'sinon';

describe('rendering routine', () => {
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

  it('Should throw error when trying to render to document.body', () => {
    const div = createVNode(VNodeFlags.HtmlElement, 'div', null, createTextVNode('1'), ChildFlags.HasVNodeChildren);
    try {
      render(div, document.body);
    } catch (e) {
      expect(e.message).toEqual('Inferno Error: you cannot render() to the "document.body". Use an empty element as a container instead.');
    }
  });

  it('Should do nothing if input is NO-OP', () => {
    render(NO_OP, container);
    expect(container.innerHTML).toEqual('');
  });

  it('Should create new object when dom exists', () => {
    const bar = createVNode(VNodeFlags.HtmlElement, 'div', null, createTextVNode('123'), ChildFlags.HasVNodeChildren);
    const foo = createVNode(VNodeFlags.HtmlElement, 'div', null, bar, ChildFlags.HasVNodeChildren);

    render(foo, container);
    expect(container.innerHTML).toEqual('<div><div>123</div></div>');

    render(null, container);

    render(foo, container);
    expect(container.innerHTML).toEqual('<div><div>123</div></div>');
  });

  it('should be called a callback argument', () => {
    // mounting phase
    let called = false;
    render(<div>Foo</div>, container, () => (called = true));
    expect(called).toEqual(true);

    // updating phase
    called = false;
    render(<div>Foo</div>, container, () => (called = true));
    expect(called).toEqual(true);
  });

  it('should call a callback argument when the same element is re-rendered', () => {
    class Foo extends Component {
      render() {
        return <div>Foo</div>;
      }
    }
    const element = <Foo />;

    // mounting phase
    let called = false;
    render(element, container, () => (called = true));
    expect(called).toEqual(true);

    // updating phase
    called = false;

    render(element, container, () => (called = true));

    expect(called).toEqual(true);
  });

  it('should render a component returning strings directly from render', () => {
    const Text = ({ value }) => value;

    render(<Text value="foo" />, container);
    expect(container.textContent).toEqual('foo');
  });

  it('should render a component returning numbers directly from render', () => {
    const Text = ({ value }) => value;

    render(<Text value={10} />, container);

    expect(container.textContent).toEqual('10');
  });

  it('should not crash encountering low-priority tree', () => {
    render(
      <div hidden={true}>
        <div />
      </div>,
      container
    );
  });

  it('should not warn when rendering into an empty container', () => {
    spyOn(console, 'error');

    render(<div>foo</div>, container);
    expect(container.innerHTML).toBe('<div>foo</div>');

    render(null, container);
    expect(container.innerHTML).toBe('');
    expect(console.error.calls.count()).toBe(0);

    render(<div>bar</div>, container);
    expect(container.innerHTML).toBe('<div>bar</div>');

    expect(console.error.calls.count()).toBe(0);
  });

  it('Should be possible to render Immutable datastructures', () => {
    function Clock(props) {
      let time = props.time + 1;
      const array = Object.freeze([<span>{'Inferno version:'}</span>, <br />, <span>{time}</span>]);
      return <div>{array}</div>;
    }

    spyOn(console, 'error');

    render(<Clock time={1} />, container);
    expect(container.innerHTML).toBe('<div><span>Inferno version:</span><br><span>2</span></div>');

    render(<Clock time={2} />, container);
    expect(container.innerHTML).toBe('<div><span>Inferno version:</span><br><span>3</span></div>');

    render(<Clock time={3} />, container);
    expect(container.innerHTML).toBe('<div><span>Inferno version:</span><br><span>4</span></div>');
    expect(console.error.calls.count()).toBe(0);

    render(null, container);
    expect(container.innerHTML).toBe('');

    expect(console.error.calls.count()).toBe(0);
  });

  describe('createTextVNode', () => {
    it('null/undefined textNodes should render empty text', () => {
      render(<div>{createTextVNode(null)}</div>, container);

      expect(container.innerHTML).toEqual('<div></div>');

      render(<div>{createTextVNode(undefined)}</div>, container);

      expect(container.innerHTML).toEqual('<div></div>');

      render(<div>{createTextVNode('')}</div>, container);

      expect(container.innerHTML).toEqual('<div></div>');
    });

    it('Should render 0 as "0"', () => {
      render(<div>{createTextVNode(0)}</div>, container);

      expect(container.innerHTML).toEqual('<div>0</div>');

      render(<div>{createTextVNode('0')}</div>, container);

      expect(container.innerHTML).toEqual('<div>0</div>');

      render(<div>{createTextVNode('')}</div>, container);

      expect(container.innerHTML).toEqual('<div></div>');
    });
  });

  describe('Swapping children', () => {
    it('Swapping children in component should affect hoisted children', () => {
      class Hello extends Component {
        render(props) {
          const child = props.children;

          child.reverse();

          return <div>Hello {child}</div>;
        }
      }

      let data = [1, 2];

      render(
        <div>
          <Hello name="World">{data}</Hello>
          <Hello name="World">{data}</Hello>
          <Hello name="World">{data}</Hello>
        </div>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>Hello 21</div><div>Hello 12</div><div>Hello 21</div></div>');

      render(
        <div>
          <Hello name="World">{data}</Hello>
          <Hello name="World">{data}</Hello>
          <Hello name="World">{data}</Hello>
        </div>,
        container
      );

      expect(container.innerHTML).toEqual('<div><div>Hello 12</div><div>Hello 21</div><div>Hello 12</div></div>');
    });
  });

  // hydrate should be exposed
  describe('hydrate', () => {
    it('Should be possible to hydrate manually', () => {
      // create matching DOM
      container.innerHTML = '<input type="checkbox"/>';

      let clickChecked = null;
      let changeChecked = null;

      // Hydrate manually, instead rendering
      hydrate(
        <input
          type="checkbox"
          checked={false}
          onClick={e => {
            clickChecked = e.target.checked;
          }}
          onChange={e => {
            changeChecked = e.target.checked;
          }}
        />,
        container
      );
      const input = container.firstChild;

      triggerEvent('click', input);

      expect(input.checked).toBe(false);
      expect(clickChecked).toBe(true);
      expect(changeChecked).toBe(true);
    });

    it('Should Manually hydrating should also attach root and patch when rendering next time', () => {
      // create matching DOM
      const spy = sinon.spy();
      container.innerHTML = '<div><input type="checkbox"/></div>';

      let clickChecked = null;
      let changeChecked = null;

      // Hydrate manually, instead rendering
      hydrate(
        <div ref={spy}>
          <input
            type="checkbox"
            checked={false}
            onClick={e => {
              clickChecked = e.target.checked;
            }}
            onChange={e => {
              changeChecked = e.target.checked;
            }}
          />
        </div>,
        container
      );

      const oldInput = container.firstChild.firstChild;

      expect(spy.callCount).toBe(1);

      // Hydrate manually, instead rendering
      render(
        <div ref={spy}>
          <input
            type="checkbox"
            checked={true}
            className="new-class"
            onClick={e => {
              clickChecked = e.target.checked;
            }}
            onChange={e => {
              changeChecked = e.target.checked;
            }}
          />
        </div>,
        container
      );

      expect(spy.callCount).toBe(1);

      const input = container.querySelector('input.new-class');

      expect(oldInput).toBe(input); // It should still be the same DOM node

      triggerEvent('click', input);

      expect(input.checked).toBe(true);
      expect(clickChecked).toBe(false);
      expect(changeChecked).toBe(false);

      render(null, container);

      expect(spy.callCount).toBe(2);
    });
  });
});
