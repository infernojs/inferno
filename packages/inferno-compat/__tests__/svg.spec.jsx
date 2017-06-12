import { render } from "inferno";
import { createElement } from "inferno-compat";

describe("svg", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
  });

  afterEach(function() {
    render(null, container);
  });

  it("Should work with normal svg attributes", () => {
    render(
      createElement(
        "svg",
        {
          height: "16",
          width: "16",
          viewBox: "0 0 1024 1024"
        },
        [
          createElement("stop", {
            offset: 0,
            stopColor: "white",
            stopOpacity: 0.5
          })
        ]
      ),
      container
    );

    expect(container.firstChild.getAttribute("viewBox")).toBe("0 0 1024 1024");
    expect(container.firstChild.getAttribute("height")).toBe("16");
    expect(container.firstChild.getAttribute("width")).toBe("16");
    expect(container.firstChild.firstChild.tagName).toBe("stop");
    expect(container.firstChild.firstChild.getAttribute("stop-color")).toBe(
      "white"
    );
    expect(container.firstChild.firstChild.getAttribute("stop-opacity")).toBe(
      "0.5"
    );
  });

  it("Should work with namespace svg attributes", () => {
    render(
      createElement("svg", null, [
        createElement("image", {
          xlinkHref: "http://i.imgur.com/w7GCRPb.png"
        })
      ]),
      container
    );

    expect(container.firstChild.firstChild.tagName).toBe("image");
    expect(container.firstChild.firstChild.getAttribute("xlink:href")).toBe(
      "http://i.imgur.com/w7GCRPb.png"
    );
  });
});
