import { Component, render, rerender } from 'inferno';
import { MemoryRouter, Prompt, Route, StaticRouter } from 'inferno-router';

describe('A <Prompt>', () => {
  it('ask if sure to transition', () => {
    const context = {};
    const node = document.createElement('div');

    expect(() => {
      render(
        <StaticRouter context={context}>
          <Prompt when={true} message="this is only a test" />
        </StaticRouter>,
        node,
      );
    }).not.toThrow();

    expect(() => {
      render(
        <StaticRouter context={context}>
          <Prompt when={false} message="this is only a test" />
        </StaticRouter>,
        node,
      );
    }).not.toThrow();

    expect(() => {
      render(
        <StaticRouter context={context}>
          <Prompt when={true} message="this is only a test" />
        </StaticRouter>,
        node,
      );
    }).not.toThrow();
  });

  it('blocks transition', () => {
    const context = {};
    const node = document.createElement('div');
    let promptWhen;

    class App extends Component {
      private ref: any;
      public state: any;

      constructor() {
        super();
        this.state = { when: true };
        promptWhen = this._setActive = this._setActive.bind(this);
      }

      private _setActive() {
        this.setState({
          when: false,
        });
      }

      public componentWillUpdate(_nextProps, nextState) {
        expect(this.ref.unblock).toBeTruthy();
        expect(this.state.when).toBe(true);
        expect(nextState.when).toBe(false);
      }

      public componentDidUpdate() {
        expect(this.ref.unblock).toBeFalsy();
      }

      public render() {
        return (
          <Prompt
            when={this.state.when}
            message="this is only a test"
            ref={(c) => (this.ref = c)}
          />
        );
      }
    }

    render(
      <StaticRouter context={context}>
        <App />
      </StaticRouter>,
      node,
    );

    promptWhen();

    render(null, node);
  });

  it('keeps blocking transitions after a confirmed one while it is rendered', () => {
    const node = document.createElement('div');
    const confirm = spyOn(window, 'confirm').and.returnValue(true);
    let history;

    function HistoryCatcher(_props, context) {
      history = context.router.history;
      return null;
    }

    render(
      <MemoryRouter initialEntries={['/a']}>
        <div>
          <HistoryCatcher />
          <Prompt when={true} message="Leave?" />
        </div>
      </MemoryRouter>,
      node,
    );

    history.push('/b');
    rerender();
    history.push('/c');
    rerender();
    history.push('/d');
    rerender();

    expect(confirm).toHaveBeenCalledTimes(3);
    expect(history.location.pathname).toBe('/d');

    render(null, node);
  });

  it('stops blocking when a confirmed transition unmounts it', () => {
    const node = document.createElement('div');
    const confirm = spyOn(window, 'confirm').and.returnValue(true);
    let history;

    function HistoryCatcher(_props, context) {
      history = context.router.history;
      return null;
    }

    render(
      <MemoryRouter initialEntries={['/a']}>
        <div>
          <HistoryCatcher />
          <Route
            path="/a"
            render={() => <Prompt when={true} message="Leave?" />}
          />
        </div>
      </MemoryRouter>,
      node,
    );

    history.push('/b');
    rerender();
    history.push('/c');
    rerender();

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(history.location.pathname).toBe('/c');

    render(null, node);
  });

  it('throws when used outside Router', () => {
    const node = document.createElement('div');

    expect(() => {
      // @ts-expect-error
      render(<Prompt />, node);
    }).toThrow();
  });
});
