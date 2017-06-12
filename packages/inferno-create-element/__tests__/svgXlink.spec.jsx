import { render } from "inferno";

describe("createTree - SVG (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  afterEach(function() {
    render(null, container);
  });

  it("should remove namespaced SVG attributes", () => {
    render(
      <svg>
        <image xlink:href="http://i.imgur.com/w7GCRPb.png" />
      </svg>,
      container
    );

    expect(container.firstChild.tagName).toEqual("svg");
    expect(
      container.firstChild.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(true);

    render(
      <svg>
        <image />
      </svg>,
      container
    );

    expect(container.firstChild.tagName).toEqual("svg");
    expect(
      container.firstChild.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(false);
  });

  it("should update namespaced SVG attributes", () => {
    render(
      <svg>
        <image xlink:href="http://i.imgur.com/w7GCRPb.png" />
      </svg>,
      container
    );

    expect(container.firstChild.tagName).toEqual("svg");
    expect(
      container.firstChild.firstChild.hasAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe(true);

    render(
      <svg>
        <image xlink:href="http://i.imgur.com/JvqCM2p.png" />
      </svg>,
      container
    );

    expect(container.firstChild.tagName).toEqual("svg");
    expect(
      container.firstChild.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("http://i.imgur.com/JvqCM2p.png");
  });

  it("should add / change / remove xlink:href attribute", () => {
    render(
      <svg>
        <use xlink:href="#test" />
      </svg>,
      container
    );

    expect(
      container.firstChild.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("#test");

    render(
      <svg>
        <use xlink:href="#changed" />
      </svg>,
      container
    );

    expect(
      container.firstChild.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("#changed");

    render(
      <svg>
        <use />
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

  it("should add / change / remove xlinkHref attribute (babel plugin should transpile it)", () => {
    render(
      <svg>
        <use xlinkHref="#test" />
      </svg>,
      container
    );

    expect(
      container.firstChild.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("#test");

    render(
      <svg>
        <use xlinkHref="#changed" />
      </svg>,
      container
    );

    expect(
      container.firstChild.firstChild.getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href"
      )
    ).toBe("#changed");

    render(
      <svg>
        <use />
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
});
