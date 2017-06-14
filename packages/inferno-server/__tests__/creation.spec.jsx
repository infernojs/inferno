import { renderToStaticMarkup } from "inferno-server";
import Component from "inferno-component";

/*
 class StatefulComponent extends Component {
 render() {
 return createElement('span', null, `stateless ${ this.props.value }!`);
 }
 }*/

function WrappedInput(props) {
  return <input type="text" value={props.value} />;
}

describe("SSR Creation (JSX)", () => {
  const testEntries = [
    {
      description: "should render a null component",
      template: () => <div>{null}</div>,
      result: "<div></div>"
    },
    {
      description: "should render a component with null children",
      template: () => <div>{null}<span>emptyValue: {null}</span></div>,
      result: "<div><span>emptyValue: </span></div>"
    },
    {
      description: "should render a component with valueless attribute",
      template: () => <script src="foo" async />,
      result: '<script src="foo" async></script>'
    },
    {
      description: "should render a stateless component with text",
      template: () => <div>Hello world, {"1"}2{"3"}</div>,
      result: "<div>Hello world, <!---->1<!---->2<!---->3</div>"
    },
    {
      description: "should render a stateless component with comments",
      template: () => <div>Hello world, {/* comment*/}</div>,
      result: "<div>Hello world, </div>"
    },
    {
      description: "should render mixed invalid/valid children",
      template: () => <div>{[null, "123", null, "456"]}</div>,
      result: "<div>123<!---->456</div>"
    },
    {
      description: "should ignore children as props",
      template: () => <p children="foo">foo</p>,
      result: "<p>foo</p>"
    },
    {
      description: "should render input with value",
      template: () => <input value="bar" />,
      result: '<input value="bar">'
    },
    {
      description:
        "should render input with value when defaultValue is present",
      template: () => <input value="bar" defaultValue="foo" />,
      result: '<input value="bar">'
    },
    {
      description:
        "should render input when value is not present with defaultValue",
      template: () => <input defaultValue="foo" />,
      result: '<input value="foo">'
    },
    {
      description:
        "should render input of type text with value when input is wrapped",
      template: () => <WrappedInput value="foo" />,
      result: '<input type="text" value="foo">'
    },
    {
      description: "should render select element with selected property",
      template: () =>
        <select value="dog">
          <option value="cat">A cat</option>
          <option value="dog">A dog</option>
        </select>,
      result:
        '<select value="dog"><option>A cat</option><option selected>A dog</option></select>'
    },
    {
      description: "should render a text placeholder",
      template: () =>
        <div>
          <div>{""}</div>
          <p>Test</p>
        </div>,
      result: "<div><div> </div><p>Test</p></div>"
    },
    {
      description: "Should render style opacity #1",
      template: () => <div style={{ opacity: 0.8 }} />,
      result: '<div style="opacity:0.8;"></div>'
    },
    {
      description: "Should render style opacity #2",
      template: () => <div style="opacity:0.8;" />,
      result: '<div style="opacity:0.8;"></div>'
    }
  ];

  testEntries.forEach(test => {
    it(test.description, () => {
      const container = document.createElement("div");
      const vDom = test.template("foo");
      const output = renderToStaticMarkup(vDom);

      document.body.appendChild(container);
      container.innerHTML = output;
      expect(output).toBe(test.result);
      document.body.removeChild(container);
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

      const container = document.createElement("div");
      const vDom = <Tester />;

      const output = renderToStaticMarkup(vDom);

      document.body.appendChild(container);
      container.innerHTML = output;
      expect(output).toBe("<div>bar2<div>bar2</div></div>");
      document.body.removeChild(container);
    });
  });
});
