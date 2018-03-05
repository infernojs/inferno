import { Component, render } from 'inferno';
import { createClass } from 'inferno-create-class';
import { createElement } from 'inferno-create-element';
import { connect } from 'inferno-redux';
import { findRenderedVNodeWithType, Wrapper } from 'inferno-test-utils';
import { createStore } from 'redux';

describe('Inferno - redux -specifics', () => {
  let container;

  const stringBuilder = (prev = '', action) => (action.type === 'APPEND' ? prev + action.payload : prev);

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
        return <div>Hello world</div>
      }

      const Container = connect(() => ({}),
          dispatch => (
            {
              dispatch,
              ref: {
                onComponentDidMount() {
                  debugger;
                  mountedCalled++;
                }
              }
            }
          )
      )(FunctionalComponent);

      const div = document.createElement('div');

      render(
        <Container store={store} />,
        div
      );

      expect(mountedCalled).toBe(1);

      expect(div.innerHTML).toBe('<div>Hello world</div>');
      store.dispatch({ type: 'APPEND', payload: 'a' });

      render(
        <Container store={store} />,
        div
      );

      expect(div.innerHTML).toBe('<div>Hello world</div>');
      expect(mountedCalled).toBe(1);
    });

    it('Should be possible to define default lifecycle events', () => {
      const store = createStore(stringBuilder);
      let mountedCalled = 0;
      let updateCounter = 0;

      function FunctionalComponent(props) {
        return <div>Hello {props.name}!</div>
      }

      FunctionalComponent.defaultHooks = {
        onComponentWillUpdate() {
          updateCounter++;
        }
      };

      const Container = connect(() => ({}),
        dispatch => (
          {
            dispatch,
            ref: {
              onComponentDidMount() {
                mountedCalled++;
              }
            }
          }
        )
      )(FunctionalComponent);

      const div = document.createElement('div');

      render(
        <Container name="Inferno" store={store} />,
        div
      );

      expect(updateCounter).toBe(0);
      expect(mountedCalled).toBe(1);

      expect(div.innerHTML).toBe('<div>Hello Inferno!</div>');

      store.dispatch({ type: 'APPEND', payload: 'a' });

      debugger;
      render(
        <Container name="Inferno1" store={store} />,
        div
      );
      expect(div.innerHTML).toBe('<div>Hello Inferno1!</div>');
      expect(updateCounter).toBe(1);
      expect(mountedCalled).toBe(1);
    });
  })
});
