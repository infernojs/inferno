/* tslint:disable:no-unused-expression */
import { Component, InfernoNode, render } from 'inferno';
import { createElement } from 'inferno-create-element';

describe('animation hooks', () => {
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
   * ANSWER: I will block all animations down stream for starters. Giving an option requires A LOT of thought on
   * edge cases.
   *
   * QUESTION: What if we add a set of siblings in a list, then all of them should animate, no?
   * DONE: Investigate how to solve this.
   * ANSWER: Animations should be a tree and only the highest node animates, but all siblings will animate
   *
   * DONE: Fix code path when removing last item in a list using clearDOM(dom) optmisation
   * DONE: The callback is lost when transition is completed by the timeout
   * QUESTION: Should I require the component to have a key?
   * ANSWER: No, they should only be required in lists.
   * DONE: What happens if order of DOM is changed during animation?
   * DONE: remove intermediate elements during animation in list
   * DONE: randomly reassign keys in a list (before/during animation)
   * DONE: randomly sort list during animation
   * DONE: shuffle keys
   * DONE: The keyed patching appears to add children despite existing nodes with same key
   * DONE: When rerendering a list 1,3,4,5,6 to 1,2,3,4,5 there are issues in the patching algorithm where 6 is left in DOM
   * STARTED: Compare with tests in patchKeyedChildren.spec.js
   * TODO: Investigate adding animations in https://github.com/infernojs/inferno/tree/master/docs/uibench-reactlike
   * TODO: Add an animation blocking parent component to example
   *
   */

  it('should NOT call "componentWillMove" when component is inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentWillMove() {
        spyer('willMove');
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(1);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
  });
  it('should NOT call "componentWillMove" when component is removed from DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentWillMove() {
        spyer('willMove');
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(<App />, container);

    render(null, container);

    expect(spyer).toHaveBeenCalledTimes(1);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
  });

  it('should call "componentWillMove" when component is about to be moved in DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentWillMove() {
        spyer('willMove');
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div>{this.props.children}</div>;
      }
    }

    render(
      <div>
        <App key="1">1</App>
        <App key="2">2</App>
      </div>,
      container
    );
    expect(container.textContent).toEqual('12');

    render(
      <div>
        <App key="2">2</App>
        <App key="1">1</App>
      </div>,
      container
    );

    expect(container.textContent).toEqual('21');
    // Only the first element needs to perform a DOM move
    // The second element is animated by parent checking positions before and after move
    expect(spyer).toHaveBeenCalledTimes(3);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(2)).toEqual(['willMove']);
  });

  it('should call "componentWillMove" when component is about to be moved in DOM', () => {
    const spyer = jasmine.createSpy();

    class App extends Component<unknown, unknown> {
      public componentWillMove(_parentVNode, _parent, dom) {
        spyer('willMove');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div>{this.props.children}</div>;
      }
    }

    render(
      <div>
        <App key="1">1</App>
        <App key="2">2</App>
        <App key="3">3</App>
      </div>,
      container
    );
    expect(container.textContent).toEqual('123');

    render(
      <div>
        <App key="2">2</App>
        <App key="3">3</App>
        <App key="1">1</App>
      </div>,
      container
    );

    expect(container.textContent).toEqual('231');
    // Only the first element needs to perform a DOM move
    // The second element is animated by parent checking positions before and after move
    expect(spyer).toHaveBeenCalledTimes(4);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(2)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(3)).toEqual(['willMove']);
  });

  it('should call "componentWillMove" when component is about to be moved in DOM', () => {
    const spyer = jasmine.createSpy();
    let parentDom;
    class App extends Component {
      public componentWillMove(_parentVNode, parent, dom) {
        spyer('willMove');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        parentDom = parentDom || parent;
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div>{this.props.children}</div>;
      }
    }

    render(
      <div>
        <App key="1">1</App>
        <App key="2">2</App>
        <App key="3">3</App>
        <App key="4">4</App>
      </div>,
      container
    );
    expect(container.textContent).toEqual('1234');

    render(
      <div>
        <App key="4">4</App>
        <App key="3">3</App>
        <App key="2">2</App>
        <App key="1">1</App>
      </div>,
      container
    );

    expect(spyer).toHaveBeenCalledTimes(7);
    // Three elements need to perform a DOM move
    // The fourth element is animated by parent checking positions before and after move
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(2)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(3)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(4)).toEqual(['willMove']);
    expect(spyer.calls.argsFor(5)).toEqual(['willMove']);
    expect(spyer.calls.argsFor(6)).toEqual(['willMove']);
    expect(container.textContent).toEqual('4321');
  });

  it('should call "componentDidAppear" when component has been inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentDidAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didAppear']);
  });

  it('should only call parent "componentDidAppear" when component tree has been inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class Child extends Component {
      public componentDidAppear() {
        spyer('no-op');
      }
      public componentDidMount() {
        spyer('childDidMount');
      }
      public render() {
        return <div />;
      }
    }

    class App extends Component {
      public componentDidAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return (
          <div>
            <Child />
          </div>
        );
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(3);
    expect(spyer.calls.argsFor(0)).toEqual(['childDidMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(2)).toEqual(['didAppear']);
  });

  it('should only call "componentDidAppear" when child component has been inserted into DOM', (done) => {
    const spyer = jasmine.createSpy();
    class Child extends Component {
      public componentDidAppear() {
        spyer('childDidAppear');
      }
      public componentDidMount() {
        spyer('childDidMount');
      }
      public render() {
        return <div>{this.props.children}</div>;
      }
    }

    interface AppState {
      items: number[];
    }

    class App extends Component<unknown, AppState> {
      public state: AppState;

      constructor() {
        super(...arguments);
        this.state = {
          items: [1]
        };
      }

      public componentDidMount() {
        spyer('didMount');
        setTimeout(() => {
          this.setState({
            items: [1, 2]
          });
          // Make sure inferno is done and then check the results
          setTimeout(finished, 5);
        }, 5);
      }

      public render() {
        return (
          <div>
            {this.state.items.map((i) => (
              <Child key={i}>{i}</Child>
            ))}
          </div>
        );
      }
    }

    render(<App />, container);

    const finished = () => {
      expect(spyer).toHaveBeenCalledTimes(5);
      expect(spyer.calls.argsFor(0)).toEqual(['childDidMount']);
      expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(2)).toEqual(['childDidAppear']);
      expect(spyer.calls.argsFor(3)).toEqual(['childDidMount']);
      expect(spyer.calls.argsFor(4)).toEqual(['childDidAppear']);
      expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div></div>');
      done();
    };
  });

  it('should call all "componentDidAppear" when multiple siblings have been inserted into DOM', () => {
    const spyer = jasmine.createSpy();
    class Child extends Component {
      public componentDidAppear(dom) {
        spyer('childDidAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      public render() {
        return <div />;
      }
    }

    class App extends Component {
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return (
          <div>
            <Child />
            <Child />
            <Child />
            <Child />
          </div>
        );
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

  it('should call "componentWillDisappear" when component is about to be removed from DOM', () => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentWillDisappear(dom, done) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(done instanceof Function).toEqual(true);
        done();
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(<App />, container);

    render(null, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['willDisappear']);
  });

  it('should handle async callbacks from "componentWillDisappear"', (done) => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentWillDisappear(dom, callback) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(callback instanceof Function).toEqual(true);
        setTimeout(() => {
          callback();
          setTimeout(() => didFinish(), 10);
        }, 10);
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
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

  it('should handle async callbacks "componentWillDisappear" when removing the two last elements in list', (done) => {
    /**
     * This test is hard to get to consistently fail. It should trigger
     * clearDOM from last animation callback prior to deferComponentClassRemoval
     * of at least one item. But it does work as expected now
     * Change
     * clearVNodeDOM(vNode, parentDOM, true);
     * to
     * clearVNodeDOM(vNode, parentDOM, false);
     * in
     * function deferComponentClassRemoval
     * to force failure
     */
    const spyer = jasmine.createSpy();
    class App extends Component {
      public state = {
        items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
      };

      public render() {
        if (this.state.items.length > 0) {
          setTimeout(() => {
            const items = this.state.items;
            items.pop();
            this.setState({ items });
          });
        }

        if (this.state.items.length === 0) {
          return <div />;
        }

        return (
          <div>
            {this.state.items.map((i) => (
              <Item key={i} index={i} />
            ))}
          </div>
        );
      }
    }

    interface ItemProps {
      index: number;
    }

    class Item extends Component<ItemProps> {
      public componentWillDisappear(_dom, callback) {
        spyer('willDisappear ' + this.props.index);

        let timeout = 10;
        if (this.props.index === 0) {
          timeout = 0;
        }
        setTimeout(() => {
          callback();
        }, timeout);
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(<App />, container);

    const checkRenderComplete_ONE = () => {
      if (container.innerHTML !== '<div></div>') {
        return setTimeout(checkRenderComplete_ONE, 10);
      }
      expect(spyer).toHaveBeenCalledTimes(40);
      expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(19)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(20)).toEqual(['willDisappear 19']);
      expect(spyer.calls.argsFor(39)).toEqual(['willDisappear 0']);
      done();
    };
    checkRenderComplete_ONE();
  });

  it('should handle async callbacks from "componentWillDisappear" and mounting components with "componentDidAppear"', (done) => {
    const spyer = jasmine.createSpy();
    // Always call the componentWillDisappear callback after last render
    let lastRenderDone = false;
    let callMeAfterLastRender;

    interface AppProps {
      forceDone?: boolean;
    }

    class App extends Component<AppProps> {
      public componentDidAppear(dom) {
        spyer('didAppear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
      }
      public componentWillDisappear(dom, callback) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(callback instanceof Function).toEqual(true);

        if (this.props.forceDone) {
          callback();
        } else {
          setTimeout(() => {
            callMeAfterLastRender = () => {
              callback();
              setTimeout(() => didFinish(), 10);
            };
            // tslint:disable-next-line:no-unused-expression
            lastRenderDone && callMeAfterLastRender();
          }, 10);
        }
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(<App />, container);
    render(null, container);
    // forceDone completes the willDissapear hook immediately
    render(<App forceDone />, container);

    expect(container.innerHTML).toBe('<div></div><div></div>');

    lastRenderDone = true;
    // tslint:disable-next-line:no-unused-expression
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

  it('should handle async callbacks even when parent is removed during animation', (done) => {
    const spyer = jasmine.createSpy();
    class App extends Component {
      public componentWillDisappear(dom, callback) {
        spyer('willDisappear');
        expect(dom instanceof HTMLDivElement).toEqual(true);
        expect(callback instanceof Function).toEqual(true);
        setTimeout(() => {
          callback();
        }, 10);
      }
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <div />;
      }
    }

    render(
      <div>
        <App />
        <App />
      </div>,
      container
    );
    render(
      <div>
        <App />
      </div>,
      container
    );
    render(null, container);

    expect(container.innerHTML).not.toEqual('');
    // Wait for all async operations to finish
    const checkRenderComplete_ONE = () => {
      if (container.innerHTML !== '') {
        return setTimeout(checkRenderComplete_ONE, 10);
      }
      expect(spyer).toHaveBeenCalledTimes(6);
      expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(1)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(2)).toEqual(['willDisappear']);
      expect(spyer.calls.argsFor(3)).toEqual(['willDisappear']);
      expect(spyer.calls.argsFor(4)).toEqual(['didMount']);
      expect(spyer.calls.argsFor(5)).toEqual(['willDisappear']);
      done();
    };
    checkRenderComplete_ONE();
  });

  const template = function (child) {
    return createElement('div', null, child);
  };

  it('should add all nodes', () => {
    const spyer = jasmine.createSpy();

    render(template(generateKeyNodes([], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    expect(container.textContent).toBe('#0#1#2#3');
    expect(container.firstChild.childNodes.length).toBe(4);
    // expect(spyer).toHaveBeenCalledTimes(4);

    render(null, container);
    expect(container.innerHTML).toBe('');
    // expect(spyer).toHaveBeenCalledTimes(8);
  });

  it('should size up', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', '#1'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    expect(container.textContent).toBe('#0#1#2#3');
    expect(container.firstChild.childNodes.length).toBe(4);
    // expect(spyer).toHaveBeenCalledTimes(4);

    render(null, container);
    expect(container.innerHTML).toBe('');
    // expect(spyer).toHaveBeenCalledTimes(8);
  });

  it('should do smiple size down', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', '#1', '#2'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#2'], spyer)), container);
    expect(container.textContent).toBe('#0#2');
    expect(container.firstChild.childNodes.length).toBe(2);
    // expect(spyer).toHaveBeenCalledTimes(4);

    render(null, container);
    expect(container.innerHTML).toBe('');
    // expect(spyer).toHaveBeenCalledTimes(8);
  });

  it('should size down', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1'], spyer)), container);
    // expect(spyer).toHaveBeenCalledTimes(2);
    expect(container.textContent).toBe('#0#1');
    expect(container.firstChild.childNodes.length).toBe(2);

    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1'], spyer)), container);

    // expect(spyer).toHaveBeenCalledTimes(10);
    expect(container.textContent).toBe('#0#1');
    expect(container.firstChild.childNodes.length).toBe(2);

    render(null, container);
    expect(container.innerHTML).toBe('');
    // expect(spyer).toHaveBeenCalledTimes(12);
  });

  it('should handle multiple removes of siblings combined with adds', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3', '#4', '#5'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#2', '#5', '#6'], spyer)), container);
    // expect(spyer).toHaveBeenCalledTimes(2);
    expect(container.textContent).toBe('#0#2#5#6');
    expect(container.firstChild.childNodes.length).toBe(4);

    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    render(template(generateKeyNodes(['#10', '#11'], spyer)), container);

    // expect(spyer).toHaveBeenCalledTimes(10);
    expect(container.textContent).toBe('#10#11');
    expect(container.firstChild.childNodes.length).toBe(2);

    render(null, container);
    expect(container.innerHTML).toBe('');
    // expect(spyer).toHaveBeenCalledTimes(12);
  });

  it('should clear all nodes', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    render(template(generateKeyNodes([], spyer)), container);
    expect(container.textContent).toBe('');
    expect(container.firstChild.childNodes.length).toBe(0);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    render(template(generateKeyNodes([], spyer)), container);
  });

  it('should work with mixed nodes', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['1', '#0', '#1', '#2'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    expect(container.textContent).toBe('#0#1#2#3');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should move a key for start to end', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['a', '#0', '#1', '#2'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', 'a'], spyer)), container);
    expect(container.textContent).toBe('#0#1#2a');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should move a key', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', 'a', '#2', '#3'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', 'a', '#3'], spyer)), container);
    expect(container.textContent).toBe('#0#1a#3');
    expect(container.firstChild.childNodes.length).toBe(4);
  });

  /* Skipping spyer from here on */

  it('should move a key', () => {
    render(template(generateKeyNodes(['#0', 'a', '#2', '#3'])), container);
    render(template(generateKeyNodes(['#0', '#1', 'a', '#3'])), container);
    expect(container.textContent).toBe('#0#1a#3');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should move a key with a size up', () => {
    render(template(generateKeyNodes(['a', '#1', '#2', '#3'])), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3', 'a', '#5'])), container);
    expect(container.textContent).toBe('#0#1#2#3a#5');
    expect(container.firstChild.childNodes.length).toBe(6);
  });
  it('should move a key with a size down', () => {
    render(template(generateKeyNodes(['a', '#1', '#2', '#3'])), container);
    render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
    expect(container.textContent).toBe('#0a#2');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should avoid unnecessary reordering', () => {
    render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
    render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
    expect(container.textContent).toBe('#0a#2');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should work with keyed nodes', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4])), container);
    render(template(generateKeyNodes([1, 2, 3, 4, 0])), container);
    expect(container.textContent).toBe('12340');
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateKeyNodes([0, 1, 2, 3, 4])), container);
    render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
    render(template(generateKeyNodes(['#0', 'a', '#2'])), container);
    expect(container.textContent).toBe('#0a#2');
    expect(container.firstChild.childNodes.length).toBe(3);
  });

  it('should reorder keys', () => {
    render(template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
    render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
  });
  it('should remove one key at the start', () => {
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    render(template(generateKeyNodes(['b', 'c'])), container);
    expect(container.textContent).toBe('bc');
    expect(container.firstChild.childNodes.length).toBe(2);
  });
  it('should do a complex reverse', () => {
    render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
    render(template(generateKeyNodes(['d', 'c', 'b', 'a'])), container);
    expect(container.textContent).toBe('dcba');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should remove two keys at the start', () => {
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    render(template(generateKeyNodes(['c'])), container);
    expect(container.textContent).toBe('c');
    expect(container.firstChild.childNodes.length).toBe(1);
  });
  it('should add one key to start', () => {
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    expect(container.textContent).toBe('abc');
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateKeyNodes(['a', 'b'])), container);
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    expect(container.textContent).toBe('abc');
    expect(container.firstChild.childNodes.length).toBe(3);
  });

  it('should add two key to start', () => {
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    expect(container.textContent).toBe('abc');
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateKeyNodes(['c'])), container);
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    expect(container.textContent).toBe('abc');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should remove one key at the end', () => {
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    render(template(generateKeyNodes(['a', 'b'])), container);
    expect(container.textContent).toBe('ab');
    expect(container.firstChild.childNodes.length).toBe(2);
  });
  it('should remove two keys at the end', () => {
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    render(template(generateKeyNodes(['a'])), container);
    expect(container.textContent).toBe('a');
    expect(container.firstChild.childNodes.length).toBe(1);
  });
  it('should add one key at the end', () => {
    render(template(generateKeyNodes(['a', 'b'])), container);
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    expect(container.textContent).toBe('abc');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should add two key at the end', () => {
    render(template(generateKeyNodes(['a'])), container);
    render(template(generateKeyNodes(['a', 'b', 'c'])), container);
    expect(container.textContent).toBe('abc');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should add to end, delete from center & reverse', () => {
    render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
    render(template(generateKeyNodes(['e', 'd', 'c', 'a'])), container);
    expect(container.textContent).toBe('edca');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should add to the beginning and remove', () => {
    render(template(generateKeyNodes(['c', 'd'])), container);
    render(template(generateKeyNodes(['a', 'b', 'c', 'e'])), container);
    expect(container.textContent).toBe('abce');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should keep a central pivot', () => {
    render(template(generateKeyNodes(['1', '2', '3'])), container);
    render(template(generateKeyNodes(['4', '2', '5'])), container);
    expect(container.textContent).toBe('425');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should insert to the middle', () => {
    render(template(generateKeyNodes(['c', 'd', 'e'])), container);
    render(template(generateKeyNodes(['a', 'b', 'e'])), container);
    expect(container.textContent).toBe('abe');
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateKeyNodes(['c', 'd', 'e'])), container);
    render(template(generateKeyNodes(['c', 'd', 'e'])), container);
    render(template(generateKeyNodes(['a', 'p', 'e'])), container);
    expect(container.textContent).toBe('ape');
    expect(container.firstChild.childNodes.length).toBe(3);
  });

  it('should shuffle, insert and remove', () => {
    render(template(generateKeyNodes(['a', 'b', 'c', 'd', 'e', 'f', 'g'])), container);
    render(template(generateKeyNodes(['b', 'c', 'a'])), container);
    expect(container.textContent).toBe('bca');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should remove a element from the middle', () => {
    render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateKeyNodes([1, 2, 4, 5])), container);
    expect(container.textContent).toBe('1245');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should move a element forward', () => {
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes([2, 3, 1, 4])), container);
    expect(container.textContent).toBe('2314');
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes([3, 2, 1, 4])), container);
    expect(container.textContent).toBe('3214');
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes([3, 2, 4, 1])), container);
    expect(container.textContent).toBe('3241');
    expect(container.firstChild.childNodes.length).toBe(4);
  });

  it('should move a element to the end', () => {
    render(template(generateKeyNodes([1, 2, 3])), container);
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateKeyNodes([2, 3, 1])), container);
    expect(container.textContent).toBe('231');
    expect(container.firstChild.childNodes.length).toBe(3);
  });
  it('should move a element backwards', () => {
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes([1, 4, 2, 3])), container);
    expect(container.textContent).toBe('1423');
    expect(container.firstChild.childNodes.length).toBe(4);
  });
  it('should swap first and last', () => {
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes([4, 2, 3, 1])), container);
    expect(container.textContent).toBe('4231');
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
  });

  it('should move to left and replace', () => {
    render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateKeyNodes([4, 1, 2, 3, 6])), container);
    expect(container.textContent).toBe('41236');
    expect(container.firstChild.childNodes.length).toBe(5);
    render(template(generateKeyNodes([4, 5, 2, 3, 0])), container);
    expect(container.textContent).toBe('45230');
    render(template(generateKeyNodes([1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(5);
  });

  it('should move to left and leave a hole', () => {
    render(template(generateKeyNodes([1, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(3);
    render(template(generateKeyNodes([4, 6])), container);
    expect(container.textContent).toBe('46');
    expect(container.firstChild.childNodes.length).toBe(2);
  });
  it('should do something', () => {
    render(template(generateKeyNodes([0, 1, 2, 3, 4, 5])), container);
    expect(container.firstChild.childNodes.length).toBe(6);
    render(template(generateKeyNodes([4, 3, 2, 1, 5, 0])), container);
    expect(container.textContent).toBe('432150');
    expect(container.firstChild.childNodes.length).toBe(6);
  });

  it('should cycle order correctly', () => {
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('1234');
    render(template(generateKeyNodes([2, 3, 4, 1])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('2341');
    render(template(generateKeyNodes([3, 4, 1, 2])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('3412');
    render(template(generateKeyNodes([4, 1, 2, 3])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('4123');
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('1234');
  });

  it('should cycle order correctly in the other direction', () => {
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('1234');
    render(template(generateKeyNodes([4, 1, 2, 3])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('4123');
    render(template(generateKeyNodes([3, 4, 1, 2])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('3412');
    render(template(generateKeyNodes([2, 3, 4, 1])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('2341');
    render(template(generateKeyNodes([1, 2, 3, 4])), container);
    expect(container.firstChild.childNodes.length).toBe(4);
    expect(container.textContent).toBe('1234');
  });

  it('should allow any character as a key', () => {
    render(template(generateKeyNodes(['<WEIRD/&\\key>'])), container);
    render(template(generateKeyNodes(['INSANE/(/&\\key', '<CRAZY/&\\key>', '<WEIRD/&\\key>'])), container);
    expect(container.textContent).toBe('INSANE/(/&\\key<CRAZY/&\\key><WEIRD/&\\key>');
    expect(container.firstChild.childNodes.length).toBe(3);
  });

  it('should reorder nodes', () => {
    render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
    render(template(generateKeyNodes(['1', '2', '3', '4', 'abc', '6', 'def', '7'])), container);
    render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
    render(template(generateKeyNodes(['7', '4', '3', '2', '6', 'abc', 'def', '1'])), container);
    expect(container.textContent).toBe('74326abcdef1');
    expect(container.firstChild.childNodes.length).toBe(8);
  });

  it('should do a advanced shuffle - numbers and letters', () => {
    render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);
    render(template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])), container);
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);
    render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);
    render(template(generateKeyNodes([0, 'e', 2, 'b', 'f', 'g', 'c', 'a', 4])), container);
    expect(container.textContent).toBe('0e2bfgca4');
    expect(container.firstChild.childNodes.length).toBe(9);
    render(template(generateKeyNodes(['a', 'b', 'c', 'd', 1, 2, 3])), container);
    expect(container.textContent).toBe('abcd123');
    expect(container.firstChild.childNodes.length).toBe(7);
    render(template(generateKeyNodes([1, 'e', 2, 'b', 'f', 'g', 'c', 'a', 3])), container);
    expect(container.textContent).toBe('1e2bfgca3');
    expect(container.firstChild.childNodes.length).toBe(9);
  });

  it('should do a complex removal at the beginning', () => {
    render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
    expect(container.textContent).toBe('abcd');
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes(['c', 'd'])), container);
    expect(container.textContent).toBe('cd');
    expect(container.firstChild.childNodes.length).toBe(2);
    render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
    expect(container.textContent).toBe('abcd');
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
    expect(container.textContent).toBe('abcd');
    expect(container.firstChild.childNodes.length).toBe(4);
  });

  it('should do move and sync nodes from right to left', () => {
    render(template(generateKeyNodes(['a', 'b', 'c', 'd'])), container);
    expect(container.textContent).toBe('abcd');
    expect(container.firstChild.childNodes.length).toBe(4);
    render(template(generateKeyNodes(['c', 'l', 1, 2, 3, 4, 5, 6, 7, 8, 9, 'd', 'g', 'b'])), container);
    expect(container.textContent).toBe('cl123456789dgb');
    expect(container.firstChild.childNodes.length).toBe(14);
  });

  describe('Should handle massive large arrays', () => {
    let items;

    beforeEach(function () {
      items = new Array(1000);
      for (let i = 0; i < 1000; i++) {
        items[i] = i;
      }
    });

    it('Should handle massive large arrays - initial', () => {
      render(template(generateKeyNodes(items)), container);

      expect(container.textContent).toEqual(items.join(''));
    });

    it('Should handle massive arrays shifting once by 2', () => {
      items = items.concat(items.splice(0, 2));
      render(template(generateKeyNodes(items)), container);

      expect(container.textContent).toEqual(items.join(''));
    });

    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line
      it('Should handle massive arrays shifting ' + i + ' times by ' + i, () => {
        for (let j = 0; j < i; j++) {
          items = items.concat(items.splice(i, j));
        }
        render(template(generateKeyNodes(items)), container);
        expect(container.textContent).toEqual(items.join(''));
      });
    }
  });

  describe('Calendar like layout', () => {
    interface AnimatedProps {
      key: string;
      children?: any;
    }

    class Animated extends Component<AnimatedProps, unknown> {
      public componentDidAppear(_dom) {
        // Trigger animation code paths on add
      }
      public componentWillDisappear(_dom, done) {
        // Trigger animation code paths on remove
        done();
      }
      public render({ children }: AnimatedProps) {
        return <div>{children}</div>;
      }
    }

    function o(text) {
      return createElement(
        Animated,
        {
          key: 'o' + text
        },
        ',o' + text
      );
    }

    function d(text) {
      return createElement(
        Animated,
        {
          key: 'd' + text
        },
        ',d' + text
      );
    }

    function wk(text) {
      return createElement(
        Animated,
        {
          key: 'wk' + text
        },
        ',wk' + text
      );
    }

    it('Should do complex suffle without duplications', () => {
      const layout1 = [
        wk(31),
        d(1),
        d(2),
        d(3),
        d(4),
        d(5),
        d(6),
        d(7),
        wk(32),
        d(8),
        d(9),
        d(10),
        d(11),
        d(12),
        d(13),
        d(14),
        wk(33),
        d(15),
        d(16),
        d(17),
        d(18),
        d(19),
        d(20),
        d(21),
        wk(34),
        d(22),
        d(23),
        d(24),
        d(25),
        d(26),
        d(27),
        d(28),
        wk(35),
        d(29),
        d(30),
        d(31),
        o(1),
        o(2),
        o(3),
        o(4),
        wk(36),
        o(5),
        o(6),
        o(7),
        o(8),
        o(9),
        o(10),
        o(11)
      ];
      render(template(layout1), container);

      expect(container.textContent).toBe(
        ',wk31,d1,d2,d3,d4,d5,d6,d7,wk32,d8,d9,d10,d11,d12,d13,d14,wk33,d15,d16,d17,d18,d19,d20,d21,wk34,d22,d23,d24,d25,d26,d27,d28,wk35,d29,d30,d31,o1,o2,o3,o4,wk36,o5,o6,o7,o8,o9,o10,o11'
      );

      const layout2 = [
        wk(35),
        o(29),
        o(30),
        o(31),
        d(1),
        d(2),
        d(3),
        d(4),
        wk(36),
        d(5),
        d(6),
        d(7),
        d(8),
        d(9),
        d(10),
        d(11),
        wk(37),
        d(12),
        d(13),
        d(14),
        d(15),
        d(16),
        d(17),
        d(18),
        wk(38),
        d(19),
        d(20),
        d(21),
        d(22),
        d(23),
        d(24),
        d(25),
        wk(39),
        d(26),
        d(27),
        d(28),
        d(29),
        d(30),
        o(1),
        o(2),
        wk(40),
        o(3),
        o(4),
        o(5),
        o(6),
        o(7),
        o(8),
        o(9)
      ];
      render(template(layout2), container);

      expect(container.textContent).toBe(
        ',wk35,o29,o30,o31,d1,d2,d3,d4,wk36,d5,d6,d7,d8,d9,d10,d11,wk37,d12,d13,d14,d15,d16,d17,d18,wk38,d19,d20,d21,d22,d23,d24,d25,wk39,d26,d27,d28,d29,d30,o1,o2,wk40,o3,o4,o5,o6,o7,o8,o9'
      );
    });
  });
});

function factory(spyer?: jasmine.Spy) {
  // TODO: Add componentWillMove
  return class Animated extends Component<any, any> {
    public componentDidAppear(_dom) {
      spyer && spyer('didAppear');
    }
    public componentWillDisappear(_dom, done) {
      spyer && spyer('willDisappear');
      done();
    }
    public render({ children }) {
      return <div>{children}</div>;
    }
  };
}

function generateKeyNodes(array: (string | number)[], spyer?) {
  let i: number = 0;
  let id: string | number;
  let key: string | number;
  const children: InfernoNode[] = [];
  let newKey: string | number | null;
  const Tag = factory(spyer);

  for (i = 0; i < array.length; i++) {
    id = key = array[i];
    if (key !== null && (typeof key !== 'string' || key[0] !== '#')) {
      newKey = key;
    } else {
      newKey = null;
    }

    children.push(
      <Tag key={newKey} id={String(id)}>
        {id}
      </Tag>
    );
  }
  return children;
}
