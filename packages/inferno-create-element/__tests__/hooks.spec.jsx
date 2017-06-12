import { render } from "inferno";
import Component from "inferno-component";
import sinon from "sinon";
import { innerHTML } from "inferno-utils";

describe("Component lifecycle (JSX)", () => {
  let container;

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  describe("componentWillUnmount", () => {
    it("Should trigger UnMount for all children", () => {
      let updater = null;

      class A extends Component {
        componentWillUnmount() {}

        constructor(props) {
          super(props);

          this.state = {
            foo: true
          };

          this.updateme = this.updateme.bind(this);
          updater = this.updateme;
        }

        updateme() {
          this.setStateSync({
            foo: !this.state.foo
          });
        }

        render() {
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
        componentWillUnmount() {}

        render() {
          return (
            <div>
              <C />
            </div>
          );
        }
      }

      class C extends Component {
        componentWillUnmount() {}

        render() {
          return (
            <div>
              <D />
            </div>
          );
        }
      }

      class D extends Component {
        componentWillUnmount() {}

        render() {
          return (
            <div>
              Terve
            </div>
          );
        }
      }

      const Aspy = sinon.spy(A.prototype, "componentWillUnmount");
      const Bspy = sinon.spy(B.prototype, "componentWillUnmount");
      const CSpy = sinon.spy(C.prototype, "componentWillUnmount");
      const DSpy = sinon.spy(D.prototype, "componentWillUnmount");
      const notCalled = sinon.assert.notCalled;

      render(<A />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><button>btn</button></div>")
      );
      notCalled(Aspy);
      notCalled(Bspy);
      notCalled(CSpy);
      notCalled(DSpy);

      updater();
      expect(container.innerHTML).toBe(
        innerHTML(
          "<div><div><div><div>Terve</div></div></div><button>btn</button></div>"
        )
      );
      notCalled(Aspy);
      notCalled(Bspy);
      notCalled(CSpy);
      notCalled(DSpy);

      updater();
      expect(container.innerHTML).toBe(
        innerHTML("<div><button>btn</button></div>")
      );
      notCalled(Aspy);
      const calledOnce = sinon.assert.calledOnce;
      calledOnce(Bspy);
      calledOnce(CSpy);
      calledOnce(DSpy);
    });

    it("Should not trigger unmount for new node", () => {
      let updater = null;

      class A extends Component {
        componentWillUnmount() {}

        constructor(props) {
          super(props);

          this.state = {
            foo: true
          };

          this.updateme = this.updateme.bind(this);
          updater = this.updateme;
        }

        updateme() {
          this.setStateSync({
            foo: !this.state.foo
          });
        }

        render() {
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
        componentWillUnmount() {}

        render() {
          return <C />;
        }
      }

      class C extends Component {
        componentWillUnmount() {}

        render() {
          return <D />;
        }
      }

      class D extends Component {
        componentWillUnmount() {}

        render() {
          return (
            <div>
              Terve
            </div>
          );
        }
      }

      const Aspy = sinon.spy(A.prototype, "componentWillUnmount");
      const Bspy = sinon.spy(B.prototype, "componentWillUnmount");
      const CSpy = sinon.spy(C.prototype, "componentWillUnmount");
      const DSpy = sinon.spy(D.prototype, "componentWillUnmount");
      const notCalled = sinon.assert.notCalled;

      render(<A />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><button>btn</button></div>")
      );
      notCalled(Aspy);
      notCalled(Bspy);
      notCalled(CSpy);
      notCalled(DSpy);

      updater();
      expect(container.innerHTML).toBe(
        innerHTML("<div><div>Terve</div><button>btn</button></div>")
      );
      notCalled(Aspy);
      notCalled(Bspy);
      notCalled(CSpy);
      notCalled(DSpy);

      updater();
      expect(container.innerHTML).toBe(
        innerHTML("<div><button>btn</button></div>")
      );
      notCalled(Aspy);
      const calledOnce = sinon.assert.calledOnce;
      calledOnce(Bspy);
      calledOnce(CSpy);
      calledOnce(DSpy);
    });

    it("Should trigger unMount once for direct nested children", () => {
      class B extends Component {
        componentWillUnmount() {}

        render() {
          return <div>B</div>;
        }
      }

      class C extends Component {
        componentWillUnmount() {}

        render() {
          return <div>C</div>;
        }
      }

      class D extends Component {
        componentWillUnmount() {}

        render() {
          return <div>D</div>;
        }
      }

      const Bspy = sinon.spy(B.prototype, "componentWillUnmount");
      const CSpy = sinon.spy(C.prototype, "componentWillUnmount");
      const DSpy = sinon.spy(D.prototype, "componentWillUnmount");
      const notCalled = sinon.assert.notCalled;
      const calledOnce = sinon.assert.calledOnce;

      render(<B />, container);
      expect(container.innerHTML).toBe(innerHTML("<div>B</div>"));
      notCalled(Bspy);
      notCalled(CSpy);
      notCalled(DSpy);

      render(<C />, container);
      expect(container.innerHTML).toBe(innerHTML("<div>C</div>"));
      calledOnce(Bspy);
      notCalled(CSpy);
      notCalled(DSpy);

      render(<D />, container);
      expect(container.innerHTML).toBe(innerHTML("<div>D</div>"));
      calledOnce(Bspy);
      calledOnce(CSpy);
      notCalled(DSpy);

      render(<B />, container);
      expect(container.innerHTML).toBe(innerHTML("<div>B</div>"));
      calledOnce(Bspy);
      calledOnce(CSpy);
      calledOnce(DSpy);
    });

    it("Should trigger unmount once for children", () => {
      let updater = null;

      class B extends Component {
        componentWillUnmount() {}

        render() {
          return (
            <div>
              <B1 />
              <B2 />
            </div>
          );
        }
      }

      class B1 extends Component {
        componentWillUnmount() {}

        render() {
          return <p>B1</p>;
        }
      }

      class B2 extends Component {
        componentWillUnmount() {}

        render() {
          return <p>B2</p>;
        }
      }

      class C extends Component {
        constructor(props) {
          super(props);

          this.state = {
            text: "C0"
          };

          this.updateMe = this.updateMe.bind(this);
          updater = this.updateMe;
        }

        componentWillUnmount() {}

        updateMe() {
          this.setState({
            text: "C1"
          });
        }

        render() {
          return (
            <div className="c">
              <C1 />
              <C2 />
            </div>
          );
        }
      }

      class C1 extends Component {
        render() {
          return <p>C1</p>;
        }
      }

      class C2 extends Component {
        render() {
          return <p>C2</p>;
        }
      }

      const Bspy = sinon.spy(B.prototype, "componentWillUnmount");
      const B1spy = sinon.spy(B1.prototype, "componentWillUnmount");
      const B2spy = sinon.spy(B2.prototype, "componentWillUnmount");
      const CSpy = sinon.spy(C.prototype, "componentWillUnmount");
      const notCalled = sinon.assert.notCalled;
      const calledOnce = sinon.assert.calledOnce;

      render(<B />, container);
      expect(container.innerHTML).toBe(
        innerHTML("<div><p>B1</p><p>B2</p></div>")
      );
      notCalled(Bspy);
      notCalled(B1spy);
      notCalled(B2spy);
      notCalled(CSpy);

      Bspy.reset();
      B1spy.reset();
      B2spy.reset();
      CSpy.reset();

      render(<C />, container);
      expect(container.innerHTML).toBe(
        innerHTML('<div class="c"><p>C1</p><p>C2</p></div>')
      );
      calledOnce(Bspy);
      calledOnce(B1spy);
      calledOnce(B2spy);
    });
  });

  describe("Stateless component hooks", () => {
    let _container;

    function StatelessComponent() {
      return (
        <div>
          Hello world
        </div>
      );
    }

    afterEach(function() {
      render(null, _container);
    });

    beforeEach(function() {
      _container = document.createElement("div");
    });

    it('"onComponentWillMount" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      render(
        <StatelessComponent onComponentWillMount={spyObj.fn} />,
        _container
      );

      expect(sinonSpy.callCount).toBe(1);
    });

    it('"onComponentDidMount" hook should fire, args DOM', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      render(
        <StatelessComponent onComponentDidMount={spyObj.fn} />,
        _container
      );

      expect(sinonSpy.callCount).toBe(1);
      expect(sinonSpy.getCall(0).args[0]).toBe(_container.firstChild);
    });

    it('"onComponentWillUnmount" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      render(
        <StatelessComponent onComponentWillUnmount={spyObj.fn} />,
        _container
      );
      expect(sinonSpy.callCount).toBe(0);
      // do unmount
      render(null, _container);

      expect(sinonSpy.callCount).toBe(1);
    });

    it('"onComponentWillUpdate" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      render(
        <StatelessComponent onComponentWillUpdate={spyObj.fn} />,
        _container
      );
      expect(sinonSpy.callCount).toBe(0);
    });

    it('"onComponentDidUpdate" hook should fire', () => {
      const spyObj = {
        fn: () => {}
      };
      const sinonSpy = sinon.spy(spyObj, "fn");
      render(
        <StatelessComponent onComponentDidUpdate={spyObj.fn} />,
        _container
      );
      expect(sinonSpy.callCount).toBe(0); // Update 1
      render(
        <StatelessComponent onComponentDidUpdate={spyObj.fn} />,
        _container
      );
      expect(sinonSpy.callCount).toBe(1); // Update 2
    });

    it('"onComponentShouldUpdate" hook should fire, should call render when return true', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };

      render(
        <StatelessComponent
          onComponentShouldUpdate={() => {
            onComponentShouldUpdateCount++;
            return true;
          }}
        />,
        _container
      );
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      render(
        <StatelessComponent
          onComponentShouldUpdate={() => {
            onComponentShouldUpdateCount++;
            return true;
          }}
        />,
        _container
      );
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(2); // Rendered 2 time
    });

    it('"onComponentShouldUpdate" hook should fire, should not call render when return false', () => {
      let onComponentShouldUpdateCount = 0;
      let renderCount = 0;
      const StatelessComponent = () => {
        renderCount++;
        return null;
      };

      render(
        <StatelessComponent
          onComponentShouldUpdate={() => {
            onComponentShouldUpdateCount++;
            return false;
          }}
        />,
        _container
      );
      expect(onComponentShouldUpdateCount).toBe(0); // Update 1
      expect(renderCount).toBe(1); // Rendered 1 time

      render(
        <StatelessComponent
          onComponentShouldUpdate={() => {
            onComponentShouldUpdateCount++;
            return false;
          }}
        />,
        _container
      );
      expect(onComponentShouldUpdateCount).toBe(1); // Update 2
      expect(renderCount).toBe(1); // Rendered 1 time
    });
  });

  describe("ref hook", () => {
    const fakeObj = {
      outerCallback() {},
      innerCallback() {},
      innerSecondCallback() {}
    };

    const calledOnce = sinon.assert.calledOnce;
    const notCalled = sinon.assert.notCalled;

    const RefTester = ({ inner, innersecond }) => {
      let content = null;
      if (inner) {
        let contentTwo = null;
        if (innersecond) {
          contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
        }
        content = (
          <div ref={fakeObj.innerCallback}>
            {contentTwo}
          </div>
        );
      }

      return (
        <div>
          <span ref={fakeObj.outerCallback}>abc</span>
          {content}
        </div>
      );
    };
    const spyOuter = sinon.spy(fakeObj, "outerCallback");
    const spyInner = sinon.spy(fakeObj, "innerCallback");
    const spyInnerSecond = sinon.spy(fakeObj, "innerSecondCallback");

    beforeEach(function() {
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();
    });

    it("Should call function when node is attached", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);
      render(<RefTester inner={false} innersecond={false} />, container);

      calledOnce(spyOuter);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={false} />, container);
      calledOnce(spyInner);
      calledOnce(spyOuter);
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual("<div></div>");
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={true} />, container);
      calledOnce(spyInner);
      calledOnce(spyOuter);
      calledOnce(spyInnerSecond);
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );
    });

    it("Should call ref functions in order: child to parent", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={true} />, container);

      calledOnce(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);
    });

    it("Should call ref when node is re-attached and re-unmounted", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={true} />, container);

      calledOnce(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);

      // reset
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      render(<RefTester inner={false} innersecond={true} />, container);

      // Verify divs are removed from DOM
      expect(container.innerHTML).toEqual("<div><span>abc</span></div>");

      // Verify ref callbacks
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyInner.getCall(0).args[0]).toEqual(null);
      expect(spyInnerSecond.getCall(0).args[0]).toEqual(null);

      // reset
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      render(<RefTester inner={true} innersecond={true} />, container);

      // Verify divs are attached
      expect(container.innerHTML).toEqual(
        "<div><span>abc</span><div><span>dfg</span></div></div>"
      );

      // Verify ref callbacks
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      // reset
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();
    });

    it("Should have width defined when html node is attached", () => {
      if (global.usingJSDOM) {
        // JSDOM mocks the ref node width to 0. Skip test
        return;
      }

      let node = null;

      class Hello extends Component {
        constructor(props) {
          super(props);
        }

        componentDidMount() {
          expect(
            node.offsetWidth,
            "ref node should have width in Didmount"
          ).not.toEqual(0);
        }

        ref(n) {
          if (n) {
            expect(
              n.offsetWidth,
              "ref node should have width in callback"
            ).not.toEqual(0);
            node = n;
          }
        }

        render() {
          return (
            <div ref={this.ref}>
              Hello World
            </div>
          );
        }
      }

      render(<Hello />, container);
    });
  });

  describe("ref hook complex", () => {
    const fakeObj = {
      outerCallback() {},
      innerCallback() {},
      innerSecondCallback() {}
    };

    const calledOnce = sinon.assert.calledOnce;
    const notCalled = sinon.assert.notCalled;

    const RefTester = ({ inner, innersecond }) => {
      let content = null;
      if (inner) {
        let contentTwo = null;
        if (innersecond) {
          contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
        }
        content = (
          <div ref={fakeObj.innerCallback}>
            {contentTwo}
          </div>
        );
      }

      return (
        <div>
          <span ref={fakeObj.outerCallback}>abc</span>
          {content}
        </div>
      );
    };
    const spyOuter = sinon.spy(fakeObj, "outerCallback");
    const spyInner = sinon.spy(fakeObj, "innerCallback");
    const spyInnerSecond = sinon.spy(fakeObj, "innerSecondCallback");

    const PlainDiv = () => <div>plaindiv</div>;

    const RefParent = ({ bool, inner, innersecond }) => {
      return (
        <div>
          {bool
            ? <RefTester inner={inner} innersecond={innersecond} />
            : <PlainDiv />}
        </div>
      );
    };

    afterEach(function() {
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();
    });

    it("Should not call ref unmount when node is not mounted", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container
      );

      calledOnce(spyOuter);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      expect(container.innerHTML).toEqual(
        "<div><div><span>abc</span></div></div>"
      );
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      // RENDER INNER DIVS
      render(
        <RefParent bool={true} inner={true} innersecond={true} />,
        container
      );
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      // verify order
      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);

      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      expect(container.innerHTML).toEqual(
        "<div><div><span>abc</span><div><span>dfg</span></div></div></div>"
      );
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      // UNMOUNT INNER DIVS
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container
      );
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      // verify order
      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);

      expect(spyInner.getCall(0).args[0]).toEqual(null);
      expect(spyInnerSecond.getCall(0).args[0]).toEqual(null);

      expect(container.innerHTML).toEqual(
        "<div><div><span>abc</span></div></div>"
      );
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      // Inner and InnerSecond divs are now unmounted
      // and unmounting parent should not cause them to unmounted again

      // REPLACE PARENT
      render(
        <RefParent bool={false} inner={false} innersecond={false} />,
        container
      );
      calledOnce(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);
      expect(container.innerHTML).toEqual("<div><div>plaindiv</div></div>");
    });
  });

  describe("ref hook #2 with statefull components", () => {
    const fakeObj = {
      outerCallback() {},
      innerCallback() {},
      innerSecondCallback() {}
    };

    const calledOnce = sinon.assert.calledOnce;
    const notCalled = sinon.assert.notCalled;

    class RefTester extends Component {
      render() {
        const inner = this.props.inner;
        const innersecond = this.props.innersecond;

        let content = null;
        if (inner) {
          let contentTwo = null;
          if (innersecond) {
            contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
          }
          content = (
            <div ref={fakeObj.innerCallback}>
              {contentTwo}
            </div>
          );
        }

        return (
          <div>
            <span ref={fakeObj.outerCallback}>abc</span>
            {content}
          </div>
        );
      }
    }

    const spyOuter = sinon.spy(fakeObj, "outerCallback");
    const spyInner = sinon.spy(fakeObj, "innerCallback");
    const spyInnerSecond = sinon.spy(fakeObj, "innerSecondCallback");

    beforeEach(function() {
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();
    });

    it("Should call function when node is attached #2", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);
      render(<RefTester inner={false} innersecond={false} />, container);

      calledOnce(spyOuter);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={false} />, container);
      calledOnce(spyInner);
      calledOnce(spyOuter);
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual("<div></div>");
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={true} />, container);
      calledOnce(spyInner);
      calledOnce(spyOuter);
      calledOnce(spyInnerSecond);
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );
    });

    it("Should call ref functions in order: child to parent #2", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={true} />, container);

      calledOnce(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);
    });

    it("Should call ref when node is re-attached and re-unmounted", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      render(<RefTester inner={true} innersecond={true} />, container);

      calledOnce(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);

      // reset
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      render(<RefTester inner={false} innersecond={true} />, container);

      // Verify divs are removed from DOM
      expect(container.innerHTML).toEqual("<div><span>abc</span></div>");

      // Verify ref callbacks
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyInner.getCall(0).args[0]).toEqual(null);
      expect(spyInnerSecond.getCall(0).args[0]).toEqual(null);

      // reset
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      render(<RefTester inner={true} innersecond={true} />, container);

      // Verify divs are attached
      expect(container.innerHTML).toEqual(
        "<div><span>abc</span><div><span>dfg</span></div></div>"
      );

      // Verify ref callbacks
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      // reset
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();
    });
  });

  describe("ref hook complex #2 statefull components", () => {
    const fakeObj = {
      outerCallback() {},
      innerCallback() {},
      innerSecondCallback() {}
    };

    const calledOnce = sinon.assert.calledOnce;
    const notCalled = sinon.assert.notCalled;

    class RefTester extends Component {
      render() {
        const inner = this.props.inner;
        const innersecond = this.props.innersecond;

        let content = null;
        if (inner) {
          let contentTwo = null;
          if (innersecond) {
            contentTwo = <span ref={fakeObj.innerSecondCallback}>dfg</span>;
          }
          content = (
            <div ref={fakeObj.innerCallback}>
              {contentTwo}
            </div>
          );
        }

        return (
          <div>
            <span ref={fakeObj.outerCallback}>abc</span>
            {content}
          </div>
        );
      }
    }

    const spyOuter = sinon.spy(fakeObj, "outerCallback");
    const spyInner = sinon.spy(fakeObj, "innerCallback");
    const spyInnerSecond = sinon.spy(fakeObj, "innerSecondCallback");

    class PlainDiv extends Component {
      render() {
        return <div>plaindiv</div>;
      }
    }

    class RefParent extends Component {
      render() {
        const { bool, inner, innersecond } = this.props;

        return (
          <div>
            {bool
              ? <RefTester inner={inner} innersecond={innersecond} />
              : <PlainDiv />}
          </div>
        );
      }
    }

    afterEach(function() {
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();
    });

    it("Should not call ref unmount when node is not mounted #2", () => {
      notCalled(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container
      );

      calledOnce(spyOuter);
      expect(spyOuter.getCall(0).args[0].outerHTML).toEqual("<span>abc</span>");
      notCalled(spyInner);
      notCalled(spyInnerSecond);

      expect(container.innerHTML).toEqual(
        "<div><div><span>abc</span></div></div>"
      );
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      // RENDER INNER DIVS
      render(
        <RefParent bool={true} inner={true} innersecond={true} />,
        container
      );
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      // verify order
      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);

      expect(spyInner.getCall(0).args[0].outerHTML).toEqual(
        "<div><span>dfg</span></div>"
      );
      expect(spyInnerSecond.getCall(0).args[0].outerHTML).toEqual(
        "<span>dfg</span>"
      );

      expect(container.innerHTML).toEqual(
        "<div><div><span>abc</span><div><span>dfg</span></div></div></div>"
      );
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      // UNMOUNT INNER DIVS
      render(
        <RefParent bool={true} inner={false} innersecond={false} />,
        container
      );
      notCalled(spyOuter);
      calledOnce(spyInner);
      calledOnce(spyInnerSecond);
      // verify order
      spyInnerSecond.calledBefore(spyInner);
      spyInner.calledBefore(spyOuter);

      expect(spyInner.getCall(0).args[0]).toEqual(null);
      expect(spyInnerSecond.getCall(0).args[0]).toEqual(null);

      expect(container.innerHTML).toEqual(
        "<div><div><span>abc</span></div></div>"
      );
      spyOuter.reset();
      spyInner.reset();
      spyInnerSecond.reset();

      // Inner and InnerSecond divs are now unmounted
      // and unmounting parent should not cause them to unmounted again

      // REPLACE PARENT
      render(
        <RefParent bool={false} inner={false} innersecond={false} />,
        container
      );
      calledOnce(spyOuter);
      notCalled(spyInner);
      notCalled(spyInnerSecond);
      expect(container.innerHTML).toEqual("<div><div>plaindiv</div></div>");
    });
  });

  describe("ES6 Component within functional component", () => {
    it("Should trigger lifecycle events when functional component change", () => {
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
        componentWillUnmount() {
          unmounted = true;
        }

        render() {
          return <div>C</div>;
        }
      }

      render(<A />, container);
      expect(container.innerHTML).toEqual("<div><div>C</div></div>");
      expect(unmounted).toEqual(false);
      render(<B />, container);
      expect(unmounted).toEqual(true);
      expect(container.innerHTML).toEqual("<div><div>C</div></div>");
    });

    it("Should trigger lifecycle events when functional component dont change", () => {
      let unmounted = false;

      function A() {
        return (
          <div>
            <Com />
          </div>
        );
      }

      class Com extends Component {
        componentWillUnmount() {
          unmounted = true;
        }

        render() {
          return <div>C</div>;
        }
      }

      render(<A />, container);
      expect(container.innerHTML).toEqual("<div><div>C</div></div>");
      expect(unmounted).toEqual(false);
      render(<A />, container);
      expect(unmounted).toEqual(false);
      expect(container.innerHTML).toEqual("<div><div>C</div></div>");
    });
  });

  describe("context with hooks", () => {
    it("Should trigger componentWillMount before getting child context", () => {
      class A extends Component {
        constructor(props) {
          super(props);

          this.state = {
            foobar: null
          };
        }

        getChildContext() {
          return {
            foobar: this.state.foobar
          };
        }

        componentWillMount() {
          this.setState({
            foobar: "hey"
          });
        }

        render() {
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

        render() {
          return <span>{this.context.foobar}</span>;
        }
      }

      render(<A />, container);

      expect(container.innerHTML).toEqual("<div><span>hey</span></div>");
    });
  });

  describe("ref", () => {
    it("Should trigger lifecycle hooks when parent changes", () => {
      const spy1 = sinon.spy();
      const spy2 = sinon.spy();
      const spy3 = sinon.spy();
      const spy4 = sinon.spy();
      const spy5 = sinon.spy();

      class A extends Component {
        render() {
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
        componentWillMount() {
          this.setState({
            foo: "bar"
          });
        }
        render() {
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
        componentWillMount() {
          this.setState({
            foo: "1"
          });
        }
        render() {
          return <div ref={spy4}>5</div>;
        }
      }

      render(<A />, container);
      expect(spy5.callCount).toBe(1);

      render(<B />, container);

      expect(spy5.callCount).toBe(2); // mount + unmount

      expect(spy1.callCount).toBe(1);
      expect(spy2.callCount).toBe(1);
      expect(spy3.callCount).toBe(1);
      expect(spy4.callCount).toBe(2); // 2 refs
    });

    // it('Should trigger lifecycle hooks when parent changes #2', (done) => {
    // 	const spy1 = sinon.spy();
    // 	const spy2 = sinon.spy();
    // 	const spy3 = sinon.spy();
    // 	const spy4 = sinon.spy();
    // 	const spy5 = sinon.spy();
    //
    // 	class A extends Component {
    // 		render() {
    // 			return (
    // 				<div>
    // 					<div ref={spy5}>
    // 						<span>1</span>
    // 						<span>1</span>
    // 					</div>
    // 				</div>
    // 			);
    // 		}
    // 	}
    //
    // 	class B extends Component {
    // 		componentWillMount() {
    // 			this.setState({
    // 				a: 2
    // 			});
    // 		}
    // 		render() {
    // 			return (
    // 				<div>
    // 					<div ref={spy1}></div>
    // 					<Child changeCallback={this.props.callback} />
    // 					<div ref={() => this.setState({ a: 1 })}></div>
    // 					{this.state.a === 1 ? <div ref={spy2}></div> : null}
    // 					<div></div>
    // 					<Child ref={spy3}/>
    // 				</div>
    // 			);
    // 		}
    // 	}
    //
    // 	let called = false;
    //
    // 	class Child extends Component {
    // 		componentWillMount() {
    // 			this.setState({
    // 				foo: '1'
    // 			});
    // 		}
    //
    // 		componentWillReceiveProps() {
    // 			if (!called) {
    // 				called = true;
    //
    // 				this.props.changeCallback();
    // 			}
    // 		}
    //
    // 		render() {
    // 			return <div ref={spy4}>5</div>;
    // 		}
    // 	}
    //
    // 	class Parent extends Component {
    // 		constructor(p, c) {
    // 			super(p, c);
    //
    // 			this.change = () => {
    // 				this.setState({ a: 1 });
    // 			};
    // 		}
    // 		render() {
    // 			return (
    // 				<div>
    // 					{this.props.bool ? <A /> : <B callback={this.change}/>}
    // 				</div>
    // 			);
    // 		}
    // 	}
    //
    // 	render(<Parent bool={true}/>, container);
    // 	expect(spy5.callCount).toEqual(1);
    // 	render(<Parent bool={false}/>, container);
    //
    // 	setTimeout(function () {
    // 		expect(spy5.callCount).toEqual(2); // mount + unmount
    //
    // 		expect(spy1.callCount).toEqual(1);
    // 		expect(spy2.callCount).toEqual(0);
    // 		expect(spy3.callCount).toEqual(1);
    // 		expect(spy4.callCount).toEqual(1); // 2 refs
    //
    // 		setTimeout(function () {
    // 			done();
    // 		}, 10);
    // 	}, 10);
    // });
  });
});
