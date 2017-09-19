import { render } from "inferno";
import { innerHTML } from "inferno-utils";
import { MemoryRouter, Link, NavLink } from "inferno-router";

describe('NavLink', () => {
  let node;

  beforeEach(function() {
    node = document.createElement("div");
    document.body.appendChild(node);
  });

  afterEach(function() {
    render(null, node);
    document.body.removeChild(node);
  });

  describe('When a <NavLink> is active', () => {
    it('applies its default activeClassName', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to='/pizza'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).toEqual('active')
    })

    it('applies its passed activeClassName', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to='/pizza' activeClassName='selected'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).toEqual('selected')
    })

    it('applies its activeStyle', () => {
      const defaultStyle = { color: 'black' }
      const activeStyle = { color: 'red' }

      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink
            to='/pizza'
            style={defaultStyle}
            activeStyle={activeStyle}
          >
            Pizza!
          </NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.style.color).toBe(activeStyle.color)
    })
  })

  describe('When a <NavLink> is not active', () => {
    it('does not apply its default activeClassName', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to='/salad' activeClassName='selected'>Salad?</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
    })

    it('does not apply its passed activeClassName', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to='/salad' activeClassName='selected'>Salad?</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).not.toContain('selected')
    })

    it('does not apply its activeStyle', () => {
      const defaultStyle = { color: 'black' }
      const activeStyle = { color: 'red' }

      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink
            to='/salad'
            style={defaultStyle}
            activeStyle={activeStyle}
          >
            Salad?
          </NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.style.color).toBe(defaultStyle.color)
    })
  })

  describe('isActive', () => {
    it('applies active default props when isActive returns true', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink
            to='/pizza'
            isActive={() => true}
          >
            Pizza!
          </NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).toEqual('active')
    })

    it('applies active passed props when isActive returns true', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink
            to='/pizza'
            activeClassName="selected"
            isActive={() => true}
          >
            Pizza!
          </NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).toEqual('selected')
    })

    it('does not apply active default props when isActive returns false', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink
            to='/pizza'
            isActive={() => false}
          >
            Pizza!
          </NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
    })

    it('does not apply active passed props when isActive returns false', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink
            to='/pizza'
            activeClassName="selected"
            isActive={() => false}
          >
            Pizza!
          </NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).not.toContain('selected')
    })
  })

  describe('exact', () => {
    it('does not do exact matching by default', () => {
      render((
        <MemoryRouter initialEntries={['/pizza/anchovies']}>
          <NavLink to='/pizza' activeClassName='active'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).toEqual('active')
    })

    it('sets active default value only for exact matches', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink exact to='/pizza'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).toEqual('active')
    })

    it('sets active passed value only for exact matches', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink exact to='/pizza' activeClassName="selected">Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).toEqual('selected')
    })

    it('does not set active default value for partial matches', () => {
      render((
        <MemoryRouter initialEntries={['/pizza/anchovies']}>
          <NavLink exact to='/pizza'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
    })

    it('does not set active passed value for partial matches', () => {
      render((
        <MemoryRouter initialEntries={['/pizza/anchovies']}>
          <NavLink exact to='/pizza' activeClassName='selected'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).not.toContain('selected')
    })
  })

  describe('strict (enforce path\'s trailing slash)', () => {
    const PATH = '/pizza/'
    it('does not do strict matching by default', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to={PATH}>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).toEqual('active')
    })

    it('does not set active default value when location.pathname has no trailing slash', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink strict to={PATH}>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
    })

    it('does not set active passed value when location.pathname has no trailing slash', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink strict to={PATH} activeClassName='selected'>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).not.toContain('selected')
    })

    it('sets active default value when pathname has trailing slash', () => {
      render((
        <MemoryRouter initialEntries={['/pizza/']}>
          <NavLink strict to={PATH}>Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).toEqual('active')
    })

    it('sets active passed value when pathname has trailing slash', () => {
      render((
        <MemoryRouter initialEntries={['/pizza/']}>
          <NavLink strict to={PATH} activeClassName="selected">Pizza!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]

      expect(a.className).not.toContain('active')
      expect(a.className).toEqual('selected')
    })
  })

  describe('location property', () => {
    it('overrides the current location', () => {
      render((
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to='/pasta' activeClassName='selected' location={{pathname: '/pasta'}}>Pasta!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).toContain('selected')
    })

    it('is not overwritten by the current location', () => {
      render((
        <MemoryRouter initialEntries={['/pasta']}>
          <NavLink to='/pasta' activeClassName='selected' location={{pathname: '/pizza'}}>Pasta!</NavLink>
        </MemoryRouter>
      ), node)
      const a = node.getElementsByTagName('a')[0]
      expect(a.className).not.toContain('active')
      expect(a.className).not.toContain('selected')
    })
  })
})
