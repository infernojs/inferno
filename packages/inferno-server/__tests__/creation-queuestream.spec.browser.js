import Component from "inferno-component";
import { streamQueueAsString } from "inferno-server";

import concatStream from "concat-stream-es6";
import createElement from "inferno-create-element";

class StatefulComponent extends Component {
  render() {
    return createElement("span", null, `stateless ${this.props.value}!`);
  }
}

class StatefulPromiseComponent extends Component {
  getInitialProps() {
    return new Promise((resolve, reject) => {
      // Waits incremenetally for each subindex
      setTimeout(() => {
        resolve({
          value: "I waited long enough!"
        });
      }, 5 * this.props.index);
    });
  }

  render() {
    return createElement(
      "span",
      null,
      `Stateless Item ${this.props.index}: ${this.props.value}`
    );
  }
}

class StatefulHierchicalPromiseComponent extends Component {
  getInitialProps() {
    return new Promise((resolve, reject) => {
      // Waits incremenetally for each subindex
      setTimeout(() => {
        resolve({
          value: `I waited long enough for ${this.props.index}!`
        });
      }, 0);
    });
  }

  render() {
    if (this.props.index > 4) {
      return createElement(
        "span",
        null,
        `Final Stateless Item ${this.props.index}: ${this.props.value}`
      );
    } else {
      return createElement(
        "div",
        { className: "child" },
        `Stateless Item ${this.props.index}: ${this.props.value}`,
        createElement(StatefulHierchicalPromiseComponent, {
          index: this.props.index + 1
        })
      );
    }
  }
}

const FunctionalComponent = ({ value }) =>
  createElement("span", null, `stateless ${value}!`);

