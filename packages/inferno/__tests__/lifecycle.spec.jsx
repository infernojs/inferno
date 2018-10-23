import { render, Component } from 'inferno';

describe('ComponentDidUpdate', () => {
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

  it('Should be called after ref updates, Github #1374 Github#1286', () => {
    class App extends Component {
      state = {
        toggled: false
      };

      toggleDynamicComponent = () =>
        this.setState({
          toggled: !this.state.toggled
        });

      renderDynamicComponent = () => (
        <div
          id="dynamic"
          ref={el => {
            this.dynamicEl = el;
          }}
        >
          <p>Dynamic component!</p>
        </div>
      );

      componentDidUpdate() {
        const dynamic = container.querySelector('#dynamic');

        expect(this.dynamicEl).toBe(dynamic);
        if (this.state.toggled) {
          expect(dynamic).not.toBeNull();
        } else {
          expect(dynamic).toBeNull();
        }

        expect(this.staticEl).toBe(container.querySelector('#static'));
      }

      render() {
        return (
          <div
            id="static"
            ref={el => {
              this.staticEl = el;
            }}
          >
            {this.state.toggled && this.renderDynamicComponent()}
            <button onClick={this.toggleDynamicComponent}>Toggle dynamic component</button>
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
      componentDidMount() {
        spyer('child-didmount');
      }

      componentWillUnmount() {
        spyer('child-willunmount');
      }
    }

    class App extends Component {
      componentDidMount() {
        spyer('parent-didmount');
      }

      componentWillUnmount() {
        spyer('parent-willunmount');
      }

      render() {
        return (
          <div
            id="outer"
            ref={el => {
              // Create new function on purpose to trigger changes
              spyer('outer-' + (el ? el.id : null));
            }}
          >
            <div
              id="inner"
              ref={el => {
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
      componentDidMount() {
        spyer('child-didmount');
      }

      componentWillUnmount() {
        spyer('child-willunmount');
      }
    }

    class App extends Component {
      componentDidMount() {
        spyer('parent-didmount');
      }

      componentWillUnmount() {
        spyer('parent-willunmount');
      }

      render() {
        return (
          <div
            id="outer"
            ref={el => {
              // Create new function on purpose to trigger changes
              spyer('outer-' + (el ? el.id : null));
            }}
          >
            <Mounter />
            <div
              id="inner"
              ref={el => {
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
    let testHack = {
      callback: null
    };

    let callbackCalled = 0;
    let setState1Called = 0;
    let setState2Called = 0;

    class Another extends Component {
      constructor(props, context) {
        super(props, context);

        testHack.callback = () => {
          callbackCalled++;
          this.setState({a: 112});
        }
      }

      render() {
        return (
          <div>
            A
          </div>
        );
      }
    }

    class TesterOne extends Component {
      constructor(props) {
        super(props);

        this.state = {
          foo: 'test'
        };
      }

      componentWillMount() {
        this.setState({
          foo: 'bar'
        }, function () {
          setState1Called++;
          expect(this.state.foo).toBe('bar');
        });

        testHack.callback();
      }

      render() {
        return (
          <div>
            Tester One
          </div>
        )
      }
    }

    class Outsider extends Component {
      constructor(props) {
        super(props);

        this.state = {
          bool: false
        };

        this._handleClick = this._handleClick.bind(this);
      }

      _handleClick() {
        this.setState({
          bool: true
        }, function () {
          setState2Called++;
          expect(this.state.bool).toBe(true);
        })
      }

      render() {
        return (
          <div id="tester" onClick={this._handleClick}>
            {this.state.bool ? (
              <TesterOne/>
            ) : <span/>}
          </div>
        )
      }
    }

    class App extends Component {
      render() {
        return (
          <div>
            <Outsider/>
            <Another/>
          </div>
        )
      }
    }

    render(<App/>, container);


    expect(callbackCalled).toBe(0);
    expect(setState1Called).toBe(0);
    expect(setState2Called).toBe(0);

    expect(container.innerHTML).toBe('<div><div id="tester"><span></span></div><div>A</div></div>');

    container.querySelector('#tester').click();

    expect(callbackCalled).toBe(1);
    expect(setState1Called).toBe(1);
    expect(setState2Called).toBe(1);

    expect(container.innerHTML).toBe('<div><div id="tester"><div>Tester One</div></div><div>A</div></div>');
  });
});
