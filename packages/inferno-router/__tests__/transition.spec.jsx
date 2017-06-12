import createMemoryHistory from "history/createMemoryHistory";
import { render } from "inferno";
import Component from "inferno-component";
import { innerHTML } from "inferno-utils";
import { IndexRoute, Link, Redirect, Route, Router } from "inferno-router";

const browserHistory = createMemoryHistory();

function GoodComponent(props) {
  return <div>Good Component{props.clone}</div>;
}

function BadComponent(props) {
  return <div>Bad Component{props.clone}</div>;
}

describe("Router (jsx) #transitions", () => {
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

  it("should fail when `history` is not provided", () => {
    expect(() => render(<Router />, container)).toThrowError(TypeError);
  });

  // Unfinished test
  it("should have routeTo() method", () => {
    expect(Router.prototype.routeTo).toBeDefined();
  });

  it("should use onEnter hook", done => {
    const TestHooksEnter = () => <div>...</div>;

    // noinspection JSUnusedLocalSymbols
    function onEnter({ props, router }) {
      router.push("/enter");
      expect(typeof props).toBe("object");
      expect(typeof router).toBe("object");
      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>onLeave</div>"));
        done();
      });
    }

    render(
      <Router history={browserHistory}>
        <Route path="/" onEnter={onEnter} component={TestHooksEnter} />
        <Route path="/enter" component={() => <div>onLeave</div>} />
      </Router>,
      container
    );
  });

  it("IndexRoute should use onLeave hook", done => {
    class TestHooksLeave extends Component {
      componentDidMount() {
        this.context.router.push("/leave");
      }

      render() {
        return <div>...</div>;
      }
    }

    const onLeave = ({ props, router }) => {
      expect(typeof props).toBe("object");
      expect(typeof router).toBe("object");
      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>onLeave</div>"));
        done();
      });
    };

    render(
      <Router history={browserHistory}>
        <IndexRoute onLeave={onLeave} component={TestHooksLeave} />
        <Route path="/leave" component={() => <div>onLeave</div>} />
      </Router>,
      container
    );
  });

  it("Route should use onLeave hook", done => {
    class TestHooksLeave extends Component {
      componentDidMount() {
        this.context.router.push("/leave");
      }

      render() {
        return <div>...</div>;
      }
    }

    const onLeave = ({ props, router }) => {
      expect(typeof props).toBe("object");
      expect(typeof router).toBe("object");
      requestAnimationFrame(() => {
        expect(container.innerHTML).toBe(innerHTML("<div>onLeave</div>"));
        done();
      });
    };

    render(
      <Router history={browserHistory}>
        <Route path="/" onLeave={onLeave} component={TestHooksLeave} />
        <Route path="/leave" component={() => <div>onLeave</div>} />
      </Router>,
      container
    );
  });

  it("should route correctly using context router object", done => {
    class TestRouting extends Component {
      componentDidMount() {
        this.context.router.push("/final");
      }

      render() {
        return <div>...</div>;
      }
    }

    render(
      <Router history={browserHistory}>
        <Route path="/" component={TestRouting} />
        <Route path="/final" component={() => <div>Done</div>} />
      </Router>,
      container
    );

    setTimeout(() => {
      expect(container.innerHTML).toBe(innerHTML("<div>Done</div>"));
      done();
    }, 10);
  });

  it("should Redirect", done => {
    render(
      <Router history={browserHistory}>
        <Redirect from="/" to="/final" />
        <Route path="/final" component={() => <div>Done</div>} />
      </Router>,
      container
    );

    setTimeout(() => {
      expect(container.innerHTML).toBe(innerHTML("<div>Done</div>"));
      done();
    }, 10);
  });

  it("should use the correct child when transitioning", done => {
    const Layout = ({ children }) =>
      <div>
        <Link to={"/foo/two"}>Go</Link>
        {children}
      </div>;

    render(
      <Router url={"/foo/bar"} history={browserHistory}>
        <Route component={Layout}>
          <Route path={"/foo/bar"} component={BadComponent} />
          <Route path={"/foo/two"} component={GoodComponent} />
        </Route>
      </Router>,
      container
    );
    expect(container.innerHTML).toBe(
      innerHTML('<div><a href="/foo/two">Go</a><div>Bad Component</div></div>')
    );

    const link = container.querySelector("a");
    clickOnLink(link);

    setTimeout(() => {
      expect(container.innerHTML).toBe(
        innerHTML(
          '<div><a href="/foo/two">Go</a><div>Good Component</div></div>'
        )
      );
      done();
    }, 10);
  });

  it("should not use empty hooks", () => {
    class TestHooksLeave extends Component {
      render() {
        return <div>...</div>;
      }
    }

    render(
      <Router history={browserHistory}>
        <Route
          path="/"
          onEnter={null}
          onLeave={null}
          component={TestHooksLeave}
        />
      </Router>,
      container
    );
  });

  it("should support getComponent as an alternative to the component prop", done => {
    const resolveToComponent = (nextState, cb) => cb(null, GoodComponent);

    render(
      <Router history={browserHistory}>
        <Route path={"/"} getComponent={resolveToComponent} />
      </Router>,
      container
    );

    setTimeout(() => {
      expect(container.innerHTML).toBe(innerHTML("<div>Good Component</div>"));
      done();
    }, 10);
  });

  it("should passed query parameters when URL is changed by using the history API", done => {
    const TestQueryParams = ({ params }) =>
      <div>Query Params {params.foo}</div>;

    render(
      <Router history={browserHistory}>
        <IndexRoute component={TestQueryParams} />
      </Router>,
      container
    );

    browserHistory.push("/?foo=Bar");

    setTimeout(() => {
      expect(container.innerHTML).toBe(
        innerHTML("<div>Query Params Bar</div>")
      );
      done();
    }, 10);
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
