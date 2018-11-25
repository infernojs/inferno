import { Fragment, Component, createPortal, createFragment, render } from 'inferno';
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
        return createFragment([<div>First</div>, <div>second</div>], ChildFlags.HasNonKeyedChildren);
      }
    }

    render(<Example />, container);

    expect(container.innerHTML).toBe('<div>First</div><div>second</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should render nested fragment', () => {
    class Example extends Component {
      render() {
        return createFragment(
          [<div>First</div>, createFragment([<div>Sub1</div>, <div>Sub2</div>], ChildFlags.HasNonKeyedChildren), <div>second</div>],
          ChildFlags.HasNonKeyedChildren
        );
      }
    }

    render(<Example />, container);

    expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be to replace component with fragment with another component', () => {
    class Example extends Component {
      render() {
        return createFragment(
          [<div>First</div>, createFragment([<div>Sub1</div>, <div>Sub2</div>], ChildFlags.HasNonKeyedChildren), <div>second</div>],
          ChildFlags.HasNonKeyedChildren
        );
      }
    }

    function FunctionalComp() {
      return createFragment([<div>Functional</div>], ChildFlags.HasNonKeyedChildren);
    }

    render(<Example />, container);

    expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

    render(<FunctionalComp />, container);

    expect(container.innerHTML).toBe('<div>Functional</div>');

    render(<Example />, container);

    expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

    render(<FunctionalComp />, container);
    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to move fragments', () => {
    const fragmentA = () => createFragment([<div id="a1">A1</div>, <div>A2</div>], ChildFlags.HasNonKeyedChildren, 'A');

    const fragmentB = () => createFragment([<div id="b1">B1</div>], ChildFlags.HasNonKeyedChildren, 'B');

    const fragmentC = () => createFragment([<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>], ChildFlags.HasNonKeyedChildren, 'C');

    render(
      <div>
        {fragmentA()}
        {fragmentB()}
        {fragmentC()}
      </div>,
      container
    );

    expect(container.innerHTML).toBe('<div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>');

    let A1 = container.querySelector('#a1');
    let B1 = container.querySelector('#b1');
    let C1 = container.querySelector('#c1');

    // Switch order
    render(
      <div>
        {fragmentC()}
        {fragmentA()}
        {fragmentB()}
      </div>,
      container
    );

    // Verify dom has changed and nodes are the same
    expect(container.innerHTML).toBe('<div><div id="c1">C1</div><div>C2</div><div>C3</div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div></div>');

    expect(container.querySelector('#a1')).toBe(A1);
    expect(container.querySelector('#b1')).toBe(B1);
    expect(container.querySelector('#c1')).toBe(C1);

    // Switch order again
    render(
      <div>
        {fragmentB()}
        {fragmentC()}
      </div>,
      container
    );

    // Verify dom has changed and nodes are the same
    expect(container.innerHTML).toBe('<div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>');

    expect(container.querySelector('#a1')).toBe(null);
    expect(container.querySelector('#b1')).toBe(B1);
    expect(container.querySelector('#c1')).toBe(C1);
  });

  it('Should clone fragment children if they are passed as reference', () => {
    const fragmentA = createFragment([<div id="a1">A1</div>, <div>A2</div>], ChildFlags.HasNonKeyedChildren, 'A');
    const fragmentB = createFragment([<div id="b1">B1</div>], ChildFlags.HasNonKeyedChildren, 'B');
    const fragmentC = createFragment([<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>], ChildFlags.HasNonKeyedChildren, 'C');

    const content = [fragmentC];

    function SFC() {
      return (
        <Fragment>
          <span>1</span>
          <Fragment>{content}</Fragment>
          <span>2</span>
        </Fragment>
      );
    }

    render(
      <Fragment>
        {fragmentA}
        <SFC key="sfc" />
        {fragmentB}
        {fragmentC}
      </Fragment>,
      container
    );

    const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
    const FragmentBHtml = '<div id="b1">B1</div>';
    const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
    const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

    expect(container.innerHTML).toBe(FragmentAHtml + SFCHtml + FragmentBHtml + FragmentCHtml);

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to move component with fragment root', () => {
    const fragmentA = createFragment([<div id="a1">A1</div>, <div>A2</div>], ChildFlags.HasNonKeyedChildren, 'A');
    const fragmentB = createFragment([<div id="b1">B1</div>], ChildFlags.HasNonKeyedChildren, 'B');
    const fragmentC = createFragment([<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>], ChildFlags.HasNonKeyedChildren, 'C');

    const content = [fragmentC];

    function SFC() {
      return (
        <Fragment>
          <span>1</span>
          <Fragment>{content}</Fragment>
          <span>2</span>
        </Fragment>
      );
    }

    render(
      <Fragment>
        {fragmentA}
        <SFC key="sfc" />
        {fragmentB}
        {fragmentC}
      </Fragment>,
      container
    );

    const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
    const FragmentBHtml = '<div id="b1">B1</div>';
    const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
    const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

    expect(container.innerHTML).toBe(FragmentAHtml + SFCHtml + FragmentBHtml + FragmentCHtml);

    // Switch order
    render(
      <Fragment>
        {fragmentA}
        {fragmentC}
        <SFC key="sfc" />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe(FragmentAHtml + FragmentCHtml + SFCHtml);

    // Switch order again
    render(
      <Fragment>
        <div key="1">1</div>
        <SFC key="sfc" />
        {fragmentA}
        {fragmentC}
        <div key="1">2</div>
      </Fragment>,
      container
    );

    // Verify dom has changed and nodes are the same
    expect(container.innerHTML).toBe('<div>1</div>' + SFCHtml + FragmentAHtml + FragmentCHtml + '<div>2</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to move component with fragment root #2', () => {
    const fragmentA = createFragment([<div id="a1">A1</div>, <div>A2</div>], ChildFlags.HasNonKeyedChildren, 'A');
    const fragmentB = createFragment([<div id="b1">B1</div>], ChildFlags.HasNonKeyedChildren, 'B');
    const fragmentC = createFragment([<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>], ChildFlags.HasNonKeyedChildren, 'C');

    const content = [fragmentC];

    function SFC() {
      return (
        <Fragment>
          <span>1</span>
          <Fragment>{content}</Fragment>
          <span>2</span>
        </Fragment>
      );
    }

    render(
      <Fragment>
        {fragmentA}
        <SFC key="sfc1" />
        {fragmentB}
        <SFC key="sfc2" />
        {fragmentC}
        <SFC key="sfc3" />
      </Fragment>,
      container
    );

    const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
    const FragmentBHtml = '<div id="b1">B1</div>';
    const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
    const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

    expect(container.innerHTML).toBe(FragmentAHtml + SFCHtml + FragmentBHtml + SFCHtml + FragmentCHtml + SFCHtml);

    // Switch order
    render(
      <Fragment>
        <SFC key="sfc3" />
        {fragmentA}
        <SFC key="sfc1" />
        {fragmentC}
        <SFC key="sfc2" />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe(SFCHtml + FragmentAHtml + SFCHtml + FragmentCHtml + SFCHtml);

    // Switch order again
    render(
      <Fragment>
        <div key="1">1</div>
        <SFC key="sfc1" />
        <SFC key="sfc2" />
        {fragmentA}
        {fragmentC}
        <div key="1">2</div>
        <SFC key="sfc3" />
      </Fragment>,
      container
    );

    // Verify dom has changed and nodes are the same
    expect(container.innerHTML).toBe('<div>1</div>' + SFCHtml + SFCHtml + FragmentAHtml + FragmentCHtml + '<div>2</div>' + SFCHtml);

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to render fragments JSX way', () => {
    function Fragmenter({ first, mid, last, changeOrder }) {
      if (changeOrder) {
        return (
          <>
            <div>{first}</div>
            <>
              More
              {null}
              Hey!
              <Fragment>
                <>Large {last}</>
                <Fragment>And Small</Fragment>
              </Fragment>
              <>Nesting</>
              {mid}
            </>
            <span>bar</span>
            {null}
          </>
        );
      }
      return (
        <>
          <div>{first}</div>
          Hey!
          <>
            More
            <>Nesting</>
            {mid}
            <Fragment>
              <>Large {last}</>
              <Fragment>And Small</Fragment>
            </Fragment>
          </>
          <span>bar</span>
        </>
      );
    }

    let mountCounter = 0;
    let unmountCounter = 0;

    class FoobarCom extends Component {
      componentWillMount() {
        mountCounter++;
      }

      componentWillUnmount() {
        unmountCounter++;
      }

      render(props) {
        return (
          <>
            {props.children}
            {createPortal(<div>InvisiblePortalCreator</div>, props.node)}
            {null}
            Try out some crazy stuff
          </>
        );
      }
    }

    const portalNode = document.createElement('div');

    render(
      <FoobarCom node={portalNode}>
        <Fragmenter first="first" mid="MID" last={<div>Why?</div>} />
      </FoobarCom>,
      container
    );

    expect(container.innerHTML).toBe('<div>first</div>Hey!MoreNestingMIDLarge <div>Why?</div>And Small<span>bar</span>Try out some crazy stuff');
    expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');

    render(
      <FoobarCom node={portalNode}>
        <Fragmenter first={<span>GoGo</span>} mid="MID" last={<div>Why?</div>} changeOrder={true} />
      </FoobarCom>,
      container
    );

    expect(container.innerHTML).toBe('<div><span>GoGo</span></div>MoreHey!Large <div>Why?</div>And SmallNestingMID<span>bar</span>Try out some crazy stuff');
    expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');

    render(
      <FoobarCom node={portalNode}>
        <Fragmenter first="first" mid="MID" last={<div>Why?</div>} />
      </FoobarCom>,
      container
    );

    expect(container.innerHTML).toBe('<div>first</div>Hey!MoreNestingMIDLarge <div>Why?</div>And Small<span>bar</span>Try out some crazy stuff');
    expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');
  });

  it('Should render deeply nested fragment', () => {
    function Fragmenter2() {
      return (
        <>
          <>
            <>
              <>
                <>
                  <>
                    <>
                      <>Okay!</>
                    </>
                  </>
                </>
              </>
            </>
          </>
        </>
      );
    }

    render(<Fragmenter2 />, container);

    expect(container.innerHTML).toBe('Okay!');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should append DOM nodes to correct position when component root Fragmnet change', () => {
    class TestRoot extends Component {
      render() {
        return <>{this.props.children}</>;
      }
    }

    render(
      <div>
        <TestRoot>
          <div>1</div>
          <div>2</div>
        </TestRoot>
        <TestRoot>
          <span>Ok</span>
          <span>Test</span>
        </TestRoot>
      </div>,
      container
    );

    expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><span>Ok</span><span>Test</span></div>');

    render(
      <div>
        <TestRoot>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </TestRoot>
        <TestRoot>
          <div>Other</div>
        </TestRoot>
      </div>,
      container
    );
    expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div><div>Other</div></div>');
  });

  it('Should not clear whole parent element when fragment children are cleared', () => {
    class TestRoot extends Component {
      render() {
        return <>{this.props.children}</>;
      }
    }

    render(
      <div>
        <TestRoot>
          <div>1</div>
          <div>2</div>
        </TestRoot>
        <TestRoot>
          <span>Ok</span>
          <span>Test</span>
        </TestRoot>
      </div>,
      container
    );

    expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><span>Ok</span><span>Test</span></div>');

    render(
      <div>
        <TestRoot>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
        </TestRoot>
        <TestRoot />
      </div>,
      container
    );
    expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div></div>');
  });

  it('Should move fragment and all its contents when using Fragment long syntax with keys', () => {
    let unmountCounter = 0;
    let mountCounter = 0;

    class TestLifecycle extends Component {
      componentWillUnmount() {
        unmountCounter++;
      }

      componentWillMount() {
        mountCounter++;
      }

      render() {
        return <>{this.props.children}</>;
      }
    }

    render(
      <div>
        <Fragment key="1">
          <TestLifecycle>1a</TestLifecycle>
          <TestLifecycle>1b</TestLifecycle>
        </Fragment>
        <Fragment key="2">
          <TestLifecycle>2a</TestLifecycle>
          <TestLifecycle>2b</TestLifecycle>
        </Fragment>
      </div>,
      container
    );

    expect(container.innerHTML).toBe('<div>1a1b2a2b</div>');
    expect(unmountCounter).toBe(0);
    expect(mountCounter).toBe(4);

    render(
      <div>
        <Fragment key="2">
          <TestLifecycle>2a</TestLifecycle>
          <TestLifecycle>2b</TestLifecycle>
          <TestLifecycle>2c</TestLifecycle>
        </Fragment>
        <Fragment key="1">
          <TestLifecycle>1a</TestLifecycle>
          <TestLifecycle>1b</TestLifecycle>
        </Fragment>
      </div>,
      container
    );

    expect(container.innerHTML).toBe('<div>2a2b2c1a1b</div>');
    expect(unmountCounter).toBe(0);
    expect(mountCounter).toBe(5);

    render(
      <div>
        <Fragment key="3">
          <TestLifecycle>3a</TestLifecycle>
          <TestLifecycle>3b</TestLifecycle>
          <TestLifecycle>3c</TestLifecycle>
        </Fragment>
        <Fragment key="2">
          <TestLifecycle>2a</TestLifecycle>
          <TestLifecycle>2Patched</TestLifecycle>
        </Fragment>
      </div>,
      container
    );

    expect(container.innerHTML).toBe('<div>3a3b3c2a2Patched</div>');
    expect(unmountCounter).toBe(3);
    expect(mountCounter).toBe(8);
  });

  it('Should unmount empty fragments', () => {
    render(
      <Fragment>
        <Fragment />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(
      <Fragment>
        <div />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<div></div>');

    render(
      <Fragment>
        <Fragment />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to replace last element in fragment', () => {
    render(
      <Fragment>
        <Fragment>
          <span>1a</span>
          <span>1b</span>
          <div>1c</div>
        </Fragment>
        <Fragment>
          <span>2a</span>
          <span>2b</span>
          <span>2c</span>
        </Fragment>
        <Fragment />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<span>1a</span><span>1b</span><div>1c</div><span>2a</span><span>2b</span><span>2c</span>');

    render(
      <Fragment>
        <Fragment>
          <span>1a</span>
          <span>1c</span>
        </Fragment>
        <Fragment>
          <span>2a</span>
          <span>2b</span>
          <span>2c</span>
        </Fragment>
        <Fragment />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<span>1a</span><span>1c</span><span>2a</span><span>2b</span><span>2c</span>');

    render(
      <Fragment>
        <Fragment />
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should mount Fragment with invalid children', () => {
    render(
      <Fragment>
        {null}
        {undefined}
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should mount Fragment with invalid children #2', () => {
    function Foobar() {
      return null;
    }

    render(
      <Fragment>
        {null}
        <Foobar />
        {undefined}
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should mount Fragment with invalid children #2', () => {
    let add = false;

    function Foobar() {
      if (add) {
        return <div>Ok</div>;
      }
      return null;
    }

    render(
      <Fragment>
        {null}
        <Foobar />
        {undefined}
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('');

    add = true;

    render(
      <Fragment>
        {null}
        <Foobar />
        {undefined}
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<div>Ok</div>');
  });

  it('Should be possible to update from 0 to 1', () => {
    function Foobar() {
      return <div>Ok</div>;
    }

    let content = [null];

    render(
      <Fragment>
        <span>1</span>
        <Fragment>{content}</Fragment>
        <span>2</span>
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<span>1</span><span>2</span>');

    content = [<Foobar />];

    render(
      <Fragment>
        <span>1</span>
        <Fragment>{content}</Fragment>
        <span>2</span>
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<span>1</span><div>Ok</div><span>2</span>');
  });

  it('Should be possible to update from 0 to 1 fragment -> fragment', () => {
    function Foobar() {
      return <div>Ok</div>;
    }

    let content = [];

    render(
      <Fragment>
        <span>1</span>
        <Fragment>{content}</Fragment>
        <span>2</span>
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<span>1</span><span>2</span>');

    content = [
      <Fragment>
        <Foobar />
      </Fragment>
    ];

    render(
      <Fragment>
        <span>1</span>
        <Fragment>{content}</Fragment>
        <span>2</span>
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<span>1</span><div>Ok</div><span>2</span>');
  });

  it('Should be possible to mount and patch single component fragment children', () => {
    let counter = 0;

    class Foobar extends Component {
      componentWillMount() {
        counter++;
      }
      render() {
        return null;
      }
    }

    render(<></>, container);

    render(
      <>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('');
    expect(counter).toBe(1);

    render(
      <>
        <div>Ok</div>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('<div>Ok</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to mount and patch single component fragment children - variation 2', () => {
    let counter = 0;

    class Foobar extends Component {
      componentWillMount() {
        counter++;
      }
      render() {
        return null;
      }
    }

    let nodes = [];

    render(<>{nodes}</>, container);

    nodes = [<Foobar />];

    render(<>{nodes}</>, container);

    nodes = [<Foobar />, <Foobar />, <Foobar />];

    render(<>{nodes}</>, container);

    nodes = [];

    render(<>{nodes}</>, container);

    expect(container.innerHTML).toBe('');
    expect(counter).toBe(3);

    render(
      <>
        <div>Ok</div>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('<div>Ok</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to patch single fragment child component', () => {
    let counter = 0;

    class Foobar extends Component {
      componentWillMount() {
        counter++;
      }
      render() {
        return null;
      }
    }

    render(
      <>
        <>
          <Foobar />
        </>
        <>
          <Foobar />
        </>
      </>,
      container
    );

    expect(container.innerHTML).toBe('');
    expect(counter).toBe(2);

    render(
      <>
        <></>
        <>
          <Foobar />
        </>
        <>
          <Foobar />
        </>
        <></>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('');
    expect(counter).toBe(4);

    render(
      <>
        <div>Ok</div>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('<div>Ok</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to mount and patch single component fragment children', () => {
    class Foobar extends Component {
      render() {
        return null;
      }
    }

    render(
      <>
        <Foobar />
      </>,
      container
    );

    render(
      <>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(
      <>
        <div>Ok</div>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('<div>Ok</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should be possible to mount and patch single component fragment children', () => {
    class Foobar extends Component {
      render() {
        return null;
      }
    }

    render(<>{null}</>, container);

    render(
      <>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('');

    render(
      <>
        <div>Ok</div>
        <Foobar />
      </>,
      container
    );

    expect(container.innerHTML).toBe('<div>Ok</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should render fragment inside fragment Github #1399', () => {
    function Layout(props) {
      return <>{props.children}</>;
    }

    class PageTemplate extends Component {
      test(sim) {
        return (
          <>
            <div>{sim}</div>
          </>
        );
      }

      render() {
        return (
          <Layout>
            <div>test</div>
            <>{this.test('sim')}</>
          </Layout>
        );
      }
    }

    render(<PageTemplate />, container);

    expect(container.innerHTML).toBe('<div>test</div><div>sim</div>');

    render(null, container);

    expect(container.innerHTML).toBe('');
  });

  it('Should not crash if lastFragment is empty and optimized for keyed ( mount )', () => {
    let nodes = [];

    render(<Fragment $HasKeyedChildren>{nodes}</Fragment>, container);

    expect(container.innerHTML).toBe('');

    nodes = [<h1>Hello</h1>, <h2>InfernoJS</h2>];

    render(<Fragment $HasKeyedChildren>{nodes}</Fragment>, container);

    expect(container.innerHTML).toBe('<h1>Hello</h1><h2>InfernoJS</h2>');
  });

  it('Should not crash if lastFragment is empty and optimized for keyed ( patch )', () => {
    let nodes = [];

    render(<Fragment $HasKeyedChildren>{nodes}</Fragment>, container);

    expect(container.innerHTML).toBe('');

    nodes = nodes.slice();

    render(<Fragment $HasKeyedChildren>{nodes}</Fragment>, container);

    expect(container.innerHTML).toBe('');

    nodes = [<h1>Hello</h1>, <h2>InfernoJS</h2>];

    render(<Fragment $HasKeyedChildren>{nodes}</Fragment>, container);

    expect(container.innerHTML).toBe('<h1>Hello</h1><h2>InfernoJS</h2>');
  });
});
