import { render } from 'inferno-compat';
import { innerHTML } from 'inferno-utils';

describe('Compat - styles', () => {
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

  it('Should be possible to use camelCase styles when reactStyles support is on', () => {
    render(<div style={{ backgroundColor: 'red' }}>Test</div>, container);

    expect(innerHTML(container.innerHTML)).toBe(innerHTML(`<div style="background-color: red;">Test</div>`));
  });

  it('Should automatically add px suffix to whitelisted numeric style properties', () => {
    render(<div style={{ width: 10, zIndex: 1 }}>foo</div>, container);

    expect(innerHTML(container.innerHTML)).toBe(innerHTML(`<div style="width: 10px; z-index: 1;">foo</div>`));
  });

  it('Should be possible to use hyphen case props too', () => {
    render(<div style={{ 'background-color': 'blue', 'z-index': 3 }}>foo</div>, container);

    expect(container.firstChild.style.backgroundColor).toBe('blue');
    expect(container.firstChild.style.zIndex + '').toBe('3');
  });
});
