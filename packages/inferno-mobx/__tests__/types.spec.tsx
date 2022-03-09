import { Component, render } from 'inferno';
import { Provider } from 'inferno-mobx';
import * as mobx from 'mobx';

describe('top level context', () => {
  let container;

  beforeEach(function () {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function () {
    render(null, container);
    container.innerHTML = '';
    document.body.removeChild(container);
  });

  describe('Rendering types', () => {
    it('Should render SFC', () => {
      // SFC
      const MyComponent = (props) => {
        return <div>{props.children}</div>;
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should be possible to return string from render SFC', () => {
      // SFC
      const MyComponent = () => {
        return 'd';
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should be possible to return number from render SFC', () => {
      // SFC
      const MyComponent = () => {
        return 1;
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should be possible to return null from render SFC', () => {
      // SFC
      const MyComponent = () => {
        return null;
      };

      render(
        <MyComponent />,
        container
      );
    });

    it('Should render Provider', () => {
      class MyComponent extends Component {
        public render() {
          return <div>1</div>;
        }
      }

      const store = mobx.observable({
        todos: [
          {
            completed: false,
            title: 'a'
          }
        ]
      });

      render(
        <Provider store={store}>
          <MyComponent />
        </Provider>,
        container
      );
    });
  });
});
