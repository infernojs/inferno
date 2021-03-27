import { renderToStaticMarkup, renderToString } from 'inferno-server';
import { Component } from 'inferno';

/**
 * NOTE! Animation hooks aren't called during SSR because they use different rendering paths
 */

describe('SSR Creation (JSX)', () => {
  it('should not call "didAppear" when component is rendered with renderToStaticMarkup', (done) => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      didAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      render () {
        return (<div />)
      }
    }

    const outp = renderToStaticMarkup(<App />);

    // Doing this async to be sure
    setTimeout(() => {
      expect(spyer).toHaveBeenCalledTimes(0);
      expect(outp).toEqual('<div></div>');
      done();
    }, 10)
  });

  it('should not call "didAppear" when component is rendered with renderToString', (done) => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      didAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      render () {
        return (<div />)
      }
    }

    const outp = renderToString(<App />);

    // Doing this async to be sure
    setTimeout(() => {
      expect(spyer).toHaveBeenCalledTimes(0);
      expect(outp).toEqual('<div></div>');
      done();
    }, 10)
  });
});