describe("SSR Creation Queue Streams - (non-JSX)", () => {
  const testEntries = [
    {
      description: "should render div with span child",
      template: () => createElement("div", null, createElement("span", null)),
      result: "<div><span></span></div>"
    },
    {
      description: "should render div with span child and styling",
      template: () =>
        createElement(
          "div",
          null,
          createElement("span", { style: "border-left: 10px;" })
        ),
      result: '<div><span style="border-left: 10px;"></span></div>'
    },
    {
      description: "should render div with span child and styling #2",
      template: () =>
        createElement(
          "div",
          null,
          createElement("span", { style: { borderLeft: 10 } })
        ),
      result: '<div><span style="border-left:10px;"></span></div>'
    },
    {
      description: "should render div with span child and styling #3",
      template: () =>
        createElement(
          "div",
          null,
          createElement("span", { style: { fontFamily: "Arial" } })
        ),
      result: '<div><span style="font-family:Arial;"></span></div>'
    },
    {
      description: "should render div with span child (with className)",
      template: () =>
        createElement(
          "div",
          { className: "foo" },
          createElement("span", { className: "bar" })
        ),
      result: '<div class="foo"><span class="bar"></span></div>'
    },
    {
      description: "should render div with text child #1",
      template: () => createElement("div", null, "Hello world"),
      result: "<div>Hello world</div>"
    },
    {
      description: "should render div with text child (XSS script attack)",
      template: () =>
        createElement(
          "div",
          null,
          'Hello world <img src="x" onerror="alert(\'XSS\')">'
        ),
      result:
        "<div>Hello world &lt;img src=&quot;x&quot; onerror=&quot;alert(&#039;XSS&#039;)&quot;&gt;</div>"
    },
    {
      description: "should render div with text children",
      template: () => createElement("div", null, "Hello", " world"),
      result: "<div>Hello<!----> world</div>"
    },
    {
      description: "should render a void element correct",
      template: () => createElement("input", null),
      result: "<input>"
    },
    {
      description: "should render div with node children",
      template: () =>
        createElement(
          "div",
          null,
          createElement("span", null, "Hello"),
          createElement("span", null, " world!")
        ),
      result: "<div><span>Hello</span><span> world!</span></div>"
    },
    {
      description: "should render div with node children #2",
      template: () =>
        createElement(
          "div",
          null,
          createElement("span", { id: "123" }, "Hello"),
          createElement("span", { className: "foo" }, " world!")
        ),
      result:
        '<div><span id="123">Hello</span><span class="foo"> world!</span></div>'
    },
    {
      description: "should render div with falsy children",
      template: () => createElement("div", null, 0),
      result: "<div>0</div>"
    },
    {
      description: "should render div with dangerouslySetInnerHTML",
      template: () =>
        createElement("div", {
          dangerouslySetInnerHTML: { __html: "<span>test</span>" }
        }),
      result: "<div><span>test</span></div>"
    },
    {
      description: "should render a stateless component",
      template: value =>
        createElement(
          "div",
          null,
          createElement(FunctionalComponent, { value })
        ),
      result: "<div><span>stateless foo!</span></div>"
    },
    {
      description: "should render a div with styles",
      template: () =>
        createElement("div", { style: { display: "block", width: "50px" } }),
      result: '<div style="display:block;width:50px;"></div>'
    },
    {
      description: "should ignore null className",
      template: () => createElement("div", { className: null }),
      result: "<div></div>"
    },
    {
      description: "should ignore undefined className",
      template: () => createElement("div", { className: undefined }),
      result: "<div></div>"
    },
    {
      description: "should render a stateful component",
      template: value =>
        createElement("div", null, createElement(StatefulComponent, { value })),
      result: "<div><span>stateless foo!</span></div>"
    },
    // Following tests check for not only concatenated output, but chunked streams
    {
      description: "should render a stateless component",
      template: value =>
        createElement(
          "div",
          null,
          createElement(FunctionalComponent, { value })
        ),
      result: [
        ["<div>", "<span>stateless foo!</span>", "</div>"],
        "<div><span>stateless foo!</span></div>"
      ]
    },
    {
      description: "should render a stateful component with promise",
      template: value =>
        createElement(
          "div",
          null,
          createElement(StatefulPromiseComponent, { index: 1 })
        ),
      result: [
        [
          "<div>",
          "<span>Stateless Item 1: I waited long enough!</span>",
          "</div>"
        ],
        "<div><span>Stateless Item 1: I waited long enough!</span></div>"
      ]
    },
    {
      description:
        "should render a stateful component with promise as hierarchy",
      template: value =>
        createElement(StatefulHierchicalPromiseComponent, { index: 1 }),
      result: [
        [
          '<div class="child">Stateless Item 1: I waited long enough for 1!',
          '<div class="child">Stateless Item 2: I waited long enough for 2!',
          '<div class="child">Stateless Item 3: I waited long enough for 3!',
          '<div class="child">Stateless Item 4: I waited long enough for 4!',
          "<span>Final Stateless Item 5: I waited long enough for 5!</span>",
          "</div>",
          "</div>",
          "</div>",
          "</div>"
        ],
        '<div class="child">Stateless Item 1: I waited long enough for 1!<div class="child">Stateless Item 2: I waited long enough for 2!<div class="child">Stateless Item 3: I waited long enough for 3!<div class="child">Stateless Item 4: I waited long enough for 4!<span>Final Stateless Item 5: I waited long enough for 5!</span></div></div></div></div>'
      ]
    },
    {
      description: "should render a stack of stateful component with promise",
      template: value =>
        createElement(
          "div",
          null,
          createElement(StatefulPromiseComponent, { index: 1 }),
          createElement(StatefulPromiseComponent, { index: 2 }),
          createElement(StatefulPromiseComponent, { index: 3 })
        ),
      result: [
        [
          "<div>",
          "<span>Stateless Item 1: I waited long enough!</span>",
          "<span>Stateless Item 2: I waited long enough!</span>",
          "<span>Stateless Item 3: I waited long enough!</span>",
          "</div>"
        ],
        "<div><span>Stateless Item 1: I waited long enough!</span><span>Stateless Item 2: I waited long enough!</span><span>Stateless Item 3: I waited long enough!</span></div>"
      ]
    },
    {
      description: "should render opacity style",
      template: () => createElement("div", { style: { opacity: 0.8 } }),
      result: '<div style="opacity:0.8;"></div>'
    }
  ];

  testEntries.forEach(test => {
    it(test.description, () => {
      const vDom = test.template("foo");
      return streamPromise(vDom).then(function(output) {
        if (typeof test.result === "object") {
          expect(output[0]).toEqual(test.result[0]);
          expect(output[1]).toBe(test.result[1]);
        } else {
          const container = document.createElement("div");
          document.body.appendChild(container);
          container.innerHTML = output;
          expect(output[1]).toBe(test.result);
          document.body.removeChild(container);
        }
      });
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
          return (
            <div>
              {this.state.foo}
            </div>
          );
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
          return (
            <div>
              {this.state.foo}
              <Another />
            </div>
          );
        }
      }

      const vDom = <Tester />;
      return streamPromise(vDom).then(function(output) {
        const container = document.createElement("div");
        document.body.appendChild(container);
        container.innerHTML = output;
        expect(output[1]).toBe("<div>bar2<div>bar2</div></div>");
        document.body.removeChild(container);
      });
    });
  });
});

function streamPromise(dom) {
  return new Promise(function(res, rej) {
    const chunks = [];
    streamQueueAsString(dom)
      .on("error", rej)
      .on("data", chunk => {
        chunks.push(chunk.toString());
      })
      .pipe(
        concatStream(function(buffer) {
          res([chunks, buffer.toString("utf-8")]);
        })
      );
  });
}
