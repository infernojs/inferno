import { render } from 'inferno';
import { triggerEvent } from 'inferno-utils';

function getChromeVersion() {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return raw ? parseInt(raw[2], 10) : false;
}

const version = getChromeVersion();

// Old versions of chrome does not support this test
if (version > 60 || version === false) {
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
      transition: 'left 1ms',
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

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              expect(clickOccurred).toBe(true);
              expect(handlerFired).toBe(true);
              done();
            }, 150);
          });
        });
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

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              expect(clickOccurred).toBe(true);
              expect(handlerFired).toBe(true);
              done();
            }, 150);
          });
        });
      }, 25);
    });
  });
}
