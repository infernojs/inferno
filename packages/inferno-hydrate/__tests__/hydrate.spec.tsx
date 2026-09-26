import {
  Component,
  createFragment,
  createPortal,
  createRef,
  createTextVNode,
  createVNode,
  Fragment,
  type InfernoNode,
  render,
  rerender,
} from 'inferno';
import { hydrate } from 'inferno-hydrate';
import { h } from 'inferno-hyperscript';
import { triggerEvent } from 'inferno-utils';
import { ChildFlags, VNodeFlags } from 'inferno-vnode-flags';
import { createElement } from 'inferno-create-element';

describe('Hydrate - rendering routine', () => {
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

  describe('hydrate', () => {
    it('Should be possible to hydrate manually', () => {
      // create matching DOM
      container.innerHTML = '<input type="checkbox"/>';

      let clickChecked: boolean | null = null;
      let changeChecked: boolean | null = null;

      // Hydrate manually, instead rendering
      hydrate(
        <input
          type="checkbox"
          checked={false}
          onClick={(e) => {
            clickChecked = e.target.checked;
          }}
          onChange={(e) => {
            changeChecked = e.target.checked;
          }}
        />,
        container,
      );
      const input = container.firstChild;

      triggerEvent('click', input);

      expect(input.checked).toBe(false);
      expect(clickChecked).toBe(true);
      expect(changeChecked).toBe(true);
    });

    it('Should Manually hydrating should also attach root and patch when rendering next time', () => {
      // create matching DOM
      const spy = jasmine.createSpy('spy');
      container.innerHTML = '<div><input type="checkbox"/></div>';

      let clickChecked: boolean | null = null;
      let changeChecked: boolean | null = null;

      // Hydrate manually, instead rendering
      hydrate(
        <div ref={spy}>
          <input
            type="checkbox"
            checked={false}
            onClick={(e) => {
              clickChecked = e.target.checked;
            }}
            onChange={(e) => {
              changeChecked = e.target.checked;
            }}
          />
        </div>,
        container,
      );

      const oldInput = container.firstChild.firstChild;

      expect(spy.calls.count()).toBe(1);

      render(
        <div ref={spy}>
          <input
            type="checkbox"
            checked={true}
            className="new-class"
            onClick={(e) => {
              clickChecked = e.target.checked;
            }}
            onChange={(e) => {
              changeChecked = e.target.checked;
            }}
          />
        </div>,
        container,
      );

      expect(spy.calls.count()).toBe(1);

      const input = container.querySelector('input.new-class');

      expect(oldInput).toBe(input); // It should still be the same DOM node

      triggerEvent('click', input);

      expect(input.checked).toBe(true);
      expect(clickChecked).toBe(false);
      expect(changeChecked).toBe(false);

      render(null, container);

      expect(spy.calls.count()).toBe(2);
    });

    it('Should change value and defaultValue to empty when hydrating over existing textArea', () => {
      container.innerHTML = '<textarea>foobar</textarea>';

      hydrate(<textarea />, container);
      expect(container.firstChild.value).toBe('');
      expect(container.firstChild.defaultValue).toBe('');
    });

    it('Should work with object ref on element vNode', () => {
      // create matching DOM
      container.innerHTML = '<div>Okay<span>foobar</span></div>';

      const newRef = createRef<HTMLSpanElement>();

      hydrate(
        <div>
          Okay
          <span ref={newRef}>Foobar</span>
        </div>,
        container,
      );

      expect(newRef.current).toBe(container.querySelector('span'));
      expect(container.innerHTML).toBe('<div>Okay<span>Foobar</span></div>');
    });

    it('Should work with object ref on component vNode', () => {
      // create matching DOM
      container.innerHTML = '<div>Okay<span>foobar</span></div>';

      let instance: Foobar | null = null;

      class Foobar extends Component {
        constructor(props, context) {
          super(props, context);

          instance = this;
        }

        render() {
          return (
            <Fragment>
              <span>1</span>
              {this.props.children}
              <span>2</span>
            </Fragment>
          );
        }
      }

      const newRef = createRef<Foobar>();

      hydrate(
        <div>
          Okay
          <Foobar ref={newRef}>Foobar</Foobar>
        </div>,
        container,
      );

      expect(newRef.current).toBe(instance);
      expect(container.innerHTML).toBe(
        '<div>Okay<span>1</span>Foobar<span>2</span></div>',
      );
    });
  });

  describe('Hydrate fragments', () => {
    function runAllTests() {
      it('Should hydrate and unmount fragment', () => {
        class Example extends Component {
          render() {
            return createFragment(
              [<div>First</div>, <div>second</div>],
              ChildFlags.HasNonKeyedChildren,
            );
          }
        }

        hydrate(<Example />, container);

        expect(container.innerHTML).toBe('<div>First</div><div>second</div>');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should hydrate nested fragment', () => {
        class Example extends Component {
          render() {
            return createFragment(
              [
                <div>First</div>,
                createFragment(
                  [<div>Sub1</div>, <div>Sub2</div>],
                  ChildFlags.HasNonKeyedChildren,
                ),
                <div>second</div>,
              ],
              ChildFlags.HasNonKeyedChildren,
            );
          }
        }

        hydrate(<Example />, container);

        expect(container.innerHTML).toBe(
          '<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>',
        );

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be to replace component with fragment with another component', () => {
        class Example extends Component {
          render() {
            return createFragment(
              [
                <div>First</div>,
                createFragment(
                  [<div>Sub1</div>, <div>Sub2</div>],
                  ChildFlags.HasNonKeyedChildren,
                ),
                <div>second</div>,
              ],
              ChildFlags.HasNonKeyedChildren,
            );
          }
        }

        function FunctionalComp() {
          return createFragment(
            [<div>Functional</div>],
            ChildFlags.HasNonKeyedChildren,
          );
        }

        hydrate(<Example />, container);

        expect(container.innerHTML).toBe(
          '<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>',
        );

        render(<FunctionalComp />, container);

        expect(container.innerHTML).toBe('<div>Functional</div>');

        render(<Example />, container);

        expect(container.innerHTML).toBe(
          '<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>',
        );

        render(<FunctionalComp />, container);
        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to move fragments', () => {
        const fragmentA = () =>
          createFragment(
            [<div id="a1">A1</div>, <div>A2</div>],
            ChildFlags.HasNonKeyedChildren,
            'A',
          );

        const fragmentB = () =>
          createFragment(
            [<div id="b1">B1</div>],
            ChildFlags.HasNonKeyedChildren,
            'B',
          );

        const fragmentC = () =>
          createFragment(
            [<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>],
            ChildFlags.HasNonKeyedChildren,
            'C',
          );

        hydrate(
          <div>
            {fragmentA()}
            {fragmentB()}
            {fragmentC()}
          </div>,
          container,
        );

        expect(container.innerHTML).toBe(
          '<div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>',
        );

        const A1 = container.querySelector('#a1');
        const B1 = container.querySelector('#b1');
        const C1 = container.querySelector('#c1');

        // Switch order
        render(
          <div>
            {fragmentC()}
            {fragmentA()}
            {fragmentB()}
          </div>,
          container,
        );

        // Verify dom has changed and nodes are the same
        expect(container.innerHTML).toBe(
          '<div><div id="c1">C1</div><div>C2</div><div>C3</div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div></div>',
        );

        expect(container.querySelector('#a1')).toBe(A1);
        expect(container.querySelector('#b1')).toBe(B1);
        expect(container.querySelector('#c1')).toBe(C1);

        // Switch order again
        render(
          <div>
            {fragmentB()}
            {fragmentC()}
          </div>,
          container,
        );

        // Verify dom has changed and nodes are the same
        expect(container.innerHTML).toBe(
          '<div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>',
        );

        expect(container.querySelector('#a1')).toBe(null);
        expect(container.querySelector('#b1')).toBe(B1);
        expect(container.querySelector('#c1')).toBe(C1);
      });

      it('Should clone fragment children if they are passed as reference', () => {
        const fragmentA = createFragment(
          [<div id="a1">A1</div>, <div>A2</div>],
          ChildFlags.HasNonKeyedChildren,
          'A',
        );
        const fragmentB = createFragment(
          [<div id="b1">B1</div>],
          ChildFlags.HasNonKeyedChildren,
          'B',
        );
        const fragmentC = createFragment(
          [<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>],
          ChildFlags.HasNonKeyedChildren,
          'C',
        );

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

        hydrate(
          <Fragment>
            {fragmentA}
            <SFC key="sfc" />
            {fragmentB}
            {fragmentC}
          </Fragment>,
          container,
        );

        const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
        const FragmentBHtml = '<div id="b1">B1</div>';
        const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
        const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

        expect(container.innerHTML).toBe(
          FragmentAHtml + SFCHtml + FragmentBHtml + FragmentCHtml,
        );

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to move component with fragment root', () => {
        const fragmentA = createFragment(
          [<div id="a1">A1</div>, <div>A2</div>],
          ChildFlags.HasNonKeyedChildren,
          'A',
        );
        const fragmentB = createFragment(
          [<div id="b1">B1</div>],
          ChildFlags.HasNonKeyedChildren,
          'B',
        );
        const fragmentC = createFragment(
          [<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>],
          ChildFlags.HasNonKeyedChildren,
          'C',
        );

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

        hydrate(
          <Fragment>
            {fragmentA}
            <SFC key="sfc" />
            {fragmentB}
            {fragmentC}
          </Fragment>,
          container,
        );

        const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
        const FragmentBHtml = '<div id="b1">B1</div>';
        const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
        const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

        expect(container.innerHTML).toBe(
          FragmentAHtml + SFCHtml + FragmentBHtml + FragmentCHtml,
        );

        // Switch order
        render(
          <Fragment>
            {fragmentA}
            {fragmentC}
            <SFC key="sfc" />
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe(
          FragmentAHtml + FragmentCHtml + SFCHtml,
        );

        // Switch order again
        render(
          <Fragment>
            <div key="1">1</div>
            <SFC key="sfc" />
            {fragmentA}
            {fragmentC}
            <div key="1">2</div>
          </Fragment>,
          container,
        );

        // Verify dom has changed and nodes are the same
        expect(container.innerHTML).toBe(
          '<div>1</div>' +
            SFCHtml +
            FragmentAHtml +
            FragmentCHtml +
            '<div>2</div>',
        );

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to move multiple keyed components with fragment root between fragments', () => {
        const fragmentA = createFragment(
          [<div id="a1">A1</div>, <div>A2</div>],
          ChildFlags.HasNonKeyedChildren,
          'A',
        );
        const fragmentB = createFragment(
          [<div id="b1">B1</div>],
          ChildFlags.HasNonKeyedChildren,
          'B',
        );
        const fragmentC = createFragment(
          [<div id="c1">C1</div>, <div>C2</div>, <div>C3</div>],
          ChildFlags.HasNonKeyedChildren,
          'C',
        );

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

        hydrate(
          <Fragment>
            {fragmentA}
            <SFC key="sfc1" />
            {fragmentB}
            <SFC key="sfc2" />
            {fragmentC}
            <SFC key="sfc3" />
          </Fragment>,
          container,
        );

        const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
        const FragmentBHtml = '<div id="b1">B1</div>';
        const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
        const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

        expect(container.innerHTML).toBe(
          FragmentAHtml +
            SFCHtml +
            FragmentBHtml +
            SFCHtml +
            FragmentCHtml +
            SFCHtml,
        );

        // Switch order
        render(
          <Fragment>
            <SFC key="sfc3" />
            {fragmentA}
            <SFC key="sfc1" />
            {fragmentC}
            <SFC key="sfc2" />
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe(
          SFCHtml + FragmentAHtml + SFCHtml + FragmentCHtml + SFCHtml,
        );

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
          container,
        );

        // Verify dom has changed and nodes are the same
        expect(container.innerHTML).toBe(
          '<div>1</div>' +
            SFCHtml +
            SFCHtml +
            FragmentAHtml +
            FragmentCHtml +
            '<div>2</div>' +
            SFCHtml,
        );

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to hydrate fragments JSX way', () => {
        interface FragmenterProps {
          first: string;
          mid: string;
          last: string;
          changeOrder?: boolean;
        }
        function Fragmenter({
          first,
          mid,
          last,
          changeOrder,
        }: FragmenterProps) {
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

        class FoobarCom extends Component<{ node: HTMLDivElement }> {
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

        hydrate(
          <FoobarCom node={portalNode}>
            <Fragmenter first="first" mid="MID" last={<div>Why?</div>} />
          </FoobarCom>,
          container,
        );

        expect(container.innerHTML).toBe(
          '<div>first</div>Hey!MoreNestingMIDLarge <div>Why?</div>And Small<span>bar</span>Try out some crazy stuff',
        );
        expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');

        render(
          <FoobarCom node={portalNode}>
            <Fragmenter
              first={<span>GoGo</span>}
              mid="MID"
              last={<div>Why?</div>}
              changeOrder={true}
            />
          </FoobarCom>,
          container,
        );

        expect(container.innerHTML).toBe(
          '<div><span>GoGo</span></div>MoreHey!Large <div>Why?</div>And SmallNestingMID<span>bar</span>Try out some crazy stuff',
        );
        expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');

        render(
          <FoobarCom node={portalNode}>
            <Fragmenter first="first" mid="MID" last={<div>Why?</div>} />
          </FoobarCom>,
          container,
        );

        expect(container.innerHTML).toBe(
          '<div>first</div>Hey!MoreNestingMIDLarge <div>Why?</div>And Small<span>bar</span>Try out some crazy stuff',
        );
        expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');
      });

      it('Should hydrate deeply nested fragment', () => {
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

        hydrate(<Fragmenter2 />, container);

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

        hydrate(
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
          container,
        );

        expect(container.innerHTML).toBe(
          '<div><div>1</div><div>2</div><span>Ok</span><span>Test</span></div>',
        );

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
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><div>1</div><div>2</div><div>3</div><div>4</div><div>Other</div></div>',
        );
      });

      it('Should not clear whole parent element when fragment children are cleared', () => {
        class TestRoot extends Component {
          render() {
            return <>{this.props.children}</>;
          }
        }

        hydrate(
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
          container,
        );

        expect(container.innerHTML).toBe(
          '<div><div>1</div><div>2</div><span>Ok</span><span>Test</span></div>',
        );

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
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><div>1</div><div>2</div><div>3</div><div>4</div></div>',
        );
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

        hydrate(
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
          container,
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
          container,
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
          container,
        );

        expect(container.innerHTML).toBe('<div>3a3b3c2a2Patched</div>');
        expect(unmountCounter).toBe(3);
        expect(mountCounter).toBe(8);
      });

      it('Should unmount empty fragments', () => {
        hydrate(
          <Fragment>
            <Fragment />
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(
          <Fragment>
            <div />
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('<div></div>');

        render(
          <Fragment>
            <Fragment />
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to replace last element in fragment', () => {
        hydrate(
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
          container,
        );

        expect(container.innerHTML).toBe(
          '<span>1a</span><span>1b</span><div>1c</div><span>2a</span><span>2b</span><span>2c</span>',
        );

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
          container,
        );

        expect(container.innerHTML).toBe(
          '<span>1a</span><span>1c</span><span>2a</span><span>2b</span><span>2c</span>',
        );

        render(
          <Fragment>
            <Fragment />
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should mount Fragment with invalid children', () => {
        hydrate(
          <Fragment>
            {null}
            {undefined}
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should mount Fragment with invalid children and a component returning null', () => {
        function Foobar() {
          return null;
        }

        hydrate(
          <Fragment>
            {null}
            <Foobar />
            {undefined}
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should patch component inside Fragment with invalid children from null to an element', () => {
        let add = false;

        function Foobar() {
          if (add) {
            return <div>Ok</div>;
          }
          return null;
        }

        hydrate(
          <Fragment>
            {null}
            <Foobar />
            {undefined}
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('');

        add = true;

        render(
          <Fragment>
            {null}
            <Foobar />
            {undefined}
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('<div>Ok</div>');
      });

      it('Should be possible to update nested fragment from a null child to a component child', () => {
        function Foobar() {
          return <div>Ok</div>;
        }

        let content = [null];

        hydrate(
          <Fragment>
            <span>1</span>
            <Fragment>{content}</Fragment>
            <span>2</span>
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('<span>1</span><span>2</span>');

        content = [<Foobar />];

        render(
          <Fragment>
            <span>1</span>
            <Fragment>{content}</Fragment>
            <span>2</span>
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe(
          '<span>1</span><div>Ok</div><span>2</span>',
        );
      });

      it('Should be possible to update nested fragment from no children to a fragment wrapping a component', () => {
        function Foobar() {
          return <div>Ok</div>;
        }

        let content: InfernoNode[] = [];

        hydrate(
          <Fragment>
            <span>1</span>
            <Fragment>{content}</Fragment>
            <span>2</span>
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe('<span>1</span><span>2</span>');

        content = [
          <Fragment>
            <Foobar />
          </Fragment>,
        ];

        render(
          <Fragment>
            <span>1</span>
            <Fragment>{content}</Fragment>
            <span>2</span>
          </Fragment>,
          container,
        );

        expect(container.innerHTML).toBe(
          '<span>1</span><div>Ok</div><span>2</span>',
        );
      });

      it('Should be possible to mount and patch single component fragment child after hydrating an empty fragment', () => {
        let counter = 0;

        class Foobar extends Component {
          componentWillMount() {
            counter++;
          }

          render() {
            return null;
          }
        }

        hydrate(<></>, container);

        expect(container.innerHTML).toBe('');

        render(
          <>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('');
        expect(counter).toBe(1);

        render(
          <>
            <div>Ok</div>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('<div>Ok</div>');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to patch fragment children array from empty to one, three and zero components', () => {
        let counter = 0;

        class Foobar extends Component {
          componentWillMount() {
            counter++;
          }

          render() {
            return null;
          }
        }

        let nodes: InfernoNode[] = [];

        hydrate(<>{nodes}</>, container);

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
          container,
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

        hydrate(
          <>
            <>
              <Foobar />
            </>
            <>
              <Foobar />
            </>
          </>,
          container,
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
          container,
        );

        expect(container.innerHTML).toBe('');
        expect(counter).toBe(4);

        render(
          <>
            <div>Ok</div>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('<div>Ok</div>');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to patch single component fragment child after hydrating the same component', () => {
        class Foobar extends Component {
          render() {
            return null;
          }
        }

        hydrate(
          <>
            <Foobar />
          </>,
          container,
        );

        render(
          <>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(
          <>
            <div>Ok</div>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('<div>Ok</div>');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });

      it('Should be possible to mount and patch single component fragment child after hydrating a null child', () => {
        class Foobar extends Component {
          render() {
            return null;
          }
        }

        hydrate(<>{null}</>, container);

        render(
          <>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('');

        render(
          <>
            <div>Ok</div>
            <Foobar />
          </>,
          container,
        );

        expect(container.innerHTML).toBe('<div>Ok</div>');

        render(null, container);

        expect(container.innerHTML).toBe('');
      });
    }

    describe('empty container', () => {
      runAllTests();
    });

    describe('mismatching container', () => {
      beforeEach(() => {
        container.innerHTML = '<div>Okay<span>Foo</span></div><em></em>';
      });

      runAllTests();
    });
  });

  describe('SVG elements', () => {
    it('Should keep SVG children flagged when parent is SVG', () => {
      class Rect extends Component {
        constructor(p, c) {
          super(p, c);
          this.state = { className: 'foo' };
        }

        componentDidMount() {
          this.setState({ className: 'bar' });
        }

        render() {
          return createElement('rect', {
            className: this.state!.className,
          });
        }
      }

      hydrate(
        <svg>
          <Rect />
        </svg>,
        container,
      );

      expect(container.firstChild.firstChild.getAttribute('class')).toBe('foo');

      rerender();

      expect(container.firstChild.firstChild.getAttribute('class')).toBe('bar');
    });
  });

  // Hydration places vNodes like mounting does, so a vNode referenced in two places must be cloned for the second place
  describe('shared vNodes', () => {
    function element(type: string, children, childFlags: ChildFlags) {
      return createVNode(
        VNodeFlags.HtmlElement,
        type,
        null,
        children,
        childFlags,
      );
    }

    function textElement(type: string, text: string) {
      return element(type, text, ChildFlags.HasTextChildren);
    }

    describe('explicit child flags', () => {
      it('Should hydrate the same single child in two places', () => {
        container.innerHTML = '<div><p><b>x</b></p><p><b>x</b></p></div>';

        const shared = textElement('b', 'x');

        hydrate(
          element(
            'div',
            [
              element('p', shared, ChildFlags.HasVNodeChildren),
              element('p', shared, ChildFlags.HasVNodeChildren),
            ],
            ChildFlags.HasNonKeyedChildren,
          ),
          container,
        );

        render(
          element(
            'div',
            [
              element('p', textElement('b', 'a'), ChildFlags.HasVNodeChildren),
              element('p', textElement('b', 'b'), ChildFlags.HasVNodeChildren),
            ],
            ChildFlags.HasNonKeyedChildren,
          ),
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><p><b>a</b></p><p><b>b</b></p></div>',
        );
      });

      it('Should hydrate the same vNode twice in one array', () => {
        container.innerHTML = '<ul><li>x</li><li>x</li></ul>';

        const shared = textElement('li', 'x');

        hydrate(
          element('ul', [shared, shared], ChildFlags.HasNonKeyedChildren),
          container,
        );

        render(
          element(
            'ul',
            [textElement('li', 'a'), textElement('li', 'b')],
            ChildFlags.HasNonKeyedChildren,
          ),
          container,
        );
        expect(container.innerHTML).toBe('<ul><li>a</li><li>b</li></ul>');
      });
    });

    describe('normalized children', () => {
      it('Should hydrate the same single child in two places', () => {
        container.innerHTML = '<div><p><b>x</b></p><p><b>x</b></p></div>';

        const shared = <b>x</b>;
        const [first, second] = container.querySelectorAll('b');

        hydrate(
          <div>
            <p>{shared}</p>
            <p>{shared}</p>
          </div>,
          container,
        );

        const [hydratedFirst, hydratedSecond] = container.querySelectorAll('b');

        expect(hydratedFirst).toBe(first);
        expect(hydratedSecond).toBe(second);

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

      it('Should hydrate the same array in two places', () => {
        container.innerHTML =
          '<div><ul><li>a</li><li>b</li></ul><ol><li>a</li><li>b</li></ol></div>';

        const items = [<li>a</li>, <li>b</li>];

        hydrate(
          <div>
            <ul>{items}</ul>
            <ol>{items}</ol>
          </div>,
          container,
        );

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

        render(
          <div>
            <ul>{[<li>c</li>]}</ul>
            <ol>{[<li>d</li>, <li>e</li>]}</ol>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe(
          '<div><ul><li>c</li></ul><ol><li>d</li><li>e</li></ol></div>',
        );
      });

      it('Should hydrate a Fragment child that is already rendered into another container', () => {
        const container2 = document.createElement('div');
        const shared = createTextVNode('x');

        render(<p>{shared}</p>, container2);

        container.innerHTML = '<div>x</div>';
        hydrate(
          <div>
            <Fragment>{shared}</Fragment>
          </div>,
          container,
        );

        render(<p>{createTextVNode('a')}</p>, container2);

        expect(container2.innerHTML).toBe('<p>a</p>');
        expect(container.innerHTML).toBe('<div>x</div>');

        render(null, container2);
      });
    });

    describe('Fragment with one child', () => {
      it('Should hydrate element child of Fragment', () => {
        container.innerHTML = '<div><b>x</b></div>';

        const b = container.querySelector('b');

        hydrate(
          <div>
            <Fragment>{<b>x</b>}</Fragment>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe('<div><b>x</b></div>');
        expect(container.querySelector('b')).toBe(b);

        render(
          <div>
            <Fragment>{<b>y</b>}</Fragment>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe('<div><b>y</b></div>');
        expect(container.querySelector('b')).toBe(b);
      });

      it('Should patch text child of Fragment after hydration', () => {
        container.innerHTML = '<div>x<br>y</div>';

        hydrate(
          <div>
            <Fragment>{createTextVNode('x')}</Fragment>
            <br />
            <Fragment>{createTextVNode('y')}</Fragment>
          </div>,
          container,
        );
        render(
          <div>
            <Fragment>{createTextVNode('a')}</Fragment>
            <br />
            <Fragment>{createTextVNode('b')}</Fragment>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe('<div>a<br>b</div>');
      });

      it('Should hydrate component child of Fragment', () => {
        container.innerHTML = '<div><b>x</b></div>';

        function Child({ text }) {
          return <b>{text}</b>;
        }

        hydrate(
          <div>
            <Fragment>{<Child text="x" />}</Fragment>
          </div>,
          container,
        );
        render(
          <div>
            <Fragment>{<Child text="y" />}</Fragment>
          </div>,
          container,
        );
        expect(container.innerHTML).toBe('<div><b>y</b></div>');
      });
    });

    describe('root', () => {
      it('Should hydrate a vNode that is already rendered into another container', () => {
        const container2 = document.createElement('div');
        const shared = <span>x</span>;

        render(shared, container2);

        container.innerHTML = '<span>x</span>';
        hydrate(shared, container);

        render(<span>a</span>, container2);
        render(<span>b</span>, container);

        expect(container2.innerHTML).toBe('<span>a</span>');
        expect(container.innerHTML).toBe('<span>b</span>');

        render(null, container2);
      });
    });
  });

  it('Should keep hydrated DOM nodes when rendering the same vtree and then an equal new vtree, Github #1426', () => {
    container.innerHTML = '<div><span>do not replace me</span></div>';

    const span = container.firstChild.firstChild;

    const vtree = h('div', [h('span', 'do not replace me')]);

    hydrate(vtree, container);

    expect(span).toBe(container.firstChild.firstChild);

    render(vtree, container);

    expect(span).toBe(container.firstChild.firstChild);

    const vtree2 = h('div', [h('span', 'do not replace me')]);

    render(vtree2, container);

    expect(span).toBe(container.firstChild.firstChild);
  });
});
