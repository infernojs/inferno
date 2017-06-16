import { createMemoryHistory } from "history";
import { render } from "inferno";
import Component from "inferno-component";
import InfernoServer from "inferno-server";
import createElement from "inferno-create-element";
import { innerHTML } from "inferno-utils";
import {
  IndexRoute,
  Link,
  Route,
  Router,
  RouterContext,
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
  beforeEach(function() {
    dataStore = {};
  });

  describe("with	SSR", () => {
    it("should resolve single asyncBefore", done => {
      const routes = (
        <Router history={browserHistory}>
          <Route path="/" asyncBefore={PageOne.fetchData} component={PageOne} />
        </Router>
      );

      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        const html = InfernoServer.renderToString(
          createElement(RouterContext, renderProps)
        );
        expect(html).toBe(
          innerHTML("<div>Page One <span>data page one</span></div>")
        );
        done();
      });
    });

    it("should resolve nested asyncBefore", done => {
      const routes = (
        <Router history={browserHistory}>
          <Route path="/" asyncBefore={PageTwo.fetchData} component={PageTwo}>
            <Route asyncBefore={Section.fetchData} component={Section} />
          </Route>
        </Router>
      );

      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        const html = InfernoServer.renderToString(
          createElement(RouterContext, renderProps)
        );
        expect(html).toBe(
          innerHTML(
            "<div>Page Two <span>data page two</span><div>Section <span>data section</span></div></div>"
          )
        );
        done();
      });
    });

    it("should resolve multiple nested asyncBefore", done => {
      const routes = (
        <Router history={browserHistory}>
          <Route path="/" asyncBefore={PageTwo.fetchData} component={PageTwo}>
            <Route asyncBefore={Section.fetchData} component={Section} />
          </Route>
        </Router>
      );

      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        const html = InfernoServer.renderToString(
          createElement(RouterContext, renderProps)
        );
        expect(html).toBe(
          innerHTML(
            "<div>Page Two <span>data page two</span><div>Section <span>data section</span></div></div>"
          )
        );
        done();
      });
    });

    it("should render without asyncBefore provided", done => {
      const routes = (
        <Router history={browserHistory}>
          <Route path="/" component={PageNoAsync} />
        </Router>
      );

      const renderProps = match(routes, "/");
      doAllAsyncBefore(renderProps).then(() => {
        const html = InfernoServer.renderToString(
          createElement(RouterContext, renderProps)
        );
        expect(html).toBe(innerHTML("<div>Page No Async</div>"));
        done();
      });
    });
  });
});
