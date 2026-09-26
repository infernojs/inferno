import { Component, Fragment, render } from 'inferno';

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
  });
});
