import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { BrowserRouter } from "inferno-router";

describe("BrowserRouter (jsx)", () => {
  it('puts history on context.router', () => {
    const node = document.createElement('div')
    let history
    const ContextChecker = (props, context) => {
      history = context.router.history
      return null
    }

    render((
      <BrowserRouter>
        <ContextChecker/>
      </BrowserRouter>
    ), node);

    expect(typeof history).toBe('object')
  })

  it('warns when passed a history prop', () => {
    const node = document.createElement('div')
    const history = {}

    spyOn(console, 'warn')

    render((
      <BrowserRouter history={history}/>
    ), node)

    expect(console.warn).toHaveBeenCalledTimes(1)

    // browser only?
    expect(console.warn.calls.mostRecent().args[0]).toContain('<BrowserRouter> ignores the history prop')

    // node only?
    //expect(console.warn).toHaveBeenCalledWith(
    //  expect.stringContaining('<BrowserRouter> ignores the history prop')
    //)
  })
});
