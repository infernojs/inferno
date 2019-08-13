// @ts-check

import { render } from 'inferno';
import { Component } from 'inferno-component';
import { inject, observer, Provider } from 'inferno-mobx';

describe('generic higher order components', () => {
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

  it('injects and observes', done => {
    /** @type {<T>(x: T | null | undefined) => T} */
    const nullthrows = (/** @type {any} */ x) => {
      if (!x) {
        throw new Error('Unexpected falsy value.');
      }

      return x;
    };

    class ApiService {
      constructor() {
        this.foo = 'bar';
      }
    }

    class TodoService {
      constructor() {
        this.baz = 'qux';
      }
    }

    /**
     * @typedef IProps
     * @property {ApiService?} [apiService]
     * @property {TodoService?} [todoService]
     *
     * @extends Component<IProps>
     */
    class TodoView extends Component {
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

    let Todo = inject('apiService', 'todoService')(observer(TodoView));

    // Legacy.
    Todo = observer(['apiService', 'todoService'])(TodoView);
    Todo = observer(['apiService', 'todoService'], TodoView);

    const services = {
      apiService: new ApiService(),
      todoService: new TodoService()
    };

    const A = () => (
      <Provider {...services}>
        <Todo />
      </Provider>
    );

    render(<A />, container);
    expect(container.querySelector('p').textContent).toBe('barqux');

    done();
  });
});
