import {Component, InfernoChild, render, rerender} from "inferno";

describe('Components 3 (TSX)', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
  });


  describe('should render a repeating counter component with component children', () => {
    interface ValueProps {
      value: number
    }

    class Value extends Component<ValueProps> {
      constructor(props) {
        super(props);
      }

      render() {
        return <div>{this.props.value}</div>;
      }
    }

    interface RepeaterProps {
      value: number;
    }

    class Repeater extends Component<RepeaterProps> {
      render() {
        const children: InfernoChild[] = [];
        for (let i = 0; i < 3; i++) {
          children.push(<Value key={i} value={this.props.value} />);
        }

        return <div>{children}</div>;
      }
    }

    it('should correctly render as values increase', () => {
      let value = 0;

      render(<Repeater value={value} />, container);
      expect(container.innerHTML).toBe('<div><div>0</div><div>0</div><div>0</div></div>');

      value++;
      render(<Repeater value={value} />, container);
      expect(container.innerHTML).toBe('<div><div>1</div><div>1</div><div>1</div></div>');

      value++;
      render(<Repeater value={value} />, container);
      expect(container.innerHTML).toBe('<div><div>2</div><div>2</div><div>2</div></div>');
    });
  });

  describe('should render a component with component children as the only child', () => {
    class Jaska extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            <h1>Okdokfwoe</h1>
            <p>odkodwq</p>
          </div>
        );
      }
    }

    class Container extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class TestingProps extends Component {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            <Container>
              <Jaska />
            </Container>
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<TestingProps />, container);
      expect(container.innerHTML).toBe('<div><div><div><h1>Okdokfwoe</h1><p>odkodwq</p></div></div></div>');
    });
  });

  describe('should render a component with with mapped text nodes', () => {
    interface MyComponent99Props {
      isok: boolean
    }

    interface MyComponent98State {
      isok: boolean
    }

    class MyComponent98 extends Component<{}, MyComponent98State> {
      state: MyComponent98State;

      constructor(props) {
        super(props);
        this.state = {
          isok: false
        };
      }

      componentDidMount() {
        this.setState({ isok: true });
      }

      render() {
        return <MyComponent99 isok={this.state.isok} />;
      }
    }

    class MyComponent99 extends Component<MyComponent99Props> {
      constructor(props) {
        super(props);
      }

      render() {
        return (
          <div>
            isok=
            {this.props.isok ? 'true' : 'false'}
            <div>
              {this.props.isok &&
                ['a', 'b'].map((x) => {
                  return <span>{x}</span>;
                })}
            </div>
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<MyComponent98 />, container);

      expect(container.innerHTML).toBe('<div>isok=false<div></div></div>');

      rerender();

      expect(container.innerHTML).toBe('<div>isok=true<div><span>a</span><span>b</span></div></div>');
    });
  });

  describe('should render a component with conditional boolean text nodes', () => {
    interface MyComponent98State {
      isok: boolean
    }

    interface MyComponent99Props {
      isok: boolean
    }

    class MyComponent98 extends Component<{}, MyComponent98State> {
      state: MyComponent98State;

      constructor(props) {
        super(props);
        this.state = {
          isok: false
        };
      }

      componentDidMount() {
        this.setState({ isok: true });
      }

      render() {
        return <MyComponent99 isok={this.state.isok} />;
      }
    }

    class MyComponent99 extends Component<MyComponent99Props> {
      constructor(props) {
        super(props);
      }

      render() {
        const z = function (v) {
          if (v) {
            return <span>a</span>;
          } else {
            return <span>b</span>;
          }
        };

        return (
          <div>
            <div>{z(this.props.isok)}</div>
          </div>
        );
      }
    }

    it('should correctly render', (done) => {
      render(<MyComponent98 />, container);
      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><div><span>a</span></div></div>');
        done();
      }, 25);
    });
  });

  const StatelessComponent2 = (props) => <div>{props.name}</div>;

  it('should render stateless component', () => {
    render(<StatelessComponent2 name="A" />, container);
    expect(container.textContent).toBe('A');
  });

  it('should unmount stateless component', function () {
    render(<StatelessComponent2 name="A" />, container);
    expect(container.textContent).toBe('A');

    render(null, container);
    expect(container.textContent).toBe('');
  });

  it('should support module pattern components', function () {
    function Child({ test }) {
      return <div>{test}</div>;
    }

    render(<Child test="test" />, container);

    expect(container.textContent).toBe('test');
  });

  describe('should render a component with a conditional list that changes upon toggle', () => {
    class BuggyRender extends Component<{}, {empty: boolean}> {
      state: {empty: boolean};

      constructor(props) {
        super(props);

        this.state = {
          empty: true
        };

        this.toggle = this.toggle.bind(this);
      }

      toggle() {
        this.setState({
          empty: !this.state.empty
        });
      }

      render() {
        return (
          <div>
            <button onClick={this.toggle}>Empty</button>
            <ul>
              {(() => {
                if (this.state.empty === true) {
                  return <li>No cars!</li>;
                } else {
                  return ['BMW', 'Volvo', 'Saab'].map(function (car) {
                    return <li>{car}</li>;
                  });
                }
              })()}
            </ul>
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<BuggyRender />, container);
      expect(container.innerHTML).toBe('<div><button>Empty</button><ul><li>No cars!</li></ul></div>');
    });

    it('should handle update upon click', () => {
      render(<BuggyRender />, container);
      const buttons = container.querySelectorAll('button');

      for (const button of buttons) {
        button.click();
      }

      expect(container.innerHTML).toBe('<div><button>Empty</button><ul><li>BMW</li><li>Volvo</li><li>Saab</li></ul></div>');
    });
  });

  describe('should render a component with a list that instantly changes', () => {
    interface ChangeChildrenCountState {
      list: string[]
    }
    class ChangeChildrenCount extends Component<{}, ChangeChildrenCountState> {
      state: ChangeChildrenCountState;

      constructor(props) {
        super(props);

        this.state = {
          list: ['1', '2', '3', '4']
        };

        this.handleClick = this.handleClick.bind(this);
      }

      handleClick() {
        this.setState({
          list: ['1']
        });
      }

      render() {
        return (
          <div>
            <button onClick={this.handleClick}>1</button>
            {this.state.list.map(function (_x, i) {
              return <div>{i}</div>;
            })}
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<ChangeChildrenCount />, container);
      expect(container.innerHTML).toBe('<div><button>1</button><div>0</div><div>1</div><div>2</div><div>3</div></div>');
    });

    it('should handle update upon click', (done) => {
      render(<ChangeChildrenCount />, container);
      const buttons = container.querySelectorAll('button');

      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><button>1</button><div>0</div></div>');
        done();
      }, 10);
    });
  });

  describe('should render a stateless component with context', () => {
    const StatelessComponent3 = ({ value }, { fortyTwo }) => (
      <p>
        {value}-{fortyTwo || 'ERROR'}
      </p>
    );

    interface FirstState {
      counter: number
    }

    class First extends Component<{}, FirstState> {
      state: FirstState;

      constructor(props, context) {
        super(props, context);

        this.state = {
          counter: 0
        };

        this._onClick = this._onClick.bind(this);
      }

      _onClick() {
        this.setState({
          counter: 1
        });
      }

      getChildContext() {
        return {
          fortyTwo: 42
        };
      }

      render() {
        return (
          <div>
            <button onClick={this._onClick}>Increase! {this.state.counter}</button>
            <StatelessComponent3 value={this.state.counter} />
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<First />, container);
      expect(container.innerHTML).toBe('<div><button>Increase! 0</button><p>0-42</p></div>');
    });

    it('should handle update upon click', (done) => {
      render(<First />, container);
      const buttons = container.querySelectorAll('button');

      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><button>Increase! 1</button><p>1-42</p></div>');
        done();
      }, 10);
    });
  });

  describe('should render a conditional stateless component', () => {
    const StatelessComponent4 = ({ value }) => <p>{value}</p>;

    interface FirstState {
      counter: number
    }

    class First extends Component<{}, FirstState> {
      state: FirstState;
      private condition: boolean;

      constructor(props) {
        super(props);

        this.state = {
          counter: 0
        };

        this.condition = true;
        this._onClick = this._onClick.bind(this);
      }

      _onClick() {
        this.setState({
          counter: 1
        });
      }

      render() {
        return (
          <div>
            <button onClick={this._onClick}>Increase! {this.state.counter}</button>
            {this.condition ? <StatelessComponent4 value={this.state.counter} /> : null}
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<First />, container);
      expect(container.innerHTML).toBe('<div><button>Increase! 0</button><p>0</p></div>');
    });

    it('should handle update upon click', (done) => {
      render(<First />, container);
      const buttons = container.querySelectorAll('button');

      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><button>Increase! 1</button><p>1</p></div>');
        done();
      }, 10);
    });
  });

  describe('should render stateless component correctly when changing states', () => {
    let firstDiv, secondDiv;

    beforeEach(function () {
      firstDiv = document.createElement('div');
      secondDiv = document.createElement('div');

      container.appendChild(firstDiv);
      container.appendChild(secondDiv);
    });

    afterEach(function () {
      render(null, firstDiv);
      render(null, secondDiv);
    });

    const StatelessComponent = ({ value }) => <p>{value}</p>;

    interface FirstState {
      counter: number
    }

    class First extends Component<{name: string}, FirstState> {
      state: FirstState;
      private condition: boolean;

      constructor(props) {
        super(props);

        this.state = {
          counter: 0
        };

        this.condition = true;
        this._onClick = this._onClick.bind(this);
      }

      _onClick() {
        this.setState({
          counter: 1
        });
      }

      render() {
        return (
          <div>
            <button onClick={this._onClick}>
              {this.props.name} {this.state.counter}
            </button>
            {this.condition ? <StatelessComponent value={this.state.counter} /> : null}
          </div>
        );
      }
    }

    it('should correctly render', () => {
      render(<First name="guy1" />, firstDiv);
      render(<First name="guy2" />, secondDiv);

      expect(container.innerHTML).toBe('<div><div><button>guy1 0</button><p>0</p></div></div><div><div><button>guy2 0</button><p>0</p></div></div>');
    });

    it('should handle update when changing first component', (done) => {
      render(<First name="guy1" />, firstDiv);
      render(<First name="guy2" />, secondDiv);

      const buttons = firstDiv.querySelectorAll('button');
      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><div><button>guy1 1</button><p>1</p></div></div><div><div><button>guy2 0</button><p>0</p></div></div>');
        done();
      }, 10);
    });

    it('should handle update when changing second component', (done) => {
      render(<First name="guy1" />, firstDiv);
      render(<First name="guy2" />, secondDiv);

      const buttons = secondDiv.querySelectorAll('button');
      for (const button of buttons) {
        button.click();
      }

      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><div><button>guy1 0</button><p>0</p></div></div><div><div><button>guy2 1</button><p>1</p></div></div>');
        done();
      }, 10);
    });
  });

  describe('updating child should not cause rendering parent to fail', () => {
    it('should render parent correctly after child changes', (done) => {
      let updateParent, updateChild;

      interface ParentState {
        x: boolean
      }

      class Parent extends Component<{}, ParentState> {
        state: ParentState;

        constructor(props) {
          super(props);
          this.state = { x: false };

          updateParent = () => {
            this.setState({ x: true });
          };
        }

        render() {
          return (
            <div>
              <p>parent</p>
              {!this.state.x ? <ChildA /> : <ChildB />}
            </div>
          );
        }
      }


      class ChildB extends Component {
        constructor(props) {
          super(props);
        }

        render() {
          return <div>Y</div>;
        }
      }

      interface ChildAState {
        z: boolean
      }

      class ChildA extends Component<{}, ChildAState> {
        state: ChildAState;

        constructor(props) {
          super(props);
          this.state = { z: false };

          updateChild = () => {
            this.setState({ z: true });
          };
        }

        render() {
          if (!this.state.z) {
            return <div>A</div>;
          }
          return <SubChild />;
        }
      }

      class SubChild extends Component {
        constructor(props) {
          super(props);
        }

        render() {
          return <div>B</div>;
        }
      }

      render(<Parent />, container);
      expect(container.innerHTML).toBe('<div><p>parent</p><div>A</div></div>');
      updateChild();
      setTimeout(() => {
        expect(container.innerHTML).toBe('<div><p>parent</p><div>B</div></div>');
        updateParent();
        setTimeout(() => {
          expect(container.innerHTML).toBe('<div><p>parent</p><div>Y</div></div>');
          done();
        }, 10);
      }, 10);
    });
  });
})
