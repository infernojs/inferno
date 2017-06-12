import { render } from "inferno";

function styleNode(style) {
  return <div style={style} />;
}

describe("CSS style properties (JSX)", () => {
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

  it("should set and remove dynamic styles", () => {
    const styles = { display: "none", fontFamily: "Arial", lineHeight: 2 };

    render(<div style={styles} />, container);
    expect(container.firstChild.style.fontFamily).toBe("Arial");
    expect(container.firstChild.style.lineHeight).toBe("2");

    render(<div />, container);
    expect(container.firstChild.style.fontFamily).toBe("");
    expect(container.firstChild.style.lineHeight).toBe("");
  });

  it("should update styles if initially null", () => {
    let styles = null;
    render(<div style={styles} />, container);

    styles = { display: "block" };

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe("block");
  });

  it("should update styles if updated to null multiple times", () => {
    let styles = null;

    render(<div style={undefined} />, container);

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe("");

    styles = { display: "block" };

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe("block");

    render(<div style={null} />, container);
    expect(container.firstChild.style.display).toBe("");

    render(<div style={styles} />, container);
    expect(container.firstChild.style.display).toBe("block");

    render(<div style={null} />, container);
    expect(container.firstChild.style.display).toBe("");
  });

  it("should update styles when `style` changes from null to object", () => {
    const styles = { color: "red" };
    render(<div style={123} />, container);
    render(<div style={styles} />, container);
    render(<div />, container);
    render(<div style={styles} />, container);

    const stubStyle = container.firstChild.style;
    expect(stubStyle.color).toBe("red");
  });

  it("should support different unit types - em and mm", () => {
    const styles = { height: "200em", width: "20mm" };
    render(<div style={styles} />, container);
    render(<div />, container);
    render(<div style={styles} />, container);

    const stubStyle = container.firstChild.style;
    expect(stubStyle.height).toBe("200em");
    expect(stubStyle.width).toBe("20mm");
  });

  it("should clear all the styles when removing `style`", () => {
    const styles = { display: "none", color: "red" };
    render(<div style={styles} />, container);

    const stubStyle = container.firstChild.style;
    expect(stubStyle.display).toBe("none");
    expect(stubStyle.color).toBe("red");
  });

  it("Should change styles", () => {
    const stylesOne = { color: "red" };
    render(styleNode(stylesOne), container);
    expect(container.firstChild.style.color).toBe("red");

    const styles = { color: "blue" };
    render(styleNode(styles), container);
    expect(container.firstChild.style.color).toBe("blue");

    const stylesTwo = { color: "orange" };
    render(styleNode(stylesTwo), container);
    expect(container.firstChild.style.color).toBe("orange");

    const stylesThree = { color: "orange" };
    render(styleNode(stylesThree), container);
    expect(container.firstChild.style.color).toBe("orange");
  });

  it("Should remove style attribute when next value is null", () => {
    const stylesOne = { float: "left" };
    render(styleNode(stylesOne), container);
    expect(container.firstChild.style.float).toBe("left");

    render(styleNode(null), container);
    expect(container.firstChild.style.cssText).toBe("");
    // expect(container.innerHTML).to.eql('<div></div>');
  });

  it("Should remove style attribute when single prop value is null", () => {
    const stylesOne = { float: "left", color: "red", display: "block" };
    render(styleNode(stylesOne), container);
    expect(container.firstChild.style.float).toBe("left");

    const stylesTwo = { float: "left", display: "none" };
    render(styleNode(stylesTwo), container);
    expect(container.firstChild.style.float).toBe("left");
    expect(container.firstChild.style.display).toBe("none");
    expect(container.firstChild.style.color).toBe("");
  });
});
