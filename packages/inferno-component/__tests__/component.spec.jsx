import { render } from 'inferno';
import Component from 'inferno-component';

describe('state', () => {
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

  it('inferno-component should export new component', () => {
    class Foo extends Component {
      render() {
        return '1';
      }
    }

    render(<Foo />, container);

    expect(container.innerHTML).toBe('1');
  });
});
