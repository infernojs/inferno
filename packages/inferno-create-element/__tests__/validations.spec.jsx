import { Component, render } from "inferno";
import { isNullOrUndef } from "inferno-shared";

describe("Development warnings", () => {
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

  describe("Warning two duplicate keys", () => {
    it("Should throw error if two duplicates is found", () => {
      const errorNode = (
        <div>
          <div key="1">2</div>
          <div key="1">1</div>
        </div>
      );

      expect(() => render(errorNode, container)).toThrowError('Inferno Error: Encountered two children with same key: {1}. Location: <div> :: <div>');
    });
  });

  // TODO:
  // normalize - children arguments length === 1 and no keys defined. console log error
  // TODO:
  // normalize - children arguments length > 1 and no keys defined. components ( check fiddle )
});
