import { Component, createTextVNode, createVNode, render, rerender } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

describe('rendering routine', () => {
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

  it('Should throw error when trying to render to document.body', () => {
    const div = createVNode(VNodeFlags.HtmlElement, 'div', null, createTextVNode('1'), ChildFlags.HasVNodeChildren);
    try {
      render(div, document.body);
    } catch (e) {
      expect(e.message).toEqual('Inferno Error: you cannot render() to the "document.body". Use an empty element as a container instead.');
    }
  });

  it('Should throw error if second parameter is not given', () => {
    expect(() => render(<div>1</div>, null)).toThrow();
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
      public render() {
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
    const spy = spyOn(console, 'error');

    render(<div>foo</div>, container);
    expect(container.innerHTML).toBe('<div>foo</div>');

    render(null, container);
    expect(container.innerHTML).toBe('');
    expect(spy.calls.count()).toBe(0);

    render(<div>bar</div>, container);
    expect(container.innerHTML).toBe('<div>bar</div>');

    expect(spy.calls.count()).toBe(0);
  });

  it('Should be possible to render Immutable datastructures', () => {
    function Clock(props) {
      const time = props.time + 1;
      const array = Object.freeze([<span>{'Inferno version:'}</span>, <br />, <span>{time}</span>]);
      return <div>{array}</div>;
    }

    const spy = spyOn(console, 'error');

    render(<Clock time={1} />, container);
    expect(container.innerHTML).toBe('<div><span>Inferno version:</span><br><span>2</span></div>');

    render(<Clock time={2} />, container);
    expect(container.innerHTML).toBe('<div><span>Inferno version:</span><br><span>3</span></div>');

    render(<Clock time={3} />, container);
    expect(container.innerHTML).toBe('<div><span>Inferno version:</span><br><span>4</span></div>');
    expect(spy.calls.count()).toBe(0);

    render(null, container);
    expect(container.innerHTML).toBe('');

    expect(spy.calls.count()).toBe(0);
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

  describe('className', () => {
    it('Should override destructured property when defined', function () {
      const testObj = {
        className: 'test'
      };

      render(<div {...testObj} className="bar" />, container);

      expect(container.innerHTML).toEqual('<div class="bar"></div>');
    });
  });

  describe('Swapping children', () => {
    it('Swapping children in component should affect hoisted children', () => {
      interface HelloProps {
        name: string;
      }

      class Hello extends Component<HelloProps> {
        public render(props) {
          const child = props.children;

          child.reverse();

          return <div>Hello {child}</div>;
        }
      }

      const data = [1, 2];

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

  // https://jsfiddle.net/Ldqyu475/
  describe('render during component construction', () => {
    it('Should queue updates and not fail if HOC updates during child component construction', () => {
      interface HelloProps {
        name?: string;
        tag: number;
        callback: () => void;
      }
      interface HelloState {
        foo: string;
      }

      class Hello extends Component<HelloProps, HelloState> {
        public state: HelloState;
        constructor(props, context) {
          super(props, context);

          this.state = { foo: 'foobar' };

          // expect(container.innerHTML).toBe('');
          expect(this.props.tag).toBe(0);
          props.callback();
          // expect(container.innerHTML).toBe('');
          expect(this.props.tag).toBe(0);
          props.callback();
          // expect(container.innerHTML).toBe('');
          expect(this.props.tag).toBe(0);
          props.callback();
          // expect(container.innerHTML).toBe('');
          expect(this.props.tag).toBe(0);
        }

        public render() {
          return (
            <div>
              Hello {this.props.name} {this.props.tag} {this.state.foo}
            </div>
          );
        }
      }

      interface HOCProps {
        name?: string;
        renderAgain: () => void;
      }

      interface HOCState {
        tag: number;
      }

      class HOC extends Component<HOCProps, HOCState> {
        public state: HOCState;

        constructor(props, context) {
          super(props, context);

          this.state = { tag: 0 };

          this.renderAgain = this.renderAgain.bind(this);
        }

        public renderAgain() {
          this.props.renderAgain();
        }

        public render() {
          return (
            <div>
              {this.state.tag > 0 ? <div>1</div> : null}
              {this.state.tag > 1 ? <div>1</div> : null}
              <Hello name={this.props.name} tag={this.state.tag} callback={this.renderAgain} />
              <span>2</span>
            </div>
          );
        }
      }

      interface ParentState {
        foo: boolean;
      }

      class Parent extends Component<unknown, ParentState> {
        public state: ParentState;
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: false
          };
        }
        public render() {
          return (
            <span id="click" onClick={() => this.setState({ foo: !this.state.foo })}>
              {this.state.foo ? <HOC renderAgain={() => this.setState({})} /> : null}
            </span>
          );
        }
      }

      render(<Parent />, container);

      expect(container.innerHTML).toBe('<span id="click"></span>');

      container.querySelector('#click').click();
      rerender();

      expect(container.innerHTML).toBe('<span id="click"><div><div>Hello  0 foobar</div><span>2</span></div></span>');

      container.querySelector('#click').click();
      rerender();

      expect(container.innerHTML).toBe('<span id="click"></span>');
    });
  });
});
