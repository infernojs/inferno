import { render } from "inferno";
import createElement from "inferno-create-element";

describe("Creation - (non-JSX)", () => {
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

  [
    {
      description: "should render div with span child",
      template: () => {
        return createElement("div", null, createElement("span"));
      },
      tagName: "div",
      children: 1,
      textContent: ""
    },
    {
      description: "should render span with span child",
      template: () => createElement("span", null, createElement("span")),
      tagName: "span",
      children: 1,
      textContent: ""
    },
    {
      description: "should render div with two span children",
      template: () =>
        createElement("div", null, createElement("div"), createElement("div")),
      tagName: "div",
      children: 2,
      textContent: ""
    },
    {
      description:
        "should render div with three span children and unset middle child",
      template: () =>
        createElement(
          "div",
          null,
          createElement("span"),
          null,
          createElement("span")
        ),
      tagName: "div",
      children: 2,
      textContent: ""
    },
    {
      description:
        "should render div with three span children and unset first, and middle child",
      template: () =>
        createElement("div", null, null, null, createElement("span")),
      tagName: "div",
      children: 1,
      textContent: ""
    },
    {
      description:
        "should render div with three span children and unset first, and middle child",
      template: () => createElement("div", null, null, null, null),
      tagName: "div",
      children: 0,
      textContent: ""
    },
    {
      description: "should render div with two null children and one text node",
      template: () => createElement("div", null, null, "Baboy", null),
      tagName: "div",
      children: 1,
      textContent: "Baboy"
    },
    {
      description: "should render div with one textNode and a span children",
      template: () =>
        createElement("div", null, "Hello!", null, createElement("span")),
      tagName: "div",
      children: 2,
      textContent: "Hello!"
    },
    {
      description: "should render div with two textNodes and a span children",
      template: () =>
        createElement(
          "div",
          null,
          "Hello, ",
          null,
          "World!",
          createElement("span")
        ),
      tagName: "div",
      children: 3,
      textContent: "Hello, World!"
    },
    {
      description:
        "should render div with two textNodes and a two span children",
      template: () =>
        createElement(
          "div",
          null,
          "Hello, ",
          createElement("span"),
          "World!",
          createElement("span")
        ),
      tagName: "div",
      children: 4,
      textContent: "Hello, World!"
    },
    {
      description:
        "should render div with two textNodes and one span children, and span with textNode",
      template: () =>
        createElement(
          "div",
          null,
          "Hello",
          createElement("span"),
          ", ",
          createElement("span", null, "World!")
        ),
      tagName: "div",
      children: 4,
      textContent: "Hello, World!"
    },
    {
      description:
        "should render div with tree null values in an array for children",
      template: () => createElement("div", null, null, null, null),
      tagName: "div",
      children: 0,
      textContent: ""
    },
    {
      description:
        "should render div with b child, and tree null values in an array for children",
      template: () =>
        createElement("div", null, createElement("b", null, null, null, null)),
      tagName: "div",
      children: 1,
      textContent: ""
    },
    {
      description:
        "should render div with b child, and number and two null values in an array for children",
      template: () =>
        createElement("div", null, createElement("b", null, null, 123, null)),
      tagName: "div",
      children: 1,
      textContent: "123"
    },
    {
      description: "should render empty div",
      template: () => createElement("div"),
      tagName: "div",
      children: 0,
      textContent: ""
    },
    {
      description: "should render empty span",
      template: () => createElement("span"),
      tagName: "span",
      children: 0,
      textContent: ""
    }
  ].forEach(test => {
    it(test.description, () => {
      render(test.template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.tagName.toLowerCase()).toBe(test.tagName);
      expect(container.firstChild.childNodes.length).toBe(test.children);
      expect(container.firstChild.textContent).toBe(test.textContent);

      render(test.template(), container);
      expect(container.firstChild.nodeType).toBe(1);
      expect(container.firstChild.tagName.toLowerCase()).toBe(test.tagName);
      expect(container.firstChild.childNodes.length).toBe(test.children);
    });
  });
});
