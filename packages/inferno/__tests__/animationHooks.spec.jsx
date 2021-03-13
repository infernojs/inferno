import { Component, render } from 'inferno';
import { createElement } from 'inferno-create-element';
import { triggerEvent } from 'inferno-utils';
import { finished } from 'stream';

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

  it('should only call "didAppear" when child component has been inserted into DOM', (done) => {
    const spyer = jasmine.createSpy();
    class Child extends Component {
      didAppear() {
        spyer('childDidAppear');
      }
      componentDidMount() {
        spyer('childDidMount');
      }
      render () {
        return (<div>{this.props.children}</div>)
      }
    }

    class App extends Component {
      constructor() {
        super(...arguments);
        this.state = {
          items: [1]
        };
      }

      componentDidMount() {
        spyer('didMount');
        setTimeout(() => {
          this.setState({
            items: [1, 2]
          });
          // Make sure inferno is done and then check the results
          setTimeout(finished, 5)
        }, 5)
      }

      render () {
        return (<div>{this.state.items.map((i) => <Child key={i}>{i}</Child>)}</div>)
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
      expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div></div>')
      done();
    }
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

  const template = function (child) {
    return createElement('div', null, child);
  };

  it('should add all nodes', () => {
    const spyer = jasmine.createSpy();

    render(template(generateKeyNodes([], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    expect(container.textContent).toBe('#0#1#2#3');
    expect(container.firstChild.childNodes.length).toBe(4);
    //expect(spyer).toHaveBeenCalledTimes(4);

    render(null, container);
    expect(container.innerHTML).toBe('');
    //expect(spyer).toHaveBeenCalledTimes(8);
  });

  it('should size up', () => {
    const spyer = jasmine.createSpy();
    render(template(generateKeyNodes(['#0', '#1'], spyer)), container);
    render(template(generateKeyNodes(['#0', '#1', '#2', '#3'], spyer)), container);
    expect(container.textContent).toBe('#0#1#2#3');
    expect(container.firstChild.childNodes.length).toBe(4);
    //expect(spyer).toHaveBeenCalledTimes(4);

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

    //expect(spyer).toHaveBeenCalledTimes(10);
    expect(container.textContent).toBe('#0#1');
    expect(container.firstChild.childNodes.length).toBe(2);

    render(null, container);
    expect(container.innerHTML).toBe('');
    //expect(spyer).toHaveBeenCalledTimes(12);
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
});

function factory(spyer) {
  return class Animated extends Component {
    didAppear(dom) {
      spyer && spyer('didAppear');
    }
    willDisappear(dom, done) {
      spyer && spyer('willDisappear');
      done()
    }
    render ({ children }) {
      return (<div>{children}</div>)
    }
  }
}

function generateKeyNodes(array, spyer) {
  let i, id, key;
  const children = [];
  let newKey;
  const Tag = factory(spyer)

  for (i = 0; i < array.length; i++) {
    id = key = array[i];
    if (key !== null && (typeof key !== 'string' || key[0] !== '#')) {
      newKey = key;
    } else {
      newKey = null;
    }

    children.push(<Tag key={newKey} id={String(id)}>{id}</Tag>);
  }
  return children;
}
