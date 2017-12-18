import { render } from 'inferno';
import { innerHTML } from 'inferno-utils';
import { HashRouter } from 'inferno-router';

describe('A <HashRouter>', () => {
  it('puts history on context.router', () => {
    let history;
    const ContextChecker = (props, context) => {
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

    spyOn(console, 'error');

    render(<HashRouter history={history} />, node);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error.calls.mostRecent().args[0]).toContain(
      '<HashRouter> ignores the history prop'
    );
  });
});
