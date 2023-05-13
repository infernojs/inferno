import { render } from 'inferno';
import { HashRouter } from 'inferno-router';

describe('A <HashRouter>', () => {
  it('puts history on context.router', () => {
    let history;
    const ContextChecker = (_props, context) => {
      history = context.router.history;
      return null;
    };

    const node = document.createElement('div');

    render(
      <HashRouter>
        <ContextChecker />
      </HashRouter>,
      node
    );

    expect(typeof history).toBe('object');
  });

  it('warns when passed a history prop', () => {
    const history = {};
    const node = document.createElement('div');

    const consoleSpy = spyOn(console, 'error');

    // @ts-ignore
    render(<HashRouter history={history} />, node);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy.calls.argsFor(0)[0]).toContain('<HashRouter> ignores the history prop');
  });
});
