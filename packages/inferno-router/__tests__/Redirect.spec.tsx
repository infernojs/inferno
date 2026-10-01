import { render, rerender } from 'inferno';
import { MemoryRouter, Redirect, Route, Switch } from 'inferno-router';

describe('Redirect (jsx)', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  afterEach(() => {
    render(null, node);
  });

  it('passes the state of a location object to the new location', () => {
    let location;

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Switch>
          <Route
            path="/login"
            render={(props) => {
              location = props.location;
              return <h1>login</h1>;
            }}
          />
          <Redirect
            from="/private"
            to={{ pathname: '/login', state: { from: '/private' } }}
          />
        </Switch>
      </MemoryRouter>,
      node,
    );
    rerender();

    expect(node.innerHTML).toBe('<h1>login</h1>');
    expect(location.pathname).toBe('/login');
    expect(location.state).toEqual({ from: '/private' });
  });
});
