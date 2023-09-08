import { Component, render } from 'inferno';
import { Prompt, StaticRouter } from 'inferno-router';

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

  it('throws when used outside Router', () => {
    const node = document.createElement('div');

    expect(() => {
      // @ts-expect-error
      render(<Prompt />, node);
    }).toThrow();
  });
});
