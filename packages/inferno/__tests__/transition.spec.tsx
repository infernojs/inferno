import { render } from 'inferno';

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
    background: 'red',
    height: '16px',
    left: '16px',
    position: 'absolute' as any,
    top: '16px',
    transition: 'left 1ms',
    width: '16px'
  };

  it('should call "ontransitionend" at the end of a transition', (done) => {
    render(
      <div
        style={transitionStyles}
        onclick={(e) => {
          (e.target as HTMLDivElement).style.left = '50px';
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
    // Be absolutely sure the transition has been applied through style
    forceReflow();
  });

  it('should call "onTransitionEnd" at the end of a transition', (done) => {
    render(
      <div
        style={transitionStyles}
        onclick={(e) => {
          (e.target as HTMLDivElement).style.left = '100px';
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
    // Be absolutely sure the transition has been applied through style
    forceReflow();
  });
});
