import { Component, ComponentType, createComponentVNode, createRef, createVNode, InfernoNode, linkEvent, Ref, render } from 'inferno';
import { emptyFn } from 'inferno-shared';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

describe('top level context', () => {
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

  describe('Rendering types', () => {
    it('Should render SFC jsx node', () => {
      const MyComponent = (props) => {
        return <div>{props.children}</div>;
      };

      render(<MyComponent />, container);
    });

    it('Should be possible to return string from render SFC', () => {
      const MyComponent = () => {
        return 'd';
      };

      render(<MyComponent />, container);
    });

    it('Should be possible to return number from render SFC', () => {
      const MyComponent = () => {
        return 1;
      };

      render(<MyComponent />, container);
    });

    it('Should be possible to return null from render SFC', () => {
      const MyComponent = () => {
        return null;
      };

      render(<MyComponent />, container);
    });

    describe('class component', function () {
      it('Should render jsx node - children', () => {
        class MyComponent extends Component<any, any> {
          public render(props) {
            return <div>{props.children}</div>;
          }
        }

        render(<MyComponent />, container);
      });

      it('Should ComponentType to be used as parameter for createComponentVNode', () => {
        interface TestCompProps {
          foo: number;
          children?: InfernoNode;
        }

        class TestComp extends Component<TestCompProps, any> {
          public render(props) {
            return createVNode(VNodeFlags.HtmlElement, 'div', null, props.foo, ChildFlags.HasTextChildren);
          }
        }

        function TestFuncComp(props: TestCompProps) {
          return <span>{props.foo}</span>;
        }

        function createComponent(val: number): ComponentType<{
          foo: number;
        }> {
          switch (val) {
            case 0:
              return TestComp;
            default:
              return TestFuncComp;
          }
        }

        class MyComponent extends Component<{ val: number }, any> {
          public render() {
            return createComponentVNode(VNodeFlags.ComponentUnknown, createComponent(this.props.val), { foo: 765 });
          }
        }

        render(<MyComponent val={1} />, container);

        expect(container.innerHTML).toBe('<span>765</span>');

        render(<MyComponent val={0} />, container);

        expect(container.innerHTML).toBe('<div>765</div>');
      });

      it('Should render children directly (props)', () => {
        class MyComponent extends Component<any, any> {
          public render(props) {
            return props.children;
          }
        }

        render(<MyComponent />, container);
      });

      it('Should render children directly (this)', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return this.props.children;
          }
        }

        render(<MyComponent />, container);
      });

      it('Should be possible to return string from class component render', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return 'd';
          }
        }

        render(<MyComponent />, container);
      });

      it('Should be possible to return number from class component render', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return 1;
          }
        }

        render(<MyComponent />, container);
      });

      it('Should be possible to return null from class component render', () => {
        class MyComponent extends Component<any, any> {
          public render() {
            return null;
          }
        }

        render(<MyComponent />, container);
      });

      it('Should be possible to return InfernoNode from class component render', () => {
        class FooBar extends Component<any, any> {
          public render() {
            return 'foobar';
          }
        }

        class MyComponent extends Component<any, any> {
          public render() {
            let Val: InfernoNode = <FooBar />;

            if (this.props.check) {
              Val = <div>1</div>;
            } else {
              Val = <div>{Val}</div>;
            }

            return Val;
          }
        }

        render(<MyComponent />, container);
      });
    });
  });

  describe('JSX', function () {
    it('Should allow setting events null', function () {
      render(<div onClick={null} />, container);
    });

    it('Should allow setting linkEvent as event', function () {
      const myObj: { a: number } = {
        a: 1
      };

      function myFunction(data, ev) {
        expect(data.a).toBe(1);
        expect(ev).toBeDefined();
      }

      render(<div onClick={linkEvent(myObj, myFunction)} />, container);
    });

    it('styles object', function () {
      const getColor = () => 'red';

      render(<div style={{ 'background-color': getColor() }} />, container);
    });

    it('styles as string', function () {
      render(<div style="background-color: red" />, container);
    });
  });

  describe('ChildFlags', function () {
    it('Should allow special flags on all elements', function () {
      const refObj = createRef<HTMLDivElement>();
      const text = 'foobar';
      const row = (
        <div className="floating-row-number" $HasTextChildren onClick={emptyFn}>
          {text}
        </div>
      );

      render(
        <div className="floating-row-numbers" ref={refObj} $HasVNodeChildren>
          {row}
        </div>,
        container
      );
    });

    it('Should allow special flags on SVG', function () {
      const refObj = createRef<SVGSVGElement>();
      const text = 'foobar';
      const row = (
        <div className="floating-row-number" $HasTextChildren onClick={emptyFn}>
          {text}
        </div>
      );

      render(
        <svg className="floating-row-numbers" ref={refObj} $HasVNodeChildren>
          {row}
        </svg>,
        container
      );
    });

    it('Should allow null for attributes', function () {
      const row = <div tabIndex={null}></div>;
      const aria = <div aria-activedescendant={null}></div>;

      expect(row).not.toBeNull();
      expect(aria).not.toBeNull();
    });

    it('Should allow null for ref attribute', function () {
      const obj: {
        refWrap: Ref<HTMLDivElement> | null;
      } = {
        refWrap: null
      };

      render(<div ref={obj.refWrap}></div>, container);
    });
  });

  it('Should allow setting native events null', function () {
    render(<div onclick={null} />, container);
  });

  it('Should allow setting linkEvent as native event handler', function () {
    const myObj: { a: number } = {
      a: 1
    };

    function myFunction(data, ev) {
      expect(data.a).toBe(1);
      expect(ev).toBeDefined();
    }

    render(<div onclick={linkEvent(myObj, myFunction)} />, container);
  });
});
