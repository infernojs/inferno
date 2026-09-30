import {
  addClassName,
  clearDimensions,
  forceReflow,
  getDimensions,
  registerTransitionListener,
  removeClassName,
  setDimensions,
  setDisplay,
  waitForTransitions,
} from '../src/utils';

describe('inferno-animation utils', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  function renderTemplate(dom): void {
    dom.innerHTML = '<div><div class="target">content</div></div>';
  }

  it('addClassName appends a class name and ignores an empty one', () => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;
    addClassName(el, 'test');
    addClassName(el, '');
    expect(el.className).toEqual('target test');
  });

  it('removeClassName removes a class name and ignores an empty one', () => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;
    removeClassName(el, 'target');
    removeClassName(el, '');
    expect(el.className).toEqual('');
  });

  it('forceReflow returns a defined value', () => {
    renderTemplate(container);
    const res = forceReflow();
    expect(res).not.toBeUndefined();
  });

  it('setDisplay sets display and removes it when given undefined', () => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;
    setDisplay(el, 'block');
    setDisplay(el, 'block');
    expect(el.style.getPropertyValue('display')).toEqual('block');

    // Removes style prop
    setDisplay(el, undefined);
    // NOTE: For some reason we get a lingering 'style' attribute in on the DOM
    // element. This is the recomended though
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/removeAttribute
    expect(el.outerHTML).toEqual('<div class="target" style="">content</div>');

    // Just clear display prop

    setDisplay(el, 'block');
    setDimensions(el, 10, 10);
    setDisplay(el, undefined);
    expect(el.style.getPropertyValue('display')).toEqual('');
  });

  it('getDimensions returns dimensions for visible and display none elements', () => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;
    const res = getDimensions(el);
    expect(res).not.toEqual(undefined);

    el.style.display = 'none';
    const res2 = getDimensions(el);
    expect(res2).not.toEqual(undefined);
  });

  it('setDimensions sets width and height in px', () => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;
    setDimensions(el, 10, 10);
    const width = el.style.getPropertyValue('width');
    const height = el.style.getPropertyValue('height');
    expect(width).toEqual('10px');
    expect(height).toEqual('10px');
  });

  it('clearDimensions removes width and height', () => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;
    setDimensions(el, 10, 10);
    clearDimensions(el);
    const width = el.style.getPropertyValue('width');
    const height = el.style.getPropertyValue('height');
    expect(width).toEqual('');
    expect(height).toEqual('');
  });

  it('registerTransitionListener calls the callback for a div element', (done) => {
    renderTemplate(container);
    const el = document.querySelector('.target') as HTMLElement;

    registerTransitionListener([el], () => {
      // We should always get a callback
      done();
    });
  });

  it('can cancel transition listeners and their timeout without invoking the callback', (done) => {
    renderTemplate(container);
    const el = container.querySelector('.target');
    const callback = jasmine.createSpy('transition callback');
    const cancel = registerTransitionListener([el], callback);
    cancel();
    el.dispatchEvent(new Event('transitionend'));
    el.dispatchEvent(new Event('transitioncancel'));
    setTimeout(() => {
      expect(callback).not.toHaveBeenCalled();
      done();
    }, 10);
  });

  it('cancels transition listeners once, however often cancel is called', () => {
    renderTemplate(container);
    const el = container.querySelector('.target');
    const removed = spyOn(el, 'removeEventListener').and.callThrough();
    const cancel = registerTransitionListener([el], () => {});
    cancel();
    cancel();
    expect(removed.calls.count()).toBe(3);
  });

  it('registerTransitionListener calls the callback when an IMG loads', (done) => {
    container.innerHTML = '<div><img class="target" /></div>';
    const el = document.querySelector('.target') as HTMLElement;

    registerTransitionListener([el], () => {
      // We should always get a callback
      done();
    });
    el.dispatchEvent(new Event('load'));
  });

  describe('waitForTransitions', () => {
    // jsdom has no computed transition lists: stub them for one element
    function stubTransitions(
      el: Element,
      property: string,
      duration: string,
      delay = '0s',
    ) {
      const computed = window.getComputedStyle;
      spyOn(window, 'getComputedStyle').and.callFake(
        (node: Element, pseudo?: string | null) =>
          node === el
            ? ({
                getPropertyValue: (name: string) =>
                  name === 'transition-property'
                    ? property
                    : name === 'transition-duration'
                      ? duration
                      : name === 'transition-delay'
                        ? delay
                        : '',
              } as CSSStyleDeclaration)
            : computed.call(window, node, pseudo),
      );
    }

    function transitionEvent(
      type: string,
      propertyName?: string,
      pseudoElement?: string,
    ) {
      const event = new Event(type);
      if (propertyName)
        Object.defineProperty(event, 'propertyName', { value: propertyName });
      if (pseudoElement)
        Object.defineProperty(event, 'pseudoElement', {
          value: pseudoElement,
        });
      return event;
    }

    it('waits for every transition that can run, each property once', () => {
      renderTemplate(container);
      const el = container.querySelector('.target');
      stubTransitions(el, 'opacity, transform, color', '1s, 0s, 2s');
      const callback = jasmine.createSpy('done');
      const cancel = waitForTransitions(el, callback);
      el.dispatchEvent(transitionEvent('transitionend', 'opacity'));
      el.dispatchEvent(transitionEvent('transitioncancel', 'opacity'));
      expect(callback).not.toHaveBeenCalled();
      el.dispatchEvent(transitionEvent('transitionend', 'color'));
      expect(callback).toHaveBeenCalledTimes(1);
      el.dispatchEvent(transitionEvent('transitionend', 'transform'));
      expect(callback).toHaveBeenCalledTimes(1);
      cancel();
    });

    it('ignores the transitions of pseudo-elements', () => {
      renderTemplate(container);
      const el = container.querySelector('.target');
      stubTransitions(el, 'opacity', '1s');
      const callback = jasmine.createSpy('done');
      const cancel = waitForTransitions(el, callback);
      el.dispatchEvent(transitionEvent('transitionend', 'opacity', '::before'));
      expect(callback).not.toHaveBeenCalled();
      el.dispatchEvent(transitionEvent('transitionend', 'opacity'));
      expect(callback).toHaveBeenCalledTimes(1);
      cancel();
    });

    it('counts an event without a property name as one transition', () => {
      renderTemplate(container);
      const el = container.querySelector('.target');
      const callback = jasmine.createSpy('done');
      waitForTransitions(el, callback);
      el.dispatchEvent(new Event('transitionend'));
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('calls back after a timer when no transition can run', (done) => {
      renderTemplate(container);
      const el = container.querySelector('.target');
      stubTransitions(el, 'opacity', '0s');
      const callback = jasmine.createSpy('done');
      waitForTransitions(el, callback);
      expect(callback).not.toHaveBeenCalled();
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('shares one fallback timer between the waits of a task', (done) => {
      container.innerHTML =
        '<div><span class="a"></span><span class="b"></span></div>';
      const a = container.querySelector('.a')!;
      const b = container.querySelector('.b')!;
      const timers = spyOn(window, 'setTimeout').and.callThrough();
      const first = jasmine.createSpy('first');
      const second = jasmine.createSpy('second');
      waitForTransitions(a, first);
      waitForTransitions(b, second);
      expect(timers.calls.count()).toBe(1);
      a.dispatchEvent(new Event('transitionend'));
      expect(first).toHaveBeenCalledTimes(1);
      setTimeout(() => {
        expect(second).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('gives a wait its own timer when the waits of its task before it have ended', (done) => {
      container.innerHTML =
        '<div><span class="a"></span><span class="b"></span></div>';
      const a = container.querySelector('.a')!;
      const b = container.querySelector('.b')!;
      const cancel = waitForTransitions(a, () => {});
      cancel();
      const callback = jasmine.createSpy('done');
      waitForTransitions(b, callback);
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('never calls back once cancelled', (done) => {
      renderTemplate(container);
      const el = container.querySelector('.target');
      const callback = jasmine.createSpy('done');
      const cancel = waitForTransitions(el, callback);
      cancel();
      cancel();
      el.dispatchEvent(new Event('transitionend'));
      setTimeout(() => {
        expect(callback).not.toHaveBeenCalled();
        done();
      }, 10);
    });
  });
});
