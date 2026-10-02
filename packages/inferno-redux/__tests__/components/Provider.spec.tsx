import { Component, type InfernoNode, render, type VNode } from 'inferno';
import { createElement } from 'inferno-create-element';
import { connect, Provider } from 'inferno-redux';
import { findRenderedVNodeWithType } from 'inferno-test-utils';
import { type Action, createStore, type Store } from 'redux';
import { VNodeFlags } from 'inferno-vnode-flags';

describe('inferno-redux Provider', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    render(null, container);
    document.body.removeChild(container);
  });

  function renderIntoContainer(vNode: VNode): InfernoNode | void {
    render(vNode, container);

    if (vNode && vNode.flags & VNodeFlags.Component) {
      return vNode.children;
    }
  }

  describe('Provider', () => {
    class Child extends Component {
      render() {
        return createElement('div', {});
      }
    }

    it('should add the store to the child context', () => {
      const store1 = createStore(() => ({}));
      const store2 = createStore(() => ({}));

      spyOn(console, 'error');

      let tree = renderIntoContainer(
        createElement(Provider, { store: store1 }, createElement(Child, {})),
      );
      expect(console.error).toHaveBeenCalledTimes(0);

      let child = findRenderedVNodeWithType(tree, Child).children as Child;
      expect(child.context.store).toBe(store1);

      tree = renderIntoContainer(
        createElement(
          Provider,
          { store: store1 },
          createElement(Provider, { store: store2 }, createElement(Child, {})),
        ),
      );

      expect(console.error).toHaveBeenCalledTimes(0);

      child = findRenderedVNodeWithType(tree, Child).children as Child;
      expect(child.context.store).toBe(store2);
    });

    it('should warn once when receiving a new store in props', () => {
      const store1 = createStore((state: number = 10) => state + 1);
      const store2 = createStore((state: number = 10) => state * 2);
      const store3 = createStore((state: number = 10) => state * state);

      interface ProviderContainerState {
        store: Store<number>;
      }

      class ProviderContainer extends Component<
        object,
        ProviderContainerState
      > {
        state: ProviderContainerState;

        constructor() {
          super();
          this.state = { store: store1 };
        }

        render() {
          return (
            <Provider store={this.state.store}>
              <Child />
            </Provider>
          );
        }
      }

      const vNode = <ProviderContainer />;
      const container = renderIntoContainer(vNode) as ProviderContainer;
      const child = findRenderedVNodeWithType(container, Child)
        .children as Child;
      expect(child.context.store.getState()).toEqual(11);

      spyOn(console, 'error');
      container.setState({ store: store2 });
      renderIntoContainer(vNode);

      expect(child.context.store.getState()).toEqual(11);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        '<Provider> does not support changing `store` on the fly.',
      );

      container.setState({ store: store3 });
      renderIntoContainer(vNode);

      expect(child.context.store.getState()).toEqual(11);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it('should handle subscriptions correctly when there is nested Providers', () => {
      type DebugStore = Store<number, Action<string>> & {
        __store_name__?: string;
      };

      const reducer1 = (state = 2, action: Action<string>) =>
        action.type === 'INC' ? state + 1 : state;
      const reducer2 = (state = 5, action: Action<string>) =>
        action.type === 'INC' ? state + 2 : state;

      const innerStore: DebugStore = createStore(reducer1);
      innerStore.__store_name__ = 'innerStore'; // for debugging
      // @ts-expect-error createSpy takes a spy name, the function is never called
      const innerMapStateToProps = jasmine.createSpy((state: number) => ({
        count: state,
      }));

      interface InnerProps {
        count: number;
      }

      const Inner = connect(innerMapStateToProps)(
        class Inner extends Component<InnerProps> {
          render() {
            return <div>{this.props.count}</div>;
          }
        },
      );

      const outerStore: DebugStore = createStore(reducer2);
      outerStore.__store_name__ = 'outerStore'; // for debugging
      const Outer = connect((state: number) => ({ count: state }))(
        class Outer extends Component {
          render() {
            return (
              <Provider store={innerStore}>
                <Inner />
              </Provider>
            );
          }
        },
      );

      renderIntoContainer(
        <Provider store={outerStore}>
          <Outer />
        </Provider>,
      );
      expect(innerMapStateToProps.calls.count()).toEqual(1);

      innerStore.dispatch({ type: 'INC' });
      expect(innerMapStateToProps.calls.count()).toEqual(2);
    });

    it('should pass state consistently to mapState', () => {
      interface AppendAction extends Action<string> {
        payload?: string;
      }

      const stringBuilder = (prev = '', action: AppendAction) =>
        action.type === 'APPEND' ? prev + action.payload : prev;

      const store = createStore(stringBuilder);

      store.dispatch({ type: 'APPEND', payload: 'a' });
      let childMapStateInvokes = 0;

      interface ChildContainerProps {
        parentState: string;
      }

      const ChildContainer = connect(
        (state: string, parentProps: ChildContainerProps) => {
          childMapStateInvokes++;
          // The state from parent props should always be consistent with the current state
          expect(state).toBe(parentProps.parentState);
          return {};
        },
      )(
        class ChildContainer extends Component {
          render() {
            return <div />;
          }
        },
      );

      interface ContainerProps {
        state: string;
      }

      // Instance of the component class created by connect()
      interface ConnectInstance<W> extends Component {
        getWrappedInstance(): W;
      }

      interface WrappedContainer {
        button: HTMLButtonElement | null;
      }

      const Container = connect((state: string) => ({ state }), null, null, {
        withRef: true,
      })(
        class Container
          extends Component<ContainerProps>
          implements WrappedContainer
        {
          button: HTMLButtonElement | null;

          emitChange() {
            store.dispatch({ type: 'APPEND', payload: 'b' });
          }

          render() {
            // NOTE: This should really be onClick not onclick. More bugs in inferno event delegation?
            return (
              <div>
                <button
                  ref={(btn) => {
                    this.button = btn;
                  }}
                  onClick={this.emitChange.bind(this)}
                >
                  change
                </button>
                <ChildContainer parentState={this.props.state} />
              </div>
            );
          }
        },
      );

      const vNode = (
        <Provider store={store}>
          <Container />
        </Provider>
      );
      const tree = renderIntoContainer(vNode);

      expect(childMapStateInvokes).toEqual(1);

      // The store state stays consistent when setState calls are batched
      store.dispatch({ type: 'APPEND', payload: 'c' });
      renderIntoContainer(vNode);
      expect(childMapStateInvokes).toEqual(2);

      // setState calls DOM handlers are batched
      const container = findRenderedVNodeWithType(tree, Container)
        .children as ConnectInstance<WrappedContainer>;
      const node = container.getWrappedInstance().button!;
      node.click();
      renderIntoContainer(vNode);
      expect(childMapStateInvokes).toEqual(3);

      // Provider uses unstable_batchedUpdates() under the hood
      store.dispatch({ type: 'APPEND', payload: 'd' });
      renderIntoContainer(vNode);
      expect(childMapStateInvokes).toEqual(4);
    });
  });
});
