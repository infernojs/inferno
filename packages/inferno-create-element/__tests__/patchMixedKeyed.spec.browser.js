import { render } from "inferno";
import createElement from "inferno-create-element";

function spanTagWithText(text) {
  return createElement(
    "span",
    {
      className: "TableCell"
    },
    text
  );
}

function spanTagWithKeyAndText(key, text) {
  return createElement(
    "span",
    {
      className: "TableCell",
      key
    },
    text
  );
}

const template = function(child) {
  return createElement("div", null, child);
};

describe("Mixed of Keyed/Non-Keyed nodes", () => {
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

  // TOOD: Is mixin keyed non keyed supported this way?
  it("should remove two keyed nodes, and move a non-key child node", () => {
    render(
      template([spanTagWithKeyAndText("d", "b"), spanTagWithText("c")]),
      container
    );
    expect(container.textContent).toBe("bc");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("abcc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([spanTagWithKeyAndText("d", "b"), spanTagWithText("c")]),
      container
    );
    expect(container.textContent).toBe("bc");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("abcc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        null,
        spanTagWithKeyAndText("b", "b"),
        undefined,
        spanTagWithKeyAndText("e", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("abcc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        null,
        spanTagWithKeyAndText("b", "b"),
        undefined,
        spanTagWithKeyAndText("e", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("abcc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([spanTagWithKeyAndText("d", "b"), spanTagWithText("c")]),
      container
    );
    expect(container.textContent).toBe("bc");
    expect(container.firstChild.childNodes.length).toBe(2);
  });

  it("should swap the last child and add three non-key children", () => {
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c"),
        spanTagWithKeyAndText("e", "a"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bcac");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
    expect(container.firstChild.childNodes.length).toBe(2);
  });

  it("should swap, and a keyed child at the end, and add one non-key child", () => {
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithKeyAndText("e", "a"),
        spanTagWithKeyAndText("f", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("bacc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        null,
        spanTagWithKeyAndText("b", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithKeyAndText("e", "a"),
        spanTagWithKeyAndText("f", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("bacc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        undefined,
        spanTagWithKeyAndText("e", "a"),
        spanTagWithKeyAndText("f", "c"),
        spanTagWithText("c")
      ]),
      container
    );
    expect(container.textContent).toBe("bacc");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
    expect(container.firstChild.childNodes.length).toBe(2);
  });

  it("should insert keyed nodes where the last key is a non-keyed node", () => {
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("f", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
    expect(container.firstChild.childNodes.length).toBe(2);
    render(
      template([
        spanTagWithKeyAndText("a", "c"),
        spanTagWithKeyAndText("e", "c"),
        spanTagWithKeyAndText("d", "b"),
        spanTagWithKeyAndText("e2", "b"),
        spanTagWithText("g")
      ]),
      container
    );
    expect(container.textContent).toBe("ccbbg");
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("f", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("f", "b")
      ]),
      container
    );
    expect(container.textContent).toBe("ab");
  });

  it("should remove the first keyed node child, and add two non-key child nodes", () => {
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
    render(
      template([
        spanTagWithKeyAndText("a", "a"),
        spanTagWithKeyAndText("b", "b"),
        spanTagWithKeyAndText("e", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("abc");
    expect(container.firstChild.childNodes.length).toBe(3);
    render(
      template([
        spanTagWithKeyAndText("d", "b"),
        spanTagWithText("c1"),
        spanTagWithText("c2"),
        spanTagWithKeyAndText("f", "c")
      ]),
      container
    );
    expect(container.textContent).toBe("bc1c2c");
    expect(container.firstChild.childNodes.length).toBe(4);
  });
});
