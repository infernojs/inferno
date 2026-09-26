import {
  Component,
  createFragment,
  createPortal,
  Fragment,
  render,
} from 'inferno';
import { ChildFlags } from 'inferno-vnode-flags';

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
});
