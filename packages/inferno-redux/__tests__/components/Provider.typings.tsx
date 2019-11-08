import { AnyAction, createStore } from 'redux';

import { render } from 'inferno';
import { Provider } from 'inferno-redux';

describe('Component typings', () => {
  // Basic app state for typing reducer arguments.
  interface AppState {
    posts?: string[];
  }

  let container: Element;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    render(null, container);
    document.body.removeChild(container);
  });

  it('should accept store with default action type', () => {
    const rootReducer = (state: AppState = {}, _: AnyAction) => {
      return state;
    };

    const store = createStore(rootReducer);

    render(<Provider store={store}></Provider>, container);
    expect(container.innerHTML).toBe('');
  });

  it('should accept store with custom action type', () => {
    // Some custom action interfaces
    interface FetchPostsAction {
      type: 'FETCH_ACTION';
      data: string;
    }

    interface ReceivePostsAction {
      type: 'RECEIVE_ACTION';
      data: string;
    }

    type MyAction = FetchPostsAction | ReceivePostsAction;

    const rootReducer = (state: AppState = {}, _: MyAction) => state;
    const store = createStore(rootReducer);

    render(<Provider store={store}></Provider>, container);
    expect(container.innerHTML).toBe('');
  });

  it('should accept children', () => {
    const HelloComponent = () => <p>Hello my friends!</p>;

    const store = createStore(() => ({}));

    render(
      <Provider store={store}>
        <h1>Hello Page</h1>
        <HelloComponent />
        <p>Another greetings!</p>
      </Provider>,
      container
    );
    expect(container.innerHTML).toBe('<h1>Hello Page</h1><p>Hello my friends!</p><p>Another greetings!</p>');
  });
});
