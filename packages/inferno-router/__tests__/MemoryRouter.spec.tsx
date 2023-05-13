import { render } from 'inferno';
import { Link, MemoryRouter, Route, Switch } from 'inferno-router';

describe('A <MemoryRouter>', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('puts history on context.router', () => {
    let history;
    const ContextChecker = (_props, context) => {
      history = context.router.history;
      return null;
    };

    ContextChecker.contextTypes = {
      router: () => {}
    };

    const node = document.createElement('div');

    render(
      <MemoryRouter>
        <ContextChecker />
      </MemoryRouter>,
      node
    );

    expect(typeof history).toBe('object');
  });

  it('warns when passed a history prop', () => {
    const history = {};
    const node = document.createElement('div');

    const consoleSpy = spyOn(console, 'error');

    // @ts-ignore
    render(<MemoryRouter history={history} />, node);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.calls.argsFor(0)[0]).toContain('<MemoryRouter> ignores the history prop');
  });

  it('Should be possible to render multiple sub routes, Github #1360', () => {
    function Home() {
      return <h1>You are in home!</h1>;
    }

    function Test() {
      return <h1>You are in test route!</h1>;
    }

    function TestOne() {
      return <h1>You are in test-1 route!</h1>;
    }

    render(
      <MemoryRouter>
        <div>Header</div>
        <Route path="/:lang">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/test" component={Test} />
            <Route path="/test-1" component={TestOne} />
          </Switch>
        </Route>
        <ul>
          <li>
            <Link to="/test">Home</Link>
          </li>
        </ul>
        <div>Footer</div>
      </MemoryRouter>,
      container
    );

    expect(container.innerHTML).toBe('<div>Header</div><h1>You are in home!</h1><ul><li><a href="/test">Home</a></li></ul><div>Footer</div>');

    container.querySelector('a').click();

    expect(container.innerHTML).toBe('<div>Header</div><h1>You are in test route!</h1><ul><li><a href="/test">Home</a></li></ul><div>Footer</div>');
  });
});
