import { type InfernoNode, render } from 'inferno';
import { AnimatedComponent } from 'inferno-animation';

describe('inferno-animation AnimatedComponent typings', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function (done) {
    render(null, container);
    function finish() {
      if (container.firstChild) {
        setTimeout(finish, 5);
      } else {
        container.remove();
        done();
      }
    }
    finish();
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

    expect(container.firstChild.tagName).toBe('DIV');
    expect(container.textContent).toBe('1');
  });
});
