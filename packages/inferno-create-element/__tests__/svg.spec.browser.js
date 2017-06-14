import { render } from "inferno";
import createElement from "inferno-create-element";

describe("SVG (non-jsx)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  afterEach(function() {
    render(null, container);
  });

  it("should set attributes correctly", () => {
    const template = val1 => createElement("svg", { height: val1 });

    render(template(null), container);
    render(template(200), container);
    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("height")).toEqual("200");
    render(template(null), container);
    render(template(200), container);
    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("height")).toEqual("200");
  });

  it("should respect SVG namespace and render SVG attributes", () => {
    let template;

    template = val1 =>
      createElement(
        "svg",
        {
          xmlns: "http://www.w3.org/2000/svg",
          version: "1.1",
          baseProfile: "full",
          width: "200",
          height: val1
        },
        null
      );

    render(template(200), container);
    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("xmlns")).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("version")).toEqual("1.1");
    expect(container.firstChild.getAttribute("baseProfile")).toEqual("full");
    expect(container.firstChild.getAttribute("width")).toEqual("200");

    render(template(null), container);

    template = () => createElement("svg", { width: 200 }, null);
    render(template(), container);

    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("width")).toEqual("200");

    render(template(), container);

    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("width")).toEqual("200");
  });

  it("should set SVG as default namespace for <svg>", () => {
    let template;

    template = () => createElement("svg", null);

    render(template(), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    render(template(), container);

    template = () => createElement("svg", null, createElement("path", null));

    render(template(), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should unset a namespaced attributes #1", () => {
    const template = val =>
      createElement("svg", null, createElement("image", { "xlink:href": val }));

    render(template(null), container);
    render(template("test.jpg"), container);
    expect(
      container.firstChild.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("test.jpg");

    render(template(null), container);
    expect(
      container.firstChild.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);
  });

  it("should unset a namespaced attributes #2", () => {
    const template = val =>
      createElement("image", {
        "xlink:href": val
      });

    render(template(null), container);
    expect(
      container.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);

    render(template(null), container);
    expect(
      container.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);
  });

  it("should unset a namespaced attributes #3", () => {
    const template = val =>
      createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        "xlink:href": val
      });

    render(template(null), container);
    expect(
      container.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);

    render(template("test.jpg"), container);
    expect(
      container.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("test.jpg");
  });

  it("should use the parent namespace by default (static)", () => {
    let template;

    template = () => createElement("svg", null, createElement("circle", null));

    render(template(), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    render(template(), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    template = () => createElement("svg", null, createElement("path", null));

    render(template(), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    template = () => createElement("svg", null);

    render(template(), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should handle SVG edge case (static)", () => {
    const template = child =>
      createElement("div", null, createElement("svg", null));

    render(template(), container);
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    render(template(), container);
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should keep parent namespace (dynamic)", () => {
    let child,
      template = _child =>
        createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg"
          },
          _child
        );

    child = () => createElement("circle", null);

    render(template(child()), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    render(template(null), container);

    child = () =>
      createElement(
        "circle",
        {
          xmlns: "http://www.w3.org/2000/svg"
        },
        createElement("circle", {
          xmlns: "http://www.w3.org/2000/svg"
        })
      );

    render(template(child()), container);
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    render(template(null), container);

    child = () =>
      createElement(
        "circle",
        null,
        createElement(
          "circle",
          null,
          createElement("g", {
            xmlns: "http://www.w3.org/2000/svg"
          })
        )
      );

    render(template(child()), container);
    expect(container.firstChild.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(
      container.firstChild.firstChild.firstChild.firstChild.namespaceURI
    ).toBe("http://www.w3.org/2000/svg");

    child = () =>
      createElement(
        "circle",
        null,
        createElement(
          "circle",
          null,
          createElement("g", null, createElement("g", null))
        )
      );
    render(template(child()), container);
    expect(
      container.firstChild.firstChild.firstChild.firstChild.namespaceURI
    ).toBe("http://www.w3.org/2000/svg");

    child = () =>
      createElement(
        "circle",
        null,
        createElement(
          "circle",
          null,
          createElement(
            "g",
            null,
            createElement("g", null, createElement("circle", null))
          )
        )
      );

    render(template(null), container);
    render(template(child()), container);
    expect(
      container.firstChild.firstChild.firstChild.firstChild.firstChild
        .namespaceURI
    ).toBe("http://www.w3.org/2000/svg");
    render(template(null), container);
    render(template(child()), container);
    expect(
      container.firstChild.firstChild.firstChild.firstChild.firstChild
        .namespaceURI
    ).toBe("http://www.w3.org/2000/svg");
  });

  it("should set class attribute", () => {
    const template = val =>
      createElement("image", {
        class: val
      });

    render(template("foo"), container);
    expect(container.firstChild.getAttribute("class")).toBe("foo");
    render(template(null), container);

    render(template("bar"), container);
    expect(container.firstChild.getAttribute("class")).toBe("bar");

    render(template(["bar"]), container);
    expect(container.firstChild.getAttribute("class")).toBe("bar");

    render(template(["bar", "zoo"]), container);
    expect(container.firstChild.getAttribute("class")).toBe("bar,zoo");

    // TODO! Fix this
    // render(template([ 'bar', null, 'zoo' ]), container);
    // expect(container.firstChild.getAttribute('class')).toEqual('bar,zoo');
  });

  it("should respect SVG namespace and render SVG attributes", () => {
    const template = (val1, val2) =>
      createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        version: "1.1",
        baseProfile: "full",
        width: val1,
        height: val2
      });

    render(template(200, 200), container);

    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("xmlns")).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("version")).toEqual("1.1");
    expect(container.firstChild.getAttribute("baseProfile")).toEqual("full");
    expect(container.firstChild.getAttribute("width")).toEqual("200");
    expect(container.firstChild.getAttribute("height")).toEqual("200");

    render(template(300, 300), container);

    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("xmlns")).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("version")).toEqual("1.1");
    expect(container.firstChild.getAttribute("baseProfile")).toEqual("full");
    expect(container.firstChild.getAttribute("width")).toEqual("300");
    expect(container.firstChild.getAttribute("height")).toEqual("300");
  });

  it('should set "viewBox" attribute', () => {
    const template = () =>
      createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 50 20"
      });

    render(template(), container);

    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("xmlns")).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("viewBox")).toEqual("0 0 50 20");

    render(template(), container);

    expect(container.firstChild.tagName.toLowerCase()).toEqual("svg");
    expect(container.firstChild.namespaceURI).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("xmlns")).toEqual(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.getAttribute("viewBox")).toEqual("0 0 50 20");
  });

  it("should solve SVG edge when wrapped inside a non-namespace element (static)", () => {
    const template = () =>
      createElement("div", null, createElement("svg", null));

    render(template(), container);
    // expect(container.firstChild.firstChild.tagName).toEqual('http://www.w3.org/2000/svg');
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should solve SVG edge case with XMLNS attribute when wrapped inside a non-namespace element (static)", () => {
    const template = () =>
      createElement(
        "div",
        {
          xmlns: "http://www.w3.org/2000/svg"
        },
        createElement("svg", null)
      );

    render(template(), container);
    // expect(container.firstChild.firstChild.tagName).toEqual('http://www.w3.org/2000/svg');
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should solve SVG edge when wrapped inside a non-namespace element (static)", () => {
    const template = () =>
      createElement(
        "div",
        null,
        createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg"
        })
      );

    render(template(), container);
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    render(template(), container);
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should be possible to add className to SVG", () => {
    const template = () =>
      createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: "class1 class2"
      });

    render(template(), container);
    expect(container.firstChild.getAttribute("class")).toBe("class1 class2");
  });

  it("should be possible to remove className from SVG", () => {
    const template = val =>
      createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: val
      });

    render(template("class1 class2"), container);
    expect(container.firstChild.getAttribute("class")).toBe("class1 class2");
    render(template("class1"), container);
    expect(container.firstChild.getAttribute("class")).toBe("class1");
    render(template(), container);
    expect(container.firstChild.getAttribute("class")).toBe(null);
  });

  it("should follow last wins when both class and className are defined", () => {
    const template = () =>
      createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        class: "test",
        className: "class1 class2"
      });

    render(template(), container);
    expect(container.firstChild.getAttribute("class")).toBe("class1 class2");
  });

  it("should respect XHTML namespace inside foreignObject of SVG", () => {
    const template = extraElement =>
      createElement(
        "svg",
        null,
        createElement(
          "foreignObject",
          null,
          createElement("div", null, extraElement ? createElement("p") : null)
        )
      );

    render(template(false), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/1999/xhtml"
    );
    render(template(true), container);
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.firstChild.firstChild.firstChild.namespaceURI).toBe(
      "http://www.w3.org/1999/xhtml"
    );
    expect(
      container.firstChild.firstChild.firstChild.firstChild.namespaceURI
    ).toBe("http://www.w3.org/1999/xhtml");
  });
});
