import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { MemoryRouter, Link } from "inferno-router";

describe('Link (jsx)', () => {

  let node;
  beforeEach(function() {
    node = document.createElement("div");
    document.body.appendChild(node);
  });

  afterEach(function() {
    render(null, node);
    document.body.removeChild(node);
  });

  it('accepts a location "to" prop', () => {
    const location = {
      pathname: '/the/path',
      search: 'the=query',
      hash: '#the-hash'
    }
    render((
      <MemoryRouter>
        <Link to={location}>link</Link>
      </MemoryRouter>
    ), node)

    const href = node.querySelector('a').getAttribute('href')

    expect(href).toEqual('/the/path?the=query#the-hash')
  })

  it('throws with no <Router>', () => {
    expect(() => {
      render((
        <Link to="/">link</Link>
      ), node)
    }).toThrowError(/You should not use <Link> outside a <Router>/)
  })

  it('exposes its ref via an innerRef prop', done => {
    const node = document.createElement('div')
    const refCallback = n => {
      expect(n.tagName).toEqual('A')
      done()
    }

    render((
      <MemoryRouter>
        <Link to="/" innerRef={refCallback}>link</Link>
      </MemoryRouter>
    ), node)
  })
});
