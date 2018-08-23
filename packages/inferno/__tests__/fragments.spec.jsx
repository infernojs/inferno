import { Component, createFragment, render } from "inferno";
import { ChildFlags } from 'inferno-vnode-flags';

describe('Fragments', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should render and unmount fragment', () => {
    class Example extends Component {
      render() {
        return (
          createFragment([
            <div>First</div>,
            <div>second</div>
          ], ChildFlags.HasNonKeyedChildren)
        )
      }
    }

    render(<Example/>, container);

    expect(container.innerHTML).toBe('<div>First</div><div>second</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should render nested fragment', () => {
    class Example extends Component {
      render() {
        return (
          createFragment([
            <div>First</div>,
            createFragment([
              <div>Sub1</div>,
              <div>Sub2</div>,
            ], ChildFlags.HasNonKeyedChildren),
            <div>second</div>
          ], ChildFlags.HasNonKeyedChildren)
        )
      }
    }

    render(<Example/>, container);

    expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be to replace component with fragment with another component', () => {
    class Example extends Component {
      render() {
        return (
          createFragment([
            <div>First</div>,
            createFragment([
              <div>Sub1</div>,
              <div>Sub2</div>,
            ], ChildFlags.HasNonKeyedChildren),
            <div>second</div>
          ], ChildFlags.HasNonKeyedChildren)
        )
      }
    }

    function FunctionalComp() {
      return (
        createFragment(
          [<div>Functional</div>], ChildFlags.HasNonKeyedChildren
        )
      )
    }

    render(<Example/>, container);

    expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

    render(<FunctionalComp/>, container);

    expect(container.innerHTML).toBe('<div>Functional</div>');

    render(<Example/>, container);

    expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

    render(<FunctionalComp/>, container);
    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to move fragments', () => {
    const fragmentA = createFragment([
        <div id="a1">A1</div>,
        <div>A2</div>
      ], ChildFlags.HasNonKeyedChildren, 'A'
    );

    const fragmentB = createFragment([
        <div id="b1">B1</div>,
      ], ChildFlags.HasNonKeyedChildren, 'B'
    );

    const fragmentC = createFragment([
        <div id="c1">C1</div>,
        <div>C2</div>,
        <div>C3</div>
      ], ChildFlags.HasNonKeyedChildren, 'C'
    );

    render((
      <div>
        {fragmentA}
        {fragmentB}
        {fragmentC}
      </div>
    ), container);

    expect(container.innerHTML).toBe('<div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>');

    let A1 = container.querySelector('#a1');
    let B1 = container.querySelector('#b1');
    let C1 = container.querySelector('#c1');

    // Switch order
    render((
      <div>
        {fragmentC}
        {fragmentA}
        {fragmentB}
      </div>
    ), container);

    // Verify dom has changed and nodes are the same
    expect(container.innerHTML).toBe('<div><div id="c1">C1</div><div>C2</div><div>C3</div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div></div>');

    expect(container.querySelector('#a1')).toBe(A1);
    expect(container.querySelector('#b1')).toBe(B1);
    expect(container.querySelector('#c1')).toBe(C1);

    // Switch order again
    render((
      <div>
        {fragmentB}
        {fragmentC}
      </div>
    ), container);

    // Verify dom has changed and nodes are the same
    expect(container.innerHTML).toBe('<div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>');

    expect(container.querySelector('#a1')).toBe(null);
    expect(container.querySelector('#b1')).toBe(B1);
    expect(container.querySelector('#c1')).toBe(C1);
  });
});
