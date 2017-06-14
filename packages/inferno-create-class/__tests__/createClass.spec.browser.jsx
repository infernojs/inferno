import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import createClass from "inferno-create-class";

describe("Components createClass (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  describe("mixins", () => {
    describe("mixin methods", () => {
      it("receives the class instance", () => {
        const Foo = createClass({
          mixins: [
            {
              componentDidMount() {
                this.someState = 1;
              },
              doSomething() {
                this.anotherState = 2;
              }
            }
          ],
          render() {
            this.doSomething();
            return <div />;
          }
        });

        let a;
        render(
          <Foo
            ref={function(i) {
              a = i;
            }}
          />,
          container
        );

        expect(a.someState).toEqual(1);
        expect(a.anotherState).toEqual(2);
      });

      it("returns result through instance", () => {
        const Foo = createClass({
          mixins: [
            {
              renderSomething() {
                return <div>{this.props.bar}</div>;
              }
            }
          ],
          render() {
            return <div>{this.renderSomething()}</div>;
          }
        });

        render(<Foo bar="test" />, container);
        expect(container.innerHTML).toEqual(
          innerHTML("<div><div>test</div></div>")
        );
      });

      it("works as a lifecycle method even when a matching method is already defined", () => {
        const Foo = createClass({
          mixins: [
            {
              componentDidMount() {
                this.someState = 1;
              }
            }
          ],
          componentDidMount() {},
          render() {
            return <div />;
          }
        });

        let a;
        render(
          <Foo
            ref={function(i) {
              a = i;
            }}
          />,
          container
        );

        expect(a.someState).toEqual(1);
      });
    });

    describe("getDefaultProps", () => {
      it("should use a mixin", () => {
        const Foo = createClass({
          mixins: [{ getDefaultProps: () => ({ a: true }) }],
          render() {
            return <div />;
          }
        });

        expect(Foo.defaultProps).toEqual({
          a: true
        });
      });

      it("should combine the results", () => {
        const Foo = createClass({
          mixins: [
            { getDefaultProps: () => ({ a: true }) },
            { getDefaultProps: () => ({ b: true }) }
          ],
          getDefaultProps() {
            return { c: true };
          },
          render() {
            return <div />;
          }
        });

        expect(Foo.defaultProps).toEqual({
          a: true,
          b: true,
          c: true
        });
      });

      it("should throw an error for duplicate keys", () => {
        expect(() =>
          createClass({
            mixins: [{ getDefaultProps: () => ({ a: true }) }],
            getDefaultProps() {
              return { a: true };
            },
            render() {
              return <div />;
            }
          })
        ).toThrowError(Error);
      });
    });

    describe("getInitialState", () => {
      it("should combine the results", () => {
        const Foo = createClass({
          mixins: [
            { getInitialState: () => ({ a: true }) },
            { getInitialState: () => ({ b: true }) }
          ],
          getInitialState() {
            return { c: true };
          },
          render() {
            return <div />;
          }
        });

        let a;
        render(
          <Foo
            ref={function(i) {
              a = i;
            }}
          />,
          container
        );

        expect(a.state).toEqual({
          a: true,
          b: true,
          c: true
        });
      });

      it("should throw an error for duplicate keys", () => {
        const Foo = createClass({
          mixins: [{ getInitialState: () => ({ a: true }) }],
          getInitialState() {
            return { a: true };
          },
          render() {
            return <div />;
          }
        });

        expect(() => {
          render(<Foo />, container);
        }).toThrowError();
      });
    });
  });

  describe("Context", () => {
    it("It should have context defined when context moved to children", () => {
      const App = createClass({
        getDefaultProps() {
          return {
            wrapContext: false
          };
        },

        getChildContext() {
          return {
            foo: "bar baz"
          };
        },

        addPageContexts(children) {
          const newChildren = [];

          for (let i = 0; i < children.length; i++) {
            newChildren.push(<Page {...children[i].props} />);
          }

          return newChildren;
        },

        render() {
          let children;

          if (this.props.wrapContext) {
            children = this.addPageContexts(this.props.children);
          } else {
            children = this.props.children;
          }

          return (
            <div>
              {children}
            </div>
          );
        }
      });

      const Page = createClass({
        getInitialState() {
          return {
            foo: this.context.foo
          };
        },
        render() {
          return <div>{this.props.greeting} {this.state.foo}</div>;
        }
      });

      render(
        <App wrapContext={true}>
          <Page greeting="Hello" />
          <Page greeting="Hai" />
        </App>,
        container
      );

      expect(container.innerHTML).toEqual(
        innerHTML("<div><div>Hello bar baz</div><div>Hai bar baz</div></div>")
      );
    });
  });
});
