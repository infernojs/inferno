import { render } from 'inferno';
import { AnimatedComponent } from '../src/AnimatedComponent';

describe('inferno-animation AnimatedComponent', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
  });

  it('should render class component extending AnimatedComponent to a string', () => {
    type MyProps = {
      number: number;
    };

    class MyComponent extends AnimatedComponent<MyProps> {
      public render(props) {
        return <div>{props.number}</div>;
      }
    }

    render(<MyComponent number={1} />, container);

    expect(container.innerHTML).toBe('<div>1</div>');
  });
});
