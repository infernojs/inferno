import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { MemoryRouter, Switch, Route } from "inferno-router";

describe('Integration Tests', () => {
  it('renders nested matches', () => {
    const node = document.createElement('div')
    const TEXT1 = 'Ms. Tripp'
    const TEXT2 = 'Mrs. Schiffman'
    render((
      <MemoryRouter initialEntries={[ '/nested' ]}>
        <Route path="/" render={() => (
          <div>
            <h1>{TEXT1}</h1>
            <Route path="/nested" render={() => (
              <h2>{TEXT2}</h2>
            )}/>
          </div>
        )}/>
      </MemoryRouter>
    ), node)
    expect(node.innerHTML).toContain(TEXT1)
    expect(node.innerHTML).toContain(TEXT2)
  })

  it('renders only as deep as the matching Route', () => {
    const node = document.createElement('div')
    const TEXT1 = 'Ms. Tripp'
    const TEXT2 = 'Mrs. Schiffman'
    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/" render={() => (
          <div>
            <h1>{TEXT1}</h1>
            <Route path="/nested" render={() => (
              <h2>{TEXT2}</h2>
            )}/>
          </div>
        )}/>
      </MemoryRouter>
    ), node)
    expect(node.innerHTML).toContain(TEXT1)
    expect(node.innerHTML).not.toContain(TEXT2)
  })

  it('renders multiple matching routes', () => {
    const node = document.createElement('div')
    const TEXT1 = 'Mrs. Schiffman'
    const TEXT2 = 'Mrs. Burton'
    render((
      <MemoryRouter initialEntries={[ '/double' ]}>
        <div>
          <aside>
            <Route path="/double" render={() => (
              <h1>{TEXT1}</h1>
            )}/>
          </aside>
          <main>
            <Route path="/double" render={() => (
              <h1>{TEXT2}</h1>
            )}/>
          </main>
        </div>
      </MemoryRouter>
    ), node)
    expect(node.innerHTML).toContain(TEXT1)
    expect(node.innerHTML).toContain(TEXT2)
  })
})
