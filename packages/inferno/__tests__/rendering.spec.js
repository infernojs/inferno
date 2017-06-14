import { createVNode, render } from "inferno";
import { NO_OP } from "inferno-shared";
import VNodeFlags from "inferno-vnode-flags";
import pkgJSON from "../package.json";

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
});
