import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { createElement, isValidElement } from "inferno-compat";

describe("Compat Children", () => {
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

  function renderCompatTestElement(element) {
    render(element, container);
  }

  it("should create a VNode with the correct className", function() {
    const element = createElement("div", { className: "foo", test: "hi" });
    expect(element.className).toBe("foo");
    expect(element.props).toEqual({ test: "hi", className: "foo" });
  });

  it("Should render element with a text string", function() {
    const element = createElement("div", null, "body text");
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(innerHTML("<div>body text</div>"));
  });

  it("Should render element with an array of one text string", function() {
    const element = createElement("div", null, ["body text"]);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(innerHTML("<div>body text</div>"));
  });

  it("Should render element with an array of two text strings", function() {
    const element = createElement("div", null, ["first text", "second text"]);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div>first textsecond text</div>")
    );
  });

  it("Should render element with child element", function() {
    const child = createElement("span", null, "child body text");
    expect(isValidElement(child)).toBe(true);

    const element = createElement("div", null, child);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div><span>child body text</span></div>")
    );
  });

  it("Should render element with an array of one child element", function() {
    const child = createElement("span", null, "child body text");
    expect(isValidElement(child)).toBe(true);

    const element = createElement("div", null, [child]);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div><span>child body text</span></div>")
    );
  });

  it("Should render element with an array of two child elements", function() {
    const first_child = createElement("span", null, "first text");
    expect(isValidElement(first_child)).toBe(true);

    const second_child = createElement("span", null, "second text");
    expect(isValidElement(second_child)).toBe(true);

    const element = createElement("div", null, [first_child, second_child]);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div><span>first text</span><span>second text</span></div>")
    );
  });

  it("Should render element with an array of a string and a child element", function() {
    const second_child = createElement("span", null, "second text");
    expect(isValidElement(second_child)).toBe(true);

    const element = createElement("div", null, ["first text", second_child]);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div>first text<span>second text</span></div>")
    );
  });

  function arrayAsBasicIterator(array) {
    return {
      [Symbol.iterator]: function() {
        let idx = 0;
        return {
          next() {
            if (idx < array.length) {
              return { value: array[idx++], done: false };
            } else {
              return { done: true };
            }
          }
        };
      }
    };
  }

  it("Should render element with an iterable of one text string", function() {
    const iterable = arrayAsBasicIterator(["generated body text"]);
    const element = createElement("div", null, iterable);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div>generated body text</div>")
    );
  });

  it("Should render element with an iterable of one child element", function() {
    const child = createElement("span", null, "generated child body text");
    expect(isValidElement(child)).toBe(true);

    const iterable = arrayAsBasicIterator([child]);
    const element = createElement("div", null, iterable);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML("<div><span>generated child body text</span></div>")
    );
  });

  it("Should render element with an iterable of a child element and a string", function() {
    const child = createElement("span", null, "generated child body text");
    expect(isValidElement(child)).toBe(true);

    const iterable = arrayAsBasicIterator([child, "generated body text"]);
    const element = createElement("div", null, iterable);
    expect(isValidElement(element)).toBe(true);

    renderCompatTestElement(element);

    expect(container.innerHTML).toBe(
      innerHTML(
        "<div><span>generated child body text</span>generated body text</div>"
      )
    );
  });
});
