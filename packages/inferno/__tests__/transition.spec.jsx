import { render } from 'inferno';

function getChromeVersion() {
  var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);

  return raw ? parseInt(raw[2], 10) : false;
}

const version = getChromeVersion();

// Old versions of chrome does not support this test
if (version > 60 || version === false) {
  describe('transition events', () => {
    let container;

    function forceReflow() {
      return document.body.clientHeight;
    }

    beforeEach(function () {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(function () {
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

    it('should call "ontransitionend" at the end of a transition', (done) => {
      render(
        <div
          style={transitionStyles}
          onclick={(e) => {
            e.target.style.left = '50px';
          }}
          ontransitionend={(e) => {
            expect(e.type).toEqual('transitionend');
            done();
          }}
        />,
        container
      );
      // Be absolutely sure the transition has been applied through style
      forceReflow();
      const div = container.firstChild;
      div.click();
    });

    it('should call "onTransitionEnd" at the end of a transition', (done) => {
      render(
        <div
          style={transitionStyles}
          onclick={(e) => {
            e.target.style.left = '100px';

          }}
          onTransitionEnd={(e) => {
            expect(e.type).toEqual('transitionend');
            done();
          }}
        />,
        container
      );
      // Be absolutely sure the transition has been applied through style
      forceReflow();
      const div = container.firstChild;
      div.click();
    });
  });
}
