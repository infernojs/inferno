import { Component, render } from 'inferno';
import Spy = jasmine.Spy;

describe('Component lifecycle (JSX)', () => {
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

  describe('componentWillUnmount', () => {
    it('Should trigger UnMount for all children', () => {
      let updater: (() => void) | null = null;

      interface AState {
        foo: boolean;
      }

      class A extends Component<unknown, AState> {
        public state: AState;

        public componentWillUnmount() {}

        constructor(props) {
          super(props);

          this.state = {
            foo: true,
          };

          this.updateme = this.updateme.bind(this);
          updater = this.updateme;
        }

        public updateme() {
          this.setState({
            foo: !this.state.foo,
          });
        }

        public render() {
          return (
            <div>
              {(() => {
                if (this.state.foo) {
                  return null;
                }
                return <B />;
              })()}
              <button onClick={this.updateme}>btn</button>
            </div>
          );
        }
      }

      class B extends Component {
        public componentWillUnmount() {}

        public render() {
          return (
            <div>
              <C />
            </div>
          );
        }
      }

      class C extends Component {
        public componentWillUnmount() {}

        public render() {
          return (
            <div>
              <D />
            </div>
          );
        }
      }

      class D extends Component {
        public componentWillUnmount() {}

        public render() {
          return <div>Terve</div>;
        }
      }

      const Aspy = spyOn(A.prototype, 'componentWillUnmount');
      const Bspy = spyOn(B.prototype, 'componentWillUnmount');
      const CSpy = spyOn(C.prototype, 'componentWillUnmount');
      const DSpy = spyOn(D.prototype, 'componentWillUnmount');

      render(<A />, container);
      expect(container.innerHTML).toBe('<div><button>btn</button></div>');
      expect(Aspy).not.toHaveBeenCalled();
      expect(Bspy).not.toHaveBeenCalled();
      expect(CSpy).not.toHaveBeenCalled();
      expect(DSpy).not.toHaveBeenCalled();

      updater!();
      expect(container.innerHTML).toBe(
        '<div><div><div><div>Terve</div></div></div><button>btn</button></div>',
      );
      expect(Aspy).not.toHaveBeenCalled();
      expect(Bspy).not.toHaveBeenCalled();
      expect(CSpy).not.toHaveBeenCalled();
      expect(DSpy).not.toHaveBeenCalled();

      updater!();
      expect(container.innerHTML).toBe('<div><button>btn</button></div>');
      expect(Aspy).not.toHaveBeenCalled();
      expect(Bspy).toHaveBeenCalledTimes(1);
      expect(CSpy).toHaveBeenCalledTimes(1);
      expect(DSpy).toHaveBeenCalledTimes(1);
    });

    it('Should not trigger unmount for new node', () => {
      let updater: (() => void) | null = null;

      interface AState {
        foo: boolean;
      }

      class A extends Component<unknown, AState> {
        public state: AState;
        public componentWillUnmount() {}

        constructor(props) {
          super(props);

          this.state = {
            foo: true,
          };

          this.updateme = this.updateme.bind(this);
          updater = this.updateme;
        }

        public updateme() {
          this.setState({
            foo: !this.state.foo,
          });
        }

        public render() {
          return (
            <div>
              {(() => {
                if (this.state.foo) {
                  return null;
                }
                return <B />;
              })()}
              <button onClick={this.updateme}>btn</button>
            </div>
          );
        }
      }

      class B extends Component {
        public componentWillUnmount() {}

        public render() {
          return <C />;
        }
      }

      class C extends Component {
        public componentWillUnmount() {}

        public render() {
          return <D />;
        }
      }

      class D extends Component {
        public componentWillUnmount() {}

        public render() {
          return <div>Terve</div>;
        }
      }

      const Aspy = spyOn(A.prototype, 'componentWillUnmount');
      const Bspy = spyOn(B.prototype, 'componentWillUnmount');
      const CSpy = spyOn(C.prototype, 'componentWillUnmount');
      const DSpy = spyOn(D.prototype, 'componentWillUnmount');

      render(<A />, container);
      expect(container.innerHTML).toBe('<div><button>btn</button></div>');
      expect(Aspy).not.toHaveBeenCalled();
      expect(Bspy).not.toHaveBeenCalled();
      expect(CSpy).not.toHaveBeenCalled();
      expect(DSpy).not.toHaveBeenCalled();

      updater!();
      expect(container.innerHTML).toBe(
        '<div><div>Terve</div><button>btn</button></div>',
      );
      expect(Aspy).not.toHaveBeenCalled();
      expect(Bspy).not.toHaveBeenCalled();
      expect(CSpy).not.toHaveBeenCalled();
      expect(DSpy).not.toHaveBeenCalled();

      updater!();
      expect(container.innerHTML).toBe('<div><button>btn</button></div>');
      expect(Aspy).not.toHaveBeenCalled();
      expect(Bspy).toHaveBeenCalledTimes(1);
      expect(CSpy).toHaveBeenCalledTimes(1);
      expect(DSpy).toHaveBeenCalledTimes(1);
    });

    it('Should trigger unMount once for direct nested children', () => {
      class B extends Component {
        public componentWillUnmount() {}

        public render() {
          return <div>B</div>;
        }
      }

      class C extends Component {
        public componentWillUnmount() {}

        public render() {
          return <div>C</div>;
        }
      }

      class D extends Component {
        public componentWillUnmount() {}

        public render() {
          return <div>D</div>;
        }
      }

      const Bspy = spyOn(B.prototype, 'componentWillUnmount');
      const CSpy = spyOn(C.prototype, 'componentWillUnmount');
      const DSpy = spyOn(D.prototype, 'componentWillUnmount');

      render(<B />, container);
      expect(container.innerHTML).toBe('<div>B</div>');
      expect(Bspy).not.toHaveBeenCalled();
      expect(CSpy).not.toHaveBeenCalled();
      expect(DSpy).not.toHaveBeenCalled();

      render(<C />, container);
      expect(container.innerHTML).toBe('<div>C</div>');
      expect(Bspy).toHaveBeenCalledTimes(1);
      expect(CSpy).not.toHaveBeenCalled();
      expect(DSpy).not.toHaveBeenCalled();

      render(<D />, container);
      expect(container.innerHTML).toBe('<div>D</div>');
      expect(Bspy).toHaveBeenCalledTimes(1);
      expect(CSpy).toHaveBeenCalledTimes(1);
      expect(DSpy).not.toHaveBeenCalled();

      render(<B />, container);
      expect(container.innerHTML).toBe('<div>B</div>');
      expect(Bspy).toHaveBeenCalledTimes(1);
      expect(CSpy).toHaveBeenCalledTimes(1);
      expect(DSpy).toHaveBeenCalledTimes(1);
    });

    it('Should trigger unmount once for children', () => {
      class B extends Component {
        public componentWillUnmount() {}

        public render() {
          return (
            <div>
              <B1 />
              <B2 />
            </div>
          );
        }
      }

      class B1 extends Component {
        public componentWillUnmount() {}

        public render() {
          return <p>B1</p>;
        }
      }

      class B2 extends Component {
        public componentWillUnmount() {}

        public render() {
          return <p>B2</p>;
        }
      }

      class C extends Component {
        constructor(props) {
          super(props);

          this.state = {
            text: 'C0',
          };

          this.updateMe = this.updateMe.bind(this);
        }

        public componentWillUnmount() {}

        public updateMe() {
          this.setState({
            text: 'C1',
          });
        }

        public render() {
          return (
            <div className="c">
              <C1 />
              <C2 />
            </div>
          );
        }
      }

      class C1 extends Component {
        public render() {
          return <p>C1</p>;
        }
      }

      class C2 extends Component {
        public render() {
          return <p>C2</p>;
        }
      }

      const Bspy = spyOn(B.prototype, 'componentWillUnmount');
      const B1spy = spyOn(B1.prototype, 'componentWillUnmount');
      const B2spy = spyOn(B2.prototype, 'componentWillUnmount');
      const CSpy = spyOn(C.prototype, 'componentWillUnmount');

      render(<B />, container);
      expect(container.innerHTML).toBe('<div><p>B1</p><p>B2</p></div>');
      expect(Bspy).not.toHaveBeenCalled();
      expect(B1spy).not.toHaveBeenCalled();
      expect(B2spy).not.toHaveBeenCalled();
      expect(CSpy).not.toHaveBeenCalled();

      Bspy.calls.reset();
      B1spy.calls.reset();
      B2spy.calls.reset();
      CSpy.calls.reset();

      render(<C />, container);
      expect(container.innerHTML).toBe(
        '<div class="c"><p>C1</p><p>C2</p></div>',
      );
      expect(Bspy).toHaveBeenCalledTimes(1);
      expect(B1spy).toHaveBeenCalledTimes(1);
      expect(B2spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Stateless component hooks', () => {
    let _container;

    function StatelessComponent(_props: { a?: unknown }) {
      return <div>Hello world</div>;
    }

    afterEach(function () {
      render(null, _container);
    });

    beforeEach(function () {
      _container = document.createElement('div');
    });

    it('"onComponentWillMount" hook should fire, args props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      render(
        <StatelessComponent a={1} onComponentWillMount={spyObj.fn} />,
        _container,
      );

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(1);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1 });
    });

    it('"onComponentDidMount" hook should fire, args DOM props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      render(
        <StatelessComponent a={1} onComponentDidMount={spyObj.fn} />,
        _container,
      );

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toBe(_container.firstChild);
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 1 });
    });

    it('"onComponentWillUnmount" hook should fire, args DOM props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      render(
        <StatelessComponent a={1} onComponentWillUnmount={spyObj.fn} />,
        _container,
      );
      expect(spy.calls.count()).toBe(0);
      // do unmount
      render(null, _container);

      expect(spy.calls.count()).toBe(1);
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0].outerHTML).toBe('<div>Hello world</div>');
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 1 });
    });

    it('"onComponentWillUpdate" hook should fire, args props nextProps', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      render(
        <StatelessComponent a={1} onComponentWillUpdate={spyObj.fn} />,
        _container,
      );
      expect(spy.calls.count()).toBe(0); // Update 1
      render(
        <StatelessComponent a={2} onComponentWillUpdate={spyObj.fn} />,
        _container,
      );
      expect(spy.calls.count()).toBe(1); // Update 2
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1 });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2 });
    });

    it('"onComponentDidUpdate" hook should fire, args prevProps props', () => {
      const spyObj = {
        fn: () => {},
      };
      const spy = spyOn(spyObj, 'fn');
      render(
        <StatelessComponent a={1} onComponentDidUpdate={spyObj.fn} />,
        _container,
      );
      expect(spy.calls.count()).toBe(0); // Update 1
      render(
        <StatelessComponent a={2} onComponentDidUpdate={spyObj.fn} />,
        _container,
      );
      expect(spy.calls.count()).toBe(1); // Update 2
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1 });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2 });
    });

    it('"onComponentShouldUpdate" hook should fire, should call render when return true, args props nextProps', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const spyObj = {
        fn: () => {
          onComponentShouldUpdateCount++;
          return true;
        },
      };
      const spy = spyOn(spyObj, 'fn').and.callThrough();
      const StatelessComponent3 = (_props: { a?: unknown }) => {
        renderCount++;
        return null;
      };

      render(
        <StatelessComponent3 a={1} onComponentShouldUpdate={spyObj.fn} />,
        _container,
      );
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      render(
        <StatelessComponent3 a={2} onComponentShouldUpdate={spyObj.fn} />,
        _container,
      );
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(2); // Rendered 2 time
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1 });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2 });
    });

    it('"onComponentShouldUpdate" hook should fire, should not call render when return false, args props nextProps', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const spyObj = {
        fn: () => {
          onComponentShouldUpdateCount++;
          return false;
        },
      };
      const spy = spyOn(spyObj, 'fn').and.callThrough();
      const StatelessComponent2 = (_props: { a?: unknown }) => {
        renderCount++;
        return null;
      };

      render(
        <StatelessComponent2 a={1} onComponentShouldUpdate={spyObj.fn} />,
        _container,
      );
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      render(
        <StatelessComponent2 a={2} onComponentShouldUpdate={spyObj.fn} />,
        _container,
      );
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(1); // Rendered 1 time
      expect(spy.calls.argsFor(0).length).toBe(2);
      expect(spy.calls.argsFor(0)[0]).toEqual({ a: 1 });
      expect(spy.calls.argsFor(0)[1]).toEqual({ a: 2 });
    });
  });

  describe('ref hook', () => {
    const fakeObj = {
      previousSiblingCallback() {},
      innerCallback() {},
      innerSecondCallback() {},
    };

    const RefTester = ({ inner, innersecond }) => {
      let content = null;
      if (inner) {
        let contentTwo = null;
        if (innersecond) {
          contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
        }
        content = <div ref={fakeObj.innerCallback}>{contentTwo}</div>;
      }

      return (
        <div>
          <span ref={fakeObj.previousSiblingCallback}>abc</span>
          {content}
        </div>
      );
    };

    let orderOfCalls: string[] = [];
    let spyPreviousSibling = null as unknown as Spy;
    let spyInner = null as unknown as Spy;
    let spyInnerSecond = null as unknown as Spy;

    beforeEach(function () {
      orderOfCalls = [];
      spyPreviousSibling = spyOn(
        fakeObj,
        'previousSiblingCallback',
      ).and.callFake(function () {
        orderOfCalls.push('spyPreviousSibling');
      });
      spyInner = spyOn(fakeObj, 'innerCallback').and.callFake(function () {
        orderOfCalls.push('inner');
      });
      spyInnerSecond = spyOn(fakeObj, 'innerSecondCallback').and.callFake(
        function () {
          orderOfCalls.push('innerSecond');
        },
      );
    });

    it('Should call function when node is attached', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();
      render(<RefTester inner={false} innersecond={false} />, container);

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={false} />, container);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual('<div></div>');
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={true} />, container);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );
    });

    it('Should call ref functions in order: child to parent', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={true} />, container);

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
      ]);
    });

    it('Should call ref when node is re-attached and re-unmounted', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={true} />, container);

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
      ]);

      // reset
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      render(<RefTester inner={false} innersecond={true} />, container);

      // Verify divs are removed from DOM
      expect(container.innerHTML).toEqual('<div><span>abc</span></div>');

      // Verify ref callbacks
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyInner.calls.argsFor(0)[0]).toEqual(null);
      expect(spyInnerSecond.calls.argsFor(0)[0]).toEqual(null);

      // reset
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      render(<RefTester inner={true} innersecond={true} />, container);

      // Verify divs are attached
      expect(container.innerHTML).toEqual(
        '<div><span>abc</span><div><span>dfg</span></div></div>',
      );

      // Verify ref callbacks
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      // reset
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();
    });

    it('Should have width defined when html node is attached', () => {
      if (global.usingJSDOM) {
        // JSDOM mocks the ref node width to 0. Skip test
        return;
      }

      let node: HTMLDivElement | null = null;

      class Hello extends Component {
        constructor(props) {
          super(props);
        }

        public componentDidMount() {
          expect(node!.offsetWidth).not.toEqual(0);
        }

        public ref(n) {
          if (n) {
            expect(n.offsetWidth).not.toEqual(0);
            node = n;
          }
        }

        public render() {
          return <div ref={this.ref}>Hello World</div>;
        }
      }

      render(<Hello />, container);
    });
  });

  describe('ref hook complex', () => {
    const fakeObj = {
      previousSiblingCallback() {},
      innerCallback() {},
      innerSecondCallback() {},
    };

    const RefTester = ({ inner, innersecond }) => {
      let content = null;
      if (inner) {
        let contentTwo = null;
        if (innersecond) {
          contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
        }
        content = <div ref={fakeObj.innerCallback}>{contentTwo}</div>;
      }

      return (
        <div>
          <span ref={fakeObj.previousSiblingCallback}>abc</span>
          {content}
        </div>
      );
    };

    const PlainDiv = () => <div>plaindiv</div>;

    const RefParent = ({ bool, inner, innersecond }) => {
      return (
        <div>
          {bool ? (
            <RefTester inner={inner} innersecond={innersecond} />
          ) : (
            <PlainDiv />
          )}
        </div>
      );
    };

    let orderOfCalls: string[] = [];
    let spyPreviousSibling = null as unknown as Spy;
    let spyInner = null as unknown as Spy;
    let spyInnerSecond = null as unknown as Spy;

    beforeEach(function () {
      orderOfCalls = [];
      spyPreviousSibling = spyOn(
        fakeObj,
        'previousSiblingCallback',
      ).and.callFake(function () {
        orderOfCalls.push('spyPreviousSibling');
      });
      spyInner = spyOn(fakeObj, 'innerCallback').and.callFake(function () {
        orderOfCalls.push('inner');
      });
      spyInnerSecond = spyOn(fakeObj, 'innerSecondCallback').and.callFake(
        function () {
          orderOfCalls.push('innerSecond');
        },
      );
    });

    afterEach(function () {
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();
    });

    it('Should not call ref unmount when node is not mounted', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container,
      );

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      expect(container.innerHTML).toEqual(
        '<div><div><span>abc</span></div></div>',
      );
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      // RENDER INNER DIVS
      render(
        <RefParent bool={true} inner={true} innersecond={true} />,
        container,
      );
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      // verify order
      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
      ]);

      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      expect(container.innerHTML).toEqual(
        '<div><div><span>abc</span><div><span>dfg</span></div></div></div>',
      );
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      // UNMOUNT INNER DIVS
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container,
      );
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      // verify order
      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
        'inner',
        'innerSecond',
      ]);

      expect(spyInner.calls.argsFor(0)[0]).toEqual(null);
      expect(spyInnerSecond.calls.argsFor(0)[0]).toEqual(null);

      expect(container.innerHTML).toEqual(
        '<div><div><span>abc</span></div></div>',
      );
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      // Inner and InnerSecond divs are now unmounted
      // and unmounting parent should not cause them to unmounted again

      // REPLACE PARENT
      render(
        <RefParent bool={false} inner={false} innersecond={false} />,
        container,
      );
      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();
      expect(container.innerHTML).toEqual('<div><div>plaindiv</div></div>');
    });
  });

  describe('ref hook #2 with statefull components', () => {
    const fakeObj = {
      previousSiblingCallback() {},
      innerCallback() {},
      innerSecondCallback() {},
    };

    interface RefTesterProps {
      inner?: boolean;
      innersecond?: boolean;
    }

    class RefTester extends Component<RefTesterProps> {
      public render() {
        const inner = this.props.inner;
        const innersecond = this.props.innersecond;

        let content = null;
        if (inner) {
          let contentTwo = null;
          if (innersecond) {
            contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
          }
          content = <div ref={fakeObj.innerCallback}>{contentTwo}</div>;
        }

        return (
          <div>
            <span ref={fakeObj.previousSiblingCallback}>abc</span>
            {content}
          </div>
        );
      }
    }

    let orderOfCalls: string[] = [];
    let spyPreviousSibling = null as unknown as Spy;
    let spyInner = null as unknown as Spy;
    let spyInnerSecond = null as unknown as Spy;

    beforeEach(function () {
      orderOfCalls = [];
      spyPreviousSibling = spyOn(
        fakeObj,
        'previousSiblingCallback',
      ).and.callFake(function () {
        orderOfCalls.push('spyPreviousSibling');
      });
      spyInner = spyOn(fakeObj, 'innerCallback').and.callFake(function () {
        orderOfCalls.push('inner');
      });
      spyInnerSecond = spyOn(fakeObj, 'innerSecondCallback').and.callFake(
        function () {
          orderOfCalls.push('innerSecond');
        },
      );
    });

    it('Should call function when node is attached #2', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();
      render(<RefTester inner={false} innersecond={false} />, container);

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={false} />, container);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual('<div></div>');
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={true} />, container);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );
    });

    it('Should call ref functions in order: child to parent #2', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={true} />, container);

      expect(spyPreviousSibling);
      expect(spyInner);
      expect(spyInnerSecond);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
      ]);
    });

    it('Should call ref when node is re-attached and re-unmounted', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      render(<RefTester inner={true} innersecond={true} />, container);

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
      ]);

      // reset
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      render(<RefTester inner={false} innersecond={true} />, container);

      // Verify divs are removed from DOM
      expect(container.innerHTML).toEqual('<div><span>abc</span></div>');

      // Verify ref callbacks
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyInner.calls.argsFor(0)[0]).toEqual(null);
      expect(spyInnerSecond.calls.argsFor(0)[0]).toEqual(null);

      // reset
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      render(<RefTester inner={true} innersecond={true} />, container);

      // Verify divs are attached
      expect(container.innerHTML).toEqual(
        '<div><span>abc</span><div><span>dfg</span></div></div>',
      );

      // Verify ref callbacks
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      // reset
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();
    });
  });

  describe('ref hook complex #2 statefull components', () => {
    const fakeObj = {
      previousSiblingCallback() {},
      innerCallback() {},
      innerSecondCallback() {},
    };

    interface RefTesterProps {
      bool?: boolean;
      inner?: boolean;
      innersecond?: boolean;
    }

    class RefTester extends Component<RefTesterProps> {
      public render() {
        const inner = this.props.inner;
        const innersecond = this.props.innersecond;

        let content = null;
        if (inner) {
          let contentTwo = null;
          if (innersecond) {
            contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
          }
          content = <div ref={fakeObj.innerCallback}>{contentTwo}</div>;
        }

        return (
          <div>
            <span ref={fakeObj.previousSiblingCallback}>abc</span>
            {content}
          </div>
        );
      }
    }

    class PlainDiv extends Component {
      public render() {
        return <div>plaindiv</div>;
      }
    }

    interface RefParentProps {
      bool?: boolean;
      inner?: boolean;
      innersecond?: boolean;
    }

    class RefParent extends Component<RefParentProps> {
      public render() {
        const { bool, inner, innersecond } = this.props;

        return (
          <div>
            {bool ? (
              <RefTester inner={inner} innersecond={innersecond} />
            ) : (
              <PlainDiv />
            )}
          </div>
        );
      }
    }

    let orderOfCalls: string[] = [];
    let spyPreviousSibling = null as unknown as Spy;
    let spyInner = null as unknown as Spy;
    let spyInnerSecond = null as unknown as Spy;

    beforeEach(function () {
      orderOfCalls = [];
      spyPreviousSibling = spyOn(
        fakeObj,
        'previousSiblingCallback',
      ).and.callFake(function () {
        orderOfCalls.push('spyPreviousSibling');
      });
      spyInner = spyOn(fakeObj, 'innerCallback').and.callFake(function () {
        orderOfCalls.push('inner');
      });
      spyInnerSecond = spyOn(fakeObj, 'innerSecondCallback').and.callFake(
        function () {
          orderOfCalls.push('innerSecond');
        },
      );
    });

    afterEach(function () {
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();
    });

    it('Should not call ref unmount when node is not mounted #2', () => {
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container,
      );

      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyPreviousSibling.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>abc</span>',
      );
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();

      expect(container.innerHTML).toEqual(
        '<div><div><span>abc</span></div></div>',
      );
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      // RENDER INNER DIVS
      render(
        <RefParent bool={true} inner={true} innersecond={true} />,
        container,
      );
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      // verify order
      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
      ]);

      expect(spyInner.calls.argsFor(0)[0].outerHTML).toEqual(
        '<div><span>dfg</span></div>',
      );
      expect(spyInnerSecond.calls.argsFor(0)[0].outerHTML).toEqual(
        '<span>dfg</span>',
      );

      expect(container.innerHTML).toEqual(
        '<div><div><span>abc</span><div><span>dfg</span></div></div></div>',
      );
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      // UNMOUNT INNER DIVS
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container,
      );
      expect(spyPreviousSibling).not.toHaveBeenCalled();
      expect(spyInner).toHaveBeenCalledTimes(1);
      expect(spyInnerSecond).toHaveBeenCalledTimes(1);
      // verify order
      expect(orderOfCalls).toEqual([
        'spyPreviousSibling',
        'innerSecond',
        'inner',
        'inner',
        'innerSecond',
      ]);

      expect(spyInner.calls.argsFor(0)[0]).toEqual(null);
      expect(spyInnerSecond.calls.argsFor(0)[0]).toEqual(null);

      expect(container.innerHTML).toEqual(
        '<div><div><span>abc</span></div></div>',
      );
      spyPreviousSibling.calls.reset();
      spyInner.calls.reset();
      spyInnerSecond.calls.reset();

      // Inner and InnerSecond divs are now unmounted
      // and unmounting parent should not cause them to unmounted again

      // REPLACE PARENT
      render(
        <RefParent bool={false} inner={false} innersecond={false} />,
        container,
      );
      expect(spyPreviousSibling).toHaveBeenCalledTimes(1);
      expect(spyInner).not.toHaveBeenCalled();
      expect(spyInnerSecond).not.toHaveBeenCalled();
      expect(container.innerHTML).toEqual('<div><div>plaindiv</div></div>');
    });
  });

  describe('ES6 Component within functional component', () => {
    it('Should trigger lifecycle events when functional component change', () => {
      let unmounted = false;

      function A() {
        return (
          <div>
            <Com />
          </div>
        );
      }

      function B() {
        return (
          <div>
            <Com />
          </div>
        );
      }

      class Com extends Component {
        public componentWillUnmount() {
          unmounted = true;
        }

        public render() {
          return <div>C</div>;
        }
      }

      render(<A />, container);
      expect(container.innerHTML).toEqual('<div><div>C</div></div>');
      expect(unmounted).toEqual(false);
      render(<B />, container);
      expect(unmounted).toEqual(true);
      expect(container.innerHTML).toEqual('<div><div>C</div></div>');
    });

    it('Should trigger lifecycle events when functional component dont change', () => {
      let unmounted = false;

      function A() {
        return (
          <div>
            <Com />
          </div>
        );
      }

      class Com extends Component {
        public componentWillUnmount() {
          unmounted = true;
        }

        public render() {
          return <div>C</div>;
        }
      }

      render(<A />, container);
      expect(container.innerHTML).toEqual('<div><div>C</div></div>');
      expect(unmounted).toEqual(false);
      render(<A />, container);
      expect(unmounted).toEqual(false);
      expect(container.innerHTML).toEqual('<div><div>C</div></div>');
    });
  });

  describe('context with hooks', () => {
    it('Should trigger componentWillMount before getting child context', () => {
      interface AState {
        foobar: string | null;
      }

      class A extends Component<unknown, AState> {
        public state: AState;
        constructor(props) {
          super(props);

          this.state = {
            foobar: null,
          };
        }

        public getChildContext() {
          return {
            foobar: this.state.foobar,
          };
        }

        public componentWillMount() {
          this.setState({
            foobar: 'hey',
          });
        }

        public render() {
          return (
            <div>
              <Child />
            </div>
          );
        }
      }

      class Child extends Component {
        constructor(props) {
          super(props);
        }

        public render() {
          return <span>{this.context.foobar}</span>;
        }
      }

      render(<A />, container);

      expect(container.innerHTML).toEqual('<div><span>hey</span></div>');
    });
  });

  describe('ref', () => {
    it('Should trigger lifecycle hooks when parent changes', () => {
      const spy1 = jasmine.createSpy('spy');
      const spy2 = jasmine.createSpy('spy');
      const spy3 = jasmine.createSpy('spy');
      const spy4 = jasmine.createSpy('spy');
      const spy5 = jasmine.createSpy('spy');

      class A extends Component {
        public render() {
          return (
            <div>
              <div ref={spy5}>
                <span>1</span>
                <span>1</span>
              </div>
            </div>
          );
        }
      }

      class B extends Component {
        public componentWillMount() {
          this.setState({
            foo: 'bar',
          });
        }

        public render() {
          return (
            <div>
              <div ref={spy1} />
              <Child />
              <div />
              <div ref={spy2} />
              <div />
              <Child ref={spy3} />
            </div>
          );
        }
      }

      class Child extends Component {
        public componentWillMount() {
          this.setState({
            foo: '1',
          });
        }

        public render() {
          return <div ref={spy4}>5</div>;
        }
      }

      render(<A />, container);
      expect(spy5.calls.count()).toBe(1);

      render(<B />, container);

      expect(spy5.calls.count()).toBe(2); // mount + unmount

      expect(spy1.calls.count()).toBe(1);
      expect(spy2.calls.count()).toBe(1);
      expect(spy3.calls.count()).toBe(1);
      expect(spy4.calls.count()).toBe(2); // 2 refs
    });
  });
});
