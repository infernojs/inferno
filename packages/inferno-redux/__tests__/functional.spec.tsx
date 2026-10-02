import { render } from 'inferno';
import { connect } from 'inferno-redux';
import { type Action, createStore, type Dispatch } from 'redux';

describe('Inferno - redux -specifics', () => {
  let container: HTMLDivElement;

  interface AppendAction extends Action<string> {
    payload?: string;
  }

  const stringBuilder = (prev = '', action: AppendAction) =>
    action.type === 'APPEND' ? prev + action.payload : prev;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    document.body.removeChild(container);
  });

  describe('Functional component connect', () => {
    it('Should be possible to define lifecycle events', () => {
      const store = createStore(stringBuilder);
      let mountedCalled = 0;

      function FunctionalComponent() {
        return <div>Hello world</div>;
      }

      const Container = connect(
        () => ({}),
        (dispatch: Dispatch<AppendAction>) => ({
          dispatch,
          ref: {
            onComponentDidMount() {
              mountedCalled++;
            },
          },
        }),
      )(FunctionalComponent);

      const div = document.createElement('div');

      render(<Container store={store} />, div);

      expect(mountedCalled).toBe(1);

      expect(div.innerHTML).toBe('<div>Hello world</div>');
      store.dispatch({ type: 'APPEND', payload: 'a' });

      render(<Container store={store} />, div);

      expect(div.innerHTML).toBe('<div>Hello world</div>');
      expect(mountedCalled).toBe(1);
    });

    it('Should be possible to define default lifecycle events', () => {
      const store = createStore(stringBuilder);
      let mountedCalled = 0;
      let updateCounter = 0;

      interface FunctionalComponentProps {
        name: string;
      }

      function FunctionalComponent(props: FunctionalComponentProps) {
        return <div>Hello {props.name}!</div>;
      }

      FunctionalComponent.defaultHooks = {
        onComponentWillUpdate() {
          updateCounter++;
        },
      };

      const Container = connect(
        () => ({}),
        (dispatch: Dispatch<AppendAction>) => ({
          dispatch,
          ref: {
            onComponentDidMount() {
              mountedCalled++;
            },
          },
        }),
      )(FunctionalComponent);

      const div = document.createElement('div');

      render(<Container name="Inferno" store={store} />, div);

      expect(updateCounter).toBe(0);
      expect(mountedCalled).toBe(1);

      expect(div.innerHTML).toBe('<div>Hello Inferno!</div>');

      store.dispatch({ type: 'APPEND', payload: 'a' });

      render(<Container name="Inferno1" store={store} />, div);
      expect(div.innerHTML).toBe('<div>Hello Inferno1!</div>');
      expect(updateCounter).toBe(1);
      expect(mountedCalled).toBe(1);
    });
  });
});
