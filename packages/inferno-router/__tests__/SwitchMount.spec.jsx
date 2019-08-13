import { Component, render } from 'inferno';
import { Route, Router, Switch } from 'inferno-router';
import createHistory from 'history/createMemoryHistory';

describe('A <Switch>', () => {
  it('does not remount a <Route>', () => {
    const node = document.createElement('div');

    let mountCount = 0;

    class App extends Component {
      componentWillMount() {
        mountCount++;
      }

      render() {
        return <div />;
      }
    }

    const history = createHistory({
      initialEntries: ['/one']
    });

    render(
      <Router history={history}>
        <Switch>
          <Route path="/one" component={App} />
          <Route path="/two" component={App} />
        </Switch>
      </Router>,
      node
    );

    expect(mountCount).toBe(1);

    history.push('/two');

    expect(mountCount).toBe(1);
    history.push('/one');

    expect(mountCount).toBe(1);
  });

  it('Should be possible to have multiple children in Route', () => {
    const node = document.createElement('div');

    let mountCount = 0;

    class App extends Component {
      componentWillMount() {
        mountCount++;
      }

      render() {
        return <div />;
      }
    }

    function Foobar() {
      return <span>Okay</span>;
    }

    const history = createHistory({
      initialEntries: ['/one']
    });

    render(
      <Router history={history}>
        <Switch>
          <Route path="/one">
            <App />
            <App />
            <div>Test</div>
          </Route>
          <Route path="/two">
            <Foobar />
          </Route>
        </Switch>
      </Router>,
      node
    );

    expect(node.innerHTML).toBe('<div></div><div></div><div>Test</div>');

    history.push('/two');

    expect(node.innerHTML).toBe('<span>Okay</span>');

    history.push('/one');

    expect(node.innerHTML).toBe('<div></div><div></div><div>Test</div>');
  });
});
