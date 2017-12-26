import { render } from 'inferno';
import { innerHTML, triggerEvent } from 'inferno-utils';
import { HashRouter, Link, MemoryRouter } from 'inferno-router';

describe('Link (jsx)', () => {
  let node;
  beforeEach(function() {
    node = document.createElement('div');
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
    };
    render(
      <MemoryRouter>
        <Link to={location}>link</Link>
      </MemoryRouter>,
      node
    );

    const href = node.querySelector('a').getAttribute('href');

    expect(href).toEqual('/the/path?the=query#the-hash');
  });

  it('throws with no <Router>', () => {
    expect(() => {
      render(<Link to="/">link</Link>, node);
    }).toThrowError(/You should not use <Link> outside a <Router>/);
  });

  it('exposes its ref via an innerRef prop', done => {
    const node = document.createElement('div');
    const refCallback = n => {
      expect(n.tagName).toEqual('A');
      done();
    };

    render(
      <MemoryRouter>
        <Link to="/" innerRef={refCallback}>
          link
        </Link>
      </MemoryRouter>,
      node
    );

    expect(node.textContent).toEqual('link');
  });
});

describe('A <Link> underneath a <HashRouter>', () => {
  let node;
  beforeEach(function() {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(function() {
    render(null, node);
    document.body.removeChild(node);
  });

  const createLinkNode = (hashType, to) => {
    render(
      <HashRouter hashType={hashType}>
        <Link to={to} />
      </HashRouter>,
      node
    );

    return node.querySelector('a');
  };

  describe('with the "slash" hashType', () => {
    it('has the correct href', () => {
      const linkNode = createLinkNode('slash', '/foo');
      expect(linkNode.getAttribute('href')).toEqual('#/foo');
    });

    it('has the correct href with a leading slash if it is missing', () => {
      const linkNode = createLinkNode('slash', 'foo');
      expect(linkNode.getAttribute('href')).toEqual('#/foo');
    });
  });

  describe('with the "hashbang" hashType', () => {
    it('has the correct href', () => {
      const linkNode = createLinkNode('hashbang', '/foo');
      expect(linkNode.getAttribute('href')).toEqual('#!/foo');
    });

    it('has the correct href with a leading slash if it is missing', () => {
      const linkNode = createLinkNode('hashbang', 'foo');
      expect(linkNode.getAttribute('href')).toEqual('#!/foo');
    });
  });

  describe('with the "noslash" hashType', () => {
    it('has the correct href', () => {
      const linkNode = createLinkNode('noslash', 'foo');
      expect(linkNode.getAttribute('href')).toEqual('#foo');
    });

    it('has the correct href and removes the leading slash', () => {
      const linkNode = createLinkNode('noslash', '/foo');
      expect(linkNode.getAttribute('href')).toEqual('#foo');
    });
  });
});
