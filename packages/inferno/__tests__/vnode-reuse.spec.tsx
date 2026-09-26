import {
  Component,
  createFragment,
  createPortal,
  createVNode,
  Fragment,
  render,
  type VNode,
} from 'inferno';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';

// vNode holds the state of the position it is rendered in (dom, component instance, key),
// so a vNode referenced outside of render must be cloned when it is placed in a second position.
describe('vNode reuse', () => {
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

  describe('the same vNode in two places', () => {
    // After rendering "shared" in two places, updating both places must update both DOM nodes
    function addSharedToSecondParagraph(initial) {
      const shared = <b>x</b>;

      render(
        <div>
          <p>{shared}</p>
          {initial}
        </div>,
        container,
      );
      render(
        <div>
          <p>{shared}</p>
          {<p>{shared}</p>}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><b>x</b></p><p><b>x</b></p></div>',
      );

      render(
        <div>
          <p>{<b>a</b>}</p>
          {<p>{<b>b</b>}</p>}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><b>a</b></p><p><b>b</b></p></div>',
      );
    }

    it('Should render the same child in two elements', () => {
      addSharedToSecondParagraph(<p>{<b>y</b>}</p>);
    });

    it('Should add the same child to an element that had no children', () => {
      addSharedToSecondParagraph(<p></p>);
    });

    it('Should add the same child to an element that had text', () => {
      addSharedToSecondParagraph(<p>text</p>);
    });

    it('Should add the same child to an element that had multiple children', () => {
      addSharedToSecondParagraph(
        <p>
          <i>1</i>
          <i>2</i>
        </p>,
      );
    });

    it('Should keep rendering the same child in two elements', () => {
      const shared = <b>x</b>;

      for (let i = 0; i < 3; ++i) {
        render(
          <div>
            <p>{shared}</p>
            <p>{shared}</p>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><p><b>x</b></p><p><b>x</b></p></div>',
        );
      }

      render(
        <div>
          <p>{<b>a</b>}</p>
          <p>{<b>b</b>}</p>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><b>a</b></p><p><b>b</b></p></div>',
      );
    });

    it('Should render the same child in an element and a Fragment', () => {
      const shared = <b>x</b>;

      render(
        <div>
          <p>{shared}</p>
          <Fragment>{shared}</Fragment>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>x</b></p><b>x</b></div>');

      render(
        <div>
          <p>{<b>a</b>}</p>
          <Fragment>{<b>b</b>}</Fragment>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>a</b></p><b>b</b></div>');
    });

    it('Should update a Fragment to the same child as an element', () => {
      const shared = <b>x</b>;

      render(
        <div>
          <p>{<b>1</b>}</p>
          <Fragment>{<b>2</b>}</Fragment>
        </div>,
        container,
      );
      render(
        <div>
          <p>{shared}</p>
          <Fragment>{shared}</Fragment>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>x</b></p><b>x</b></div>');

      render(
        <div>
          <p>{<b>a</b>}</p>
          <Fragment>{<b>b</b>}</Fragment>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>a</b></p><b>b</b></div>');
    });

    it('Should render the same child in an element and a Portal', () => {
      const portalContainer = document.createElement('div');
      const shared = <b>x</b>;

      render(
        <div>
          <p>{shared}</p>
          {createPortal(shared, portalContainer)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>x</b></p></div>');
      expect(portalContainer.innerHTML).toBe('<b>x</b>');

      render(
        <div>
          <p>{<b>a</b>}</p>
          {createPortal(<b>b</b>, portalContainer)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>a</b></p></div>');
      expect(portalContainer.innerHTML).toBe('<b>b</b>');
    });

    it('Should update a Portal to the same child as an element', () => {
      const portalContainer = document.createElement('div');
      const shared = <b>x</b>;

      render(
        <div>
          <p>{<b>1</b>}</p>
          {createPortal(<b>2</b>, portalContainer)}
        </div>,
        container,
      );
      render(
        <div>
          <p>{shared}</p>
          {createPortal(shared, portalContainer)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>x</b></p></div>');
      expect(portalContainer.innerHTML).toBe('<b>x</b>');

      render(
        <div>
          <p>{<b>a</b>}</p>
          {createPortal(<b>b</b>, portalContainer)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>a</b></p></div>');
      expect(portalContainer.innerHTML).toBe('<b>b</b>');
    });

    it('Should keep shared arrays separate', () => {
      const items = [<li>a</li>, <li>b</li>];

      for (let i = 0; i < 3; ++i) {
        render(
          <div>
            <ul>{items}</ul>
            <ol>{items}</ol>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><ul><li>a</li><li>b</li></ul><ol><li>a</li><li>b</li></ol></div>',
        );
      }

      render(
        <div>
          <ul>{[<li>c</li>, <li>d</li>]}</ul>
          <ol>{[<li>e</li>]}</ol>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><ul><li>c</li><li>d</li></ul><ol><li>e</li></ol></div>',
      );
    });

    it('Should keep shared keyed arrays separate', () => {
      const items = [<li key="a">a</li>, <li key="b">b</li>];

      for (let i = 0; i < 3; ++i) {
        render(
          <div>
            <ul>{items}</ul>
            <ol>{items}</ol>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><ul><li>a</li><li>b</li></ul><ol><li>a</li><li>b</li></ol></div>',
        );
      }

      render(
        <div>
          <ul>{[items[1], items[0]]}</ul>
          <ol>{[<li key="c">c</li>, items[1]]}</ol>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><ul><li>b</li><li>a</li></ul><ol><li>c</li><li>b</li></ol></div>',
      );
    });

    it('Should render the same vNode twice in one array', () => {
      const shared = <li>x</li>;

      for (let i = 0; i < 3; ++i) {
        render(<ul>{[shared, shared]}</ul>, container);
        expect(container.innerHTML).toBe('<ul><li>x</li><li>x</li></ul>');
      }

      render(<ul>{[<li>a</li>, <li>b</li>]}</ul>, container);
      expect(container.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
    });

    it('Should move a vNode between parents', () => {
      const shared = <b>x</b>;

      render(
        <div>
          <p>{shared}</p>
          <p>{<i>y</i>}</p>
        </div>,
        container,
      );
      render(
        <div>
          <p>{<i>y</i>}</p>
          <p>{shared}</p>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><i>y</i></p><p><b>x</b></p></div>',
      );

      render(
        <div>
          <p>{<b>a</b>}</p>
          <p>{<b>b</b>}</p>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><b>a</b></p><p><b>b</b></p></div>',
      );
    });

    it('Should render the same vNode into two containers', () => {
      const container2 = document.createElement('div');
      const shared = <span>x</span>;

      render(shared, container);
      render(shared, container2);
      expect(container.innerHTML).toBe('<span>x</span>');
      expect(container2.innerHTML).toBe('<span>x</span>');

      render(<span>a</span>, container);
      render(<span>b</span>, container2);
      expect(container.innerHTML).toBe('<span>a</span>');
      expect(container2.innerHTML).toBe('<span>b</span>');

      render(null, container2);
    });

    it('Should render the same vNode in place of another vNode in a second container', () => {
      const container2 = document.createElement('div');
      const shared = <span>x</span>;

      render(shared, container);
      render(<span>y</span>, container2);
      render(shared, container2);
      expect(container.innerHTML).toBe('<span>x</span>');
      expect(container2.innerHTML).toBe('<span>x</span>');

      render(<span>a</span>, container);
      render(<span>b</span>, container2);
      expect(container.innerHTML).toBe('<span>a</span>');
      expect(container2.innerHTML).toBe('<span>b</span>');

      render(null, container2);
    });
  });

  // Explicit child flags skip normalization, so the same vNode reaches mounting and patching as it is
  describe('the same vNode in two places with explicit child flags', () => {
    function addSharedToSecondParagraph(initial) {
      const shared = <b>x</b>;

      render(
        <div>
          <p $HasVNodeChildren>{shared}</p>
          {initial}
        </div>,
        container,
      );
      render(
        <div>
          <p $HasVNodeChildren>{shared}</p>
          {<p $HasVNodeChildren>{shared}</p>}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><b>x</b></p><p><b>x</b></p></div>',
      );

      render(
        <div>
          <p $HasVNodeChildren>{<b>a</b>}</p>
          {<p $HasVNodeChildren>{<b>b</b>}</p>}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><p><b>a</b></p><p><b>b</b></p></div>',
      );
    }

    it('Should render the same child with explicit child flags in two elements', () => {
      addSharedToSecondParagraph(<p $HasVNodeChildren>{<b>y</b>}</p>);
    });

    it('Should add the same child with explicit child flags to an element that had no children', () => {
      addSharedToSecondParagraph(<p></p>);
    });

    it('Should add the same child with explicit child flags to an element that had text', () => {
      addSharedToSecondParagraph(<p>text</p>);
    });

    it('Should add the same child with explicit child flags to an element that had multiple children', () => {
      addSharedToSecondParagraph(
        <p>
          <i>1</i>
          <i>2</i>
        </p>,
      );
    });

    it('Should render the same child with explicit child flags in an element and a Fragment', () => {
      const shared = <b>x</b>;

      render(
        <div>
          <p $HasVNodeChildren>{shared}</p>
          {createFragment(shared, ChildFlags.HasVNodeChildren)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>x</b></p><b>x</b></div>');

      render(
        <div>
          <p $HasVNodeChildren>{<b>a</b>}</p>
          {createFragment(<b>b</b>, ChildFlags.HasVNodeChildren)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>a</b></p><b>b</b></div>');
    });

    it('Should update a Fragment with explicit child flags to the same child as an element', () => {
      const shared = <b>x</b>;

      render(
        <div>
          <p $HasVNodeChildren>{<b>1</b>}</p>
          {createFragment(<b>2</b>, ChildFlags.HasVNodeChildren)}
        </div>,
        container,
      );
      render(
        <div>
          <p $HasVNodeChildren>{shared}</p>
          {createFragment(shared, ChildFlags.HasVNodeChildren)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>x</b></p><b>x</b></div>');

      render(
        <div>
          <p $HasVNodeChildren>{<b>a</b>}</p>
          {createFragment(<b>b</b>, ChildFlags.HasVNodeChildren)}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><p><b>a</b></p><b>b</b></div>');
    });
  });

  // Each step of the keyed algorithm places a vNode, which can be the vNode "s" rendered in the other list
  describe('the same vNode in two keyed lists', () => {
    function li(key: string, text: string = key) {
      return <li key={key}>{text}</li>;
    }

    function renderLists(olItems, ulItems) {
      render(
        <div>
          <ol>{olItems}</ol>
          <ul>{ulItems}</ul>
        </div>,
        container,
      );
    }

    function html(olTexts: string[], ulTexts: string[]) {
      const items = (texts) => texts.map((text) => `<li>${text}</li>`).join('');

      return `<div><ol>${items(olTexts)}</ol><ul>${items(ulTexts)}</ul></div>`;
    }

    // Render "s" in both lists, then check both lists update their own DOM
    function addSharedToList(lastKeys: string[], nextKeys: string[]) {
      const shared = li('s');

      renderLists(
        [shared],
        lastKeys.map((key) => li(key)),
      );
      renderLists(
        [shared],
        nextKeys.map((key) => (key === 's' ? shared : li(key))),
      );
      expect(container.innerHTML).toBe(html(['s'], nextKeys));

      renderLists(
        [li('s', 'o')],
        nextKeys.map((key) => (key === 's' ? li(key, 'u') : li(key))),
      );
      expect(container.innerHTML).toBe(
        html(
          ['o'],
          nextKeys.map((key) => (key === 's' ? 'u' : key)),
        ),
      );
    }

    it('Should patch the same vNode at the start of both lists', () => {
      addSharedToList(['s', 'a'], ['s', 'b']);
    });

    it('Should patch the same vNode at the end of both lists', () => {
      addSharedToList(['a', 's'], ['b', 's']);
    });

    it('Should append the same vNode', () => {
      addSharedToList(['a'], ['a', 's']);
    });

    it('Should patch the same vNode when list is reordered', () => {
      addSharedToList(['a', 's', 'b'], ['b', 's', 'a']);
    });

    it('Should patch the same vNode when long list is reordered', () => {
      const keys: string[] = [];

      for (let i = 0; i < 39; ++i) {
        keys.push('k' + i);
      }
      keys.push('s');

      addSharedToList(keys, keys.slice().reverse());
    });

    it('Should insert the same vNode when list is reordered', () => {
      addSharedToList(['a', 'b', 'c'], ['c', 'a', 's']);
    });

    it('Should insert the same vNode in the middle of a list', () => {
      addSharedToList(['a', 'b', 'c'], ['a', 's', 'c']);
    });
  });

  // Normalization changes flags and keys of child vNodes, which must not affect a vNode already used elsewhere
  describe('normalization', () => {
    it('Should patch a vNode normalized elsewhere like a new vNode', () => {
      let constructed = 0;

      class Counter extends Component {
        constructor(props) {
          super(props);
          constructed++;
        }

        public render() {
          return <span>counter</span>;
        }
      }

      function Show({ item }) {
        return item;
      }

      const shared = <Counter />;

      render(
        <div>
          <Show item={<Counter />} />
          <p>{shared}</p>
        </div>,
        container,
      );
      expect(constructed).toBe(2);

      // Show keeps its Counter, although the Counter it renders now has been normalized as child of p
      render(
        <div>
          <Show item={shared} />
          <p />
        </div>,
        container,
      );
      expect(constructed).toBe(2);
      expect(container.innerHTML).toBe(
        '<div><span>counter</span><p></p></div>',
      );
    });

    it('Should not change a vNode rendered elsewhere when it becomes a single child', () => {
      let constructed = 0;

      class Counter extends Component {
        constructor(props) {
          super(props);
          constructed++;
        }

        public render() {
          return <span>counter</span>;
        }
      }

      const shared = <Counter />;

      function Root({ useShared }) {
        return useShared ? shared : <Counter />;
      }

      render(
        <div>
          <Root useShared={true} />
          {null}
        </div>,
        container,
      );
      render(
        <div>
          <Root useShared={true} />
          {<p>{shared}</p>}
        </div>,
        container,
      );
      expect(constructed).toBe(2);

      // Root keeps its Counter when it switches to an equal element
      render(
        <div>
          <Root useShared={false} />
          {null}
        </div>,
        container,
      );
      expect(constructed).toBe(2);
      expect(container.innerHTML).toBe('<div><span>counter</span></div>');
    });

    it('Should not change the key of a vNode when it is used at another index', () => {
      const shared = <li>x</li>;

      render(
        <div>
          <ul>{[shared]}</ul>
          <ol>{[]}</ol>
        </div>,
        container,
      );

      const li = container.querySelector('ul li');

      render(
        <div>
          <ul>{[shared]}</ul>
          <ol>{[<li>y</li>, shared]}</ol>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><ul><li>x</li></ul><ol><li>y</li><li>x</li></ol></div>',
      );

      // The first list keeps its element, because its key did not change
      render(
        <div>
          <ul>{[<li>x</li>]}</ul>
          <ol>{[]}</ol>
        </div>,
        container,
      );
      expect(container.querySelector('ul li')).toBe(li);
      expect(container.innerHTML).toBe(
        '<div><ul><li>x</li></ul><ol></ol></div>',
      );
    });

    it('Should not change the key of a vNode when it is used in another nested array', () => {
      const shared = <li>x</li>;

      render(
        <div>
          <ul>{[<li>a</li>, [shared]]}</ul>
          <ol>{[]}</ol>
        </div>,
        container,
      );

      const li = container.querySelectorAll('ul li')[1];

      render(
        <div>
          <ul>{[<li>a</li>, [shared]]}</ul>
          <ol>{[[shared]]}</ol>
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><ul><li>a</li><li>x</li></ul><ol><li>x</li></ol></div>',
      );

      // The first list keeps its element, because its key did not change
      render(
        <div>
          <ul>{[<li>a</li>, [<li>x</li>]]}</ul>
          <ol>{[]}</ol>
        </div>,
        container,
      );
      expect(container.querySelectorAll('ul li')[1]).toBe(li);
    });
  });

  // Rendering must not change the children a vNode was created with, the vNode can be rendered again later
  describe('reused vNode keeps its children', () => {
    it('Should render a hoisted element again after another element was patched in its place', () => {
      const PLACEHOLDER = (
        <p>
          <b>loading</b>
          <i>...</i>
        </p>
      );
      const view = (ready: boolean) =>
        ready ? (
          <p>
            <b>done</b>
            <i>!</i>
          </p>
        ) : (
          PLACEHOLDER
        );

      render(view(false), container);
      render(view(true), container);
      expect(container.innerHTML).toBe('<p><b>done</b><i>!</i></p>');

      render(view(false), container);
      expect(container.innerHTML).toBe('<p><b>loading</b><i>...</i></p>');
    });

    it('Should render a hoisted list again after another list was patched in its place', () => {
      const EMPTY = <ul>{[<li>none</li>]}</ul>;
      const view = (items: string[]) =>
        items.length > 0 ? (
          <ul>
            {items.map((item) => (
              <li>{item}</li>
            ))}
          </ul>
        ) : (
          EMPTY
        );

      render(view([]), container);
      render(view(['a', 'b']), container);
      expect(container.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');

      render(view([]), container);
      expect(container.innerHTML).toBe('<ul><li>none</li></ul>');
    });

    it('Should render a hoisted Fragment again after another Fragment was patched in its place', () => {
      const PLACEHOLDER = (
        <Fragment>
          <b>loading</b>
          <i>...</i>
        </Fragment>
      );
      const view = (ready: boolean) => (
        <div>
          {ready ? (
            <Fragment>
              <b>done</b>
              <i>!</i>
            </Fragment>
          ) : (
            PLACEHOLDER
          )}
        </div>
      );

      render(view(false), container);
      render(view(true), container);
      render(view(false), container);
      expect(container.innerHTML).toBe('<div><b>loading</b><i>...</i></div>');
    });

    it('Should render a hoisted Fragment with explicit child flags again after another Fragment was patched in its place', () => {
      const PLACEHOLDER = (
        <Fragment>
          <b>loading</b>
          <i>...</i>
        </Fragment>
      );
      const view = (ready: boolean) => (
        <div $HasVNodeChildren>
          {ready ? (
            <Fragment>
              <b>done</b>
              <i>!</i>
            </Fragment>
          ) : (
            PLACEHOLDER
          )}
        </div>
      );

      render(view(false), container);
      render(view(true), container);
      render(view(false), container);
      expect(container.innerHTML).toBe('<div><b>loading</b><i>...</i></div>');
    });

    it('Should render the same element with multiple children twice', () => {
      const row = (
        <ul>
          <li>a</li>
          <li>b</li>
        </ul>
      );

      render(
        <div>
          {row}
          {row}
        </div>,
        container,
      );
      render(
        <div>
          {row}
          {row}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><ul><li>a</li><li>b</li></ul><ul><li>a</li><li>b</li></ul></div>',
      );

      render(
        <div>
          {
            <ul>
              <li>c</li>
              <li>d</li>
            </ul>
          }
          {
            <ul>
              <li>e</li>
              <li>f</li>
            </ul>
          }
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><ul><li>c</li><li>d</li></ul><ul><li>e</li><li>f</li></ul></div>',
      );
    });

    it('Should render the same Fragment with one child twice', () => {
      const fragment = <Fragment>{<b>x</b>}</Fragment>;

      render(
        <div>
          {fragment}
          <i />
          {fragment}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><b>x</b><i></i><b>x</b></div>');

      render(
        <div>
          {<Fragment>{<b>a</b>}</Fragment>}
          <i />
          {<Fragment>{<b>b</b>}</Fragment>}
        </div>,
        container,
      );
      expect(container.innerHTML).toBe('<div><b>a</b><i></i><b>b</b></div>');
    });

    it('Should render the same Fragment with multiple children twice', () => {
      const fragment = (
        <Fragment>
          <b>x</b>
          <b>y</b>
        </Fragment>
      );

      render(
        <div>
          {fragment}
          <i />
          {fragment}
        </div>,
        container,
      );
      render(
        <div>
          {
            <Fragment>
              <b>1</b>
              <b>2</b>
            </Fragment>
          }
          <i />
          {
            <Fragment>
              <b>3</b>
              <b>4</b>
            </Fragment>
          }
        </div>,
        container,
      );
      expect(container.innerHTML).toBe(
        '<div><b>1</b><b>2</b><i></i><b>3</b><b>4</b></div>',
      );
    });

    it('Should render the same Portal twice', () => {
      const portalContainer = document.createElement('div');
      const portal = createPortal(<b>x</b>, portalContainer);

      render(
        <div>
          {portal}
          <i />
          {portal}
        </div>,
        container,
      );
      expect(portalContainer.innerHTML).toBe('<b>x</b><b>x</b>');

      render(
        <div>
          {createPortal(<b>a</b>, portalContainer)}
          <i />
          {createPortal(<b>b</b>, portalContainer)}
        </div>,
        container,
      );
      expect(portalContainer.innerHTML).toBe('<b>a</b><b>b</b>');
    });
    it('Should render the same element with a Portal child twice', () => {
      const portalContainer = document.createElement('div');
      const row = <span>{createPortal(<b>x</b>, portalContainer)}</span>;

      render(
        <div>
          {row}
          {row}
        </div>,
        container,
      );
      expect(portalContainer.innerHTML).toBe('<b>x</b><b>x</b>');

      render(<div />, container);
      expect(portalContainer.innerHTML).toBe('');
    });

    it('Should update the same Portal rendered twice', () => {
      const portalContainer = document.createElement('div');
      const portal = createPortal(<b>x</b>, portalContainer);

      for (let i = 0; i < 2; ++i) {
        render(
          <div>
            {portal}
            <i />
            {portal}
          </div>,
          container,
        );
        expect(portalContainer.innerHTML).toBe('<b>x</b><b>x</b>');
      }

      render(
        <div>
          {createPortal(<b>a</b>, portalContainer)}
          <i />
          {createPortal(<b>b</b>, portalContainer)}
        </div>,
        container,
      );
      expect(portalContainer.innerHTML).toBe('<b>a</b><b>b</b>');
    });
  });

  describe('the same vNode rendered at the same position is not cloned', () => {
    it('Should not clone the same vNode rendered again into the same container', () => {
      const shared = <span>x</span>;

      render(shared, container);
      render(shared, container);
      render(shared, container);

      expect(container.$V).toBe(shared);
      expect(container.innerHTML).toBe('<span>x</span>');
    });

    it('Should not clone hoisted single child with explicit child flags', () => {
      const hoisted = <span>x</span>;
      let instance;

      class Parent extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return <p $HasVNodeChildren>{hoisted}</p>;
        }
      }

      render(<Parent />, container);

      for (let i = 0; i < 3; ++i) {
        instance.forceUpdate();
        expect(instance.$LI.children).toBe(hoisted);
        expect(container.innerHTML).toBe('<p><span>x</span></p>');
      }
    });

    it('Should not clone hoisted root of class component', () => {
      const hoisted = <span>x</span>;
      let instance;

      class Parent extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return hoisted;
        }
      }

      render(<Parent />, container);

      for (let i = 0; i < 3; ++i) {
        instance.forceUpdate();
        expect(instance.$LI).toBe(hoisted);
        expect(container.innerHTML).toBe('<span>x</span>');
      }
    });

    it('Should not clone hoisted root of functional component', () => {
      const hoisted = <span>x</span>;
      let instance;

      function Child() {
        return hoisted;
      }

      class Parent extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return <Child />;
        }
      }

      render(<Parent />, container);

      for (let i = 0; i < 3; ++i) {
        instance.forceUpdate();
        expect(instance.$LI.children).toBe(hoisted);
        expect(container.innerHTML).toBe('<span>x</span>');
      }
    });

    it('Should not clone single props.children', () => {
      let instance;

      class Wrapper extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return <div>{this.props.children}</div>;
        }
      }

      render(
        <Wrapper>
          <span>x</span>
        </Wrapper>,
        container,
      );

      const child = instance.props.children;

      for (let i = 0; i < 3; ++i) {
        instance.forceUpdate();
        expect(instance.$LI.children).toBe(child);
        expect(container.innerHTML).toBe('<div><span>x</span></div>');
      }
    });

    it('Should not clone props.children array items', () => {
      let instance;

      class Wrapper extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return <div>{this.props.children}</div>;
        }
      }

      render(
        <Wrapper>
          <span>a</span>
          <span>b</span>
        </Wrapper>,
        container,
      );

      const children = instance.props.children;

      for (let i = 0; i < 3; ++i) {
        instance.forceUpdate();
        expect(instance.$LI.children[0]).toBe(children[0]);
        expect(instance.$LI.children[1]).toBe(children[1]);
        expect(container.innerHTML).toBe(
          '<div><span>a</span><span>b</span></div>',
        );
      }
    });

    it('Should not clone the items of a hoisted element', () => {
      const list = (
        <ul>
          <li>a</li>
          <li>b</li>
        </ul>
      );
      const items = (list.children as VNode[]).slice();
      let instance;

      class Parent extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return list;
        }
      }

      render(<Parent />, container);

      for (let i = 0; i < 3; ++i) {
        instance.forceUpdate();
        expect(list.children[0]).toBe(items[0]);
        expect(list.children[1]).toBe(items[1]);
        expect(container.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
      }
    });

    it('Should not clone the same vNode at the end of a keyed list', () => {
      const last = <li key="last">last</li>;

      render(<ul>{[<li key="a">a</li>, last]}</ul>, container);
      render(<ul>{[<li key="b">b</li>, last]}</ul>, container);

      expect(container.$V.children[1]).toBe(last);
      expect(container.innerHTML).toBe('<ul><li>b</li><li>last</li></ul>');
    });

    it('Should not clone the same vNode when a keyed list is reordered', () => {
      const middle = <li key="m">m</li>;

      render(
        <ul>{[<li key="a">a</li>, middle, <li key="b">b</li>]}</ul>,
        container,
      );
      render(
        <ul>{[<li key="b">b</li>, middle, <li key="a">a</li>]}</ul>,
        container,
      );

      expect(container.$V.children[1]).toBe(middle);
      expect(container.innerHTML).toBe(
        '<ul><li>b</li><li>m</li><li>a</li></ul>',
      );
    });

    it('Should not clone the same vNode when a long keyed list is reordered', () => {
      const middle = <li key="m">m</li>;
      const keys: string[] = [];

      for (let i = 0; i < 40; ++i) {
        keys.push(i === 20 ? 'm' : 'k' + i);
      }
      const view = (order: string[]) => (
        <ul>
          {order.map((key) =>
            key === 'm' ? middle : <li key={key}>{key}</li>,
          )}
        </ul>
      );

      render(view(keys), container);
      render(view(keys.slice().reverse()), container);

      expect(container.$V.children[19]).toBe(middle);
      expect(container.innerHTML).toBe(
        '<ul>' +
          keys
            .slice()
            .reverse()
            .map((key) => `<li>${key}</li>`)
            .join('') +
          '</ul>',
      );
    });

    it('Should not clone the same vNode in a nested array', () => {
      const nested = <li>n</li>;

      render(<ul>{[<li>a</li>, [nested]]}</ul>, container);
      render(<ul>{[<li>a</li>, [nested]]}</ul>, container);

      expect(container.$V.children[1]).toBe(nested);
      expect(container.innerHTML).toBe('<ul><li>a</li><li>n</li></ul>');
    });

    it('Should still re-create the same vNode when it is flagged with ReCreate', () => {
      const hoisted = createVNode(
        VNodeFlags.HtmlElement | VNodeFlags.ReCreate,
        'span',
        null,
        'x',
        ChildFlags.HasTextChildren,
      );
      let instance;

      class Parent extends Component {
        constructor(props) {
          super(props);
          instance = this;
        }

        public render() {
          return hoisted;
        }
      }

      render(<Parent />, container);

      for (let i = 0; i < 3; ++i) {
        const lastDom = container.firstChild;

        instance.forceUpdate();
        expect(container.firstChild).not.toBe(lastDom);
        expect(container.innerHTML).toBe('<span>x</span>');
      }
    });
  });
});
