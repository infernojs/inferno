import { render } from 'inferno';
import { BrowserRouter } from 'inferno-router';

describe('BrowserRouter (jsx)', () => {
  it('puts history on context.router', () => {
    const node = document.createElement('div');
    let history;
    const ContextChecker = (props, context) => {
      props;
      history = context.router.history;
      return null;
    };

    render(
      <BrowserRouter>
        <ContextChecker />
      </BrowserRouter>,
      node
    );

    expect(typeof history).toBe('object');
  });

  it('warns when passed a history prop', () => {
    const node = document.createElement('div');
    const history = {};

    spyOn(console, 'error');

    // @ts-ignore
    render(<BrowserRouter history={history} />, node);

    expect(console.error).toHaveBeenCalledTimes(1);

    // browser only?
    expect((console.error as any).calls.argsFor(0)[0]).toContain('<BrowserRouter> ignores the history prop');

    // node only?
    //expect(console.error).toHaveBeenCalledWith(
    //  expect.stringContaining('<BrowserRouter> ignores the history prop')
    //)
  });
});
