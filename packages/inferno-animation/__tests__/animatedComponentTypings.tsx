import { type InfernoNode, render } from 'inferno';
import { AnimatedComponent } from 'inferno-animation';

describe('inferno-animation AnimatedComponent', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
  });

  it('Should be possible to define typed props for AnimatedComponent', () => {
    interface MyProps {
      number: number;
    }

    class MyComponent extends AnimatedComponent<MyProps, any> {
      public render(props): InfernoNode {
        return <div>{props.number}</div>;
      }
    }

    render(<MyComponent number={1} />, container);

    expect(container.innerHTML).toBe('<div>1</div>');
  });
});
