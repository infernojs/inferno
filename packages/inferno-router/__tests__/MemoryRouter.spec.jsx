import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { MemoryRouter } from "inferno-router";

describe('A <MemoryRouter>', () => {
  it('puts history on context.router', () => {
    let history
    const ContextChecker = (props, context) => {
      history = context.router.history
      return null
    }

    ContextChecker.contextTypes = {
      router: () => {}
    }

    const node = document.createElement('div')

    render((
      <MemoryRouter>
        <ContextChecker/>
      </MemoryRouter>
    ), node)

    expect(typeof history).toBe('object')
  })

  it('warns when passed a history prop', () => {
    const history = {}
    const node = document.createElement('div')

    spyOn(console, 'warn')

    render((
      <MemoryRouter history={history} />
    ), node)

    expect(console.warn).toHaveBeenCalledTimes(1)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('<MemoryRouter> ignores the history prop')
    )
  })
})
