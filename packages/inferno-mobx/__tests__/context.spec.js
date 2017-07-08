import createClass from "inferno-create-class";
import { observer, Provider } from "inferno-mobx";
import { innerHTML } from "inferno-utils";
import { observable } from "mobx";
import { renderComponent } from "./helpers";

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
    const B = () => <C />;
    const A = () =>
      <Provider foo="bar">
        <B />
      </Provider>;
    const wrapper = render(<A />, container);

    expect(wrapper.find("div").text()).toBe("context:bar");
  });

  it("props override context", () => {
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
    const B = () => <C foo={42} />;
    const A = () =>
      <Provider foo="bar">
        <B />
      </Provider>;
    const wrapper = render(<A />);

    expect(wrapper.find("div").text()).toBe("context:42");
  });

  it("overriding stores is supported", () => {
    const C = observer(
      ["foo", "bar"],
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
    );
    const B = () => <C />;
    const A = () =>
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
      </Provider>;
    const wrapper = render(<A />);

    expect(wrapper.find("span").text()).toBe("context:bar1337");
    expect(wrapper.find("section").text()).toBe("context:421337");
  });

  it("store should be available", () => {
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
    const B = () => <C />;
    const A = () =>
      <Provider baz={42}>
        <B />
      </Provider>;

    expect(() => render(<A />)).toThrowError(
      /Store 'foo' is not available! Make sure it is provided by some Provider/
    );
  });

  it("store is not required if prop is available", () => {
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
    const B = () => <C foo="bar" />;
    const wrapper = render(<B />);
    expect(wrapper.find("div").text()).toBe("context:bar");
  });

  it("warning is printed when changing stores (half-tested)", () => {
    // Since we are using `warning` function, we need a different way to test warnings
    // let msg = null;
    // const baseWarn = console.warn;
    // console.warn = m => msg = m;
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
            <span>{a.get()}</span>,
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
    // expect(msg).toBe('MobX Provider: Provided store \'foo\' has changed. Please avoid replacing stores as the change might not propagate to all children');
    // console.warn = baseWarn;
  });

  it("warning is not printed when changing stores, but suppressed explicitly (half-tested)", () => {
    // Since we are using `warning` function, we need a different way to test warnings
    // let msg = null;
    // const baseWarn = console.warn;
    // console.warn = m => msg = m;
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
            <span>{a.get()}</span>,
            <Provider foo={a.get()} suppressChangedStoreWarning>
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

    // expect(msg).toBe(null);
    // console.warn = baseWarn;
  });
});
