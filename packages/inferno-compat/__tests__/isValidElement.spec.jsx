import createElement from "inferno-create-element";
import { isValidElement } from "inferno-compat";
import { cloneVNode } from "inferno";
import h from "inferno-hyperscript";
import Component from "inferno-component";

describe("isValidElement", () => {
  it("Should not work with non-object", () => {
    expect(isValidElement(33)).toBe(false);
    expect(isValidElement(false)).toBe(false);
    expect(isValidElement(true)).toBe(false);
    expect(isValidElement("some text")).toBe(false);
    expect(isValidElement(0)).toBe(false);
    expect(isValidElement(undefined)).toBe(false);
  });

  it("Should not work with invalid object", () => {
    expect(isValidElement(null)).toBe(false);
    expect(isValidElement({})).toBe(false);
    expect(isValidElement({ dom: "fake data" })).toBe(false);
  });

  it("Should not work with a number", () => {
    expect(isValidElement(33)).toBe(false);
  });

  it("Should work with createElement (element)", () => {
    const el = createElement("div", null, "Do a thing");
    expect(isValidElement(el)).toBe(true);
  });

  it("Should work with createElement (stateless component)", () => {
    const el = createElement("div", null, "Do a thing");
    const Comp = () => el;
    const comp = createElement(Comp);
    expect(isValidElement(comp)).toBe(true);
  });

  it("Should work with createElement (stateful component)", () => {
    class Comp extends Component {
      render() {
        return createElement("div", null, "Do a thing");
      }
    }
    const comp = createElement(Comp);
    expect(isValidElement(comp)).toBe(true);
  });

  it("Should work with JSX", () => {
    const node = <div>Hello world</div>;
    expect(isValidElement(node)).toBe(true);
  });

  it("Should work with cloneVNode", () => {
    const node = <div>Hello world</div>;
    const clonedNode = cloneVNode(node, null, "Hello world 2!");
    expect(isValidElement(clonedNode)).toBe(true);
  });

  it("Should work with hyperscript (element)", () => {
    const el = h("div", "Do a thing");
    expect(isValidElement(el)).toBe(true);
  });

  it("Should work with hyperscript (stateless component)", () => {
    const el = h("div", "Do a thing");
    const Comp = () => el;
    const comp = h(Comp);
    expect(isValidElement(comp)).toBe(true);
  });

  it("Should work with hyperscript (stateful component)", () => {
    class Comp extends Component {
      render() {
        return h("div", "Do a thing");
      }
    }
    const comp = h(Comp);
    expect(isValidElement(comp)).toBe(true);
  });

  it("Should not work with a stateless component (using createElement)", () => {
    const el = createElement("div", null, "Do a thing");
    const Comp = () => el;
    expect(isValidElement(Comp)).toBe(false);
  });

  it("Should not work with a stateless component (using hyperscript)", () => {
    const el = h("div", "Do a thing");
    const Comp = () => el;
    expect(isValidElement(Comp)).toBe(false);
  });

  it("Should not work with a stateful component (using createElement)", () => {
    class Comp extends Component {
      render() {
        return createElement("div", null, "Do a thing");
      }
    }
    expect(isValidElement(Comp)).toBe(false);
  });

  it("Should not work with a stateful component (using hyperscript)", () => {
    class Comp extends Component {
      render() {
        return h("div", "Do a thing");
      }
    }
    expect(isValidElement(Comp)).toBe(false);
  });
});
