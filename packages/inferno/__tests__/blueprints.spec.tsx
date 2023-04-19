import { Component, render } from 'inferno';

describe('Blueprints (JSX)', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    document.body.removeChild(container);
    container = null;
  });

  describe('Should have parentDOM defined #1', () => {
    class A extends Component {
      public render() {
        return <div>A</div>;
      }
    }

    class B extends Component {
      public render() {
        return <span>B</span>;
      }
    }

    interface CounterProps {
      car: string;
    }

    interface CounterState {
      bool: boolean;
    }

    class Counter extends Component<CounterProps, CounterState> {
      public state: CounterState;

      constructor(props) {
        super(props);
        this.state = {
          bool: false
        };
        this.btnCount = this.btnCount.bind(this);
      }

      public btnCount() {
        this.setState({
          bool: !this.state.bool
        });
      }

      public render() {
        return (
          <div className="my-component">
            <h1>
              {this.props.car} {this.state.bool ? <A /> : <B />}
            </h1>
            <button type="button" onClick={this.btnCount}>
              btn
            </button>
          </div>
        );
      }
    }

    class Wrapper extends Component {
      constructor(props) {
        super(props);
      }

      public render() {
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
        '<div><div class="my-component"><h1>Saab <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <span>B</span></h1><button type="button">btn</button></div></div>'
      );

      render(null, container);
    });

    it('Second render (update)', () => {
      render(<Wrapper />, container);
      const buttons = container.querySelectorAll('button');
      buttons.forEach((button) => button.click());

      expect(container.innerHTML).toBe(
        '<div><div class="my-component"><h1>Saab <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <div>A</div></h1><button type="button">btn</button></div></div>'
      );
      render(null, container);
    });
  });

  describe('Infinite loop issue', () => {
    it('Should not get stuck when doing setState from ref callback', (done) => {
      interface AProps {
        open?: boolean;
      }

      interface AState {
        text: string;
      }

      class A extends Component<AProps, AState> {
        public state: Readonly<AState>;

        constructor(props) {
          super(props);

          this.state = {
            text: 'foo'
          };

          this.onWilAttach = this.onWilAttach.bind(this);
        }

        public onWilAttach() {
          this.setState({
            text: 'animate'
          });
        }

        public render() {
          if (!this.props.open) {
            return null;
          }

          return <div ref={this.onWilAttach}>{this.state.text}</div>;
        }
      }

      render(<A />, container);

      render(<A open={true} />, container);
      setTimeout(() => {
        expect(container.innerHTML).toBe('<div>animate</div>');
        done();
      }, 10);
    });
  });

  describe('Refs inside components', () => {
    it('Should have refs defined when componentDidMount is called', () => {
      class Com extends Component {
        private _first: HTMLDivElement | null;
        private _second: HTMLSpanElement | null;

        constructor(props) {
          super(props);
          this._first = null;
          this._second = null;
        }

        public componentDidMount() {
          expect(this._first).not.toBe(null);
          expect(this._second).not.toBe(null);
        }

        public render() {
          return (
            <div ref={(node) => (this._first = node)}>
              <span>1</span>
              <span ref={(node) => (this._second = node)}>2</span>
            </div>
          );
        }
      }

      render(<Com />, container);
    });
  });

  describe('Spread operator and templates', () => {
    it('Should be able to update property', () => {
      interface AProps {
        disabled?: boolean;
        args?: {};
      }
      class A extends Component<AProps> {
        constructor(props) {
          super(props);
        }

        public render() {
          return (
            <div>
              <input disabled={this.props.disabled} {...this.props.args} />
            </div>
          );
        }
      }

      render(<A disabled={true} />, container);
      let input = container.querySelector('input');
      expect(input.disabled).toBe(true);

      render(<A disabled={false} />, container);
      input = container.querySelector('input');
      expect(input.disabled).toBe(false);
    });
  });
});
