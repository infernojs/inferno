import { Fragment, render } from 'inferno';

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
