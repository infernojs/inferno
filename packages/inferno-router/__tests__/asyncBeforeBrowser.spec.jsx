import { createMemoryHistory } from "history";
import { render } from "inferno";
import Component from "inferno-component";
import { innerHTML } from "inferno-utils";
import {
  IndexRoute,
  Link,
  Route,
  Router,
  match,
  doAllAsyncBefore
} from "inferno-router";

const browserHistory = createMemoryHistory();

var dataStore = {};

class PageOne extends Component {
  static fetchData(params) {
    return new Promise(function(resolve, reject) {
      setTimeout(() => {
        dataStore["pageOne"] = "data page one";
        resolve();
      }, 0);
    });
  }

  render() {
    return <div>Page One <span>{dataStore.pageOne}</span></div>;
  }
}

class PageTwo extends Component {
  static fetchData(params) {
    // console.log('Fetch Data PageTwo');
    return new Promise(function(resolve, reject) {
      setTimeout(() => {
        dataStore["pageTwo"] = "data page two";
        resolve();
      }, 0);
    });
  }

  render() {
    return (
      <div>Page Two <span>{dataStore.pageTwo}</span>{this.props.children}</div>
    );
  }
}

class PageNoData extends Component {
  static fetchData(params) {
    return new Promise(function(resolve, reject) {
      setTimeout(() => {
        resolve();
      }, 0);
    });
  }

  render() {
    return <div>Page No Data</div>;
  }
}

class PageNoAsync extends Component {
  render() {
    return <div>Page No Async</div>;
  }
}

class Section extends Component {
  static fetchData(params) {
    return new Promise(function(resolve, reject) {
      setTimeout(() => {
        dataStore["section"] = "data section";
        resolve();
      }, 0);
    });
  }

  render() {
    return <div>Section <span>{dataStore.section}</span></div>;
  }
}

describe("Router (jsx) asyncBefore", () => {
  describe("with browser rendering", () => {
    let container;

    beforeEach(function() {
      dataStore = {};
      browserHistory.push("/");
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(function() {
      render(null, container);
      document.body.removeChild(container);
    });

    it("should resolve single asyncBefore", done => {
      function didEnter() {
        requestAnimationFrame(() => {
          expect(innerHTML(container.innerHTML)).toBe(
            innerHTML("<div>Page One <span>data page one</span></div>")
          );
          done();
        });
      }

      const routes = (
        <Router history={browserHistory}>
          <Route
            key="test"
            path={"/"}
            asyncBefore={PageOne.fetchData}
            onEnter={didEnter}
            component={PageOne}
          />
        </Router>
      );

      // Need to prime the route props with data on first render. With SSR this should be done by hydration
      // so makes sense not to perform automagically in router.
      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        // Then render
        render(routes, container);
      });
    });

    it("should resolve nested asyncBefore", done => {
      function didEnter() {
        requestAnimationFrame(() => {
          expect(innerHTML(container.innerHTML)).toBe(
            innerHTML(
              "<div>Page Two <span>data page two</span><div>Section <span>data section</span></div></div>"
            )
          );
          done();
        });
      }

      const routes = (
        <Router history={browserHistory}>
          <Route path="/" asyncBefore={PageTwo.fetchData} component={PageTwo}>
            <Route
              asyncBefore={Section.fetchData}
              onEnter={didEnter}
              component={Section}
            />
          </Route>
        </Router>
      );

      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        // Then render
        render(routes, container);
      });
    });

    it("should render without asyncBefore provided", done => {
      function didEnter() {
        requestAnimationFrame(() => {
          expect(innerHTML(container.innerHTML)).toBe(
            innerHTML("<div>Page No Async</div>")
          );
          done();
        });
      }

      const routes = (
        <Router history={browserHistory}>
          <Route path="/" component={PageNoAsync} onEnter={didEnter} />
        </Router>
      );

      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        // Then render
        render(routes, container);
      });
    });

    it("should handle navigation", done => {
      class TransientPageOne extends Component {
        static fetchData(params) {
          return new Promise(function(resolve, reject) {
            setTimeout(() => {
              dataStore["pageOne"] = "data page one";
              resolve();
            }, 0);
          });
        }

        componentDidMount() {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              // console.log('push')
              this.context.router.push("/test3");
            });
          });
        }

        render() {
          return <div>Page One <span>{dataStore.pageOne}</span></div>;
        }
      }

      function didEnterOne() {
        // console.log('Step 1.1')
        requestAnimationFrame(() => {
          // console.log('Step 1.2')
          expect(innerHTML(container.innerHTML)).toBe(
            innerHTML("<div>Page One <span>data page one</span></div>")
          );
          // console.log('Step 1.3')
        });
      }

      function didEnterTwo() {
        // console.log('Step 2.1')
        requestAnimationFrame(() => {
          // console.log('Step 2.2')
          expect(innerHTML(container.innerHTML)).toBe(
            innerHTML("<div>Page Two <span>data page two</span></div>")
          );
          // console.log('Step 2.3')
          done();
        });
      }

      const routes = (
        <Router
          history={browserHistory}
          asyncBefore={url => {
            // console.log('Async before...')
            return doAllAsyncBefore(match(routes, url));
          }}
        >
          <Route
            path="/"
            asyncBefore={TransientPageOne.fetchData}
            onEnter={didEnterOne}
            component={TransientPageOne}
          />
          <Route
            path="/test3"
            asyncBefore={PageTwo.fetchData}
            onEnter={didEnterTwo}
            component={PageTwo}
          />
        </Router>
      );

      // Need to prime the route props with data on first render. With SSR this should be done by hydration
      // so makes sense not to perform automagically in router.
      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        // Then render
        render(routes, container);
      });
    });
  });
});
