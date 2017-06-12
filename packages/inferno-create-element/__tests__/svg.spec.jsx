import { render } from "inferno";
import { innerHTML } from "inferno-utils";

describe("createTree - SVG (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  afterEach(function() {
    render(null, container);
  });

  it("should render svg as <svg>", () => {
    render(null, container);
    render(<svg />, container);
    expect(innerHTML(container.innerHTML)).toBe(innerHTML("<svg></svg>"));
  });

  it("should use the parent namespace by default", () => {
    render(null, container);
    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle xmlns="http://www.w3.org/2000/svg" />
      </svg>,
      container
    );
    expect(innerHTML(container.firstChild.firstChild.tagName)).toBe("circle");
    expect(innerHTML(container.firstChild.getAttribute("xmlns"))).toBe(
      "http://www.w3.org/2000/svg"
    );

    render(null, container);
    expect(container.innerHTML).toBe("");
  });

  it("should keep parent namespace", () => {
    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle />
      </svg>,
      container
    );
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    render(null, container);
    render(
      <svg width="100" height="100">
        <g>
          <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
        </g>
        <g>
          <g>
            <circle cx="50" cy="50" r="40" stroke="green" fill="yellow" />
          </g>
        </g>
      </svg>,
      container
    );
    expect(container.childNodes[0].namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.childNodes[0].childNodes[0].tagName).toBe("g");
    expect(container.childNodes[0].childNodes[0].namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.childNodes[0].childNodes[0].firstChild.tagName).toBe(
      "circle"
    );
    expect(container.childNodes[0].childNodes[0].firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    expect(container.childNodes[0].childNodes[1].tagName).toBe("g");
    expect(container.childNodes[0].childNodes[1].namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.childNodes[0].childNodes[1].firstChild.tagName).toBe("g");
    expect(container.childNodes[0].childNodes[1].firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(
      container.childNodes[0].childNodes[1].firstChild.firstChild.tagName
    ).toBe("circle");
    expect(
      container.childNodes[0].childNodes[1].firstChild.firstChild.namespaceURI
    ).toBe("http://www.w3.org/2000/svg");

    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle />
      </svg>,
      container
    );
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should keep parent namespace with xmlns attribute", () => {
    render(
      <svg xmlns="http://www.w3.org/2000/svg">
        <circle />
      </svg>,
      container
    );
    expect(container.firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    render(
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle
            xmlns="http://www.w3.org/2000/svg"
            cx="50"
            cy="50"
            r="40"
            stroke="green"
            fill="yellow"
          />
        </g>
        <g>
          <circle
            xmlns="http://www.w3.org/2000/svg"
            cx="50"
            cy="50"
            r="40"
            stroke="green"
            fill="yellow"
            foo={undefined}
          />
        </g>
      </svg>,
      container
    );
    expect(container.childNodes[0].namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.childNodes[0].childNodes[0].tagName).toBe("g");
    expect(container.childNodes[0].childNodes[0].namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.childNodes[0].childNodes[0].firstChild.tagName).toBe(
      "circle"
    );
    expect(
      container.childNodes[0].childNodes[0].firstChild.getAttribute("xmlns")
    ).toBe("http://www.w3.org/2000/svg");
    expect(container.childNodes[0].childNodes[0].firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );

    expect(container.childNodes[0].childNodes[1].tagName).toBe("g");
    expect(container.childNodes[0].childNodes[1].namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
    expect(container.childNodes[0].childNodes[1].firstChild.tagName).toBe(
      "circle"
    );
    expect(
      container.childNodes[0].childNodes[1].firstChild.getAttribute("xmlns")
    ).toBe("http://www.w3.org/2000/svg");
    expect(container.childNodes[0].childNodes[1].firstChild.namespaceURI).toBe(
      "http://www.w3.org/2000/svg"
    );
  });

  it("should set and remove dynamic class property", () => {
    const value = "foo";

    render(<svg className={value} />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.getAttribute("class")).toBe("foo");

    render(<svg />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.hasAttribute("class")).toBe(false);
  });

  it("should set and remove dynamic class attribute", () => {
    const value = "foo";

    render(<svg className={value} />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.getAttribute("class")).toBe("foo");

    render(<svg />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.hasAttribute("class")).toBe(false);
  });

  it("should set static class attribute, update to dynamic attr, and remove", () => {
    render(<svg className={null} />, container);
    render(<svg className={{}} />, container);
    render(<svg className="bar" />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.getAttribute("class")).toBe("bar");

    const value = "foo";

    render(<svg className={value} />, container);
    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.getAttribute("class")).toBe("foo");

    render(<svg />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.hasAttribute("class")).toBe(false);
  });

  it("should remove known SVG camel case attributes", () => {
    render(<svg viewBox="0 0 100 100" />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.hasAttribute("viewBox")).toBe(true);

    render(<svg />, container);

    expect(container.firstChild.tagName).toEqual("svg");
    expect(container.firstChild.hasAttribute("viewBox")).toBe(false);
  });

  it("should remove arbitrary SVG camel case attributes", () => {
    render(<svg theWord="theBird" />, container);

    expect(container.firstChild.hasAttribute("theWord")).toBe(true);
    render(<svg />, container);
    expect(container.firstChild.hasAttribute("theWord")).toBe(false);
  });

  it("should remove namespaced SVG attributes", () => {
    render(<svg clip-path="0 0 110 110" />, container);

    expect(container.firstChild.tagName).toEqual("svg");

    expect(container.firstChild.hasAttribute("clip-path")).toBe(true);

    render(
      <svg>
        <image />
      </svg>,
      container
    );

    expect(
      container.firstChild.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);
  });

  it("should remove namespaced SVG attributes", () => {
    render(<svg clip-path="0 0 110 110" />, container);

    expect(container.firstChild.tagName).toEqual("svg");

    expect(container.firstChild.hasAttribute("clip-path")).toBe(true);

    render(
      <svg>
        <image />
      </svg>,
      container
    );

    expect(
      container.firstChild.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);
  });

  it("Should make SVG and children with spread attribute", () => {
    const spread = { id: "test" };

    render(<svg {...spread} />, container);
    expect(innerHTML(container.innerHTML)).toBe(
      innerHTML('<svg id="test"></svg>')
    );
  });
});
