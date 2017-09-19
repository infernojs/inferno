import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { MemoryRouter, Router, Route } from "inferno-router";
import createMemoryHistory from 'history/createMemoryHistory'

describe('A <Route>', () => {
  it('renders at the root', () => {
    const TEXT = 'Mrs. Kato'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/" render={() => (
          <h1>{TEXT}</h1>
        )}/>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('does not render when it does not match', () => {
    const TEXT = 'bubblegum'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/bunnies' ]}>
        <Route path="/flowers" render={() => (
          <h1>{TEXT}</h1>
        )}/>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).not.toContain(TEXT)
  })

  it('can use a `location` prop instead of `context.router.route.location`', () => {
    const TEXT = 'tamarind chutney'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/mint' ]}>
        <Route
          location={{ pathname: '/tamarind' }}
          path="/tamarind"
          render={() => (
            <h1>{TEXT}</h1>
          )}
        />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('supports preact by nulling out children prop when empty array is passed', () => {
    const TEXT = 'Mrs. Kato'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/" render={() => (
          <h1>{TEXT}</h1>
        )}>
          {[]}
        </Route>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('matches using nextContext when updating', () => {
    const node = document.createElement('div')

    let push
    render((
      <MemoryRouter initialEntries={[ '/sushi/california' ]}>
        <Route path="/sushi/:roll" render={({ history, match }) => {
          push = history.push
          return <div>{match.url}</div>
        }}/>
      </MemoryRouter>
    ), node)
    push('/sushi/spicy-tuna')
    expect(node.innerHTML).toContain('/sushi/spicy-tuna')
  })

  it('throws with no <Router>', () => {
    const node = document.createElement('div')

    expect(() => {
      render((
        <Route path="/" render={() => null} />
      ), node)
    }).toThrow(/You should not use <Route> or withRouter\(\) outside a <Router>/)
  })
})

describe('A <Route> with dynamic segments in the path', () => {
  it('decodes them', () => {
    const node = document.createElement('div')
    render((
      <MemoryRouter initialEntries={[ '/a%20dynamic%20segment' ]}>
        <Route path="/:id" render={({ match }) => <div>{match.params.id}</div>} />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain('a dynamic segment')
  })
})

describe('A unicode <Route>', () => {
  it('is able to match', () => {
    const node = document.createElement('div')
    render((
      <MemoryRouter initialEntries={[ '/パス名' ]}>
        <Route path="/パス名" render={({ match }) => <div>{match.url}</div>} />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain('/パス名')
  })
})

describe('<Route render>', () => {
  const history = createMemoryHistory()
  const node = document.createElement('div')

  it('renders its return value', () => {
    const TEXT = 'Mrs. Kato'
    const node = document.createElement('div')
    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/" render={() => <div>{TEXT}</div>} />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('receives { match, location, history } props', () => {
    let actual = null

    render((
      <Router history={history}>
        <Route path="/" render={props => (actual = props) && null}/>
      </Router>
    ), node)

    expect(actual.history).toBe(history)
    expect(typeof actual.match).toBe('object')
    expect(typeof actual.location).toBe('object')
  })
})

describe('<Route component>', () => {
  const history = createMemoryHistory()
  const node = document.createElement('div')

  it('renders the component', () => {
    const TEXT = 'Mrs. Kato'
    const node = document.createElement('div')
    const Home = () => <div>{TEXT}</div>
    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/" component={Home} />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('receives { match, location, history } props', () => {
    let actual = null
    const Component = (props) => (actual = props) && null

    render((
      <Router history={history}>
        <Route path="/" component={Component}/>
      </Router>
    ), node)

    expect(actual.history).toBe(history)
    expect(typeof actual.match).toBe('object')
    expect(typeof actual.location).toBe('object')
  })
})

describe('<Route children>', () => {
  const history = createMemoryHistory()
  const node = document.createElement('div')

  it('renders a function', () => {
    const TEXT = 'Mrs. Kato'
    const node = document.createElement('div')
    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/" children={() => <div>{TEXT}</div>} />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('renders a child element', () => {
    const TEXT = 'Mrs. Kato'
    const node = document.createElement('div')
    render((
      <MemoryRouter initialEntries={[ '/' ]}>
        <Route path="/">
          <div>{TEXT}</div>
        </Route>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('receives { match, location, history } props', () => {
    let actual = null

    render((
      <Router history={history}>
        <Route path="/" children={props => (actual = props) && null}/>
      </Router>
    ), node)

    expect(actual.history).toBe(history)
    expect(typeof actual.match).toBe('object')
    expect(typeof actual.location).toBe('object')
  })
})

describe('A <Route exact>', () => {
  it('renders when the URL does not have a trailing slash', () => {
    const TEXT = 'bubblegum'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/somepath/' ]}>
        <Route exact path="/somepath" render={() => (
          <h1>{TEXT}</h1>
        )}/>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  it('renders when the URL has trailing slash', () => {
    const TEXT = 'bubblegum'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/somepath' ]}>
        <Route exact path="/somepath/" render={() => (
          <h1>{TEXT}</h1>
        )}/>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })
})

describe('A <Route exact strict>', () => {
  it('does not render when the URL has a trailing slash', () => {
    const TEXT = 'bubblegum'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/somepath/' ]}>
        <Route exact strict path="/somepath" render={() => (
          <h1>{TEXT}</h1>
        )}/>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).not.toContain(TEXT)
  })

  it('does not render when the URL does not have a trailing slash', () => {
    const TEXT = 'bubblegum'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/somepath' ]}>
        <Route exact strict path="/somepath/" render={() => (
          <h1>{TEXT}</h1>
        )}/>
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).not.toContain(TEXT)
  })
})

describe('A <Route location>', () => {
  it('can use a `location` prop instead of `router.location`', () => {
    const TEXT = 'tamarind chutney'
    const node = document.createElement('div')

    render((
      <MemoryRouter initialEntries={[ '/mint' ]}>
        <Route
          location={{ pathname: '/tamarind' }}
          path="/tamarind"
          render={() => (
            <h1>{TEXT}</h1>
          )}
        />
      </MemoryRouter>
    ), node)

    expect(node.innerHTML).toContain(TEXT)
  })

  describe('children', () => {
    it('uses parent\'s prop location', () => {
      const TEXT = 'cheddar pretzel'
      const node = document.createElement('div')

      render((
        <MemoryRouter initialEntries={[ '/popcorn' ]}>
          <Route
            location={{ pathname: '/pretzels/cheddar' }}
            path="/pretzels"
            render={() => (
              <Route path='/pretzels/cheddar' render={() => (
                <h1>{TEXT}</h1>
              )} />
            )}
          />
        </MemoryRouter>
      ), node)

      expect(node.innerHTML).toContain(TEXT)
    })

    it('continues to use parent\'s prop location after navigation', () => {
      const TEXT = 'cheddar pretzel'
      const node = document.createElement('div')
      let push
      render((
        <MemoryRouter initialEntries={[ '/popcorn' ]}>
          <Route
            location={{ pathname: '/pretzels/cheddar' }}
            path="/pretzels"
            render={({ history }) => {
              push = history.push
              return (
                <Route path='/pretzels/cheddar' render={() => (
                  <h1>{TEXT}</h1>
                )} />
              )
            }}
          />
        </MemoryRouter>
      ), node)
      expect(node.innerHTML).toContain(TEXT)
      push('/chips')
      expect(node.innerHTML).toContain(TEXT)
    })
  })
})
