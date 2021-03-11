import { Component, render } from 'inferno';
import { triggerEvent } from 'inferno-utils';

describe('transition events', () => {
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

  /**
   * This is how component animation hooks work:
   * 
   * On node creation, if there is a callback, a reference to the DOM-node is passed to that callback which allows for CSS-
   * animations to be applied.
   * 
   * On node removal, if there is a callback, the node isn't actually removed until the callback has finished.
   * 
   * On node move, if there is a callback, the original node is cloned and both a reference to the cloned node and the new
   * node are passed to the callback allowing CSS-animations to be performed.
   * 
   * ** Entrypoints **
   * - mounting.ts
   * - unmounnting.ts
   * 
   * ** Scope **
   * We will start by implementing this for class components. Animations are expensive so it is probably a reasonable
   * tradeoff to force the use of class componnents.
   * 
   * QUESTION: How do we handle nested animations?
   * Normally we only want to animated the outermost animation, but there are situation when the dev might want to
   * do this differenty. Should we:
   * - always block animations in children?
   * - allow the dev to specify?
   * 
   * Ex. you have a page animation and also animations on items in that page.
   * 
   * ANSWER: I will block all animations down stream for starters. Giving an option requires A LOT of thought on
   * edge cases.
   * 
   * QUESTION: What if we add a set of siblings in a list, then all of them should animate, no?
   * TODO: Investigate how to solve this. Right now only one item will animate.
   * 
   * Perhaps animations should be a tree and only the root node animates
   */

  it('should call "didAppear" when component has been inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      didAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      componentDidMount() {
        spyer('didMount');
      }
      render () {
        return (<div />)
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didAppear']);
  });

  it('should only call parent "didAppear" when component tree has been inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class Child extends Component {
      didAppear() {
        spyer('no-op');
      }
      componentDidMount() {
        spyer('childDidMount');
      }
      render () {
        return (<div />)
      }
    }

    class App extends Component {
      didAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      componentDidMount() {
        spyer('didMount');
      }
      render () {
        return (<div><Child /></div>)
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(3);
    expect(spyer.calls.argsFor(0)).toEqual(['childDidMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(2)).toEqual(['didAppear']);
  });

  it('should call all "didAppear" when multiple siblings have been inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class Child extends Component {
      didAppear(dom) {
        spyer('childDidAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      render () {
        return (<div />)
      }
    }

    class App extends Component {
      componentDidMount() {
        spyer('didMount');
      }
      render () {
        return (<div>
          <Child />
          <Child />
          <Child />
          <Child />
        </div>)
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(5);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['childDidAppear']);
    expect(spyer.calls.argsFor(2)).toEqual(['childDidAppear']);
    expect(spyer.calls.argsFor(3)).toEqual(['childDidAppear']);
    expect(spyer.calls.argsFor(4)).toEqual(['childDidAppear']);
  });

  it('should call "willDisappear" when component is about to be removed from DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      willDisappear(dom, done) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(done instanceof Function).toEqual(true);
        done()
      }
      componentDidMount() {
        spyer('didMount');
      }
      render () {
        return (<div />)
      }
    }

    render(<App />, container);
    
    render(null, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['willDisappear']);

  });

  it('should handle async callbacks from "willDisappear"', (done) => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      willDisappear(dom, callback) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(done instanceof Function).toEqual(true);
        setTimeout(() => {
          callback()
          didFinish()
        }, 10);
      }
      componentDidMount() {
        spyer('didMount');
      }
      render () {
        return (<div />)
      }
    }

    render(<App />, container);
    
    render(null, container);

    function didFinish() {
      expect(spyer).toHaveBeenCalledTimes(2);
      expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(1)).toEqual(['willDisappear']);
      done();
    }
  });

  it('should handle async callbacks from "willDisappear" and mounting components with "didAppear"', (done) => {
    const spyer = jasmine.createSpy();
    // Always call the willDisappear callback after last render
    let lastRenderDone = false;
    let callMeAfterLastRender;
    
    class App extends Component {
      didAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      willDisappear(dom, callback) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(done instanceof Function).toEqual(true);

        if (this.props.forceDone) {
          callback();
        }
        else {
          setTimeout(() => {
            callMeAfterLastRender = () => {
              callback()
              didFinish()
            }
            lastRenderDone && callMeAfterLastRender();
          }, 10);
        }
      }
      componentDidMount() {
        spyer('didMount');
      }
      render () {
        return (<div />)
      }
    }

    render(<App />, container);
    render(null, container);
    // forceDone completes the willDissapear hook immediately
    render(<App forceDone />, container);

    expect(container.innerHTML).toBe('<div></div><div></div>');
      
    lastRenderDone = true;
    callMeAfterLastRender && callMeAfterLastRender();
    
    function didFinish() {
      expect(spyer).toHaveBeenCalledTimes(5);
      expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(1)).toEqual(['didAppear']);
      expect(spyer.calls.argsFor(2)).toEqual(['willDisappear']);
      expect(spyer.calls.argsFor(3)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(4)).toEqual(['didAppear']);
      expect(container.innerHTML).toBe('<div></div>');

      render(null, container);
      expect(container.innerHTML).toBe('');
      done();
    }
  });

  it('should call "willMove" when component is about to be moved to another part of DOM', () => {});

});