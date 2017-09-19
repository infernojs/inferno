import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { MemoryRouter, Switch, Route, Redirect } from "inferno-router";

describe("Switch (jsx)", () => {
  it("renders the first <Route> that matches the URL", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).toMatch(/one/);
  });

  it("renders the first <Redirect from> that matches the URL", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/three"]}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Redirect from="/four" to="/one" />
          <Redirect from="/three" to="/two" />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).toMatch(/two/);
  });

  it("does not render a second <Route> or <Redirect> that also matches the URL", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Redirect from="/one" to="/two" />
          <Route path="/one" render={() => <h1>two</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toMatch(/two/);
  });

  it("renders pathless Routes", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/cupcakes"]}>
        <Switch>
          <Route path="/bubblegum" render={() => <div>one</div>} />
          <Route render={() => <div>two</div>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toContain("one");
    expect(node.innerHTML).toContain("two");
  });

  it("handles from-less Redirects", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/cupcakes"]}>
        <Switch>
          <Route path="/bubblegum" render={() => <div>bub</div>} />
          <Redirect to="/bubblegum" />
          <Route path="/cupcakes" render={() => <div>cup</div>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toContain("cup");
    expect(node.innerHTML).toContain("bub");
  });

  it("handles subsequent redirects", (done) => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Redirect exact from="/one" to="/two" />
          <Redirect exact from="/two" to="/three" />

          <Route path="/three" render={() => <div>three</div>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    // Inferno does last iteration async, thats why setTimeout here
    expect(node.innerHTML).toBe("");

    setTimeout(() => {
      expect(node.innerHTML).toContain("three");
      done();
    }, 10);
  });

  it("warns when redirecting to same route, both strings", () => {
    const node = document.createElement("div");
    let redirected = false;
    let done = false;

    spyOn(console, "warn");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route
            path="/one"
            render={() => {
              if (done) return <h1>done</h1>;

              if (!redirected) {
                return <Redirect to="/one" />;
              }
              done = true;

              return <Redirect to="/one" />;
            }}
          />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toContain("done");
    expect(console.warn.calls.count()).toBe(1);
    expect(console.warn.calls.mostRecent().args[0]).toContain("/one");
  });

  it("warns when redirecting to same route, mixed types", () => {
    const node = document.createElement("div");
    let redirected = false;
    let done = false;

    spyOn(console, "warn");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route
            path="/one"
            render={() => {
              if (done) return <h1>done</h1>;

              if (!redirected) {
                redirected = true;
                return <Redirect to="/one" />;
              }
              done = true;

              return <Redirect to={{ pathname: "/one" }} />;
            }}
          />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toContain("done");
    expect(console.warn.calls.count()).toBe(1);
    expect(console.warn.calls.mostRecent().args[0]).toContain("/one");
    //expect(console.warn.calls.argsFor(0)[0]).toMatch(/Warning:.*"\/one"/)
  });

  it("warns when redirecting to same route, mixed types, string with query", () => {
    const node = document.createElement("div");
    let redirected = false;
    let done = false;

    spyOn(console, "warn");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route
            path="/one"
            render={() => {
              if (done) return <h1>done</h1>;

              if (!redirected) {
                redirected = true;
                return <Redirect to="/one?utm=1" />;
              }
              done = true;

              return <Redirect to={{ pathname: "/one", search: "?utm=1" }} />;
            }}
          />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toContain("done");
    expect(console.warn.calls.count()).toBe(1);
    expect(console.warn.calls.mostRecent().args[0]).toContain("/one?utm=1");
    //expect(console.error.calls.argsFor(0)[0]).toMatch(/Warning:.*"\/one\?utm=1"/)
  });

  it("does NOT warn when redirecting to same route with different `search`", d => {
    const node = document.createElement("div");
    let redirected = false;
    let done = false;

    spyOn(console, "warn");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route
            path="/one"
            render={() => {
              if (done) return <h1>done</h1>;

              if (!redirected) {
                redirected = true;
                return <Redirect to={{ pathname: "/one", search: "?utm=1" }} />;
              }
              done = true;

              return <Redirect to={{ pathname: "/one", search: "?utm=2" }} />;
            }}
          />
        </Switch>
      </MemoryRouter>,
      node
    );

    // Inferno does last iteration async, thats why setTimeout here
    expect(node.innerHTML).toBe("");
    expect(console.warn.calls.count()).toBe(0);

    setTimeout(() => {
      expect(node.innerHTML).toContain("done");
      expect(console.warn.calls.count()).toBe(0);
      d();
    }, 10);
  });

  it("handles comments", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/cupcakes"]}>
        <Switch>
          <Route path="/bubblegum" render={() => <div>bub</div>} />
          {/* this is a comment */}
          <Route path="/cupcakes" render={() => <div>cup</div>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).not.toContain("bub");
    expect(node.innerHTML).toContain("cup");
  });

  it("renders with non-element children", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          {false}
          {undefined}
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).toMatch(/one/);
  });

  it("throws with no <Router>", () => {
    const node = document.createElement("div");
    expect(() => {
      render(
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>,
        node
      );
    }).toThrowError(/You should not use <Switch> outside a <Router>/);
  });
});

describe("A <Switch location>", () => {
  it("can use a `location` prop instead of `router.location`", () => {
    const node = document.createElement("div");

    render(
      <MemoryRouter initialEntries={["/one"]}>
        <Switch location={{ pathname: "/two" }}>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>
      </MemoryRouter>,
      node
    );

    expect(node.innerHTML).toMatch(/two/);
  });

  describe("children", () => {
    it("passes location prop to matched <Route>", () => {
      const node = document.createElement("div");

      let propLocation;
      const RouteHoneytrap = props => {
        propLocation = props.location;
        return <Route {...props} />;
      };

      const switchLocation = { pathname: "/two" };
      render(
        <MemoryRouter initialEntries={["/one"]}>
          <Switch location={switchLocation}>
            <Route path="/one" render={() => <h1>one</h1>} />
            <RouteHoneytrap path="/two" render={() => <h1>two</h1>} />
          </Switch>
        </MemoryRouter>,
        node
      );
      expect(propLocation).toEqual(switchLocation);
    });
  });
});
