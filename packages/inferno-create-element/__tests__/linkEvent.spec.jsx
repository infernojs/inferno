import { linkEvent, render } from "inferno";
import Component from "inferno-component";

describe("linkEvent", () => {
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

  describe("linkEvent on a button (onClick)", () => {
    let test;

    function handleOnClick(props) {
      test = props.test;
    }

    function FunctionalComponent(props) {
      return <button onClick={linkEvent(props, handleOnClick)} />;
    }

    class StatefulComponent extends Component {
      render() {
        return <button onClick={linkEvent(this.props, handleOnClick)} />;
      }
    }

    it("should work correctly for functional components", () => {
      render(<FunctionalComponent test="123" />, container);
      container.querySelector("button").click();
      expect(test).toBe("123");
    });

    it("should work correctly for stateful components", () => {
      render(<StatefulComponent test="456" />, container);
      container.querySelector("button").click();
      expect(test).toBe("456");
    });

    it("Should not fail when given event is invalid", () => {
      render(<div onClick={linkEvent({ number: 1 }, null)} />, container);
      container.firstChild.click();
      render(<div onClick={linkEvent({ number: 1 }, undefined)} />, container);
      container.firstChild.click();
      render(<div onClick={linkEvent({ number: 1 }, false)} />, container);
      container.firstChild.click();
      render(<div onClick={linkEvent({ number: 1 }, true)} />, container);
      container.firstChild.click();
      render(<div onClick={linkEvent({ number: 1 }, {})} />, container);
      container.firstChild.click();
    });
  });

  describe("linkEvent on a button (onclick) - no delegation", () => {
    let test;

    function handleOnClick(props) {
      test = props.test;
    }

    function FunctionalComponent(props) {
      return <button onclick={linkEvent(props, handleOnClick)} />;
    }

    class StatefulComponent extends Component {
      render() {
        return <button onclick={linkEvent(this.props, handleOnClick)} />;
      }
    }

    it("should work correctly for functional components", () => {
      render(<FunctionalComponent test="123" />, container);
      container.querySelector("button").click();
      expect(test).toBe("123");
    });

    it("should work correctly for stateful components", () => {
      render(<StatefulComponent test="456" />, container);
      container.querySelector("button").click();
      expect(test).toBe("456");
    });
  });

  describe("linkEvent on a input (onInput)", () => {
    let test;
    let event;

    function simulateInput(elm, text) {
      if (typeof Event !== "undefined") {
        const newEvent = document.createEvent("Event");
        newEvent.initEvent("input", true, true);

        elm.dispatchEvent(newEvent);
      } else {
        elm.oninput({
          target: elm
        });
      }
    }

    function handleOnInput(props, e) {
      test = props.test;
      event = e;
    }

    function FunctionalComponent(props) {
      return (
        <input type="text" onInput={linkEvent(props, handleOnInput)} value="" />
      );
    }

    class StatefulComponent extends Component {
      render() {
        return (
          <input
            type="text"
            onInput={linkEvent(this.props, handleOnInput)}
            value=""
          />
        );
      }
    }

    it("should work correctly for functional components", () => {
      render(<FunctionalComponent test="123" />, container);
      simulateInput(container.querySelector("input"), "123");
      expect(test).toBe("123");
      expect(event.target.nodeName).toBe("INPUT");
    });

    it("should work correctly for stateful components", () => {
      render(<StatefulComponent test="456" />, container);
      simulateInput(container.querySelector("input"), "123");
      expect(test).toBe("456");
      expect(event.target.nodeName).toBe("INPUT");
    });
  });

  describe("linkEvent on a input (onfocus and onblur) - no delegation", () => {
    let isFocus;
    let isBlur;

    function handleOnFocus(id) {
      isFocus = id;
    }

    function handleOnBlur(id) {
      isBlur = id;
    }

    function FunctionalComponent(props) {
      return (
        <div>
          <input
            onfocus={linkEvent("1234", handleOnFocus)}
            onblur={linkEvent("4321", handleOnBlur)}
          />
        </div>
      );
    }

    class StatefulComponent extends Component {
      render() {
        return (
          <div>
            <input
              onfocus={linkEvent("1234", handleOnFocus)}
              onblur={linkEvent("4321", handleOnBlur)}
            />
          </div>
        );
      }
    }

    function simulateFocus(elm) {
      if (typeof Event !== "undefined") {
        const newEvent = document.createEvent("UIEvent");
        newEvent.initEvent("focus", true, true);

        elm.dispatchEvent(newEvent);
      } else {
        elm.focus();
      }
    }

    function simulateBlur(elm) {
      if (typeof Event !== "undefined") {
        const newEvent = document.createEvent("UIEvent");
        newEvent.initEvent("blur", true, true);

        elm.dispatchEvent(newEvent);
      } else {
        elm.blur();
      }
    }

    it("should work correctly for functional components", done => {
      render(<FunctionalComponent />, container);
      const input = container.querySelector("input");
      simulateFocus(input);
      requestAnimationFrame(() => {
        simulateBlur(input);
        requestAnimationFrame(() => {
          expect(isFocus).toBe("1234");
          expect(isBlur).toBe("4321");
          done();
        });
      });
    });

    it("should work correctly for stateful components", done => {
      render(<StatefulComponent />, container);
      const input = container.querySelector("input");
      simulateFocus(input);
      requestAnimationFrame(() => {
        simulateBlur(input);
        requestAnimationFrame(() => {
          expect(isFocus).toBe("1234");
          expect(isBlur).toBe("4321");
          done();
        });
      });
    });
  });
});
