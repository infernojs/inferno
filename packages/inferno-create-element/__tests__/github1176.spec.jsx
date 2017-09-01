import { render } from "inferno";
import Component from "inferno-component";
import { Router, Route, Link } from "inferno-router";
import createMemoryHistory from "history/createMemoryHistory";
import { triggerEvent } from "inferno-utils";

describe("Github1176", () => {
  let container;
  const browserHistory = createMemoryHistory();

  beforeEach(function() {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = "";
    document.body.removeChild(container);
  });

  it("Should not crash", done => {
    const Loader = () => <div className="loader">Loader...</div>;

    class Component1 extends Component {
      render() {
        return (
          <div className="component1">
            Component 1 <br />
            <Link id="com2" to="/component2">
              Link to component 2
            </Link>
          </div>
        );
      }
    }

    class Component2 extends Component {
      constructor(props) {
        super(props);

        this.state = {
          loading: true
        };
      }

      componentDidMount() {
        setTimeout(() => {
          this.setState({
            loading: false
          });
        }, 10);
      }

      clearApp() {
        render(null, container);
      }

      render() {
        if (this.state.loading) {
          return <Loader />;
        }

        return (
          <div className="component2">
            Component 2 <br />
            <span id="clear" onClick={this.clearApp}>
              clear app
            </span>
          </div>
        );
      }
    }

    const routes = (
      <Router history={browserHistory}>
        <Route component={Component1} path="/" />
        <Route component={Component2} path="/component2" />
      </Router>
    );

    render(routes, container);

    expect(container.querySelectorAll(".component1").length).toBe(1);
    const div2 = container.querySelector("#com2");
    triggerEvent("click", div2);

    setTimeout(() => {
      expect(container.querySelectorAll(".component1").length).toBe(0);
      expect(container.querySelectorAll(".component2").length).toBe(1);

      const clear = container.querySelector("#clear");
      clear.click();

      expect(container.innerHTML).toBe("");
      expect(container.querySelectorAll(".component2").length).toBe(0);
      expect(container.querySelectorAll(".component1").length).toBe(0);
      done();
    }, 25);
  });
});
