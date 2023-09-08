import {
  Component,
  createRef,
  forwardRef,
  type RefObject,
  render,
} from 'inferno';

describe('Forward Ref', () => {
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

  it('Should be possible to forward createRef', () => {
    const FancyButton = forwardRef((props, ref) => (
      <button ref={ref} className="FancyButton">
        {props.children}
      </button>
    ));

    expect(FancyButton.render).toBeDefined();

    class Hello extends Component {
      private readonly btn: RefObject<Element>;

      constructor(props) {
        super(props);

        // You can now get a ref directly to the DOM button:
        this.btn = createRef();
      }

      public componentDidMount() {
        expect(this.btn.current).toBe(container.querySelector('button'));
      }

      public render() {
        return <FancyButton ref={this.btn}>Click me!</FancyButton>;
      }
    }

    render(<Hello />, container);

    expect(container.innerHTML).toBe(
      '<button class="FancyButton">Click me!</button>',
    );
  });

  it('Should be possible to forward callback ref', () => {
    const FancyButton = forwardRef((props, ref) => (
      <button ref={ref} className="FancyButton">
        {props.children}
      </button>
    ));

    expect(FancyButton.render).toBeDefined();

    class Hello extends Component {
      public render() {
        return (
          <FancyButton
            ref={(btn) => {
              if (btn) {
                expect(btn).toBe(container.querySelector('button'));
              }
            }}
          >
            Click me!
          </FancyButton>
        );
      }
    }

    render(<Hello />, container);

    expect(container.innerHTML).toBe(
      '<button class="FancyButton">Click me!</button>',
    );

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to patch forwardRef component', () => {
    const FancyButton = forwardRef((props, ref) => {
      return (
        <button ref={ref} className="FancyButton">
          {props.children}
        </button>
      );
    });

    expect(FancyButton.render).toBeDefined();

    let firstVal = null;

    render(
      <FancyButton
        ref={(btn) => {
          firstVal = btn;
        }}
      >
        Click me!
      </FancyButton>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<button class="FancyButton">Click me!</button>',
    );
    expect(firstVal).not.toBe(null);

    let secondVal = null;

    render(
      <FancyButton
        ref={(btn) => {
          secondVal = btn;
        }}
      >
        Click me! 222
      </FancyButton>,
      container,
    );

    expect(firstVal).toBe(null);
    expect(secondVal).not.toBe(null);

    expect(container.innerHTML).toBe(
      '<button class="FancyButton">Click me! 222</button>',
    );
  });

  describe('Validations', () => {
    it('Should log error if input is: Component, vNode or invalid value', () => {
      const consoleSpy = spyOn(console, 'error');

      class Foobar extends Component {}

      let i = 0;

      // @ts-expect-error
      forwardRef(false);
      expect(consoleSpy.calls.count()).toEqual(++i);

      // @ts-expect-error
      forwardRef(true);
      expect(consoleSpy.calls.count()).toEqual(++i);

      // @ts-expect-error
      forwardRef({});
      expect(consoleSpy.calls.count()).toEqual(++i);

      // @ts-expect-error
      forwardRef('asd');
      expect(consoleSpy.calls.count()).toEqual(++i);

      // @ts-expect-error
      forwardRef(undefined);
      expect(consoleSpy.calls.count()).toEqual(++i);

      // @ts-expect-error
      forwardRef(8);
      expect(consoleSpy.calls.count()).toEqual(++i);

      // TODO: improve forward ref typings
      forwardRef(<div>1</div>);
      expect(consoleSpy.calls.count()).toEqual(++i);

      forwardRef(<Foobar />);
      expect(consoleSpy.calls.count()).toEqual(++i);

      // This is ok
      forwardRef(function () {
        return <div>1</div>;
      });
      expect(consoleSpy.calls.count()).toEqual(i);
    });
  });

  it('Should be possible to extent forwardRef object', () => {
    const objRef = createRef();
    const RefComponent = forwardRef((props, ref) => (
      <div ref={ref} {...props}>
        1
      </div>
    ));

    RefComponent.staticMember = 'asd';

    render(<RefComponent ref={objRef} />, container);

    expect(container.innerHTML).toBe('<div>1</div>');
    expect(objRef.current!.outerHTML).toBe('<div>1</div>');

    expect(RefComponent.staticMember).toBe('asd');
  });

  describe('Inferno specifics', () => {
    it('Should support defaultProps and defaultHooks', () => {
      function CoolStuff(props, ref) {
        return (
          <div className={props.className}>
            <span ref={ref}>{props.children}</span>
            {props.foo}
          </div>
        );
      }

      CoolStuff.defaultProps = {
        foo: 'bar',
      };
      CoolStuff.defaultHooks = {
        onComponentWillMount() {},
      };

      const spy = spyOn(CoolStuff.defaultHooks, 'onComponentWillMount');

      const ForwardCom = forwardRef(CoolStuff);

      expect(ForwardCom.render).toBe(CoolStuff);

      class Hello extends Component {
        public render() {
          return (
            <ForwardCom
              className="okay"
              ref={(btn) => {
                if (btn) {
                  expect(btn).toBe(container.querySelector('span'));
                }
              }}
            >
              <a>1</a>
            </ForwardCom>
          );
        }
      }

      render(<Hello />, container);

      expect(container.innerHTML).toBe(
        '<div class="okay"><span><a>1</a></span>bar</div>',
      );
      expect(spy.calls.count()).toBe(1);

      render(null, container);

      expect(container.innerHTML).toBe('');
    });
  });
});
