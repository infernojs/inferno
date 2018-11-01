import { render, Component, createFragment, Fragment, createPortal, rerender } from 'inferno';
import { createElement } from 'inferno-create-element';
import { innerHTML } from 'inferno-utils';
import { ChildFlags } from 'inferno-vnode-flags';

describe('CreateElement (non-JSX)', () => {
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

  describe('Fragments', () => {
    it('Should render and unmount fragment', () => {
      let Example = class Example extends Component {
        render() {
          return createFragment([createElement('div', null, 'First'), createElement('div', null, 'second')], ChildFlags.HasNonKeyedChildren);
        }
      };

      render(createElement(Example, null), container);

      expect(container.innerHTML).toBe('<div>First</div><div>second</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should render nested fragment', () => {
      let Example = class Example extends Component {
        render() {
          return createFragment(
            [
              createElement('div', null, 'First'),
              createFragment([createElement('div', null, 'Sub1'), createElement('div', null, 'Sub2')], ChildFlags.HasNonKeyedChildren),
              createElement('div', null, 'second')
            ],
            ChildFlags.HasNonKeyedChildren
          );
        }
      };

      render(createElement(Example, null), container);

      expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be to replace component with fragment with another component', () => {
      let Example = class Example extends Component {
        render() {
          return createFragment(
            [
              createElement('div', null, 'First'),
              createFragment([createElement('div', null, 'Sub1'), createElement('div', null, 'Sub2')], ChildFlags.HasNonKeyedChildren),
              createElement('div', null, 'second')
            ],
            ChildFlags.HasNonKeyedChildren
          );
        }
      };

      function FunctionalComp() {
        return createFragment([createElement('div', null, 'Functional')], ChildFlags.HasNonKeyedChildren);
      }

      render(createElement(Example, null), container);

      expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

      render(createElement(FunctionalComp, null), container);

      expect(container.innerHTML).toBe('<div>Functional</div>');

      render(createElement(Example, null), container);

      expect(container.innerHTML).toBe('<div>First</div><div>Sub1</div><div>Sub2</div><div>second</div>');

      render(createElement(FunctionalComp, null), container);
      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to move fragments', () => {
      const fragmentA = () => createFragment([createElement('div', { id: 'a1' }, 'A1'), createElement('div', null, 'A2')], ChildFlags.HasNonKeyedChildren, 'A');

      const fragmentB = () => createFragment([createElement('div', { id: 'b1' }, 'B1')], ChildFlags.HasNonKeyedChildren, 'B');

      const fragmentC = () =>
        createFragment(
          [createElement('div', { id: 'c1' }, 'C1'), createElement('div', null, 'C2'), createElement('div', null, 'C3')],
          ChildFlags.HasNonKeyedChildren,
          'C'
        );

      render(createElement('div', null, fragmentA(), fragmentB(), fragmentC()), container);

      expect(container.innerHTML).toBe('<div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>');

      let A1 = container.querySelector('#a1');
      let B1 = container.querySelector('#b1');
      let C1 = container.querySelector('#c1');

      // Switch order
      render(createElement('div', null, fragmentC(), fragmentA(), fragmentB()), container);

      // Verify dom has changed and nodes are the same
      expect(container.innerHTML).toBe('<div><div id="c1">C1</div><div>C2</div><div>C3</div><div id="a1">A1</div><div>A2</div><div id="b1">B1</div></div>');

      expect(container.querySelector('#a1')).toBe(A1);
      expect(container.querySelector('#b1')).toBe(B1);
      expect(container.querySelector('#c1')).toBe(C1);

      // Switch order again
      render(createElement('div', null, fragmentB(), fragmentC()), container);

      // Verify dom has changed and nodes are the same
      expect(container.innerHTML).toBe('<div><div id="b1">B1</div><div id="c1">C1</div><div>C2</div><div>C3</div></div>');

      expect(container.querySelector('#a1')).toBe(null);
      expect(container.querySelector('#b1')).toBe(B1);
      expect(container.querySelector('#c1')).toBe(C1);
    });

    it('Should clone fragment children if they are passed as reference', () => {
      const fragmentA = createFragment([createElement('div', { id: 'a1' }, 'A1'), createElement('div', null, 'A2')], ChildFlags.HasNonKeyedChildren, 'A');
      const fragmentB = createFragment([createElement('div', { id: 'b1' }, 'B1')], ChildFlags.HasNonKeyedChildren, 'B');
      const fragmentC = createFragment(
        [createElement('div', { id: 'c1' }, 'C1'), createElement('div', null, 'C2'), createElement('div', null, 'C3')],
        ChildFlags.HasNonKeyedChildren,
        'C'
      );

      const content = [fragmentC];

      function SFC() {
        return createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2'));
      }

      render(createElement(Fragment, null, fragmentA, createElement(SFC, { key: 'sfc' }), fragmentB, fragmentC), container);

      const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
      const FragmentBHtml = '<div id="b1">B1</div>';
      const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
      const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

      expect(container.innerHTML).toBe(FragmentAHtml + SFCHtml + FragmentBHtml + FragmentCHtml);

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to move component with fragment root', () => {
      const fragmentA = createFragment([createElement('div', { id: 'a1' }, 'A1'), createElement('div', null, 'A2')], ChildFlags.HasNonKeyedChildren, 'A');
      const fragmentB = createFragment([createElement('div', { id: 'b1' }, 'B1')], ChildFlags.HasNonKeyedChildren, 'B');
      const fragmentC = createFragment(
        [createElement('div', { id: 'c1' }, 'C1'), createElement('div', null, 'C2'), createElement('div', null, 'C3')],
        ChildFlags.HasNonKeyedChildren,
        'C'
      );

      const content = [fragmentC];

      function SFC() {
        return createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2'));
      }

      render(createElement(Fragment, null, fragmentA, createElement(SFC, { key: 'sfc' }), fragmentB, fragmentC), container);

      const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
      const FragmentBHtml = '<div id="b1">B1</div>';
      const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
      const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

      expect(container.innerHTML).toBe(FragmentAHtml + SFCHtml + FragmentBHtml + FragmentCHtml);

      // Switch order
      render(createElement(Fragment, null, fragmentA, fragmentC, createElement(SFC, { key: 'sfc' })), container);

      expect(container.innerHTML).toBe(FragmentAHtml + FragmentCHtml + SFCHtml);

      // Switch order again
      render(
        createElement(
          Fragment,
          null,
          createElement('div', { key: '1' }, '1'),
          createElement(SFC, { key: 'sfc' }),
          fragmentA,
          fragmentC,
          createElement('div', { key: '1' }, '2')
        ),
        container
      );

      // Verify dom has changed and nodes are the same
      expect(container.innerHTML).toBe('<div>1</div>' + SFCHtml + FragmentAHtml + FragmentCHtml + '<div>2</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to move component with fragment root #2', () => {
      const fragmentA = createFragment([createElement('div', { id: 'a1' }, 'A1'), createElement('div', null, 'A2')], ChildFlags.HasNonKeyedChildren, 'A');
      const fragmentB = createFragment([createElement('div', { id: 'b1' }, 'B1')], ChildFlags.HasNonKeyedChildren, 'B');
      const fragmentC = createFragment(
        [createElement('div', { id: 'c1' }, 'C1'), createElement('div', null, 'C2'), createElement('div', null, 'C3')],
        ChildFlags.HasNonKeyedChildren,
        'C'
      );

      const content = [fragmentC];

      function SFC() {
        return createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2'));
      }

      render(
        createElement(
          Fragment,
          null,
          fragmentA,
          createElement(SFC, { key: 'sfc1' }),
          fragmentB,
          createElement(SFC, { key: 'sfc2' }),
          fragmentC,
          createElement(SFC, { key: 'sfc3' })
        ),
        container
      );

      const FragmentAHtml = '<div id="a1">A1</div><div>A2</div>';
      const FragmentBHtml = '<div id="b1">B1</div>';
      const FragmentCHtml = '<div id="c1">C1</div><div>C2</div><div>C3</div>';
      const SFCHtml = '<span>1</span>' + FragmentCHtml + '<span>2</span>';

      expect(container.innerHTML).toBe(FragmentAHtml + SFCHtml + FragmentBHtml + SFCHtml + FragmentCHtml + SFCHtml);

      // Switch order
      render(
        createElement(
          Fragment,
          null,
          createElement(SFC, { key: 'sfc3' }),
          fragmentA,
          createElement(SFC, { key: 'sfc1' }),
          fragmentC,
          createElement(SFC, { key: 'sfc2' })
        ),
        container
      );

      expect(container.innerHTML).toBe(SFCHtml + FragmentAHtml + SFCHtml + FragmentCHtml + SFCHtml);

      // Switch order again
      render(
        createElement(
          Fragment,
          null,
          createElement('div', { key: '1' }, '1'),
          createElement(SFC, { key: 'sfc1' }),
          createElement(SFC, { key: 'sfc2' }),
          fragmentA,
          fragmentC,
          createElement('div', { key: '1' }, '2'),
          createElement(SFC, { key: 'sfc3' })
        ),
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
          return createElement(
            Fragment,
            null,
            createElement('div', null, first),
            createElement(
              Fragment,
              null,
              'More',
              null,
              'Hey!',
              createElement(Fragment, null, createElement(Fragment, null, 'Large ', last), createElement(Fragment, null, 'And Small')),
              createElement(Fragment, null, 'Nesting'),
              mid
            ),
            createElement('span', null, 'bar'),
            null
          );
        }
        return createElement(
          Fragment,
          null,
          createElement('div', null, first),
          'Hey!',
          createElement(
            Fragment,
            null,
            'More',
            createElement(Fragment, null, 'Nesting'),
            mid,
            createElement(Fragment, null, createElement(Fragment, null, 'Large ', last), createElement(Fragment, null, 'And Small'))
          ),
          createElement('span', null, 'bar')
        );
      }

      let mountCounter = 0;
      let unmountCounter = 0;

      let FoobarCom = class FoobarCom extends Component {
        componentWillMount() {
          mountCounter++;
        }

        componentWillUnmount() {
          unmountCounter++;
        }

        render(props) {
          return createElement(
            Fragment,
            null,
            props.children,
            createPortal(createElement('div', null, 'InvisiblePortalCreator'), props.node),
            null,
            'Try out some crazy stuff'
          );
        }
      };

      const portalNode = document.createElement('div');

      render(
        createElement(
          FoobarCom,
          { node: portalNode },
          createElement(Fragmenter, {
            first: 'first',
            mid: 'MID',
            last: createElement('div', null, 'Why?')
          })
        ),
        container
      );

      expect(container.innerHTML).toBe('<div>first</div>Hey!MoreNestingMIDLarge <div>Why?</div>And Small<span>bar</span>Try out some crazy stuff');
      expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');

      render(
        createElement(
          FoobarCom,
          { node: portalNode },
          createElement(Fragmenter, {
            first: createElement('span', null, 'GoGo'),
            mid: 'MID',
            last: createElement('div', null, 'Why?'),
            changeOrder: true
          })
        ),
        container
      );

      expect(container.innerHTML).toBe('<div><span>GoGo</span></div>MoreHey!Large <div>Why?</div>And SmallNestingMID<span>bar</span>Try out some crazy stuff');
      expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');

      render(
        createElement(
          FoobarCom,
          { node: portalNode },
          createElement(Fragmenter, {
            first: 'first',
            mid: 'MID',
            last: createElement('div', null, 'Why?')
          })
        ),
        container
      );

      expect(container.innerHTML).toBe('<div>first</div>Hey!MoreNestingMIDLarge <div>Why?</div>And Small<span>bar</span>Try out some crazy stuff');
      expect(portalNode.innerHTML).toBe('<div>InvisiblePortalCreator</div>');
    });

    it('Should render deeply nested fragment', () => {
      function Fragmenter2() {
        return createElement(
          Fragment,
          null,
          createElement(
            Fragment,
            null,
            createElement(
              Fragment,
              null,
              createElement(
                Fragment,
                null,
                createElement(Fragment, null, createElement(Fragment, null, createElement(Fragment, null, createElement(Fragment, null, 'Okay!'))))
              )
            )
          )
        );
      }

      render(createElement(Fragmenter2, null), container);

      expect(container.innerHTML).toBe('Okay!');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should append DOM nodes to correct position when component root Fragmnet change', () => {
      let TestRoot = class TestRoot extends Component {
        render() {
          return createElement(Fragment, null, this.props.children);
        }
      };

      render(
        createElement(
          'div',
          null,
          createElement(TestRoot, null, createElement('div', null, '1'), createElement('div', null, '2')),
          createElement(TestRoot, null, createElement('span', null, 'Ok'), createElement('span', null, 'Test'))
        ),
        container
      );

      expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><span>Ok</span><span>Test</span></div>');

      render(
        createElement(
          'div',
          null,
          createElement(
            TestRoot,
            null,
            createElement('div', null, '1'),
            createElement('div', null, '2'),
            createElement('div', null, '3'),
            createElement('div', null, '4')
          ),
          createElement(TestRoot, null, createElement('div', null, 'Other'))
        ),
        container
      );
      expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div><div>Other</div></div>');
    });

    it('Should not clear whole parent element when fragment children are cleared', () => {
      let TestRoot = class TestRoot extends Component {
        render() {
          return createElement(Fragment, null, this.props.children);
        }
      };

      render(
        createElement(
          'div',
          null,
          createElement(TestRoot, null, createElement('div', null, '1'), createElement('div', null, '2')),
          createElement(TestRoot, null, createElement('span', null, 'Ok'), createElement('span', null, 'Test'))
        ),
        container
      );

      expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><span>Ok</span><span>Test</span></div>');

      render(
        createElement(
          'div',
          null,
          createElement(
            TestRoot,
            null,
            createElement('div', null, '1'),
            createElement('div', null, '2'),
            createElement('div', null, '3'),
            createElement('div', null, '4')
          ),
          createElement(TestRoot, null)
        ),
        container
      );
      expect(container.innerHTML).toBe('<div><div>1</div><div>2</div><div>3</div><div>4</div></div>');
    });

    it('Should move fragment and all its contents when using Fragment long syntax with keys', () => {
      let unmountCounter = 0;
      let mountCounter = 0;

      let TestLifecycle = class TestLifecycle extends Component {
        componentWillUnmount() {
          unmountCounter++;
        }

        componentWillMount() {
          mountCounter++;
        }

        render() {
          return createElement(Fragment, null, this.props.children);
        }
      };

      render(
        createElement(
          'div',
          null,
          createElement(Fragment, { key: '1' }, createElement(TestLifecycle, null, '1a'), createElement(TestLifecycle, null, '1b')),
          createElement(Fragment, { key: '2' }, createElement(TestLifecycle, null, '2a'), createElement(TestLifecycle, null, '2b'))
        ),
        container
      );

      expect(container.innerHTML).toBe('<div>1a1b2a2b</div>');
      expect(unmountCounter).toBe(0);
      expect(mountCounter).toBe(4);

      render(
        createElement(
          'div',
          null,
          createElement(
            Fragment,
            { key: '2' },
            createElement(TestLifecycle, null, '2a'),
            createElement(TestLifecycle, null, '2b'),
            createElement(TestLifecycle, null, '2c')
          ),
          createElement(Fragment, { key: '1' }, createElement(TestLifecycle, null, '1a'), createElement(TestLifecycle, null, '1b'))
        ),
        container
      );

      expect(container.innerHTML).toBe('<div>2a2b2c1a1b</div>');
      expect(unmountCounter).toBe(0);
      expect(mountCounter).toBe(5);

      render(
        createElement(
          'div',
          null,
          createElement(
            Fragment,
            { key: '3' },
            createElement(TestLifecycle, null, '3a'),
            createElement(TestLifecycle, null, '3b'),
            createElement(TestLifecycle, null, '3c')
          ),
          createElement(Fragment, { key: '2' }, createElement(TestLifecycle, null, '2a'), createElement(TestLifecycle, null, '2Patched'))
        ),
        container
      );

      expect(container.innerHTML).toBe('<div>3a3b3c2a2Patched</div>');
      expect(unmountCounter).toBe(3);
      expect(mountCounter).toBe(8);
    });

    it('Should unmount empty fragments', () => {
      render(createElement(Fragment, null, createElement(Fragment, null)), container);

      expect(container.innerHTML).toBe('');

      render(createElement(Fragment, null, createElement('div', null)), container);

      expect(container.innerHTML).toBe('<div></div>');

      render(createElement(Fragment, null, createElement(Fragment, null)), container);

      expect(container.innerHTML).toBe('');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to replace last element in fragment', () => {
      render(
        createElement(
          Fragment,
          null,
          createElement(Fragment, null, createElement('span', null, '1a'), createElement('span', null, '1b'), createElement('div', null, '1c')),
          createElement(Fragment, null, createElement('span', null, '2a'), createElement('span', null, '2b'), createElement('span', null, '2c')),
          createElement(Fragment, null)
        ),
        container
      );

      expect(container.innerHTML).toBe('<span>1a</span><span>1b</span><div>1c</div><span>2a</span><span>2b</span><span>2c</span>');

      render(
        createElement(
          Fragment,
          null,
          createElement(Fragment, null, createElement('span', null, '1a'), createElement('span', null, '1c')),
          createElement(Fragment, null, createElement('span', null, '2a'), createElement('span', null, '2b'), createElement('span', null, '2c')),
          createElement(Fragment, null)
        ),
        container
      );

      expect(container.innerHTML).toBe('<span>1a</span><span>1c</span><span>2a</span><span>2b</span><span>2c</span>');

      render(createElement(Fragment, null, createElement(Fragment, null)), container);

      expect(container.innerHTML).toBe('');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should mount Fragment with invalid children', () => {
      render(createElement(Fragment, null, null, undefined), container);

      expect(container.innerHTML).toBe('');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should mount Fragment with invalid children #2', () => {
      function Foobar() {
        return null;
      }

      render(createElement(Fragment, null, null, createElement(Foobar, null), undefined), container);

      expect(container.innerHTML).toBe('');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should mount Fragment with invalid children #2', () => {
      let add = false;

      function Foobar() {
        if (add) {
          return createElement('div', null, 'Ok');
        }
        return null;
      }

      render(createElement(Fragment, null, null, createElement(Foobar, null), undefined), container);

      expect(container.innerHTML).toBe('');

      add = true;

      render(createElement(Fragment, null, null, createElement(Foobar, null), undefined), container);

      expect(container.innerHTML).toBe('<div>Ok</div>');
    });

    it('Should be possible to update from 0 to 1', () => {
      function Foobar() {
        return createElement('div', null, 'Ok');
      }

      let content = [null];

      render(
        createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2')),
        container
      );

      expect(container.innerHTML).toBe('<span>1</span><span>2</span>');

      content = [createElement(Foobar, null)];

      render(
        createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2')),
        container
      );

      expect(container.innerHTML).toBe('<span>1</span><div>Ok</div><span>2</span>');
    });

    it('Should be possible to update from 0 to 1 fragment -> fragment', () => {
      function Foobar() {
        return createElement('div', null, 'Ok');
      }

      let content = [];

      render(
        createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2')),
        container
      );

      expect(container.innerHTML).toBe('<span>1</span><span>2</span>');

      content = [createElement(Fragment, null, createElement(Foobar, null))];

      render(
        createElement(Fragment, null, createElement('span', null, '1'), createElement(Fragment, null, content), createElement('span', null, '2')),
        container
      );

      expect(container.innerHTML).toBe('<span>1</span><div>Ok</div><span>2</span>');
    });

    it('Should be possible to mount and patch single component fragment children', () => {
      let counter = 0;

      let Foobar = class Foobar extends Component {
        componentWillMount() {
          counter++;
        }

        render() {
          return null;
        }
      };

      render(createElement(Fragment, null), container);

      render(createElement(Fragment, null, createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('');
      expect(counter).toBe(1);

      render(createElement(Fragment, null, createElement('div', null, 'Ok'), createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('<div>Ok</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to mount and patch single component fragment children - variation 2', () => {
      let counter = 0;

      let Foobar = class Foobar extends Component {
        componentWillMount() {
          counter++;
        }

        render() {
          return null;
        }
      };

      let nodes = [];

      render(createElement(Fragment, null, nodes), container);

      nodes = [createElement(Foobar, null)];

      render(createElement(Fragment, null, nodes), container);

      nodes = [createElement(Foobar, null), createElement(Foobar, null), createElement(Foobar, null)];

      render(createElement(Fragment, null, nodes), container);

      nodes = [];

      render(createElement(Fragment, null, nodes), container);

      expect(container.innerHTML).toBe('');
      expect(counter).toBe(3);

      render(createElement(Fragment, null, createElement('div', null, 'Ok'), createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('<div>Ok</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to patch single fragment child component', () => {
      let counter = 0;

      let Foobar = class Foobar extends Component {
        componentWillMount() {
          counter++;
        }

        render() {
          return null;
        }
      };

      render(
        createElement(Fragment, null, createElement(Fragment, null, createElement(Foobar, null)), createElement(Fragment, null, createElement(Foobar, null))),
        container
      );

      expect(container.innerHTML).toBe('');
      expect(counter).toBe(2);

      render(
        createElement(
          Fragment,
          null,
          createElement(Fragment, null),
          createElement(Fragment, null, createElement(Foobar, null)),
          createElement(Fragment, null, createElement(Foobar, null)),
          createElement(Fragment, null),
          createElement(Foobar, null)
        ),
        container
      );

      expect(container.innerHTML).toBe('');
      expect(counter).toBe(4);

      render(createElement(Fragment, null, createElement('div', null, 'Ok'), createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('<div>Ok</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to mount and patch single component fragment children', () => {
      let Foobar = class Foobar extends Component {
        render() {
          return null;
        }
      };

      render(createElement(Fragment, null, createElement(Foobar, null)), container);

      render(createElement(Fragment, null, createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('');

      render(createElement(Fragment, null, createElement('div', null, 'Ok'), createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('<div>Ok</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should be possible to mount and patch single component fragment children #2', () => {
      let Foobar = class Foobar extends Component {
        render() {
          return null;
        }
      };

      render(createElement(Fragment, null, null), container);

      render(createElement(Fragment, null, createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('');

      render(createElement(Fragment, null, createElement('div', null, 'Ok'), createElement(Foobar, null)), container);

      expect(container.innerHTML).toBe('<div>Ok</div>');

      render(null, container);

      expect(container.innerHTML).toBe('');
    });

    it('Should mount fragment children to correct position Github #1412', () => {
      const f = (...xs) => createFragment(xs, 0);

      class Articles extends Component {
        constructor() {
          super();
          this.state = { articles: ['id2', 'id3'], sections: ['id0', 'id1'] };
        }

        componentDidMount() {
          expect(container.innerHTML).toEqual(
            '<h1>App</h1><section><h2>id0</h2><aside>Today</aside><article>id2</article><article>id3</article></section><section><h2>id1</h2><aside>Today</aside><article>id2</article><article>id3</article></section><footer>2018</footer>'
          );

          this.setState({ sections: [] });

          rerender();

          expect(container.innerHTML).toEqual('<h1>App</h1><footer>2018</footer>');

          this.setState({ articles: ['id2', 'id3'], sections: ['id0', 'id1'] });

          rerender();

          expect(container.innerHTML).toEqual(
            '<h1>App</h1><section><h2>id0</h2><aside>Today</aside><article>id2</article><article>id3</article></section><section><h2>id1</h2><aside>Today</aside><article>id2</article><article>id3</article></section><footer>2018</footer>'
          );
        }

        render() {
          return f(
            this.state.sections.map(section =>
              createElement('section', null, [
                createElement('h2', null, section),
                this.state.articles.map(article => f(article === 'id2' && createElement('aside', null, 'Today'), createElement('article', null, article)))
              ])
            )
          );
        }
      }

      class App extends Component {
        render() {
          return f(createElement('h1', null, 'App'), createElement(Articles), createElement('footer', null, '2018'));
        }
      }

      render(createElement(App), container);

      rerender();
    });

    it('Should re-mount fragment children to correct position when edge is component', () => {
      const f = (...xs) => createFragment(xs, 0);

      class Articles extends Component {
        constructor() {
          super();
          this.state = { articles: ['id2', 'id3'], sections: ['id0', 'id1'] };
        }

        componentDidMount() {
          expect(container.innerHTML).toEqual(
            '<h1>App</h1><section><h2>id0</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><section><h2>id1</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><footer>2018</footer><div>1</div><div>2</div>'
          );

          this.setState({ sections: [] });

          rerender();

          expect(container.innerHTML).toEqual('<h1>App</h1><footer>2018</footer><div>1</div><div>2</div>');

          this.setState({ articles: ['id2', 'id3'], sections: ['id0', 'id1'] });

          rerender();

          expect(container.innerHTML).toEqual(
            '<h1>App</h1><section><h2>id0</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><section><h2>id1</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><footer>2018</footer><div>1</div><div>2</div>'
          );
        }

        render() {
          return f(
            this.state.sections.map(section =>
              createElement(Section, {
                children: [
                  createElement('h2', null, section),
                  this.state.articles.map(article => f(article === 'id2' && createElement('aside', null, 'Today'), createElement('article', null, article)))
                ]
              })
            )
          );
        }
      }

      function Section(props) {
        return f(createElement('section', null, props.children), createElement('div', null, 'end'));
      }

      function EdgeComponent() {
        return f(createElement('footer', null, '2018'), createElement('div', null, '1'), createElement('div', null, '2'));
      }

      class App extends Component {
        render() {
          return f(createElement('h1', null, 'App'), createElement(Articles), createElement(EdgeComponent));
        }
      }

      render(createElement(App), container);

      rerender();
    });

    it('Should append more fragment children to correct position when edge is component', () => {
      const f = (...xs) => createFragment(xs, 0);

      class Articles extends Component {
        constructor() {
          super();
          this.state = { articles: ['id2', 'id3'], sections: ['id0', 'id1'] };
        }

        componentDidMount() {
          expect(container.innerHTML).toEqual(
            '<h1>App</h1><section><h2>id0</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><section><h2>id1</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><footer>2018</footer><div>1</div><div>2</div>'
          );

          this.setState({ articles: [], sections: ['id0'] });

          rerender();

          expect(container.innerHTML).toEqual('<h1>App</h1><section><h2>id0</h2></section><div>end</div><footer>2018</footer><div>1</div><div>2</div>');

          this.setState({ articles: ['id2', 'id3'], sections: ['id0', 'id1'] });

          rerender();

          expect(container.innerHTML).toEqual(
            '<h1>App</h1><section><h2>id0</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><section><h2>id1</h2><aside>Today</aside><article>id2</article><article>id3</article></section><div>end</div><footer>2018</footer><div>1</div><div>2</div>'
          );
        }

        render() {
          return f(
            this.state.sections.map(section =>
              createElement(Section, {
                children: [
                  createElement('h2', null, section),
                  this.state.articles.map(article => f(article === 'id2' && createElement('aside', null, 'Today'), createElement('article', null, article)))
                ]
              })
            )
          );
        }
      }

      function Section(props) {
        return f(createElement('section', null, props.children), createElement('div', null, 'end'));
      }

      function EdgeComponent() {
        return f(createElement('footer', null, '2018'), createElement('div', null, '1'), createElement('div', null, '2'));
      }

      class App extends Component {
        render() {
          return f(createElement('h1', null, 'App'), createElement(Articles), createElement(EdgeComponent));
        }
      }

      render(createElement(App), container);

      rerender();
    });
  });
});
