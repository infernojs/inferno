import { Component, render } from 'inferno';

describe('Components 1 (JSX)', () => {
  let container;
  let attachedListener: () => void = () => {};
  let renderedName: string | null = null;

  interface InnerProps {
    onClick: () => void;
    name: null | string;
  }

  class Inner extends Component<InnerProps> {
    render() {
      attachedListener = this.props.onClick;
      renderedName = this.props.name;
      return <div className={this.props.name} />;
    }
  }

  beforeEach(function () {
    attachedListener = () => {};
    renderedName = null;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
  });

  class BasicComponent1 extends Component<{ name: any; title: any }> {
    render() {
      return (
        <div className="basic">
          <span className={this.props.name}>
            The title is {this.props.title}
          </span>
        </div>
      );
    }
  }

  it('should render a basic component jsx', () => {
    render(
      <div>
        <BasicComponent1 title="abc" name="basic-render" />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>',
    );

    render(
      <div>
        <BasicComponent1 title="abc" name="basic-render" />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>',
    );

    const attrs = { title: 'abc', name: 'basic-render2', foo: 'bar' };

    // JSX Spread Attribute
    render(
      <div>
        <BasicComponent1 {...attrs} />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render2">The title is abc</span></div></div>',
    );
  });

  class BasicComponent1b extends Component<{
    isChecked: boolean | null;
    title: string;
  }> {
    render() {
      return (
        <div className="basic">
          <label>
            <input checked={this.props.isChecked} />
            The title is {this.props.title}
          </label>
        </div>
      );
    }
  }

  it('should render a basic component with inputs', () => {
    render(
      <div>
        <BasicComponent1b title="abc" isChecked={true} />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><label><input>The title is abc</label></div></div>',
    );
    expect(container.querySelector('input').checked).toBe(true);

    render(
      <div>
        <BasicComponent1b title="123" isChecked={false} />
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<div><div class="basic"><label><input>The title is 123</label></div></div>',
    );
    expect(container.querySelector('input').checked).toBe(false);

    render(
      <div>
        <BasicComponent1b title="123" isChecked={null} />
      </div>,
      container,
    );

    render(<div />, container);

    render(
      <div>
        <BasicComponent1b title="123" isChecked={true} />
      </div>,
      container,
    );
    expect(container.querySelector('input').checked).toBe(true);
  });

  it('should render a basic component and remove property if null', () => {
    render(
      <div>
        <BasicComponent1 title="abc" name="basic-render" />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is abc</span></div></div>',
    );

    render(<div />, container);
    render(
      <div>
        <BasicComponent1 title="Hello, World!" name="basic-render" />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is Hello, World!</span></div></div>',
    );

    render(
      <div>
        <BasicComponent1 title="123" name={null} />
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span>The title is 123</span></div></div>',
    );
    render(
      <div>
        <BasicComponent1 title={[]} name={null} />
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span>The title is </span></div></div>',
    );

    render(
      <div>
        <BasicComponent1 title={null} name={null} />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span>The title is </span></div></div>',
    );

    render(
      <div>
        <BasicComponent1 title="abc" name={null} />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span>The title is abc</span></div></div>',
    );

    render(
      <div>
        <BasicComponent1 title="123" name="basic-update" />
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-update">The title is 123</span></div></div>',
    );
  });

  it('should render a basic root component', () => {
    render(<BasicComponent1 title="abc" name="basic-render" />, container);

    expect(container.firstChild.getAttribute('class')).toBe('basic');

    render(<BasicComponent1 title="abc" name="basic-render" />, container);

    expect(container.firstChild.getAttribute('class')).toBe('basic');

    render(<BasicComponent1 title="123" name="basic-update" />, container);
    expect(container.innerHTML).toBe(
      '<div class="basic"><span class="basic-update">The title is 123</span></div>',
    );
  });

  class BasicComponent2 extends Component<{ name: string; title: string }> {
    render() {
      return (
        <div className="basic">
          <span className={this.props.name}>
            The title is {this.props.title}
          </span>
          {this.props.children}
        </div>
      );
    }
  }

  it('should render a basic component with children', () => {
    render(
      <div>
        <BasicComponent2 title="abc" name="basic-render">
          <span>Im a child</span>
        </BasicComponent2>
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is abc</span><span>Im a child</span></div></div>',
    );

    render(
      <div>
        <BasicComponent2 title="123" name="basic-update">
          <span>Im a child</span>
        </BasicComponent2>
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-update">The title is 123</span><span>Im a child</span></div></div>',
    );
  });

  it('should render multiple components', () => {
    render(
      <div>
        <BasicComponent1 title="component 1" name="basic-render" />
        <BasicComponent1 title="component 2" name="basic-render" />
      </div>,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is component 1</span></div>' +
        '<div class="basic"><span class="basic-render">The title is component 2</span></div></div>',
    );

    render(
      <div>
        <BasicComponent1 title="component 1" name="basic-render" />
      </div>,
      container,
    );
    expect(container.innerHTML).toBe(
      '<div><div class="basic"><span class="basic-render">The title is component 1</span></div></div>',
    );
  });

  class BasicComponent3 extends Component<{ title?: string; styles?: any }> {
    render() {
      return (
        <div style={this.props.styles}>
          <span style={this.props.styles}>The title is {this.props.title}</span>
        </div>
      );
    }
  }

  it('should render a basic component with styling', () => {
    render(
      <BasicComponent3
        title="styled!"
        styles={{ color: 'red', 'padding-left': '10px' }}
      />,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div style="color: red; padding-left: 10px;"><span style="color: red; padding-left: 10px;">The title is styled!</span></div>',
    );

    render(<BasicComponent3 />, container);

    render(
      <BasicComponent3
        title="styled (again)!"
        styles={{ color: 'blue', 'margin-bottom': '20px' }}
      />,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div style="color: blue; margin-bottom: 20px;"><span style="color: blue; margin-bottom: 20px;">The title is styled (again)!</span></div>',
    );
  });

  it('should render a basic component and remove styling', () => {
    render(
      <BasicComponent3
        title="styled!"
        styles={{ color: 'red', 'padding-top': '20px' }}
      />,
      container,
    );

    expect(container.innerHTML).toBe(
      '<div style="color: red; padding-top: 20px;"><span style="color: red; padding-top: 20px;">The title is styled!</span></div>',
    );

    render(
      <BasicComponent3 title="styles are removed!" styles={null} />,
      container,
    );

    expect([null, '']).toContain(container.firstChild.getAttribute('style'));
    expect(container.firstChild.tagName).toEqual('DIV');
    expect(container.firstChild.firstChild.innerHTML).toEqual(
      'The title is styles are removed!',
    );
  });

  interface SuperState {
    organizations: { name: string; key: string }[];
  }

  class SuperComponent extends Component<object, SuperState> {
    state: SuperState;

    constructor(props) {
      super(props);
      this.state = {
        organizations: [
          { name: 'test1', key: '1' },
          { name: 'test2', key: '2' },
          { name: 'test3', key: '3' },
          { name: 'test4', key: '4' },
          { name: 'test5', key: '5' },
          { name: 'test6', key: '6' },
        ],
      };
    }

    render() {
      return (
        <ul class="login-organizationlist">
          {this.state.organizations.map((result) => {
            return <li>{result.name}</li>;
          })}
        </ul>
      );
    }
  }

  it('should render a basic component with a list of values from state', () => {
    render(<SuperComponent />, container);
    expect(container.innerHTML).toBe(
      '<ul class="login-organizationlist"><li>test1</li><li>test2</li><li>test3</li><li>test4</li><li>test5</li><li>test6</li></ul>',
    );
  });

  it('should render a basic component with an element and components as children', () => {
    class Navbar extends Component {
      render() {
        return (
          <ul>
            <li>Nav1</li>
          </ul>
        );
      }
    }

    class Main extends Component {
      render() {
        return (
          <div className="main">
            <Navbar />
            <div id="app" />
          </div>
        );
      }
    }

    render(<Main />, container);
  });

  function test(element, expectedTag, expectedClassName, callback) {
    render(element, container, () => {
      expect(container.firstChild).not.toBe(null);
      expect(container.firstChild.tagName).toBe(expectedTag);
      expect(container.firstChild.className).toBe(expectedClassName);
      callback();
    });
  }

  it('should only render once when setting state in componentWillMount', function (done) {
    let renderCount = 0;

    interface FooState {
      bar: string | null;
    }

    class Foo extends Component<{ initialValue: string | null }, FooState> {
      state: FooState;

      constructor(props) {
        super(props);
        this.state = { bar: props.initialValue };
      }

      componentWillMount() {
        this.setState({ bar: 'bar' });
      }

      render() {
        renderCount++;
        return <span className={this.state.bar} />;
      }
    }

    test(<Foo initialValue={null} />, 'SPAN', 'bar', () => {
      test(<Foo initialValue="foo" />, 'SPAN', 'bar', () => {
        expect(renderCount).toBe(2);
        done();
      });
    });
  });

  it('should render with null in the initial state property', function (done) {
    class Foo extends Component {
      constructor(props) {
        super(props);
        this.state = null;
      }

      render() {
        return <span />;
      }
    }

    test(<Foo />, 'SPAN', '', done);
  });

  it('should setState through an event handler', (done) => {
    interface FooState {
      bar: string | null;
    }

    class Foo extends Component<{ initialValue: string | null }, FooState> {
      state: FooState;

      constructor(props) {
        super(props);
        this.state = { bar: props.initialValue };
      }

      handleClick() {
        this.setState({ bar: 'bar' });
      }

      render() {
        return (
          <Inner name={this.state.bar} onClick={this.handleClick.bind(this)} />
        );
      }
    }

    test(<Foo initialValue="foo" />, 'DIV', 'foo', () => {
      expect(renderedName).toBe('foo');
      attachedListener();
      setTimeout(() => {
        expect(renderedName).toBe('bar');
        done();
      }, 10);
    });
  });

  it('should render using forceUpdate even when there is no state', (done) => {
    class Foo extends Component<{ initialValue: string | null }> {
      private mutativeValue: string;

      constructor(props) {
        super(props);
        this.mutativeValue = props.initialValue;
      }

      handleClick() {
        this.mutativeValue = 'bar';
        this.forceUpdate();
      }

      render() {
        return (
          <Inner
            name={this.mutativeValue}
            onClick={this.handleClick.bind(this)}
          />
        );
      }
    }

    test(<Foo initialValue="foo" />, 'DIV', 'foo', function () {
      attachedListener();
      expect(renderedName).toBe('bar');
      done();
    });
  });

  describe('should render a component with a list of children that dynamically update via setState', () => {
    interface CounterState {
      count: number;
    }

    interface CounterProps {
      car: string;
    }

    class Counter extends Component<CounterProps, CounterState> {
      state: CounterState;

      constructor(props) {
        super(props);
        this.state = {
          count: 0,
        };
        this.incrementCount = this.incrementCount.bind(this);
      }

      incrementCount() {
        this.setState({
          count: this.state.count + 1,
        });
      }

      render() {
        return (
          <div class="my-component">
            <h1>
              {this.props.car} {this.state.count}
            </h1>
            <button type="button" onClick={this.incrementCount}>
              Increment
            </button>
          </div>
        );
      }
    }

    class Wrapper extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            {['Saab', 'Volvo', 'BMW'].map(function (c) {
              return <Counter car={c} />;
            })}
          </div>
        );
      }
    }

    it('Initial render (creation)', () => {
      render(<Wrapper />, container);

      expect(container.innerHTML).toBe(
        '<div><div class="my-component"><h1>Saab 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 0</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 0</h1><button type="button">Increment</button></div></div>',
      );
    });

    it('Second render (update) #1', (done) => {
      render(<Wrapper />, container);
      const buttons = container.querySelectorAll('button');
      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe(
          '<div><div class="my-component"><h1>Saab 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>Volvo 1</h1><button type="button">Increment</button></div><div class="my-component"><h1>BMW 1</h1><button type="button">Increment</button></div></div>',
        );
        done();
      }, 25);
    });
  });

  describe('should render a component with a conditional state item', () => {
    interface SomeErrorState {
      show: boolean;
    }

    class SomeError extends Component<object, SomeErrorState> {
      state: SomeErrorState;

      constructor(props) {
        super(props);

        this.state = {
          show: false,
        };

        this.toggle = this.toggle.bind(this);
      }

      toggle() {
        this.setState({
          show: !this.state.show,
        });
      }

      render() {
        return (
          <div className="login-view bg-visma">
            <button onClick={this.toggle}>TOGGLE</button>
            <br />
            {function () {
              if (this.state.show === true) {
                return <h1>This is cool!</h1>;
              } else {
                return <h1>Not so cool</h1>;
              }
            }.call(this)}
          </div>
        );
      }
    }

    it('Initial render (creation)', () => {
      render(<SomeError />, container);

      expect(container.innerHTML).toBe(
        '<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>Not so cool</h1></div>',
      );
    });

    it('Second render (update with state change) #2', () => {
      render(<SomeError />, container);
      const buttons = container.querySelectorAll('button');
      for (const button of buttons) {
        button.click();
      }

      expect(container.innerHTML).toBe(
        '<div class="login-view bg-visma"><button>TOGGLE</button><br><h1>This is cool!</h1></div>',
      );
    });
  });

  describe('should render a stateless component with a conditional state item', () => {
    interface TestingState {
      show: boolean;
    }

    const StatelessComponent = (props) => <p>{props.name}</p>;

    class Testing extends Component<object, TestingState> {
      state: TestingState;
      // @ts-ignore
      private name: string = 'Kalle';

      constructor(props) {
        super(props);

        this.state = {
          show: false,
        };

        this.toggle = this.toggle.bind(this);
      }

      toggle() {
        this.setState({
          show: !this.state.show,
        });
      }

      render() {
        return (
          <div>
            {function () {
              if (this.state.show === true) {
                return <StatelessComponent name={this.name} />;
              } else {
                return <h1>Hello folks</h1>;
              }
            }.call(this)}
            <button onClick={this.toggle}>toggle</button>
          </div>
        );
      }
    }

    it('Initial render (creation)', () => {
      render(null, container);

      render(<Testing />, container);

      expect(container.innerHTML).toBe(
        '<div><h1>Hello folks</h1><button>toggle</button></div>',
      );
    });

    it('Second render (update with state change) #3', (done) => {
      render(<Testing />, container);
      const buttons = container.querySelectorAll('button');
      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe(
          '<div><p>Kalle</p><button>toggle</button></div>',
        );
        done();
      }, 25);
    });
  });
});
