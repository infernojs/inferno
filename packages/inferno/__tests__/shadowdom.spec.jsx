import { render } from 'inferno';
import sinon from 'sinon';

describe('Shadow DOM', () => {
  let container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('Should propagate events through shadow dom boundaries', () => {
    // Run these tests only in environments which support shadow-dom
    if (!container.attachShadow) {
      return;
    }

    const spyObj = { fn: () => {} };
    const spy1 = sinon.spy(spyObj, 'fn');

    const shadowRoot = container.attachShadow({ mode: 'open' });

    render(<button onClick={spy1}>Log</button>, shadowRoot);

    shadowRoot.querySelector('button').click();

    expect(spy1.callCount).toBe(1);
  });
});