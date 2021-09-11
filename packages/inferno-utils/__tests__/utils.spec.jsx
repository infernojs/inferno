import { createContainerWithHTML, innerHTML, sortAttributes, triggerEvent, validateNodeTree } from 'inferno-utils';

function styleStringToArray(styleString) {
  const splittedWords = styleString.split(';');
  const arr = [];

  for (let i = 0; i < splittedWords.length; i++) {
    const word = splittedWords[i].trim();

    if (word !== '') {
      arr.push(word);
    }
  }

  return arr.sort();
}

describe('Utils', () => {
  describe('sortAttributes', () => {
    it('should return sorted attributes on HTML strings', () => {
      expect(
        sortAttributes('<div zAttribute="test" aAttribute="inferno" bAttribute="running">Inferno <span fAttribute="huh" cAttr="last">is cool!</span></div>')
      ).toBe('<div aAttribute="inferno" bAttribute="running" zAttribute="test">Inferno <span cAttr="last" fAttribute="huh">is cool!</span></div>');
    });
  });

  describe('innerHTML', () => {
    it('should return the correct innerHTML', () => {
      const testHTML = '<div>Hello World <a href="//test.com/">test link</a></div>';

      expect(innerHTML(testHTML)).toBe(testHTML);
    });
  });

  describe('createContainerWithHTML', () => {
    it('should create a container with the passed in HTML', () => {
      const container = createContainerWithHTML('<h1>hello!</h1>');
      expect(container.innerHTML).toBe('<h1>hello!</h1>');
      expect(container.tagName).toBe('DIV');
    });
  });
  describe('validateNodeTree', () => {
    it('should return true if called with falsy arguments', () => {
      expect(validateNodeTree(false)).toBe(true);
      expect(validateNodeTree(null)).toBe(true);
      expect(validateNodeTree(undefined)).toBe(true);
    });

    it('should return true if called with a string', () => {
      expect(validateNodeTree('<div><h1>test</h1></div>')).toBe(true);
    });

    it('should return true if called with a number', () => {
      expect(validateNodeTree(4)).toBe(true);
    });
  });

  describe('triggerEvent', () => {
    let expectedEventType = '';
    const element = {
      dispatchEvent(event) {}
    };
    let spyDispatch;
    let spyCreateMouseEvent;
    let triggerName;
    let spyEvent;

    beforeEach(function () {
      spyDispatch = spyOn(element, 'dispatchEvent');

      spyCreateMouseEvent = spyOn(document, 'createEvent').and.callFake((ev) => {
        expect(ev).toBe(expectedEventType);

        spyEvent = {
          initEvent: (eventType, canBubble, cancelable) => {
            expect(eventType).toBe(triggerName);
            // expect(canBubble).toBe(true);
            expect(cancelable).toBe(true);
          }
        };

        return spyEvent;
      });
    });

    afterEach(function () {
      spyDispatch.calls.reset();
      spyCreateMouseEvent.calls.reset();
    });

    it('should trigger event on click', () => {
      expectedEventType = 'MouseEvents';
      triggerName = 'click';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on dblclick', () => {
      expectedEventType = 'MouseEvents';
      triggerName = 'dblclick';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on mousedown', () => {
      expectedEventType = 'MouseEvents';
      triggerName = 'mousedown';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on mouseup', () => {
      expectedEventType = 'MouseEvents';
      triggerName = 'mouseup';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on focus', () => {
      expectedEventType = 'HTMLEvents';
      triggerName = 'focus';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on change', () => {
      expectedEventType = 'HTMLEvents';
      triggerName = 'change';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on blur', () => {
      expectedEventType = 'HTMLEvents';
      triggerName = 'blur';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should trigger event on select', () => {
      expectedEventType = 'HTMLEvents';
      triggerName = 'select';

      triggerEvent(triggerName, element);

      expect(spyDispatch.calls.argsFor(0)[0]).toBe(spyEvent);
    });

    it('should throw an error on unknown event', () => {
      expectedEventType = 'HTMLEvents';
      triggerName = 'blah';

      expect(triggerEvent.bind(triggerEvent, triggerName, element)).toThrowError(Error);
    });
  });
});
