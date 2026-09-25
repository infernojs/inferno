import {
  addClassName,
  clearDimensions,
  forceReflow,
  getDimensions,
  registerTransitionListener,
  removeClassName,
  setDimensions,
  setDisplay,
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

  it('registerTransitionListener calls the callback when an IMG loads', (done) => {
    container.innerHTML = '<div><img class="target" /></div>';
    const el = document.querySelector('.target') as HTMLElement;

    registerTransitionListener([el], () => {
      // We should always get a callback
      done();
    });
    el.dispatchEvent(new Event('load'));
  });
});
