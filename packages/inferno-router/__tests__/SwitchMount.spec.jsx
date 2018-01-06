import { Component, render } from 'inferno';
import { innerHTML } from 'inferno-utils';
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
});
