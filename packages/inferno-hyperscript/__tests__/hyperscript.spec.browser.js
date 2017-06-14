import { render } from "inferno";
import h from "inferno-hyperscript";
import { innerHTML } from "inferno-utils";
import sinon from "sinon";

describe("HyperScript (non-JSX)", () => {
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

  it("Should handle a basic example", () => {
    render(h("div"), container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));
  });

  it("Should handle a basic example #2", () => {
    render(h("div", "Hello world!"), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
  });

  it("Should handle a basic example #3", () => {
    render(h("div", { className: "foo" }, "Hello world!"), container);
    expect(container.innerHTML).toBe(
      innerHTML('<div class="foo">Hello world!</div>')
    );
  });

  const StatelessComponent = () => h("div", "Hello world!");

  it("Should handle a basic example #4", () => {
    render(h(StatelessComponent), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
  });

  it("Should handle a hooks example #1", () => {
    const Component = ({ children }) => {
      return h("div", children);
    };
    const ComponentHooks = () =>
      h(Component, {
        hooks: {
          onComponentDidUnmount() {}
        },
        children: "Hello world!"
      });

    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
  });

  it("Should handle children as third argument", () => {
    const Component = ({ children }) => {
      return h("div", children);
    };
    const ComponentHooks = () => h(Component, null, "Hello world!");

    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
  });

  it("Should handle different props (key, class, id, ref, children)", () => {
    const ComponentHooks = () =>
      h("div#myId.test", {
        onComponentDidMount() {},
        key: "myKey",
        ref: c => c,
        className: "myClass",
        children: "Hello world!"
      });

    render(h(ComponentHooks), container);
    expect(innerHTML(container.innerHTML)).toBe(
      innerHTML('<div class="test myClass" id="myId">Hello world!</div>')
    );
  });

  it("Should handle tag with no name", () => {
    const ComponentHooks = () => h("", { children: "Hello world!" });
    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world!</div>"));
  });

  it("Should be possible to create textarea with hyperscript", () => {
    const ComponentHooks = () => h("textarea", { id: "test" });
    render(h(ComponentHooks), container);
    expect(innerHTML(container.innerHTML)).toBe(
      innerHTML('<textarea id="test"></textarea>')
    );
  });

  it("Should be possible to create select element with hyperscript", () => {
    const ComponentHooks = () =>
      h("select", { id: "select" }, [
        h("option", { value: 1 }, "1"),
        h("option", { value: 2 }, "2")
      ]);
    render(h(ComponentHooks), container);
    expect(innerHTML(container.innerHTML)).toBe(
      innerHTML(
        '<select id="select"><option value="1">1</option><option value="2">2</option></select>'
      )
    );
  });

  it("Should handle tag with no tag name but id is present", () => {
    const ComponentHooks = () => h("#myId");
    render(h(ComponentHooks), container);
    expect(container.innerHTML).toBe(innerHTML('<div id="myId"></div>'));
  });

  it("Should support lifecycle methods on functional components willMount", () => {
    const callbackSpy = sinon.spy();
    const ComponentHooks = () => h("#myId");
    render(h(ComponentHooks, { onComponentWillMount: callbackSpy }), container);
    expect(container.innerHTML).toBe(innerHTML('<div id="myId"></div>'));
    expect(callbackSpy.calledOnce).toBe(true);
  });

  it("Should support lifecycle methods on functional components didMount", () => {
    const callbackSpy = sinon.spy();
    const ComponentHooks = () => h("#myId");
    render(h(ComponentHooks, { onComponentDidMount: callbackSpy }), container);
    expect(container.innerHTML).toBe(innerHTML('<div id="myId"></div>'));
    expect(callbackSpy.calledOnce).toBe(true);
  });

  it("Should pass classNames through", () => {
    function Test1({ children, ...props }) {
      return h("div.test1", props, children);
    }

    function Test2({ children, ...props }) {
      return h("div", props, children);
    }

    function Test3({ children, ...props }) {
      return h("div", { className: "test3" }, children);
    }

    function Test4({ children, className, ...props }) {
      return h("div", { className, ...props }, children);
    }

    render(
      h("div", {}, [
        h(Test1, { className: "test1prop" }),
        h(Test2, { className: "test2prop" }),
        h(Test3),
        h(Test4, { className: "test4prop" })
      ]),
      container
    );

    const children = container.firstChild.childNodes;

    expect(children[0].className).toBe("test1 test1prop");
    expect(children[1].className).toBe("test2prop");
    expect(children[2].className).toBe("test3");
    expect(children[3].className).toBe("test4prop");
  });

  if (typeof global !== "undefined" && !global.usingJSDOM) {
    it("Should not lower case SVG tags", () => {
      render(
        h(
          "svg",
          null,
          h(
            "filter",
            { id: "blur" },
            h("feGaussianBlur", { in: "SourceGraphic" })
          )
        ),
        container
      );

      expect(container.firstChild.firstChild.firstChild.tagName).toEqual(
        "feGaussianBlur"
      ); // tag name is case sensitive
      expect(container.firstChild.firstChild.tagName).toEqual("filter");
      expect(container.firstChild.tagName).toEqual("svg");
    });
  }
});
