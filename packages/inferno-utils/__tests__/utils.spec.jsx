import { render } from "inferno";
import { renderToString } from "inferno-server";
import {
  createContainerWithHTML,
  createStyler,
  innerHTML,
  sortAttributes,
  style,
  triggerEvent,
  validateNodeTree
} from "inferno-utils";
import sinon from "sinon";

const styleStringToArray = styleString =>
  styleString.split(";").map(s => s.trim());

describe("Utils", () => {
  describe("sortAttributes", () => {
    it("should return sorted attributes on HTML strings", () => {
      expect(
        sortAttributes(
          '<div zAttribute="test" aAttribute="inferno" bAttribute="running">Inferno <span fAttribute="huh" cAttr="last">is cool!</span></div>'
        )
      ).toBe(
        '<div aAttribute="inferno" bAttribute="running" zAttribute="test">Inferno <span cAttr="last" fAttribute="huh">is cool!</span></div>'
      );
    });
  });

  describe("innerHTML", () => {
    it("should return the correct innerHTML", () => {
      const testHTML =
        '<div>Hello World <a href="//test.com/">test link</a></div>';

      expect(innerHTML(testHTML)).toBe(testHTML);
    });
  });

  describe("createStyler", () => {
    it('should return "" if undefined', () => {
      expect(createStyler(undefined)).toBe("");
    });

    it('should return "" if null', () => {
      expect(createStyler(null)).toBe("");
    });

    it("should create a valid CSS string", () => {
      const CSS = `
				position: relative;
				top: -20
				left: 5;
				right: 10px;
			`;
      const validCSS = "position: relative; right: 10px;";

      expect(styleStringToArray(createStyler(CSS))).toEqual(
        styleStringToArray(validCSS)
      );
    });
  });

  describe("style", () => {
    it("should map an array", () => {
      const CSS = ["1", "position: relative;", "3"];

      const expected = ["", "position: relative;", ""];
      const actual = style(CSS);

      expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
    });

    it("return the created style", () => {
      const CSS = `
				position: relative;
				top: -20
				left: 5;
				right: 10px;
			`;

      expect(styleStringToArray(style(CSS))).toEqual(
        styleStringToArray(createStyler(CSS))
      );
    });
  });

  describe("createContainerWithHTML", () => {
    it("should create a container with the passed in HTML", () => {
      const container = createContainerWithHTML("<h1>hello!</h1>");
      expect(container.innerHTML).toBe("<h1>hello!</h1>");
      expect(container.tagName).toBe("DIV");
    });
  });
  describe("validateNodeTree", () => {
    it("should return true if called with falsy arguments", () => {
      expect(validateNodeTree(false)).toBe(true);
      expect(validateNodeTree(null)).toBe(true);
      expect(validateNodeTree(undefined)).toBe(true);
    });

    it("should return true if called with a string", () => {
      expect(validateNodeTree("<div><h1>test</h1></div>")).toBe(true);
    });

    it("should return true if called with a number", () => {
      expect(validateNodeTree(4)).toBe(true);
    });

    it("should return true on a valid node tree", () => {
      const node = <div><span>Hello world</span></div>;
      const html = renderToString(node);
      const container = createContainerWithHTML(html);
      render(node, container);
      expect(validateNodeTree(node)).toBe(true);
    });
  });

  describe("triggerEvent", () => {
    const element = {
      dispatchEvent(event) {}
    };
    const spyDispatch = sinon.spy(element, "dispatchEvent");
    let spyCreateMouseEvent;

    afterEach(function() {
      spyDispatch.reset();
      spyCreateMouseEvent.restore();
    });

    it("should trigger event on click", () => {
      const triggerName = "click";
      const triggeredEventType = "MouseEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on dblclick", () => {
      const triggerName = "dblclick";
      const triggeredEventType = "MouseEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on mousedown", () => {
      const triggerName = "mousedown";
      const triggeredEventType = "MouseEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on mouseup", () => {
      const triggerName = "mouseup";
      const triggeredEventType = "MouseEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on focus", () => {
      const triggerName = "focus";
      const triggeredEventType = "HTMLEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on change", () => {
      const triggerName = "change";
      const triggeredEventType = "HTMLEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(false);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on blur", () => {
      const triggerName = "blur";
      const triggeredEventType = "HTMLEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should trigger event on select", () => {
      const triggerName = "select";
      const triggeredEventType = "HTMLEvents";
      const event = {
        initEvent: (eventType, canBubble, cancelable) => {
          expect(eventType).toBe(triggerName);
          expect(canBubble).toBe(true);
          expect(cancelable).toBe(true);
        }
      };
      spyCreateMouseEvent = sinon
        .stub(document, "createEvent")
        .callsFake(eventInterface => {
          expect(eventInterface).toBe(triggeredEventType);

          return event;
        });

      triggerEvent(triggerName, element);

      expect(spyDispatch.args[0][0]).toBe(event);
      expect(spyDispatch.args[0][1]).toBe(true);
    });

    it("should throw an error on unknown event", () => {
      const triggerName = "blah";

      expect(
        triggerEvent.bind(triggerEvent, triggerName, element)
      ).toThrowError(Error);
    });
  });
});
