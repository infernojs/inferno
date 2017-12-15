import { createVNode, render, Component } from "inferno";
import { NO_OP } from "inferno-shared";
import { VNodeFlags } from "inferno-vnode-flags";

describe("rendering routine", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  it("Should throw error when trying to render to document.body", () => {
    const div = createVNode(
      VNodeFlags.Element,
      "div",
      null,
      "1",
      null,
      null,
      null,
      true
    );
    try {
      render(div, document.body);
    } catch (e) {
      expect(e.message).toEqual(
        'Inferno Error: you cannot render() to the "document.body". Use an empty element as a container instead.'
      );
    }
  });

  it("Should do nothing if input is NO-OP", () => {
    render(NO_OP, container);
    expect(container.innerHTML).toEqual("");
  });

  it("Should create new object when dom exists", () => {
    const bar = createVNode(2, "div", null, "123", null, null, null, true);
    const foo = createVNode(2, "div", null, bar, null, null, null, true);

    render(foo, container);
    expect(container.innerHTML).toEqual("<div><div>123</div></div>");

    render(null, container);

    render(foo, container);
    expect(container.innerHTML).toEqual("<div><div>123</div></div>");
  });

  it("should be called a callback argument", () => {
    // mounting phase
    let called = false;
    render(<div>Foo</div>, container, () => (called = true));
    expect(called).toEqual(true);

    // updating phase
    called = false;
    render(<div>Foo</div>, container, () => (called = true));
    expect(called).toEqual(true);
  });

  it("should call a callback argument when the same element is re-rendered", () => {
    class Foo extends Component {
      render() {
        return <div>Foo</div>;
      }
    }
    const element = <Foo />;

    // mounting phase
    let called = false;
    render(element, container, () => (called = true));
    expect(called).toEqual(true);

    // updating phase
    called = false;

    render(element, container, () => (called = true));

    expect(called).toEqual(true);
  });

  it("should render a component returning strings directly from render", () => {
    const Text = ({ value }) => value;

    render(<Text value="foo" />, container);
    expect(container.textContent).toEqual("foo");
  });

  it("should render a component returning numbers directly from render", () => {
    const Text = ({ value }) => value;

    render(<Text value={10} />, container);

    expect(container.textContent).toEqual("10");
  });

  it("should not crash encountering low-priority tree", () => {
    render(
      <div hidden={true}>
        <div />
      </div>,
      container
    );
  });

  it("should not warn when rendering into an empty container", () => {
    spyOn(console, "error");

    render(<div>foo</div>, container);
    expect(container.innerHTML).toBe("<div>foo</div>");

    render(null, container);
    expect(container.innerHTML).toBe("");
    expect(console.error.calls.count()).toBe(0);

    render(<div>bar</div>, container);
    expect(container.innerHTML).toBe("<div>bar</div>");

    expect(console.error.calls.count()).toBe(0);
  });

  it('Should be possible to render Immutable datastructures', () => {
    function Clock(props) {
        let time = props.time + 1;
        const array = Object.freeze([
          <span>{ 'Inferno version:' }</span>,
          <br/>,
          <span>{ time }</span>
        ]);
        return (
          <div>
            {array}
          </div>
        );
      }

    spyOn(console, "error");

    render(<Clock time={1}/>, container);
    expect(container.innerHTML).toBe("<div><span>Inferno version:</span><br><span>2</span></div>");

    render(<Clock time={2}/>, container);
    expect(container.innerHTML).toBe("<div><span>Inferno version:</span><br><span>3</span></div>");

    render(<Clock time={3}/>, container);
    expect(container.innerHTML).toBe("<div><span>Inferno version:</span><br><span>4</span></div>");
    expect(console.error.calls.count()).toBe(0);

    render(null, container);
    expect(container.innerHTML).toBe("");

    expect(console.error.calls.count()).toBe(0);
  });
});
