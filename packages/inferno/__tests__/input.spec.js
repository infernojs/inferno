import { render } from "inferno";
import { innerHTML, triggerEvent } from "inferno-utils";

describe("Input type checkbox", () => {
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

  it("Checked attribute should be false", function() {
    render(<input type="checkbox" checked={false} />, container);
    const input = container.firstChild;

    expect(input.checked).toBe(false);
  });

  it("Checked attribute after Click", function() {
    let clickChecked = null;
    let changeChecked = null;

    render(
      <input
        type="checkbox"
        checked={false}
        onclick={e => {
          clickChecked = e.target.checked;
        }}
        onchange={e => {
          changeChecked = e.target.checked;
        }}
      />,
      container
    );
    const input = container.firstChild;

    triggerEvent("click", input);

    expect(input.checked).toBe(false);
    expect(clickChecked).toBe(true);
    expect(changeChecked).toBe(true);
  });
});

describe("Input type Radio", () => {
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

  it("Controlled radio, checked=false", function() {
    render(<input type="radio" checked={false} value="magic" />, container);
    const input = container.firstChild;

    expect(input.checked).toBe(false);
  });

  it("Checked attribute after Click", function() {
    let clickChecked = null;
    let changeChecked = null;

    render(
      <input
        type="radio"
        checked={false}
        value="magic"
        onclick={e => {
          clickChecked = e.target.checked;
        }}
        onchange={e => {
          changeChecked = e.target.checked;
        }}
      />,
      container
    );
    const input = container.firstChild;

    triggerEvent("click", input);

    expect(clickChecked).toBe(true);
	// check is jsdom
    if (window.name === 'nodejs') {
        expect(input.checked).toBe(true);
        expect(changeChecked).toBe(null);
    } else {
        expect(input.checked).toBe(false);
        expect(changeChecked).toBe(true);
    }
  });
});