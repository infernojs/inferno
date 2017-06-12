import { createVNode, render } from "inferno";
import VNodeFlags from "inferno-vnode-flags";
import { createTextVNode } from "inferno/core/VNodes";

describe("patching routine", () => {
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

  it("Should do nothing if lastVNode strictly equals nextVnode", () => {
    const yar = createVNode(2, "div", null, "123", null, null, null, true);
    const bar = createVNode(2, "div", null, "123", null, null, null, true);
    let foo = createVNode(2, "div", null, [bar, yar], null, null, null, true);

    render(foo, container);
    expect(container.innerHTML).toEqual(
      "<div><div>123</div><div>123</div></div>"
    );

    foo = createVNode(2, "div", null, [bar, yar], null, null, null, true);

    render(foo, container);
    expect(container.innerHTML).toEqual(
      "<div><div>123</div><div>123</div></div>"
    );
  });

  it("Should mount nextNode if lastNode crashed", () => {
    const validNode = createVNode(
      VNodeFlags.HtmlElement,
      "span",
      null,
      createTextVNode("a"),
      null,
      null,
      null,
      false
    );
    const invalidNode = createVNode(0, "span");

    render(validNode, container);
    try {
      render(invalidNode, container);
    } catch (e) {
      expect(
        e.message.indexOf("Inferno Error: mount() received an object")
      ).not.toEqual(-1);
    }
    expect(container.innerHTML).toEqual("<span>a</span>");

    render(validNode, container);
    expect(container.innerHTML).toEqual("<span>a</span>");
  });

  it("Patch operation when nextChildren is NOT Invalid/Array/StringOrNumber/VNode", () => {
    const validNode = createVNode(
      VNodeFlags.HtmlElement,
      "span",
      null,
      createVNode(
        VNodeFlags.HtmlElement,
        "span",
        null,
        createTextVNode("a"),
        null,
        null,
        null,
        false
      ),
      null,
      null,
      null,
      false
    );

    const invalidChildNode = createVNode(
      VNodeFlags.HtmlElement,
      "span",
      null,
      createVNode(0, "span"),
      null,
      null,
      null,
      false
    );

    render(validNode, container);
    render(invalidChildNode, container);
  });

  it("Should not access real DOM property when text does not change", () => {
    render(createTextVNode("a"), container);
    expect(container.innerHTML).toEqual("a");
    render(createTextVNode("a"), container);
    expect(container.innerHTML).toEqual("a");
  });
});
