import { createVNode, render } from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

describe('Delegated events', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  function element(type: string, props) {
    return createVNode(
      VNodeFlags.HtmlElement,
      type,
      null,
      null,
      ChildFlags.HasInvalidChildren,
      props,
    );
  }

  // Object.prototype has members with these names, the props are attributes like any other
  describe('props named like Object.prototype members', () => {
    const names = ['toString', 'valueOf', 'constructor', 'hasOwnProperty'];

    function props(suffix: string) {
      const result = {};

      for (let i = 0, len = names.length; i < len; ++i) {
        const name = names[i];
        result[name] = name + suffix;
      }
      return result;
    }

    it('should set them as attributes when mounting', () => {
      render(element('div', props('-1')), container);

      for (let i = 0, len = names.length; i < len; ++i) {
        const name = names[i];
        expect(container.firstChild.getAttribute(name)).toBe(name + '-1');
      }
    });

    it('should update them as attributes when patching', () => {
      render(element('div', props('-1')), container);
      render(element('div', props('-2')), container);

      for (let i = 0, len = names.length; i < len; ++i) {
        const name = names[i];
        expect(container.firstChild.getAttribute(name)).toBe(name + '-2');
      }
    });
  });

  // No other spec uses touch events, so the listener on document belongs to these tests
  describe('listeners on document', () => {
    let addSpy;
    let removeSpy;

    beforeEach(function () {
      addSpy = spyOn(document, 'addEventListener').and.callThrough();
      removeSpy = spyOn(document, 'removeEventListener').and.callThrough();
    });

    function calls(spy, type: string): any[][] {
      return spy.calls.allArgs().filter((args) => args[0] === type);
    }

    function touchMove(target: Element): void {
      target.dispatchEvent(new Event('touchmove', { bubbles: true }));
    }

    it('should add one listener for an event type and remove it with the last handler', () => {
      const first = jasmine.createSpy('first');
      const second = jasmine.createSpy('second');

      render(
        <div>
          <span onTouchMove={first} />
          <span onTouchMove={second} />
        </div>,
        container,
      );
      const spans = container.querySelectorAll('span');

      expect(calls(addSpy, 'touchmove').length).toBe(1);
      touchMove(spans[1]);
      expect(second.calls.count()).toBe(1);

      // One element still has a handler, so the listener stays
      render(
        <div>
          <span onTouchMove={first} />
          <span />
        </div>,
        container,
      );
      expect(calls(removeSpy, 'touchmove').length).toBe(0);
      touchMove(spans[0]);
      expect(first.calls.count()).toBe(1);

      // The last handler is gone, so is the listener
      render(
        <div>
          <span />
          <span />
        </div>,
        container,
      );
      const removed = calls(removeSpy, 'touchmove');

      expect(removed.length).toBe(1);
      expect(removed[0][1]).toBe(calls(addSpy, 'touchmove')[0][1]);
      touchMove(spans[0]);
      expect(first.calls.count()).toBe(1);

      // A new handler attaches the listener again
      render(
        <div>
          <span onTouchMove={first} />
          <span />
        </div>,
        container,
      );
      expect(calls(addSpy, 'touchmove').length).toBe(2);
      touchMove(spans[0]);
      expect(first.calls.count()).toBe(2);
    });

    it('should remove the listener when the elements with handlers are unmounted', () => {
      const handler = jasmine.createSpy('handler');

      render(
        <div>
          <span onTouchMove={handler} />
          <span onTouchMove={handler} />
        </div>,
        container,
      );
      render(null, container);

      expect(calls(addSpy, 'touchmove').length).toBe(1);
      expect(calls(removeSpy, 'touchmove').length).toBe(1);
    });

    it('should count an element once when its handler changes', () => {
      render(<span onTouchMove={() => {}} />, container);
      render(<span onTouchMove={() => {}} />, container);
      render(null, container);

      expect(calls(addSpy, 'touchmove').length).toBe(1);
      expect(calls(removeSpy, 'touchmove').length).toBe(1);
    });
  });
});
