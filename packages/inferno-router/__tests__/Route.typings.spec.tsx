import { render } from 'inferno';
import { Route, Router } from 'inferno-router';
import createMemoryHistory from 'history/createMemoryHistory';

describe('<Route component>', () => {
  const history = createMemoryHistory();
  const node = document.createElement('div');

  it('receives { history, location, match } props', () => {
    type RouteProps = {
      history: any;
      location: any;
      match: any;
    };
    let actual: RouteProps = {
      history: null,
      location: null,
      match: null
    };
    const Component = (props: RouteProps) => (actual = props) && null;

    render(
      <Router history={history}>
        <Route path="/" component={Component} />
      </Router>,
      node
    );

    expect(actual.history).toBe(history);
    expect(typeof actual.match).toBe('object');
    expect(typeof actual.location).toBe('object');
  });
});
