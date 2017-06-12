import { render } from "inferno";
import Component from "inferno-component";
import { innerHTML } from "inferno-utils";

describe("Blueprints (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    document.body.removeChild(container);
    container = null;
  });

  describe("Should have parentDOM defined #1", () => {
    class A extends Component {
      render() {
        return <div>A</div>;
      }
    }

    class B extends Component {
      render() {
        return <span>B</span>;
      }
    }

    class Counter extends Component {
      constructor(props) {
        super(props);
        this.state = {
          bool: false
        };
        this.btnCount = this.btnCount.bind(this);
      }

      btnCount() {
        this.setState({
          bool: !this.state.bool
        });
      }

      render() {
        return (
          <div className="my-component">
            <h1>{this.props.car} {this.state.bool ? <A /> : <B />}</h1>
            <button type="button" onClick={this.btnCount}>btn</button>
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
            {["Saab", "Volvo", "BMW"].map(function(c) {
              return <Counter car={c} />;
            })}
          </div>
        );
      }
    }

    it("Initial render (creation)", () => {
      render(<Wrapper />, container);

      expect(container.innerHTML).toBe(
        innerHTML(
          '<div><div class="my-component"><h1>Saab <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <span>B</span></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <span>B</span></h1><button type="button">btn</button></div></div>'
        )
      );

      render(null, container);
    });

    it("Second render (update)", done => {
      render(<Wrapper />, container);
      const buttons = Array.prototype.slice.call(
        container.querySelectorAll("button")
      );
      buttons.forEach(button => button.click());

      // requestAnimationFrame is needed here because
      // setState fires after a requestAnimationFrame
      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(
          innerHTML(
            '<div><div class="my-component"><h1>Saab <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>Volvo <div>A</div></h1><button type="button">btn</button></div><div class="my-component"><h1>BMW <div>A</div></h1><button type="button">btn</button></div></div>'
          )
        );
        render(null, container);
        done();
      });
    });
  });

  describe("Infinite loop issue", () => {
    it("Should not get stuck when doing setState from ref callback", done => {
      class A extends Component {
        constructor(props) {
          super(props);

          this.state = {
            text: "foo"
          };

          this.onWilAttach = this.onWilAttach.bind(this);
        }

        onWilAttach(node) {
          // Do something with node and setState
          this.setState({
            text: "animate"
          });
        }

        render() {
          if (!this.props.open) {
            return null;
          }

          return (
            <div ref={this.onWilAttach}>
              {this.state.text}
            </div>
          );
        }
      }

      render(<A />, container);

      render(<A open={true} />, container);
      setTimeout(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>animate</div>"));
        done();
      }, 10);
    });
  });

  describe("Refs inside components", () => {
    it("Should have refs defined when componentDidMount is called", () => {
      class Com extends Component {
        constructor(props) {
          super(props);
          this._first = null;
          this._second = null;
        }

        componentDidMount() {
          expect(this._first).not.toBe(null);
          expect(this._second).not.toBe(null);
        }

        render() {
          return (
            <div ref={node => (this._first = node)}>
              <span>1</span>
              <span ref={node => (this._second = node)}>2</span>
            </div>
          );
        }
      }

      render(<Com />, container);
    });
  });

  describe("Spread operator and templates", () => {
    it("Should be able to update property", () => {
      class A extends Component {
        constructor(props) {
          super(props);
        }

        render() {
          return (
            <div>
              <input disabled={this.props.disabled} {...this.props.args} />
            </div>
          );
        }
      }

      render(<A disabled={true} />, container);
      let input = container.querySelector("input");
      expect(input.disabled).toBe(true);

      render(<A disabled={false} />, container);
      input = container.querySelector("input");
      expect(input.disabled).toBe(false);
    });
  });
});
