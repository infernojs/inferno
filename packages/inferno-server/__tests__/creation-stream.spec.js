import { render } from "inferno";
import createClass from "inferno-create-class";
import createElement from "inferno-create-element";
import { streamAsStaticMarkup } from "inferno-server";

import concatStream from "concat-stream-es6";
import Component from "inferno-component";

describe("SSR Root Creation Streams - (non-JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  it("should throw with invalid children", () => {
    const test = value => createElement("a", null, true);

    return streamPromise(test("foo")).catch(err => {
      expect(err.toString()).toBe("Error: invalid component");
    });
  });

  it("should use getChildContext", () => {
    const TestComponent = createClass({
      getChildContext() {
        return { hello: "world" };
      },
      render() {
        return createElement("a", null, this.context.hello);
      }
    });
    return streamPromise(createElement(TestComponent, null)).then(function(
      output
    ) {
      expect(output).toBe("<a data-infernoroot>world</a>");
    });
  });

  describe("Component hook", () => {
    it("Should allow changing state in CWM", () => {
      class Another extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: "bar"
          };
        }

        componentWillMount() {
          this.setState({
            foo: "bar2"
          });
        }

        render() {
          return createElement("div", null, this.state.foo);
        }
      }

      class Tester extends Component {
        constructor(props, context) {
          super(props, context);

          this.state = {
            foo: "bar"
          };
        }

        componentWillMount() {
          this.setState({
            foo: "bar2"
          });
        }

        render() {
          return createElement("div", null, [
            this.state.foo,
            createElement(Another)
          ]);
        }
      }

      const vDom = createElement(Tester);
      return streamPromise(vDom).then(function(output) {
        const container = document.createElement("div");
        document.body.appendChild(container);
        container.innerHTML = output;
        expect(output).toBe("<div data-infernoroot>bar2<div>bar2</div></div>");
        document.body.removeChild(container);
      });
    });
  });
});

function streamPromise(dom) {
  return new Promise(function(res, rej) {
    streamAsStaticMarkup(dom).on("error", rej).pipe(
      concatStream(function(buffer) {
        res(buffer.toString("utf-8"));
      })
    );
  });
}
