import { Component, Fragment, render } from 'inferno';

describe('All single patch variations', () => {
  let templateRefSpy;
  let container;
  let mountSpy;
  let updateSpy;
  let unmountSpy;

  beforeEach(function () {
    mountSpy = spyOn(ComA.prototype, 'componentWillMount');
    updateSpy = spyOn(ComA.prototype, 'componentWillUpdate');
    unmountSpy = spyOn(ComA.prototype, 'componentWillUnmount');
    templateRefSpy = jasmine.createSpy('spy');
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  function rTemplate(content) {
    return render(<div>{[content]}</div>, container);
  }

  function tearDown() {
    render(null, container);
    expect(container.innerHTML).toBe('');
  }

  /* tslint:disable:no-empty */
  class ComA extends Component<any, any> {
    public componentDidMount() {}

    public componentWillMount() {}

    public componentWillReceiveProps(_nextProps, _nextContext) {}

    public shouldComponentUpdate(_nextProps, _nextState, _nextContext) {
      return true;
    }

    public componentWillUpdate(_nextProps, _nextState, _nextContext) {}

    public componentDidUpdate(_prevProps, _prevState, _prevContext) {}

    public componentWillUnmount() {}

    public render({ children }) {
      return children;
    }
  }
  /* tslint:enable */

  describe('Text to', () => {
    let node;

    beforeEach(() => {
      rTemplate('text');
      expect(container.innerHTML).toEqual('<div>text</div>');
      node = container.firstChild.firstChild;
    });

    it('text', () => {
      rTemplate('more text');
      expect(container.innerHTML).toEqual('<div>more text</div>');

      expect(container.firstChild.firstChild).toBe(node);

      rTemplate('more text2');
      expect(container.innerHTML).toEqual('<div>more text2</div>');

      expect(container.firstChild.firstChild).toBe(node);
      tearDown();
    });

    it('invalid', () => {
      rTemplate(false);
      expect(container.innerHTML).toEqual('<div></div>');

      expect(container.firstChild.firstChild).toBe(null);

      rTemplate(null);
      expect(container.innerHTML).toEqual('<div></div>');

      expect(container.firstChild.firstChild).toBe(null);
      tearDown();
    });

    it('vNode (elem)', () => {
      const spy = jasmine.createSpy('spy');

      rTemplate(<span ref={spy}>1</span>);
      expect(container.innerHTML).toEqual('<div><span>1</span></div>');

      expect(spy.calls.count()).toBe(1);

      rTemplate(<span ref={spy}>2</span>);
      expect(container.innerHTML).toEqual('<div><span>2</span></div>');

      expect(spy.calls.count()).toBe(1);
      tearDown();
    });

    it('vNode (com)', () => {
      const spy = jasmine.createSpy('spy');

      rTemplate(<ComA ref={spy}>1</ComA>);
      expect(container.innerHTML).toEqual('<div>1</div>');
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(0);
      expect(unmountSpy.calls.count()).toBe(0);
      expect(spy.calls.count()).toBe(1);

      rTemplate(<ComA ref={spy}>2</ComA>);
      expect(container.innerHTML).toEqual('<div>2</div>');
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(1);
      expect(unmountSpy.calls.count()).toBe(0);
      expect(spy.calls.count()).toBe(1);

      tearDown();
    });

    it('Array', () => {
      const spy = jasmine.createSpy('spy');

      rTemplate([<ComA ref={spy}>1</ComA>, 'foo']);
      expect(container.innerHTML).toEqual('<div>1foo</div>');
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(0);
      expect(unmountSpy.calls.count()).toBe(0);
      expect(spy.calls.count()).toBe(1);

      rTemplate([<ComA ref={spy}>2</ComA>, null]);
      expect(container.innerHTML).toEqual('<div>2</div>');
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(1);
      expect(unmountSpy.calls.count()).toBe(0);
      expect(spy.calls.count()).toBe(1);

      tearDown();
    });
  });

  describe('Component to', () => {
    beforeEach(() => {
      rTemplate(<ComA ref={templateRefSpy}>first</ComA>);
      expect(templateRefSpy.calls.count()).toBe(1);
      templateRefSpy.calls.reset();
      expect(container.innerHTML).toEqual('<div>first</div>');
      expect(unmountSpy.calls.count()).toBe(0);
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(0);
    });

    it('text', () => {
      rTemplate('more text');
      expect(container.innerHTML).toEqual('<div>more text</div>');
      expect(unmountSpy.calls.count()).toBe(1);
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(0);

      rTemplate('more text2');
      expect(container.innerHTML).toEqual('<div>more text2</div>');
      tearDown();
    });

    it('invalid', () => {
      rTemplate(false);
      expect(container.innerHTML).toEqual('<div></div>');
      expect(unmountSpy.calls.count()).toBe(1);
      expect(mountSpy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(0);

      expect(container.firstChild.firstChild).toBe(null);

      rTemplate(null);
      expect(container.innerHTML).toEqual('<div></div>');

      expect(container.firstChild.firstChild).toBe(null);
      tearDown();
    });

    it('vNode (elem)', () => {
      const spy = jasmine.createSpy('spy');
      expect(templateRefSpy.calls.count()).toBe(0);

      rTemplate(
        <div ref={spy} className="component2">
          Component 2 <br />
          <span id="clear">clear app</span>
        </div>
      );
      expect(templateRefSpy.calls.count()).toBe(1); // unmount
      expect(unmountSpy.calls.count()).toBe(1);
      expect(spy.calls.count()).toBe(1);
      expect(updateSpy.calls.count()).toBe(0);
      expect(container.innerHTML).toEqual('<div><div class="component2">Component 2 <br><span id="clear">clear app</span></div></div>');

      rTemplate(<span ref={spy}>2</span>);
      expect(container.innerHTML).toEqual('<div><span>2</span></div>');

      expect(spy.calls.count()).toBe(3); // mount, unmount, mount
      tearDown();
    });

    it('vNode (Com different)', () => {
      const componentWillMountSpy = jasmine.createSpy();

      class ComC extends Component<any, any> {
        // tslint:disable-next-line
        componentWillMount() {
          componentWillMountSpy();
        }

        public render({ children }) {
          return children;
        }
      }

      rTemplate(<ComC>second</ComC>);

      expect(componentWillMountSpy).toHaveBeenCalledTimes(1);

      tearDown();
    });
  });

  describe('children', () => {
    describe('HasKeyedChildren', () => {
      it('Should update from Array to single vNode', () => {
        render(<div $HasKeyedChildren>{[<div key="1">1</div>, <div key="2">2</div>]}</div>, container);

        expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div></div>');

        render(
          <div>
            <div>single</div>
          </div>,
          container
        );

        expect(container.innerHTML).toEqual('<div><div>single</div></div>');

        // Revert
        render(<div $HasKeyedChildren>{[<div key="1">1</div>, <div key="2">2</div>]}</div>, container);

        expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div></div>');
      });
    });

    describe('hasNonKeyedChildren', () => {
      it('Should update from Array to single vNode', () => {
        render(<div $HasNonKeyedChildren>{[<div>1</div>, <div>2</div>]}</div>, container);

        expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div></div>');

        render(
          <div>
            <div>single</div>
          </div>,
          container
        );

        expect(container.innerHTML).toEqual('<div><div>single</div></div>');

        // Revert
        render(<div $HasNonKeyedChildren>{[<div>1</div>, <div>2</div>]}</div>, container);

        expect(container.innerHTML).toEqual('<div><div>1</div><div>2</div></div>');
      });
    });
  });

  describe('defaultHooks', () => {
    it('Should never update if defaultProps refs SCU returns false', () => {
      let counter = 0;

      const Static = function () {
        return <div>{counter}</div>;
      };

      Static.defaultHooks = {
        onComponentShouldUpdate() {
          return false;
        }
      };

      function doRender() {
        render(
          <div>
            {counter}
            <Static />
          </div>,
          container
        );
      }

      doRender();
      expect(container.innerHTML).toEqual('<div>0<div>0</div></div>');
      counter++;
      doRender();
      expect(container.innerHTML).toEqual('<div>1<div>0</div></div>');
      counter++;
      doRender();
      expect(container.innerHTML).toEqual('<div>2<div>0</div></div>');
    });

    it('Should prefer external hook if given', () => {
      let counter = 0;
      let mountCounter = 0;

      type scuTestType = {
        onComponentShouldUpdate: () => boolean;
      };

      const Static = function (_: scuTestType) {
        return <div>{counter}</div>;
      };

      Static.defaultHooks = {
        onComponentShouldUpdate() {
          return false;
        },
        onComponentWillMount() {
          mountCounter++;
        }
      };

      function doRender() {
        render(
          <div>
            {counter}
            <Static onComponentShouldUpdate={() => true} />
          </div>,
          container
        );
      }

      doRender();
      expect(container.innerHTML).toEqual('<div>0<div>0</div></div>');
      counter++;
      expect(mountCounter).toBe(1);
      doRender();
      expect(container.innerHTML).toEqual('<div>1<div>1</div></div>');
      counter++;
      expect(mountCounter).toBe(1);
      doRender();
      expect(container.innerHTML).toEqual('<div>2<div>2</div></div>');
      expect(mountCounter).toBe(1);
    });

    it('Should be possible to define default hooks and use spread operator', () => {
      let counter = 0;
      let mountCounter = 0;

      const Static = function () {
        return <div>{counter}</div>;
      };

      Static.defaultHooks = {
        onComponentShouldUpdate() {
          return false;
        },
        onComponentWillMount() {
          mountCounter++;
        }
      };

      const props = {
        ref: {
          onComponentShouldUpdate: () => true
        }
      };

      // TODO: Supporting types for "ref: {}" function component hooks probably needs changes to "JSX root types" where are those?

      function doRender() {
        render(
          <div>
            {counter}
            {/*
 // @ts-ignore */}
            <Static {...props} />
          </div>,
          container
        );
      }

      doRender();
      expect(container.innerHTML).toEqual('<div>0<div>0</div></div>');
      counter++;
      expect(mountCounter).toBe(1);
      doRender();
      expect(container.innerHTML).toEqual('<div>1<div>1</div></div>');
      counter++;
      expect(mountCounter).toBe(1);
      doRender();
      expect(container.innerHTML).toEqual('<div>2<div>2</div></div>');
      expect(mountCounter).toBe(1);
    });
  });

  describe('immutable children', () => {
    it('Should be possible to render frozen objects', () => {
      const EMPTY_ARRAY = [];
      Object.freeze(EMPTY_ARRAY);

      render(<div>{EMPTY_ARRAY}</div>, container);

      expect(container.innerHTML).toBe('<div></div>');

      render(<div>{EMPTY_ARRAY}</div>, container);

      expect(container.innerHTML).toBe('<div></div>');

      render(<div>{EMPTY_ARRAY}</div>, container);

      expect(container.innerHTML).toBe('<div></div>');

      render(<div>{null}</div>, container);
      expect(container.innerHTML).toBe('<div></div>');
    });

    it('Should be possible to render frozen objects #2', () => {
      const EMPTY_ARRAY = [];
      const TWO_NODES = [<div>1</div>, <div>2</div>];
      Object.freeze(EMPTY_ARRAY);
      Object.freeze(TWO_NODES);

      render(<div>{EMPTY_ARRAY}</div>, container);

      expect(container.innerHTML).toBe('<div></div>');

      render(<div>{TWO_NODES}</div>, container);

      expect(container.innerHTML).toBe('<div><div>1</div><div>2</div></div>');

      render(<div>{EMPTY_ARRAY}</div>, container);

      expect(container.innerHTML).toBe('<div></div>');

      render(<div>{null}</div>, container);
      expect(container.innerHTML).toBe('<div></div>');
    });
  });

  describe('it should use non keyed algorithm if its forced Github #1275', () => {
    it('last & prev are flagged $HasNonKeyedChildren', () => {
      render(<div $HasNonKeyedChildren>{[<div key="1">1</div>, <div key="2">2</div>]}</div>, container);

      const oldFirstNode = container.firstChild.firstChild;
      expect(container.innerHTML).toBe('<div><div>1</div><div>2</div></div>');

      render(<div $HasNonKeyedChildren>{[<div key="2">2</div>, <div key="1">1</div>]}</div>, container);

      expect(container.innerHTML).toBe('<div><div>2</div><div>1</div></div>');

      // It is forced to do non keyed, so elements are remounted
      expect(container.firstChild.firstChild).not.toBe(oldFirstNode);
    });
  });

  it('Should remount whole vNode tree when parent element vNode key changes', () => {
    let mountCallCount = 0;
    let unmountCallCount = 0;

    class ComponentFooBar extends Component<any, any> {
      public componentWillMount() {
        mountCallCount++;
      }

      public componentWillUnmount() {
        unmountCallCount++;
      }

      public render() {
        return <div>Component</div>;
      }
    }

    render(
      <div>
        <div key="First">
          <ComponentFooBar />
        </div>
      </div>,
      container
    );

    expect(container.innerHTML).toEqual('<div><div><div>Component</div></div></div>');

    expect(mountCallCount).toBe(1);
    expect(unmountCallCount).toBe(0);

    render(
      <div>
        <div key="Another">
          <ComponentFooBar />
        </div>
      </div>,
      container
    );

    expect(container.innerHTML).toEqual('<div><div><div>Component</div></div></div>');

    expect(mountCallCount).toBe(2);
    expect(unmountCallCount).toBe(1);
  });

  it('Should handle situation where same element ref is used multiple times', () => {
    const div = <div>Fun</div>;

    render(
      <Fragment $HasNonKeyedChildren>
        {[
          div,
          div,
          <div $HasNonKeyedChildren>
            {div}
            <div $HasVNodeChildren>{div}</div>
          </div>,
          div
        ]}
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<div>Fun</div><div>Fun</div><div><div>Fun</div><div><div>Fun</div></div></div><div>Fun</div>');

    expect(container.$V.children[1].children[0]).not.toBe(container.$V.children[0]);
    expect(container.$V.children[0]).not.toBe(container.$V.children[3]);

    render(
      <Fragment $HasNonKeyedChildren>
        {[
          div,
          div,
          <div $HasNonKeyedChildren>
            {div}
            <div $HasVNodeChildren>{div}</div>
            {div}
          </div>,
          div
        ]}
      </Fragment>,
      container
    );

    expect(container.innerHTML).toBe('<div>Fun</div><div>Fun</div><div><div>Fun</div><div><div>Fun</div></div><div>Fun</div></div><div>Fun</div>');
    expect(container.$V.children[0]).not.toBe(container.$V.children[3]);
  });

  it('Should unmount root fragment with hoisted children', () => {
    const div = <div>Fun</div>;

    render(
      <Fragment $HasNonKeyedChildren>
        {[
          div,
          div,
          div,
          <div $HasNonKeyedChildren>
            {div}
            <div $HasVNodeChildren>{div}</div>
            {div}
          </div>,
          div,
          div,
          div
        ]}
      </Fragment>,
      container
    );

    render(null, container);

    expect(container.innerHTML).toBe('');

    render(null, container);
    render(null, container);
  });

  it('Should handle hoisted nodes correctly', () => {
    const div = <div>Fun</div>;

    function Okay() {
      return div;
    }

    const OkayHoisted = <Okay />;

    function Nested() {
      return OkayHoisted;
    }

    class Foobar extends Component {
      public render() {
        return (
          <>
            {div}
            <span>Ok</span>
            <Okay />
          </>
        );
      }
    }

    const NestedHoisted = <Nested />;
    const FooBarHoisted = <Foobar />;

    render(
      <Fragment>
        {[
          FooBarHoisted,
          <Foobar />,
          div,
          <div>
            {NestedHoisted}
            <div>{div}</div>
            {NestedHoisted}
          </div>,
          FooBarHoisted,
          div,
          div
        ]}
      </Fragment>,
      container
    );
    render(null, container);

    expect(container.innerHTML).toBe('');

    render(null, container);
    render(null, container);
  });

  it('Should not re-mount fragment contents', () => {
    class Foobar extends Component<
      any,
      {
        val: number;
      }
    > {
      public state = {
        val: 1
      };

      constructor(props, context) {
        super(props, context);
      }

      public render() {
        return (
          <div onClick={() => this.setState({ val: ++this.state.val })}>
            <span>{this.state.val}</span>
            {this.props.children}
          </div>
        );
      }
    }

    function Foobar2(props) {
      return <span className={props.data}>Foo</span>;
    }

    render(
      <>
        <Foobar>
          <div>
            <Foobar2 data="first" />
          </div>
          <>
            <>
              <Foobar2 data="second" />
              <Foobar2 data="third" />
            </>
          </>
        </Foobar>
      </>,
      container
    );

    expect(container.innerHTML).toBe(
      '<div><span>1</span><div><span class="first">Foo</span></div><span class="second">Foo</span><span class="third">Foo</span></div>'
    );

    const firstNode = container.querySelector('.first');
    const secondNode = container.querySelector('.second');

    container.firstChild.click();

    expect(container.innerHTML).toBe(
      '<div><span>2</span><div><span class="first">Foo</span></div><span class="second">Foo</span><span class="third">Foo</span></div>'
    );

    expect(container.querySelector('.first')).toBe(firstNode);
    expect(container.querySelector('.second')).toBe(secondNode);

    container.firstChild.click();

    expect(container.innerHTML).toBe(
      '<div><span>3</span><div><span class="first">Foo</span></div><span class="second">Foo</span><span class="third">Foo</span></div>'
    );

    expect(container.querySelector('.first')).toBe(firstNode);
    expect(container.querySelector('.second')).toBe(secondNode);
  });

  it('Should keep given key even for deeply nested content', () => {
    render(<div>{[null, <div key="first">First</div>, <div key="second">Second</div>]}</div>, container);

    const firstDiv = container.firstChild.firstChild;
    const secondDiv = container.firstChild.childNodes[1];

    expect(container.innerHTML).toBe('<div><div>First</div><div>Second</div></div>');

    render(<div>{[null, undefined, <div key="first">First</div>, <div key="second">Second</div>]}</div>, container);
    const firstDiv2 = container.firstChild.firstChild;
    const secondDiv2 = container.firstChild.childNodes[1];

    expect(container.innerHTML).toBe('<div><div>First</div><div>Second</div></div>');

    expect(firstDiv).toBe(firstDiv2);
    expect(secondDiv).toBe(secondDiv2);
  });

  it('Should keep given key even for deeply nested content #2', () => {
    const vNode1 = <div key="first">First</div>;

    render(<div>{[null, <div key="first1">First</div>, vNode1, <div key="second">Second</div>]}</div>, container);

    const domNode = container.firstChild.childNodes[1];

    expect(container.innerHTML).toBe('<div><div>First</div><div>First</div><div>Second</div></div>');

    render(<div>{[null, undefined, <div key="first1">First</div>, [vNode1], <div key="second">Second</div>]}</div>, container);
    const domNode2 = container.firstChild.childNodes[1];

    expect(container.innerHTML).toBe('<div><div>First</div><div>First</div><div>Second</div></div>');

    expect(domNode).not.toBe(domNode2);
  });

  it('Should differenciate between location even if key is same', () => {
    let changeState: any = null;
    const okDiv = <div key="ok">ok</div>;

    class Example extends Component<{
      test: boolean;
    }> {
      constructor(props, context) {
        super(props, context);

        changeState = () => this.setState({});
      }

      public render() {
        if (this.props.test) {
          return <div>{[[[[[[okDiv]]]]]]}</div>;
        }

        return <div>{[[okDiv]]}</div>;
      }
    }
    render(<Example test={false} />, container);

    const domNode = container.firstChild.childNodes[0];

    changeState();

    // set state should keep it the same
    expect(domNode).toBe(container.firstChild.childNodes[0]);

    render(<Example test={true} />, container);

    // Rendered to different array, create new dom
    const newDomNode = container.firstChild.childNodes[0];

    expect(newDomNode).not.toBe(domNode);

    changeState();

    expect(newDomNode).toBe(container.firstChild.childNodes[0]);
  });

  it('Should differenciate between location even if key is same (props.children)', () => {
    let changeState: any = null;

    class Example extends Component<{
      test: boolean;
    }> {
      constructor(props, context) {
        super(props, context);

        changeState = () => this.setState({});
      }

      public render() {
        if (this.props.test) {
          return <div>{[[[[[[this.props.children]]]]]]}</div>;
        }

        return <div>{[[this.props.children]]}</div>;
      }
    }

    function start(bool: boolean) {
      render(
        <Example test={bool}>
          <div key="ok">ok</div>
        </Example>,
        container
      );
    }

    start(false);

    const domNode = container.firstChild.childNodes[0];

    changeState();

    // set state should keep it the same
    expect(domNode).toBe(container.firstChild.childNodes[0]);

    start(true);

    // Rendered to different array, create new dom
    const newDomNode = container.firstChild.childNodes[0];

    expect(newDomNode).not.toBe(domNode);

    changeState();

    expect(newDomNode).toBe(container.firstChild.childNodes[0]);
  });

  it('Should not recreate DOM nodes if key is given and does not change', () => {
    let changeState: any = null;

    class Example extends Component {
      constructor(props, context) {
        super(props, context);

        changeState = () => this.setState({});
      }

      public render() {
        return (
          <div key="exampleDiv">
            <input key="button" type="button" value="rerender" />
            {this.props.children}
          </div>
        );
      }
    }

    const rerender = function () {
      // children must be defiend outside the Exampe Component
      // if defined insite render of Exampe and/or its a single child, there is no issue
      render(
        <Example key="exmapleApp">
          <div class="anim1" key="div1" />
          <div class="anim2" key="div22" />
        </Example>,
        container
      );
    };

    rerender();

    const originalInput = container.firstChild.children[0];
    const originalDiv1 = container.firstChild.children[1];
    const originalDiv2 = container.firstChild.children[2];

    changeState();

    expect(originalInput).toBe(container.firstChild.children[0]);
    expect(originalDiv1).toBe(container.firstChild.children[1]);
    expect(originalDiv2).toBe(container.firstChild.children[2]);

    changeState();

    expect(originalInput).toBe(container.firstChild.children[0]);
    expect(originalDiv1).toBe(container.firstChild.children[1]);
    expect(originalDiv2).toBe(container.firstChild.children[2]);

    rerender();

    expect(originalInput).toBe(container.firstChild.children[0]);
    expect(originalDiv1).toBe(container.firstChild.children[1]);
    expect(originalDiv2).toBe(container.firstChild.children[2]);

    changeState();

    expect(originalInput).toBe(container.firstChild.children[0]);
    expect(originalDiv1).toBe(container.firstChild.children[1]);
    expect(originalDiv2).toBe(container.firstChild.children[2]);

    rerender();

    expect(originalInput).toBe(container.firstChild.children[0]);
    expect(originalDiv1).toBe(container.firstChild.children[1]);
    expect(originalDiv2).toBe(container.firstChild.children[2]);
  });
});
