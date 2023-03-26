/* tslint:disable:no-unused-expression */
import { Component, InfernoNode, InfernoSingleNode, render } from 'inferno';
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

  it('should call "onComponentDidAppear" when component has been inserted into DOM', () => {
    const spyer = jasmine.createSpy();

    const Animated = () => {
      return <div />;
    };

    const onComponentDidAppear = (dom, props) => {
      spyer('didAppear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
      expect(typeof props === 'object').toEqual(true);
    };

    class App extends Component {
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return <Animated onComponentDidAppear={onComponentDidAppear} />;
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didAppear']);
  });

  it('should only call parent "onComponentDidAppear" when component tree has been inserted into DOM', () => {
    const spyer = jasmine.createSpy();

    const Child = () => {
      return <div />;
    };

    const childOnComponentDidAppear = (dom) => {
      spyer('no-op');
      expect(dom instanceof HTMLDivElement).toEqual(true);
    };

    const Parent = () => {
      return <Child onComponentDidAppear={childOnComponentDidAppear} />;
    };

    const parentOnComponentDidAppear = (dom) => {
      spyer('didAppear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
    };

    class App extends Component {
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return (
          <div>
            <Parent onComponentDidAppear={parentOnComponentDidAppear} />
          </div>
        );
      }
    }

    render(<App />, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['didAppear']);
  });

  it('should only call "componentDidAppear" when child component has been inserted into DOM', (done) => {
    const spyer = jasmine.createSpy();

    const Child = (props) => {
      return <div>{props.children}</div>;
    };

    const childOnComponentDidMount = () => {
      spyer('childDidMount');
    };

    const childOnComponentDidAppear = () => {
      spyer('childDidAppear');
    };

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
              <Child key={i} onComponentDidAppear={childOnComponentDidAppear} onComponentDidMount={childOnComponentDidMount}>
                {i}
              </Child>
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

    const Child = () => {
      return <div />;
    };

    const onComponentDidAppear = (dom) => {
      spyer('childDidAppear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
    };

    class App extends Component {
      public componentDidMount() {
        spyer('didMount');
      }
      public render() {
        return (
          <div>
            <Child onComponentDidAppear={onComponentDidAppear} />
            <Child onComponentDidAppear={onComponentDidAppear} />
            <Child onComponentDidAppear={onComponentDidAppear} />
            <Child onComponentDidAppear={onComponentDidAppear} />
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
    const App = () => {
      return <div />;
    };

    const onComponentWillDisappear = (dom, props, callback) => {
      spyer('willDisappear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
      expect(callback instanceof Function).toEqual(true);
      expect(typeof props === 'object').toEqual(true);
      callback();
    };

    const onComponentDidMount = () => {
      spyer('didMount');
    };

    render(<App onComponentWillDisappear={onComponentWillDisappear} onComponentDidMount={onComponentDidMount} />, container);

    render(null, container);

    expect(spyer).toHaveBeenCalledTimes(2);
    expect(spyer.calls.argsFor(0)).toEqual(['didMount']);
    expect(spyer.calls.argsFor(1)).toEqual(['willDisappear']);
  });

  it('should handle async callbacks from "componentWillDisappear"', (done) => {
    const spyer = jasmine.createSpy();

    const App = () => {
      return <div />;
    };

    const onComponentWillDisappear = (dom, _props, callback) => {
      spyer('willDisappear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
      expect(callback instanceof Function).toEqual(true);
      setTimeout(() => {
        callback();
        setTimeout(() => didFinish(), 10);
      }, 10);
    };

    const onComponentDidMount = () => {
      spyer('didMount');
    };

    render(<App onComponentWillDisappear={onComponentWillDisappear} onComponentDidMount={onComponentDidMount} />, container);

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

    const Item = () => {
      return <div />;
    };

    const getOnComponentWillDisappear = (index) => {
      return (_dom, _props, callback) => {
        spyer('willDisappear ' + index);

        let timeout = 10;
        if (index === 0) {
          timeout = 0;
        }
        setTimeout(() => {
          callback();
        }, timeout);
      };
    };

    const onComponentDidMount = () => {
      spyer('didMount');
    };

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
              <Item key={i} onComponentWillDisappear={getOnComponentWillDisappear(i)} onComponentDidMount={onComponentDidMount} />
            ))}
          </div>
        );
      }
    }

    render(<App />, container);

    const checkRenderComplete_ONE = () => {
      if (container.innerHTML !== '<div></div>') {
        return setTimeout(checkRenderComplete_ONE, 100);
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

    const App = () => {
      return <div />;
    };

    const onComponentDidAppear = (dom) => {
      spyer('didAppear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
    };

    const getOnComponentWillDisappear = (forceDone) => (dom, _props, callback) => {
      spyer('willDisappear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
      expect(callback instanceof Function).toEqual(true);

      if (forceDone) {
        callback();
      } else {
        setTimeout(() => {
          callMeAfterLastRender = () => {
            callback();
            setTimeout(() => didFinish(), 10);
          };
          lastRenderDone && callMeAfterLastRender();
        }, 10);
      }
    };

    const onComponentDidMount = () => {
      spyer('didMount');
    };

    render(
      <App
        onComponentDidAppear={onComponentDidAppear}
        onComponentDidMount={onComponentDidMount}
        onComponentWillDisappear={getOnComponentWillDisappear(false)}
      />,
      container
    );
    render(null, container);
    // forceDone completes the willDissapear hook immediately
    render(
      <App
        onComponentDidAppear={onComponentDidAppear}
        onComponentDidMount={onComponentDidMount}
        onComponentWillDisappear={getOnComponentWillDisappear(true)}
      />,
      container
    );

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

  it('should handle async callbacks even when parent is removed during animation', (done) => {
    const spyer = jasmine.createSpy();
    const App = () => {
      return <div />;
    };

    const onComponentWillDisappear = (dom, _props, callback) => {
      spyer('willDisappear');
      expect(dom instanceof HTMLDivElement).toEqual(true);
      expect(callback instanceof Function).toEqual(true);
      setTimeout(() => {
        callback();
      }, 10);
    };

    const onComponentDidMount = () => {
      spyer('didMount');
    };

    render(
      <div>
        <App onComponentDidMount={onComponentDidMount} onComponentWillDisappear={onComponentWillDisappear} />
        <App onComponentDidMount={onComponentDidMount} onComponentWillDisappear={onComponentWillDisappear} />
      </div>,
      container
    );
    render(
      <div>
        <App onComponentDidMount={onComponentDidMount} onComponentWillDisappear={onComponentWillDisappear} />
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

  it('should call "willMove" when component is about to be moved to another part of DOM', () => {});

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
      public componentDidAppear() {
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

interface TagProps {
  children: InfernoSingleNode;
  id: string;
}

function factory(spyer?: jasmine.Spy) {
  return {
    Tag: ({ children }: TagProps) => {
      return <div>{children}</div>;
    },
    onComponentDidAppear(_dom) {
      spyer && spyer('didAppear');
    },
    onComponentWillDisappear(_dom, _props, callback) {
      spyer && spyer('willDisappear');
      callback();
    }
  };
}

function generateKeyNodes(array: (string | number)[], spyer?) {
  let i: number;
  let id: string | number;
  let key: string | number;
  const children: InfernoNode[] = [];
  let newKey: string | number | null;
  const { Tag, onComponentDidAppear, onComponentWillDisappear } = factory(spyer);

  for (i = 0; i < array.length; i++) {
    id = key = array[i];
    if (key !== null && (typeof key !== 'string' || key[0] !== '#')) {
      newKey = key;
    } else {
      newKey = null;
    }

    children.push(
      <Tag key={newKey} id={String(id)} onComponentDidAppear={onComponentDidAppear} onComponentWillDisappear={onComponentWillDisappear}>
        {id}
      </Tag>
    );
  }
  return children;
}
