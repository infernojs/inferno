import sinon from "sinon";
import createMemoryHistory from "history/createMemoryHistory";
import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { IndexLink, IndexRoute, Link, Route, Router } from "inferno-router";
const browserHistory = createMemoryHistory();

function TestComponent() {
  return (
    <div>
      <Link to={"/test"}>Link</Link>
      <IndexLink>IndexLink</IndexLink>
    </div>
  );
}

function createRoutes(component) {
  return (
    <Router history={browserHistory}>
      <IndexRoute component={() => component} />
      <Route path={"/test"} component={() => <div>Good</div>} />
    </Router>
  );
}

function showChildren({ children }) {
  return <div>{children}</div>;
}

describe("Router (jsx)", () => {
  let container;

  beforeEach(function() {
    browserHistory.push("/");
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  describe("#Link", () => {
    it("should render with all possible props", () => {
      render(
        createRoutes(
          <Link
            to="/"
            activeClassName="linkActiveClass"
            className="linkClass"
            style={{ color: "red" }}
            activeStyle={{ fontWeight: "bold" }}
            title="TestTitle"
            data-test="DataTest"
          >
            Link
          </Link>
        ),
        container
      );

      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<a class="linkClass linkActiveClass" href="/" style="color: red; font-weight: bold;" title="TestTitle" data-test="DataTest">Link</a>'
        )
      );
    });

    it("should render without active class and style when not the active location", () => {
      render(
        createRoutes(
          <Link
            to="/notactive"
            activeClassName="linkActiveClass"
            className="linkClass"
            style={{ color: "red" }}
            activeStyle={{ fontWeight: "bold" }}
          >
            Link
          </Link>
        ),
        container
      );

      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<a class="linkClass" href="/notactive" style="color: red;">Link</a>'
        )
      );
    });

    it("should render base class and style when active class and style are not defined", () => {
      render(
        createRoutes(
          <Link to="/notactive" className="linkClass" style={{ color: "red" }}>
            Link
          </Link>
        ),
        container
      );

      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<a class="linkClass" href="/notactive" style="color: red;">Link</a>'
        )
      );
    });

    it("should render active class and style even when base class is not defined", () => {
      render(
        createRoutes(
          <Link
            to="/"
            activeClassName="linkActiveClass"
            activeStyle={{ fontWeight: "bold" }}
          >
            Link
          </Link>
        ),
        container
      );

      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<a class="linkActiveClass" href="/" style="font-weight: bold;">Link</a>'
        )
      );
    });

    it("should route on click", done => {
      render(createRoutes(<TestComponent />), container);

      expect(container.innerHTML).toBe(
        innerHTML(
          '<div><a href="/test">Link</a><a href="/">IndexLink</a></div>'
        )
      );

      const link = container.querySelector('a[href="/test"]');
      clickOnLink(link);

      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>Good</div>"));
        done();
      });
    });

    it("should call onClick handler when clicked", () => {
      const obj = {
        fn() {}
      };
      const sinonSpy = sinon.spy(obj, "fn");

      render(
        createRoutes(<Link to="/" onClick={obj.fn}>Link</Link>),
        container
      );

      const link = container.querySelector('a[href="/"]');
      link.onclick({
        button: 0,
        preventDefault() {},
        target: {}
      });

      const calledOnce = sinon.assert.calledOnce;
      calledOnce(sinonSpy);
    });

    it("should not call onClick handler when right clicked", () => {
      const obj = {
        fn() {}
      };
      const sinonSpy = sinon.spy(obj, "fn");

      render(
        createRoutes(<Link to="/" onClick={obj.fn}>Link</Link>),
        container
      );

      const link = container.querySelector('a[href="/"]');
      link.onclick({
        button: 2,
        preventDefault() {},
        target: {}
      });

      const notCalled = sinon.assert.notCalled;
      notCalled(sinonSpy);
    });

    it("should show warning when used without <Router />", () => {
      const sinonSpy = sinon.spy(console, "warn");

      render(<Link to="/">Link</Link>, container);

      sinon.assert.called(sinonSpy);

      sinonSpy.restore();
    });
  });

  describe("#IndexLink", () => {
    it("should render with all possible props", () => {
      render(
        createRoutes(
          <IndexLink
            activeClassName="linkActiveClass"
            className="linkClass"
            activeStyle={{ fontWeight: "bold" }}
          >
            IndexLink
          </IndexLink>
        ),
        container
      );

      expect(innerHTML(container.innerHTML)).toBe(
        innerHTML(
          '<a class="linkClass linkActiveClass" href="/" style="font-weight: bold;">IndexLink</a>'
        )
      );
    });

    it("should route on click", done => {
      render(
        <Router url={"/test"} history={browserHistory}>
          <IndexRoute component={() => <div>Good</div>} />
          <Route path={"/test"} component={() => <TestComponent />} />
        </Router>,
        container
      );

      expect(container.innerHTML).toBe(
        innerHTML(
          '<div><a href="/test">Link</a><a href="/">IndexLink</a></div>'
        )
      );

      const link = container.querySelector('a[href="/"]');
      clickOnLink(link);

      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>Good</div>"));
        done();
      });
    });
  });

  describe("#Route", () => {
    it("should call onEnter when switching route through a click", done => {
      const callbackSpy = sinon.spy();

      render(
        <Router url={"/test"} history={browserHistory}>
          <IndexRoute component={() => <div>Good</div>} onEnter={callbackSpy} />
          <Route path={"/test"} component={() => <TestComponent />} />
        </Router>,
        container
      );

      const link = container.querySelector('a[href="/"]');
      clickOnLink(link);

      requestAnimationFrame(() => {
        expect(callbackSpy.calledOnce).toBe(true);
        done();
      });
    });

    it("shouldn't call onEnter if already on the page the href points to", done => {
      const callbackSpy = sinon.spy();
      render(
        <Router url={"/test"} history={browserHistory}>
          <IndexRoute component={() => <div>Good</div>} />
          <Route
            path={"/test"}
            component={() => <TestComponent />}
            onEnter={() => {
              callbackSpy();
            }}
          />
        </Router>,
        container
      );

      requestAnimationFrame(() => {
        // onEnter should have been called the first time we enter the component
        expect(callbackSpy.callCount).toBe(1);
        const link = container.querySelector('a[href="/test"]');
        clickOnLink(link);
        requestAnimationFrame(() => {
          // But shouldn't be called again when clicking on a link that points to the same location
          // as we are in
          expect(callbackSpy.callCount).toBe(1);
          done();
        });
      });
    });

    it("should pass props and context through onEnter when switching route", done => {
      const callback = sinon.spy();

      render(
        <Router url={"/test"} history={browserHistory}>
          <IndexRoute
            component={() => <div>Good</div>}
            onEnter={callback}
            className="test-class"
          />
          <Route path={"/test"} component={() => <TestComponent />} />
        </Router>,
        container
      );

      const link = container.querySelector('a[href="/"]');
      clickOnLink(link);

      requestAnimationFrame(() => {
        const context = callback.getCall(0).args[0];
        expect(context.props.className).toBe("test-class");
        expect(context.router.url).toBe("/");
        done();
      });
    });

    it("should call getComponent when switching route after click", done => {
      const callback = (context, cb) => {
        cb(null, () => <div>...</div>);
      };

      const spy = sinon.spy(callback);

      render(
        <Router url={"/test"} history={browserHistory}>
          <Route component={showChildren}>
            <IndexRoute getComponent={spy} />
            <Route path={"/test"} component={() => <TestComponent />} />
          </Route>
        </Router>,
        container
      );

      requestAnimationFrame(() => {
        const link = container.querySelector('a[href="/"]');
        clickOnLink(link);
        requestAnimationFrame(() => {
          expect(spy.callCount).toBe(1);
          expect(spy.getCall(0).args[0].props.path).toBe("/");
          expect(spy.getCall(0).args[0].router.url).toBe("/");
          done();
        });
      });
    });

    it("shouldn't call getComponent if already on the page the href points to", done => {
      function callback(context, cb) {
        cb(null, TestComponent);
      }

      const spy = sinon.spy(callback);

      render(
        <Router url={"/test"} history={browserHistory}>
          <IndexRoute component={() => <div>Good</div>} />
          <Route path={"/test"} getComponent={spy} />
        </Router>,
        container
      );

      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(
          '<div><a href="/test">Link</a><a href="/">IndexLink</a></div>'
        );
        expect(spy.getCall(0).args[0].props.path).toBe("/test");
        const link = container.querySelector('a[href="/test"]');
        clickOnLink(link);
        requestAnimationFrame(() => {
          // Should be one because getComponent is called on first render
          expect(spy.callCount).toBe(1);
          done();
        });
      });
    });

    it("should mount the child returned by getComponent after navigating through a click", done => {
      const Test = () => {
        return <div>async component</div>;
      };

      const callback = (context, cb) => {
        cb(null, () => <Test />);
      };

      render(
        <Router url={"/"} history={browserHistory}>
          <Route component={showChildren}>
            <IndexRoute component={() => <TestComponent />} />
            <Route path={"/test"} getComponent={callback} />
          </Route>
        </Router>,
        container
      );

      const link = container.querySelector('a[href="/test"]');
      clickOnLink(link);

      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(
          "<div><div>async component</div></div>"
        );
        done();
      });
    });

    it("should render IndexRoute when root Route without component prop used", () => {
      render(
        <Router history={browserHistory}>
          <Route path="/">
            <IndexRoute component={() => <div>Good</div>} />
            <Route path={"/test"} component={() => <div>Bad</div>} />
          </Route>
        </Router>,
        container
      );

      expect(innerHTML(container.innerHTML)).toBe("<div>Good</div>");
    });

    it("should render /test Route when root Route without component prop used", () => {
      render(
        <Router url={"/test"} history={browserHistory}>
          <Route path="/">
            <IndexRoute component={() => <div>Bad</div>} />
            <Route path={"/test"} component={() => <div>Good</div>} />
          </Route>
        </Router>,
        container
      );

      expect(container.innerHTML).toBe("<div>Good</div>");
    });
  });
});

function clickOnLink(element) {
  if (
    typeof window.__karma__ !== "undefined" ||
    typeof window.mocha !== "undefined"
  ) {
    element.click();
  } else {
    browserHistory.push(element.href);
  }
}
