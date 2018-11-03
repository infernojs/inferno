import { render } from 'inferno';
import { innerHTML, triggerEvent } from 'inferno-utils';
import { Link, MemoryRouter } from 'inferno-router';
import sinon from 'sinon';

// These tests are not part of RR4 but it seems to be like they should pass
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

  it('should trigger when clicked', () => {
    let history;
    const ContextChecker = (props, context) => {
      history = context.router.history;
      return props.children;
    };

    render(
      <div>
        <MemoryRouter>
          <ContextChecker>
            <Link to="/clicked">link</Link>
          </ContextChecker>
        </MemoryRouter>
      </div>,
      node
    );

    const element = node.querySelector('a');
    triggerEvent('click', element);
    expect(history.location.pathname).toBe('/clicked');
  });

  it('should trigger custom onClick', () => {
    const spy = sinon.spy();

    render(
      <MemoryRouter>
        <Link to="/" onClick={spy}>
          link
        </Link>
      </MemoryRouter>,
      node
    );
    expect(spy.callCount).toBe(0);
    const element = node.querySelector('a');
    triggerEvent('click', element);
    expect(spy.callCount).toBe(1);
  });
});
