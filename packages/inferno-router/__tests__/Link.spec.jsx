import { render } from 'inferno';
import { HashRouter, Link, MemoryRouter } from 'inferno-router';
import { parsePath } from 'history';

describe('Link (jsx)', () => {
  let node;
  beforeEach(function () {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(function () {
    render(null, node);
    document.body.removeChild(node);
  });

  it('accepts a location "to" prop', () => {
    render(
      <MemoryRouter>
        <Link to={parsePath('/the/path?the=query#the-hash')}>link</Link>
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

  it('exposes its ref via an innerRef prop', (done) => {
    const node = document.createElement('div');
    const refCallback = (n) => {
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
  beforeEach(function () {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(function () {
    render(null, node);
    document.body.removeChild(node);
  });

  const createLinkNode = (to) => {
    render(
      <HashRouter>
        <Link to={to} />
      </HashRouter>,
      node
    );

    return node.querySelector('a');
  };

  it('has the correct href', () => {
    const linkNode = createLinkNode('/foo');
    expect(linkNode.getAttribute('href')).toEqual('#/foo');
  });

  it('has the correct href #2', () => {
    const linkNode = createLinkNode('foo');
    expect(linkNode.getAttribute('href')).toEqual('#foo');
  });
});
