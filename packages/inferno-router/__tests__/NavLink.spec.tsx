import { createMemoryHistory } from 'history';
import { Component, render } from 'inferno';
import { HashRouter, MemoryRouter, NavLink } from 'inferno-router';

describe('NavLink', () => {
  let node;

  beforeEach(function () {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(function () {
    render(null, node);
    document.body.removeChild(node);
  });

  describe('When a <NavLink> is active', () => {
    it('applies its default activeClassName', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza">Pizza!</NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).toEqual('active');
    });

    it('applies its passed activeClassName', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza" activeClassName="selected">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).toEqual('selected');
    });

    it('applies its activeStyle', () => {
      const defaultStyle = { color: 'black' };
      const activeStyle = { color: 'red' };

      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza" style={defaultStyle} activeStyle={activeStyle}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.style.color).toBe(activeStyle.color);
    });
  });

  describe('When a <NavLink> is not active', () => {
    it('does not apply its default activeClassName', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/salad" activeClassName="selected">
            Salad?
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
    });

    it('does not apply its passed activeClassName', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/salad" activeClassName="selected">
            Salad?
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).not.toContain('selected');
    });

    it('does not apply its activeStyle', () => {
      const defaultStyle = { color: 'black' };
      const activeStyle = { color: 'red' };

      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/salad" style={defaultStyle} activeStyle={activeStyle}>
            Salad?
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.style.color).toBe(defaultStyle.color);
    });
  });

  describe('isActive', () => {
    it('applies active default props when isActive returns true', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza" isActive={() => true}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).toEqual('active');
    });

    it('applies active passed props when isActive returns true', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza" activeClassName="selected" isActive={() => true}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).toEqual('selected');
    });

    it('does not apply active default props when isActive returns false', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza" isActive={() => false}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
    });

    it('does not apply active passed props when isActive returns false', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pizza" activeClassName="selected" isActive={() => false}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).not.toContain('selected');
    });
  });

  it('applies its className when provided as a function', () => {
    render(
      <MemoryRouter initialEntries={['/pizza']}>
        <NavLink to="/pizza" className={(isActive: boolean) => (isActive ? 'active-pizza' : 'chill-pizza')}>
          Pizza!
        </NavLink>
      </MemoryRouter>,
      node
    );

    const a = node.querySelector('a');
    expect(a.className).toContain('active-pizza');
  });

  it('applies its style when provided as a function', () => {
    const defaultStyle = { color: 'black' };
    const activeStyle = { color: 'red' };

    render(
      <MemoryRouter initialEntries={['/pizza']}>
        <NavLink to="/pizza" style={(isActive) => (isActive ? activeStyle : defaultStyle)}>
          Pizza!
        </NavLink>
      </MemoryRouter>,
      node
    );

    const a = node.querySelector('a');
    expect(a.style.color).toBe(activeStyle.color);
  });

  it('applies its className when provided as a function #2', () => {
    render(
      <MemoryRouter initialEntries={['/pizza']}>
        <NavLink to="/salad" className={(isActive) => (isActive ? 'active-salad' : 'chill-salad')}>
          Salad?
        </NavLink>
      </MemoryRouter>,
      node
    );

    const a = node.querySelector('a');
    expect(a.className).toContain('chill-salad');
  });

  it('applies its style when provided as a function', () => {
    const defaultStyle = { color: 'black' };
    const activeStyle = { color: 'red' };

    render(
      <MemoryRouter initialEntries={['/pizza']}>
        <NavLink to="/salad" style={(isActive) => (isActive ? activeStyle : defaultStyle)}>
          Salad?
        </NavLink>
      </MemoryRouter>,
      node
    );

    const a = node.querySelector('a');
    expect(a.style.color).toBe(defaultStyle.color);
  });

  describe('exact', () => {
    it('does not do exact matching by default', () => {
      render(
        <MemoryRouter initialEntries={['/pizza/anchovies']}>
          <NavLink to="/pizza" activeClassName="active">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).toEqual('active');
    });

    it('sets active default value only for exact matches', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink exact to="/pizza">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).toEqual('active');
      expect(a.getAttribute('exact')).toBeNull();
    });

    it('sets active passed value only for exact matches', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink exact to="/pizza" activeClassName="selected">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).toEqual('selected');
    });

    it('does not set active default value for partial matches', () => {
      render(
        <MemoryRouter initialEntries={['/pizza/anchovies']}>
          <NavLink exact to="/pizza">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
    });

    it('does not set active passed value for partial matches', () => {
      render(
        <MemoryRouter initialEntries={['/pizza/anchovies']}>
          <NavLink exact to="/pizza" activeClassName="selected">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).not.toContain('selected');
    });
  });

  describe("strict (enforce path's trailing slash)", () => {
    const PATH = '/pizza/';
    it('does not do strict matching by default', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to={PATH}>Pizza!</NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).toEqual('active');
    });

    it('does not set active default value when location.pathname has no trailing slash', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink strict to={PATH}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
    });

    it('does not set active passed value when location.pathname has no trailing slash', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink strict to={PATH} activeClassName="selected">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).not.toContain('selected');
    });

    it('sets active default value when pathname has trailing slash', () => {
      render(
        <MemoryRouter initialEntries={['/pizza/']}>
          <NavLink strict to={PATH}>
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).toEqual('active');
    });

    it('sets active passed value when pathname has trailing slash', () => {
      render(
        <MemoryRouter initialEntries={['/pizza/']}>
          <NavLink strict to={PATH} activeClassName="selected">
            Pizza!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];

      expect(a.className).not.toContain('active');
      expect(a.className).toEqual('selected');
    });
  });

  describe('location property', () => {
    it('overrides the current location', () => {
      render(
        <MemoryRouter initialEntries={['/pizza']}>
          <NavLink to="/pasta" activeClassName="selected" location={{ pathname: '/pasta' }}>
            Pasta!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).toContain('selected');
    });

    it('is not overwritten by the current location', () => {
      render(
        <MemoryRouter initialEntries={['/pasta']}>
          <NavLink to="/pasta" activeClassName="selected" location={{ pathname: '/pizza' }}>
            Pasta!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.className).not.toContain('active');
      expect(a.className).not.toContain('selected');
      expect(node.textContent).toEqual('Pasta!');
    });
  });

  describe('html link attributes', () => {
    it('accept html link attributes', () => {
      render(
        <MemoryRouter initialEntries={['/pasta']}>
          <NavLink to="/pasta" title="pasta">
            Pasta!
          </NavLink>
        </MemoryRouter>,
        node
      );
      const a = node.getElementsByTagName('a')[0];
      expect(a.title).toEqual('pasta');
    });
  });

  describe('A <NavLink> underneath a <HashRouter>', () => {
    let tmpNode;
    beforeEach(function () {
      tmpNode = document.createElement('div');
      document.body.appendChild(tmpNode);
    });

    afterEach(function () {
      render(null, tmpNode);
      document.body.removeChild(tmpNode);
    });

    const createLinkNode = (to) => {
      render(
        <HashRouter>
          <NavLink to={to} />
        </HashRouter>,
        tmpNode
      );

      return tmpNode.querySelector('a');
    };

    it('has the correct href', () => {
      const linkNode = createLinkNode('/foo');
      expect(linkNode.getAttribute('href')).toEqual('#/foo');
    });

    it('has the correct href #2', () => {
      const linkNode = createLinkNode('foo');
      expect(linkNode.getAttribute('href')).toEqual('#foo');
    });

    it('accepts a string `to` prop', () => {
      const to = '/the/path?the=query#the-hash';

      render(
        <MemoryRouter>
          <NavLink to={to}>link</NavLink>
        </MemoryRouter>,
        tmpNode
      );

      const a = tmpNode.querySelector('a');

      expect(a.getAttribute('href')).toEqual('/the/path?the=query#the-hash');
    });

    it('accepts an object `to` prop', () => {
      const to = {
        hash: '#the-hash',
        key: '1',
        pathname: '/the/path',
        search: 'the=query',
        state: null
      };

      render(
        <MemoryRouter>
          <NavLink to={to}>link</NavLink>
        </MemoryRouter>,
        tmpNode
      );

      const a = tmpNode.querySelector('a');

      expect(a.getAttribute('href')).toEqual('/the/path?the=query#the-hash');
    });

    it('accepts an object `to` prop with state', async () => {
      const memoryHistoryFoo = createMemoryHistory({
        initialEntries: ['/foo']
      });
      memoryHistoryFoo.push = jasmine.createSpy();

      const clickHandler = jasmine.createSpy();

      const to = {
        hash: '#the-hash',
        key: '1',
        pathname: '/the/path',
        search: 'the=query',
        state: { test: 'ok' }
      };

      class ContextChecker extends Component {
        public getChildContext() {
          const { context } = this;
          context.router.history = memoryHistoryFoo;

          return {
            router: context.router
          };
        }

        public render({ children }) {
          return children;
        }
      }

      render(
        <MemoryRouter>
          <ContextChecker>
            <NavLink to={to} onClick={clickHandler}>
              link
            </NavLink>
          </ContextChecker>
        </MemoryRouter>,
        tmpNode
      );

      const a = tmpNode.querySelector('a');
      a.click();

      expect(clickHandler).toHaveBeenCalledTimes(1);
      expect(memoryHistoryFoo.push).toHaveBeenCalledTimes(1);
      const { hash, pathname, search, state } = to;
      expect(memoryHistoryFoo.push).toHaveBeenCalledWith({ hash, pathname, search }, state);
    });
  });
});
