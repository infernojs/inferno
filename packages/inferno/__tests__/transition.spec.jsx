import { render } from 'inferno';
import { innerHTML, triggerEvent } from 'inferno-utils';

describe('transition events', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  const transitionStyles = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    transition: 'left 50ms',
    background: 'red',
    height: '16px',
    width: '16px'
  };

  it('should call "ontransitionend" at the end of a transition', done => {
    let clickOccurred = null;
    let handlerFired = null;

    render(
      <div
        style={transitionStyles}
        onclick={e => {
          e.target.style.left = '50px';
          clickOccurred = true;
        }}
        ontransitionend={e => {
          handlerFired = true;
        }}
      />,
      container
    );

    const div = container.firstChild;
    setTimeout(() => {
      triggerEvent('click', div);

      setTimeout(() => {
        expect(clickOccurred).toBe(true);
        expect(handlerFired).toBe(true);
        done();
      }, 250);
    }, 25);
  });

  it('should call "onTransitionEnd" at the end of a transition', done => {
    let clickOccurred = null;
    let handlerFired = null;

    render(
      <div
        style={transitionStyles}
        onclick={e => {
          e.target.style.left = '100px';
          clickOccurred = true;
        }}
        onTransitionEnd={e => {
          handlerFired = true;
        }}
      />,
      container
    );

    const div = container.firstChild;
    setTimeout(() => {
      triggerEvent('click', div);

      setTimeout(() => {
        expect(clickOccurred).toBe(true);
        expect(handlerFired).toBe(true);
        done();
      }, 250);
    }, 25);
  });
});
