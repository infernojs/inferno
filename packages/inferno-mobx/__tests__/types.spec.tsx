import { render, SFC, Component } from "inferno";
import { Provider } from "inferno-mobx";
import * as mobx from "mobx";


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
      const MyComponent: SFC = (props) => {
        return <div>{props.children}</div> // Error: Property 'children' does not exist on type 'Refs<{}>'.
      };

      render(
        <MyComponent />, // Error: JSX element type 'InfernoNode' is not a constructor function for JSX elements. Type 'string' is not assignable to type 'Element | null'
        container
      );
    });

    it('Should be possible to return void from render SFC', () => {
      // SFC
      const MyComponent: SFC = () => {
        return;
      };

      render(
        <MyComponent />, // Error: JSX element type 'InfernoNode' is not a constructor function for JSX elements. Type 'string' is not assignable to type 'Element | null'
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
    })
  });
});
