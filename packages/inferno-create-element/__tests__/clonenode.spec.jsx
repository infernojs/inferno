import { render } from "inferno";

describe("CloneVNode use cases", () => {
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

  it("Should be able to render hoisted node", () => {
    const a = ["foo", "bar"];

    render(<div>{[a, a, a, a]}</div>, container);

    expect(container.innerHTML).toEqual("<div>foobarfoobarfoobarfoobar</div>");
  });
});
