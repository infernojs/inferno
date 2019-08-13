import { Component, createComponentVNode, render, rerender } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';

let renderCount = 0;

class TestCWRP extends Component<any, any> {
  public state = {
    a: 0,
    b: 0
  };

  constructor(props) {
    super(props);
  }

  public componentWillReceiveProps() {
    this.setState({ a: 1 });

    expect(this.state.a).toBe(0); // It should be 0 because state is not synchronously updated
  }

  public render() {
    if (renderCount === 0) {
      expect(this.state.a).toBe(0);
    } else if (renderCount === 1) {
      expect(this.state.a).toBe(1); // Changed in CWRP
    }

    renderCount++;

    return <div>{JSON.stringify(this.state)}</div>;
  }
}

describe('state', () => {
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

  // As per React
  it('Should not have state defined in base constructor', () => {
    class Foo extends Component<any, any> {
      constructor(p, c) {
        super(p, c);

        expect(this.state).toBeNull();
      }
    }

    const f = new Foo({}, {});

    expect(f).not.toBeNull();
  });

  describe('setting state', () => {
    it('setState should apply state during componentWillReceiveProps', done => {
      render(createComponentVNode(VNodeFlags.ComponentClass, TestCWRP, {}), container);
      expect(renderCount).toBe(1);

      render(
        createComponentVNode(VNodeFlags.ComponentClass, TestCWRP, {
          foo: 1
        }),
        container
      );
      expect(renderCount).toBe(2);
      done();
    });
  });

  describe('didUpdate and setState', () => {
    it('order', done => {
      class Test extends Component<{ scrollTop: number }, any> {
        public state = {
          testScrollTop: 0
        };

        constructor(props, context) {
          super(props, context);
        }

        public componentWillReceiveProps(nextProps) {
          if (nextProps.scrollTop !== 0) {
            this.setState({ testScrollTop: nextProps.scrollTop });
          }
        }

        public componentDidUpdate(_prevProps, prevState) {
          expect(prevState.testScrollTop).toBe(0);
          expect(this.state.testScrollTop).toBe(200);
        }

        public render() {
          return <div style={{ 'background-attachment': 'scroll' }}>aa</div>;
        }
      }

      class Example extends Component<{ name: string }, { exampleScrollTop: number }> {
        public state = {
          exampleScrollTop: 0
        };

        constructor(props, context) {
          super(props, context);
        }

        public render() {
          return <Test scrollTop={this.state.exampleScrollTop} />;
        }

        public componentDidMount() {
          setTimeout(() => {
            this.setState({ exampleScrollTop: 200 });
            rerender();

            done();
          }, 50);
        }
      }

      render(<Example name="World" />, container);
    });
  });
});
