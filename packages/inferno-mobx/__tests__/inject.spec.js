import { render as infernoRender } from "inferno";
import Component from "inferno-component";
import createClass from "inferno-create-class";
import { observer, inject, Provider } from "inferno-mobx";
import { innerHTML } from "inferno-utils";
import { action, observable } from "mobx";
import { renderComponent } from "./helpers";

//jest.useFakeTimers();

describe("observer based context", () => {
  let container = null;
  let render = null;

  beforeEach(function() {
    container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
    render = renderComponent.bind(this, container);
  });

  afterEach(function() {
    render(null);
    document.body.removeChild(container);
  });

  it("basic context", () => {
    const C = inject("foo")(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.foo}
              </div>
            );
          }
        })
      )
    );
    const B = () => <C />;
    const A = () =>
      <Provider foo="bar">
        <B />
      </Provider>;
    const wrapper = render(<A />);
    expect(wrapper.find("div").text()).toBe("context:bar");
  });

  it("props override context", () => {
    const C = inject("foo")(
      createClass({
        render() {
          return (
            <div>
              context:{this.props.foo}
            </div>
          );
        }
      })
    );
    const B = () => <C foo={42} />;
    const A = createClass({
      render: () =>
        <Provider foo="bar">
          <B />
        </Provider>
    });
    const wrapper = render(<A />);
    expect(wrapper.find("div").text()).toBe("context:42");
  });

  it("overriding stores is supported", () => {
    const C = inject("foo", "bar")(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.foo}
                {this.props.bar}
              </div>
            );
          }
        })
      )
    );
    const B = () => <C />;
    const A = createClass({
      render: () =>
        <Provider foo="bar" bar={1337}>
          <div>
            <span>
              <B />
            </span>
            <section>
              <Provider foo={42}>
                <B />
              </Provider>
            </section>
          </div>
        </Provider>
    });
    const wrapper = render(<A />);
    expect(wrapper.find("span").text()).toBe("context:bar1337");
    expect(wrapper.find("section").text()).toBe("context:421337");
  });

  it("store should be available", () => {
    const C = inject("foo")(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.foo}
              </div>
            );
          }
        })
      )
    );
    const B = () => <C />;
    const A = createClass({
      render: () =>
        <Provider baz={42}>
          <B />
        </Provider>
    });
    expect(() => render(<A />)).toThrowError(/Store 'foo' is not available/i);
  });

  it("store is not required if prop is available", () => {
    const C = inject("foo")(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.foo}
              </div>
            );
          }
        })
      )
    );
    const B = () => <C foo="bar" />;
    const wrapper = render(<B />);
    expect(wrapper.find("div").text()).toBe("context:bar");
  });

  it("inject merges (and overrides) props", () => {
    //t.plan(1);
    const C = inject(() => ({ a: 1 }))(
      observer(
        createClass({
          render() {
            expect(this.props).toEqual({
              a: 1,
              b: 2
            });
            return null;
          }
        })
      )
    );
    const B = () => <C a={2} b={2} />;
    render(<B />);
  });

  it("warning is printed when changing stores", () => {
    let msg;
    const baseWarn = console.warn;
    console.warn = m => (msg = m);
    const a = observable(3);
    const C = observer(
      ["foo"],
      createClass({
        render() {
          return (
            <div>
              context:{this.props.foo}
            </div>
          );
        }
      })
    );
    const B = observer(
      createClass({
        render: () => <C />
      })
    );
    const A = observer(
      createClass({
        render: () =>
          <section>
            <span>
              {a.get()}
            </span>
            <Provider foo={a.get()}>
              <B />
            </Provider>
          </section>
      })
    );
    const wrapper = render(<A />);

    expect(wrapper.find("span").text()).toBe("3");
    expect(wrapper.find("div").text()).toBe("context:3");

    a.set(42);

    expect(wrapper.find("span").text()).toBe("42");
    expect(wrapper.find("div").text()).toBe("context:3");

    expect(
      msg,
      "MobX Provider: Provided store 'foo' has changed. Please avoid replacing stores as the change might not propagate to all children"
    );
    console.warn = baseWarn;
  });

  it("custom storesToProps", () => {
    const C = inject((stores, props, context) => {
      expect(context).toEqual({ mobxStores: { foo: "bar" } });
      expect(stores).toEqual({ foo: "bar" });
      expect(props).toEqual({ baz: 42 });
      return {
        zoom: stores.foo,
        baz: props.baz * 2
      };
    })(
      observer(
        createClass({
          render() {
            return (
              <div>
                context:{this.props.zoom}
                {this.props.baz}
              </div>
            );
          }
        })
      )
    );
    const B = createClass({
      render: () => <C baz={42} />
    });
    const A = () =>
      <Provider foo="bar">
        <B />
      </Provider>;
    const wrapper = render(<A />);
    expect(wrapper.find("div").text()).toBe("context:bar84");
  });

  it("support static hoisting, wrappedComponent and wrappedInstance", () => {
    const B = createClass({
      render() {
        this.testField = 1;
        return null;
      }
    });
    B.bla = 17;
    B.bla2 = {};
    const C = inject("booh")(B);

    expect(C.wrappedComponent, B);
    expect(B.bla, 17);
    expect(C.bla, 17);
    expect(C.bla2).toBe(B.bla2);

    const wrapper = infernoRender(<C booh={42} />, container);
    expect(wrapper.wrappedComponent.testField, 1);
  });

  it("warning is printed when attaching contextTypes to HOC", () => {
    const msg = [];
    const baseWarn = console.warn;
    console.warn = m => msg.push(m);
    const C = inject(["foo"])(
      createClass({
        displayName: "C",
        render() {
          return (
            <div>
              context:{this.props.foo}
            </div>
          );
        }
      })
    );
    C.defaultProps = {};
    C.contextTypes = {};

    const B = () => <C />;
    const A = () =>
      <Provider foo="bar">
        <B />
      </Provider>;
    render(<A />);
    expect(msg.length, 1);
    expect(
      msg[0],
      "Mobx Injector: you are trying to attach `contextTypes` on an component decorated with `inject` (or `observer`) HOC. Please specify the contextTypes on the wrapped component instead. It is accessible through the `wrappedComponent`"
    );
    console.warn = baseWarn;
  });

  it("propTypes and defaultProps are forwarded", () => {
    const msg = [];
    const baseError = console.error;
    console.error = m => msg.push(m);

    const C = inject(["foo"])(
      createClass({
        displayName: "C",
        render() {
          expect(this.props.y, 3);
          expect(this.props.x, undefined);
          return null;
        }
      })
    );
    C.defaultProps = {
      y: 3
    };
    const B = () => <C z="test" />;
    const A = () =>
      <Provider foo="bar">
        <B />
      </Provider>;
    render(<A />);
    expect(msg.length, 2);
    console.error = baseError;
  });

  it("warning is not printed when attaching propTypes to injected component", () => {
    let msg = [];
    const baseWarn = console.warn;
    console.warn = m => (msg = m);

    const C = inject(["foo"])(
      createClass({
        displayName: "C",
        render: () =>
          <div>
            context:{this.props.foo}
          </div>
      })
    );
    C.propTypes = {};

    expect(msg.length, 0);
    console.warn = baseWarn;
  });

  it.skip("using a custom injector is reactive", done => {
    const user = observable({ name: "Noa" });
    const mapper = stores => ({ name: stores.user.name });
    const DisplayName = props =>
      <h1>
        {props.name}
      </h1>;
    const User = inject(mapper)(DisplayName);
    const App = () =>
      <Provider user={user}>
        <User />
      </Provider>;

    infernoRender(<App />, container);

    expect(container.querySelector("h1").innerHTML).toBe("Noa");
    user.name = "Veria";
    expect(container.querySelector("h1").innerHTML).toBe("Veria");
  });

  it.skip("using a custom injector is not too reactive", done => {
    let listRender = 0;
    let itemRender = 0;
    let injectRender = 0;

    function connect() {
      return component => inject.apply(this, arguments)(observer(component));
    }

    class State {
      highlighted = observable(null);

      isHighlighted(item) {
        return this.highlighted == item;
      }

      highlight = action(item => {
        this.highlighted = item;
      });
    }

    const items = observable([
      { title: "ItemA" },
      { title: "ItemB" },
      { title: "ItemC" },
      { title: "ItemD" },
      { title: "ItemE" },
      { title: "ItemF" }
    ]);

    const state = new State();

    class ListComponent extends Component {
      render() {
        listRender++;
        const { items } = this.props;

        return (
          <ul>
            {items.map(item => <ItemComponent key={item.title} item={item} />)}
          </ul>
        );
      }
    }

    connect(({ state }, { item }) => {
      injectRender++;
      if (injectRender > 6) {
        // debugger;
      }
      return {
        // Using
        // highlighted: expr(() => state.isHighlighted(item)) // seems to fix the problem
        highlighted: state.isHighlighted(item),
        highlight: state.highlight
      };
    });

    class ItemComponent extends Component {
      highlight = () => {
        const { item, highlight } = this.props;
        highlight(item);
      };

      render() {
        itemRender++;
        const { highlighted, item } = this.props;
        return (
          <li className={"hl_" + item.title} onClick={this.highlight}>
            {item.title} {highlighted ? "(highlighted)" : ""}{" "}
          </li>
        );
      }
    }

    const testRoot = render(
      <Provider state={state}>
        <ListComponent items={items} />
      </Provider>
    );

    expect(listRender).toBe(1);
    expect(injectRender).toBe(6);
    expect(itemRender).toBe(6);

    testRoot.findAll(".hl_ItemB").forEach(e => e.click());
    setTimeout(() => {
      expect(listRender).toBe(1);
      expect(injectRender).toBe(12); // ideally).toBe(7
      expect(itemRender).toBe(7);

      testRoot.findAll(".hl_ItemF").forEach(e => e.click());
      setTimeout(() => {
        expect(listRender).toBe(1);
        expect(injectRender).toBe(18); // ideally).toBe(9
        expect(itemRender).toBe(9);

        testRoot.parentNode.removeChild(testRoot);
        done();
      }).toBe(20);
    }).toBe(20);
  });
});
