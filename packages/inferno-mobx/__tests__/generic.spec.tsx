import { Component, render } from 'inferno';
import { observer, Provider } from 'inferno-mobx';

describe('generic higher order components', () => {
  let container: HTMLDivElement;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  it('injects and observes', (done) => {
    const nullthrows = <T,>(x: T | null | undefined): T => {
      if (!x) {
        throw new Error('Unexpected falsy value.');
      }

      return x;
    };

    class ApiService {
      foo: string;

      constructor() {
        this.foo = 'bar';
      }
    }

    class TodoService {
      baz: string;

      constructor() {
        this.baz = 'qux';
      }
    }

    interface IProps {
      apiService?: ApiService | null;
      todoService?: TodoService | null;
    }

    class TodoView extends Component<IProps> {
      render() {
        const { foo } = nullthrows(this.props.apiService);
        const { baz } = nullthrows(this.props.todoService);

        return (
          <p>
            {foo}
            {baz}
          </p>
        );
      }
    }

    const Todo = observer(['apiService', 'todoService'], TodoView);

    const services = {
      apiService: new ApiService(),
      todoService: new TodoService(),
    };

    const A = () => (
      <Provider {...services}>
        <Todo />
      </Provider>
    );

    render(<A />, container);
    expect(container.querySelector('p')!.textContent).toBe('barqux');

    done();
  });
});
