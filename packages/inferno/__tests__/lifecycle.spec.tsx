import { Component, render, rerender } from 'inferno';

describe('ComponentDidUpdate', () => {
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

  it('Should be called after ref updates, Github #1374 Github#1286', () => {
    class App extends Component {
      public state = {
        toggled: false,
      };

      private dynamicEl: HTMLDivElement | null;
      private staticEl: HTMLDivElement | null;

      public toggleDynamicComponent = () => {
        this.setState({
          toggled: !this.state.toggled,
        });
      };

      public renderDynamicComponent = () => (
        <div
          id="dynamic"
          ref={(el) => {
            this.dynamicEl = el;
          }}
        >
          <p>Dynamic component!</p>
        </div>
      );

      public componentDidUpdate() {
        const dynamic = container.querySelector('#dynamic');

        expect(this.dynamicEl).toBe(dynamic);
        if (this.state.toggled) {
          expect(dynamic).not.toBeNull();
        } else {
          expect(dynamic).toBeNull();
        }

        expect(this.staticEl).toBe(container.querySelector('#static'));
      }

      public render() {
        return (
          <div
            id="static"
            ref={(el) => {
              this.staticEl = el;
            }}
          >
            {this.state.toggled && this.renderDynamicComponent()}
            <button onClick={this.toggleDynamicComponent}>
              Toggle dynamic component
            </button>
          </div>
        );
      }
    }

    render(<App />, container);

    const button = container.querySelector('button');

    button.click();
    button.click();
    button.click();
    button.click();
  });

  it('Should unmount refs parent first', () => {
    const spyer = jasmine.createSpy();

    class Mounter extends Component {
      public componentDidMount() {
        spyer('child-didmount');
      }

      public componentWillUnmount() {
        spyer('child-willunmount');
      }
    }

    interface AppProps {
      child?: boolean;
    }

    class App extends Component<AppProps> {
      public componentDidMount() {
        spyer('parent-didmount');
      }

      public componentWillUnmount() {
        spyer('parent-willunmount');
      }

      public render() {
        return (
          <div
            id="outer"
            ref={(el) => {
              // Create new function on purpose to trigger changes
              spyer('outer-' + (el ? el.id : null));
            }}
          >
            <div
              id="inner"
              ref={(el) => {
                // Create new function on purpose to trigger changes
                spyer('inner-' + (el ? el.id : null));
              }}
            >
              {this.props.child ? <Mounter /> : null}
            </div>
          </div>
        );
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(3);
    expect(spyer.calls.argsFor(0)).toEqual(['inner-inner']);
    expect(spyer.calls.argsFor(1)).toEqual(['outer-outer']);
    expect(spyer.calls.argsFor(2)).toEqual(['parent-didmount']);

    render(<App child={true} />, container);

    expect(spyer.calls.argsFor(3)).toEqual(['inner-null']);
    expect(spyer.calls.argsFor(4)).toEqual(['outer-null']);
    expect(spyer.calls.argsFor(5)).toEqual(['child-didmount']);
    expect(spyer.calls.argsFor(6)).toEqual(['inner-inner']);
    expect(spyer.calls.argsFor(7)).toEqual(['outer-outer']);

    expect(spyer).toHaveBeenCalledTimes(8);

    render(<App child={false} />, container);

    expect(spyer.calls.argsFor(8)).toEqual(['child-willunmount']);
    expect(spyer.calls.argsFor(9)).toEqual(['inner-null']);
    expect(spyer.calls.argsFor(10)).toEqual(['outer-null']);
    expect(spyer.calls.argsFor(11)).toEqual(['inner-inner']);
    expect(spyer.calls.argsFor(12)).toEqual(['outer-outer']);

    expect(spyer).toHaveBeenCalledTimes(13);

    render(<App child={true} />, container);

    expect(spyer.calls.argsFor(13)).toEqual(['inner-null']);
    expect(spyer.calls.argsFor(14)).toEqual(['outer-null']);
    expect(spyer.calls.argsFor(15)).toEqual(['child-didmount']);
    expect(spyer.calls.argsFor(16)).toEqual(['inner-inner']);
    expect(spyer.calls.argsFor(17)).toEqual(['outer-outer']);

    expect(spyer).toHaveBeenCalledTimes(18);

    render(null, container);

    expect(spyer.calls.argsFor(18)).toEqual(['parent-willunmount']);
    expect(spyer.calls.argsFor(19)).toEqual(['outer-null']);
    expect(spyer.calls.argsFor(20)).toEqual(['inner-null']);
    expect(spyer.calls.argsFor(21)).toEqual(['child-willunmount']);

    expect(spyer).toHaveBeenCalledTimes(22);
  });

  // https://jsfiddle.net/3ja27qw5/
  it('Should unmount refs parent first - variation 2', () => {
    const spyer = jasmine.createSpy();

    class Mounter extends Component {
      public componentDidMount() {
        spyer('child-didmount');
      }

      public componentWillUnmount() {
        spyer('child-willunmount');
      }
    }

    interface AppProps {
      child?: boolean;
    }

    class App extends Component<AppProps> {
      public componentDidMount() {
        spyer('parent-didmount');
      }

      public componentWillUnmount() {
        spyer('parent-willunmount');
      }

      public render() {
        return (
          <div
            id="outer"
            ref={(el) => {
              // Create new function on purpose to trigger changes
              spyer('outer-' + (el ? el.id : null));
            }}
          >
            <Mounter />
            <div
              id="inner"
              ref={(el) => {
                // Create new function on purpose to trigger changes
                spyer('inner-' + (el ? el.id : null));
              }}
            >
              {this.props.child ? <Mounter /> : null}
            </div>
          </div>
        );
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(4);
    expect(spyer.calls.argsFor(0)).toEqual(['child-didmount']);
    expect(spyer.calls.argsFor(1)).toEqual(['inner-inner']);
    expect(spyer.calls.argsFor(2)).toEqual(['outer-outer']);
    expect(spyer.calls.argsFor(3)).toEqual(['parent-didmount']);

    render(<App child={true} />, container);

    expect(spyer.calls.argsFor(4)).toEqual(['inner-null']);
    expect(spyer.calls.argsFor(5)).toEqual(['outer-null']);
    expect(spyer.calls.argsFor(6)).toEqual(['child-didmount']);
    expect(spyer.calls.argsFor(7)).toEqual(['inner-inner']);
    expect(spyer.calls.argsFor(8)).toEqual(['outer-outer']);

    render(null, container);

    expect(spyer.calls.argsFor(9)).toEqual(['parent-willunmount']);
    expect(spyer.calls.argsFor(10)).toEqual(['outer-null']);
    expect(spyer.calls.argsFor(11)).toEqual(['child-willunmount']);
    expect(spyer.calls.argsFor(12)).toEqual(['inner-null']);
    expect(spyer.calls.argsFor(13)).toEqual(['child-willunmount']);

    expect(spyer).toHaveBeenCalledTimes(14);
  });

  it('Should not call setState callback if another component triggers setState during other tree mount', () => {
    // This is only to simplify whats going on in real application
    const testHack = {
      callback: () => {},
    };

    let callbackCalled = 0;
    let setState1Called = 0;
    let setState2Called = 0;

    class Another extends Component {
      constructor(props, context) {
        super(props, context);

        testHack.callback = () => {
          callbackCalled++;
          this.setState({ a: 112 });
        };
      }

      public render() {
        return <div>A</div>;
      }
    }

    class TesterOne extends Component {
      constructor(props) {
        super(props);

        this.state = {
          foo: 'test',
        };
      }

      public componentWillMount() {
        this.setState(
          {
            foo: 'bar',
          },
          function () {
            setState1Called++;
            expect(this.state.foo).toBe('bar');
          },
        );

        testHack.callback();
      }

      public render() {
        return <div>Tester One</div>;
      }
    }

    interface OutsiderState {
      bool?: boolean;
    }

    class Outsider extends Component<unknown, OutsiderState> {
      public state: OutsiderState;

      constructor(props) {
        super(props);

        this.state = {
          bool: false,
        };

        this._handleClick = this._handleClick.bind(this);
      }

      public _handleClick() {
        this.setState(
          {
            bool: true,
          },
          function () {
            setState2Called++;
            expect(this.state.bool).toBe(true);
          },
        );
      }

      public render() {
        return (
          <div id="tester" onClick={this._handleClick}>
            {this.state.bool ? <TesterOne /> : <span />}
          </div>
        );
      }
    }

    class App extends Component {
      public render() {
        return (
          <div>
            <Outsider />
            <Another />
          </div>
        );
      }
    }

    render(<App />, container);

    expect(callbackCalled).toBe(0);
    expect(setState1Called).toBe(0);
    expect(setState2Called).toBe(0);

    expect(container.innerHTML).toBe(
      '<div><div id="tester"><span></span></div><div>A</div></div>',
    );

    container.querySelector('#tester').click();

    expect(callbackCalled).toBe(1);
    expect(setState1Called).toBe(1);
    expect(setState2Called).toBe(1);

    expect(container.innerHTML).toBe(
      '<div><div id="tester"><div>Tester One</div></div><div>A</div></div>',
    );
  });

  it('Should not fail if mounting subtree propagates callback to parent which renders again', () => {
    // This is only to simplify whats going on in real application
    const testHack = {
      callback: () => {},
    };

    let callbackCalled = 0;
    let setState1Called = 0;
    let setState2Called = 0;
    let mounterCounter = 0;

    interface AnotherProps {
      a: number;
    }

    class Another extends Component<AnotherProps> {
      public render() {
        return <div>A {this.props.a}</div>;
      }
    }

    interface TesterOneProps {
      a: number;
    }

    class TesterOne extends Component<TesterOneProps> {
      constructor(props) {
        super(props);

        mounterCounter++;

        this.state = {
          foo: 'test',
        };
      }

      public componentWillMount() {
        this.setState(
          {
            foo: 'bar',
          },
          function () {
            setState1Called++;
            expect(this.state.foo).toBe('bar');
          },
        );

        testHack.callback();
      }

      public render() {
        return <div>Tester One {this.props.a}</div>;
      }
    }

    interface OutsiderState {
      bool?: boolean;
    }

    interface OutsiderProps {
      a: number;
    }

    class Outsider extends Component<OutsiderProps, OutsiderState> {
      public state: OutsiderState;
      constructor(props) {
        super(props);

        this.state = {
          bool: false,
        };

        this._handleClick = this._handleClick.bind(this);
      }

      public _handleClick() {
        this.setState(
          {
            bool: true,
          },
          function () {
            setState2Called++;
            expect(this.state.bool).toBe(true);
          },
        );
      }

      public render() {
        return (
          <div id="tester" onClick={this._handleClick}>
            {this.state.bool ? (
              <TesterOne a={this.props.a} />
            ) : (
              <span>{this.props.a}</span>
            )}
          </div>
        );
      }
    }

    interface AppState {
      a: number;
    }

    class App extends Component<unknown, AppState> {
      public state: AppState;
      constructor(props) {
        super(props);

        this.state = {
          a: 0,
        };

        testHack.callback = () => {
          callbackCalled++;
          this.setState({ a: 112 });
        };
      }

      public render() {
        return (
          <div>
            <Outsider a={this.state.a} />
            <Another a={this.state.a} />
          </div>
        );
      }
    }

    render(<App />, container);

    expect(mounterCounter).toBe(0);
    expect(callbackCalled).toBe(0);
    expect(setState1Called).toBe(0);
    expect(setState2Called).toBe(0);

    expect(container.innerHTML).toBe(
      '<div><div id="tester"><span>0</span></div><div>A 0</div></div>',
    );

    container.querySelector('#tester').click();

    rerender();

    expect(mounterCounter).toBe(1);
    expect(callbackCalled).toBe(1);
    expect(setState1Called).toBe(1);
    expect(setState2Called).toBe(1);

    expect(container.innerHTML).toBe(
      '<div><div id="tester"><div>Tester One 112</div></div><div>A 112</div></div>',
    );
  });
});
