import { Component, render } from 'inferno';
import { Link, Route, Router, Switch } from 'inferno-router';
import createMemoryHistory from 'history/createMemoryHistory';
import { triggerEvent } from 'inferno-utils';

describe('Github1176', () => {
  let container;
  const browserHistory = createMemoryHistory();

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should not crash', done => {
    const Loader = () => <div className="loader">Loader...</div>;

    class Component1 extends Component {
      public render() {
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

    class Component2 extends Component<any, any> {
      constructor(props) {
        super(props);

        this.state = {
          loading: true
        };
      }

      public componentDidMount() {
        setTimeout(() => {
          this.setState({
            loading: false
          });
        }, 10);
      }

      public clearApp() {
        render(null, container);
      }

      public render() {
        if ((this.state as any).loading) {
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

    function Foobar() {
      return <div>Ok</div>
    }

    const routes = (
      <Router history={browserHistory}>
        <Switch>
          <Route component={Component1} path="/" exact />
          <Route component={Component2} path="/component2" exact />
          <Route component={Foobar} path="/component333" exact />
        </Switch>
      </Router>
    );

    render(routes, container);

    expect(container.querySelectorAll('.component1').length).toBe(1);
    const div2 = container.querySelector('#com2');
    triggerEvent('click', div2);

    setTimeout(() => {
      expect(container.querySelectorAll('.component1').length).toBe(0);
      expect(container.querySelectorAll('.component2').length).toBe(1);

      const clear = container.querySelector('#clear');
      clear.click();

      expect(container.innerHTML).toBe('');
      expect(container.querySelectorAll('.component2').length).toBe(0);
      expect(container.querySelectorAll('.component1').length).toBe(0);
      done();
    }, 25);
  });
});
