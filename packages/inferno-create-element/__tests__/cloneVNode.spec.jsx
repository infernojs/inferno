import { cloneVNode, render } from "inferno";
import { innerHTML } from "inferno-utils";

// React Fiddle for Cloning https://jsfiddle.net/es4u02jv/
describe("cloneVNode (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  it("should clone a tag", () => {
    const node = cloneVNode(<a />, null);
    render(node, container);
    expect(container.innerHTML).toBe(innerHTML("<a></a>"));
  });

  it("should clone with third argument array", () => {
    const node = cloneVNode(<div />, null, [<span />]);
    render(node, container);
    expect(container.innerHTML).toBe(innerHTML("<div><span></span></div>"));
  });

  it("should clone with third argument overriding props and cloned node children", () => {
    const node = cloneVNode(<div>f</div>, { children: "x" }, [<a>1</a>]);
    render(node, container);
    expect(container.innerHTML).toBe(innerHTML("<div><a>1</a></div>"));
  });

  it("should clone OPT_ELEMENT", () => {
    const noop = () => {};
    const node = cloneVNode(
      <div
        onComponentWillMount={noop}
        onComponentDidMount={noop}
        onComponentWillUnmount={noop}
        onComponentShouldUpdate={noop}
        onComponentWillUpdate={noop}
      />,
      { children: [<span />] }
    );
    render(node, container);
    expect(container.innerHTML).toBe(innerHTML("<div><span></span></div>"));
  });

  it("should clone a basic element with array children", () => {
    const node = cloneVNode(<div />, { children: [<span />] });
    render(node, container);
    expect(container.innerHTML).toBe(innerHTML("<div><span></span></div>"));
  });

  it("should clone a basic element with children in props and as third argument", () => {
    const node1 = cloneVNode(
      <div />,
      { children: <span>arr1a</span> },
      <span>arr2b</span>
    );
    render(node1, container);
    expect(container.innerHTML).toBe(
      innerHTML("<div><span>arr2b</span></div>")
    );

    const node2 = cloneVNode(
      <div />,
      { children: [<span>arr2a</span>] },
      <span>arr2b</span>
    );
    render(node2, container);
    expect(container.innerHTML).toBe(
      innerHTML("<div><span>arr2b</span></div>")
    );

    const node3 = cloneVNode(<div />, { children: [<span>arr3a</span>] }, [
      <span>arr3b</span>
    ]);
    render(node3, container);
    expect(container.innerHTML).toBe(
      innerHTML("<div><span>arr3b</span></div>")
    );
  });

  it("Should support multiple parameters as children", () => {
    const node = cloneVNode(
      <div />,
      null,
      <span>arr3a</span>,
      <span>arr3b</span>,
      <span>arr3c</span>
    );
    render(node, container);
    expect(container.innerHTML).toBe(
      innerHTML(
        "<div><span>arr3a</span><span>arr3b</span><span>arr3c</span></div>"
      )
    );
  });

  it("Should support multiple nodes as children inside array", () => {
    const node = cloneVNode(<div />, null, [
      <span>arr3a</span>,
      <span>arr3b</span>,
      <span>arr3c</span>
    ]);
    render(node, container);
    expect(container.innerHTML).toBe(
      innerHTML(
        "<div><span>arr3a</span><span>arr3b</span><span>arr3c</span></div>"
      )
    );
  });

  it("Should support single node as children", () => {
    const node = cloneVNode(<div />, null, <span>arr3a</span>);
    render(node, container);
    expect(container.innerHTML).toBe(
      innerHTML("<div><span>arr3a</span></div>")
    );
  });

  it("Should support single node as children inside array", () => {
    const node = cloneVNode(<div />, null, [<span>arr3a</span>]);
    render(node, container);
    expect(container.innerHTML).toBe(
      innerHTML("<div><span>arr3a</span></div>")
    );
  });

  it("should clone a basic element with null children", () => {
    const node = cloneVNode(<div />, { children: null });
    render(node, container);
    expect(container.innerHTML).toBe(innerHTML("<div></div>"));
  });

  it("should clone a basic element with key and ref", () => {
    const ref = () => {};
    const node = cloneVNode(<div />, { key: "foo", ref });

    expect(node.key).toBe("foo");
    expect(node.ref).toBe(ref);
  });

  it("should clone a basic element with different children and props", () => {
    const node1 = <div>Hello world</div>;
    render(node1, container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world</div>"));

    const node2 = cloneVNode(node1, null, "Hello world 2!");
    render(node2, container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world 2!</div>"));

    const node3 = cloneVNode(node2, { className: "foo" }, "Hello world 2!");
    render(node3, container);
    expect(container.innerHTML).toBe(
      innerHTML('<div class="foo">Hello world 2!</div>')
    );

    const node4 = cloneVNode(node1, { className: "foo" }, "Hello world 3!");
    render(node4, container);
    expect(container.innerHTML).toBe(
      innerHTML('<div class="foo">Hello world 3!</div>')
    );
  });

  function StatelessComponent(props) {
    return <div {...props} />;
  }

  it("should clone a basic stateless component with different children and props", () => {
    const node1 = <StatelessComponent children="Hello world" />;

    render(node1, container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world</div>"));
    const node2 = cloneVNode(node1, { children: "Hello world 2!" });

    render(node2, container);
    expect(container.innerHTML).toBe(innerHTML("<div>Hello world 2!</div>"));
    const node3 = cloneVNode(node1, {
      children: "Hello world 3!",
      className: "yo"
    });

    render(node3, container);
    expect(container.innerHTML).toBe(
      innerHTML('<div class="yo">Hello world 3!</div>')
    );
  });

  it("Should prefer children in order", () => {
    function Bar({ children }) {
      return (
        <div>
          {children}
        </div>
      );
    }

    const nodeToClone = <Bar>First</Bar>;

    render(nodeToClone, container);

    expect(container.innerHTML).toBe("<div>First</div>");

    render(cloneVNode(nodeToClone, { children: "Second" }), container);

    expect(container.innerHTML).toBe("<div>Second</div>");

    render(cloneVNode(nodeToClone, { children: "Second" }, "Third"), container);

    expect(container.innerHTML).toBe("<div>Third</div>");

    render(
      cloneVNode(nodeToClone, { children: "Second" }, "Third", "Fourth"),
      container
    );

    expect(container.innerHTML).toBe("<div>ThirdFourth</div>");
  });

  it("Should prefer children in order #2", () => {
    function Bar({ children }) {
      return (
        <div>
          {children}
        </div>
      );
    }

    const nodeToClone = <Bar>First</Bar>;

    render(nodeToClone, container);

    expect(container.innerHTML).toBe("<div>First</div>");

    render(cloneVNode(nodeToClone, null), container);

    expect(container.innerHTML).toBe("<div>First</div>");

    render(cloneVNode(nodeToClone, null, null), container);

    expect(container.innerHTML).toBe("<div></div>");
  });

  describe("Cloning className", () => {
    it("Should prefer new props over cloned object", () => {
      const node = <div className="test" />;

      render(node, container);

      expect(container.firstChild.className).toEqual("test");

      const newNode = cloneVNode(node, {
        className: "foo"
      });

      render(newNode, container);
      expect(newNode.props.hasOwnProperty("className")).toBe(false);

      expect(container.firstChild.className).toBe("foo");
      expect(innerHTML(container.innerHTML)).toEqual(
        innerHTML('<div class="foo"></div>')
      );
    });

    it("Should remove className if new one is empty", () => {
      const node = <div className="test" />;

      render(node, container);

      expect(container.firstChild.className).toEqual("test");

      const newNode = cloneVNode(node, {
        className: null
      });

      render(newNode, container);
      console.log(newNode.props);
      expect(newNode.props.hasOwnProperty("className")).toBe(false);

      expect(container.firstChild.className).toBe("");
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });

    it("Should keep previous className when new props dont have that property at all", () => {
      const node = <div className="test" />;

      render(node, container);

      expect(container.firstChild.className).toEqual("test");

      const newNode = cloneVNode(node, {
        id: "wow"
      });

      render(newNode, container);

      expect(newNode.props.hasOwnProperty("id")).toBe(true);
      expect(newNode.props.hasOwnProperty("className")).toBe(false);

      expect(container.firstChild.className).toBe("test");
      expect(container.firstChild.getAttribute("id")).toBe("wow");
      expect(innerHTML(container.innerHTML)).toEqual(
        innerHTML('<div class="test" id="wow"></div>')
      );
    });
  });

  describe("Cloning key", () => {
    it("Should prefer new props over cloned object", () => {
      const node = <div key="test" />;

      expect(node.key).toEqual("test");

      render(node, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));

      const newNode = cloneVNode(node, {
        key: "foo"
      });

      expect(newNode.key).toEqual("foo");
      expect(newNode.props.hasOwnProperty("key")).toBe(false);
      render(newNode, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });

    it("Should remove key if new one is empty", () => {
      const node = <div key="test" />;

      expect(node.key).toEqual("test");

      render(node, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));

      const newNode = cloneVNode(node, {
        key: null
      });

      expect(newNode.key).toEqual(null);

      render(newNode, container);
      expect(newNode.props.hasOwnProperty("key")).toBe(false);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });

    it("Should keep previous key when new props dont have that property at all", () => {
      const node = <div key="test" />;

      expect(node.key).toEqual("test");

      render(node, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));

      const newNode = cloneVNode(node, {
        className: null
      });

      expect(newNode.key).toEqual("test");
      expect(newNode.props.hasOwnProperty("key")).toBe(false);
      expect(newNode.props.hasOwnProperty("className")).toBe(false);
      render(newNode, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });
  });

  describe("Cloning Ref", () => {
    function initialFunc() {}

    it("Should prefer new props over cloned object", () => {
      const node = <div ref={initialFunc} />;

      expect(node.ref).toEqual(initialFunc);

      render(node, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));

      function newFunction() {}

      const newNode = cloneVNode(node, {
        ref: newFunction
      });

      expect(newNode.ref).toEqual(newFunction);
      expect(newNode.props.hasOwnProperty("ref")).toBe(false);
      render(newNode, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });

    it("Should remove ref if new one is empty", () => {
      const node = <div ref={initialFunc} />;

      expect(node.ref).toEqual(initialFunc);

      render(node, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));

      const newNode = cloneVNode(node, {
        ref: null
      });

      expect(newNode.ref).toEqual(null);
      expect(newNode.props.hasOwnProperty("ref")).toBe(false);
      render(newNode, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });

    it("Should keep previous ref when new props dont have that property at all", () => {
      const node = <div ref={initialFunc} />;

      expect(node.ref).toEqual(initialFunc);

      debugger;
      render(node, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));

      const newNode = cloneVNode(node, {
        className: null
      });

      console.log(newNode.props);
      expect(newNode.ref).toEqual(initialFunc);
      expect(newNode.props.hasOwnProperty("className")).toBe(false);
      expect(newNode.className).toBe(null);
      render(newNode, container);
      expect(innerHTML(container.innerHTML)).toEqual(innerHTML("<div></div>"));
    });
  });
});
