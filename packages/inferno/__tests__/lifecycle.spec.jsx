import { render, Component } from 'inferno';

describe('ComponentDidUpdate', () => {
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

  it('Should be called after ref updates, Github #1374 Github#1286', () => {
    class App extends Component {
      state = {
        toggled: false
      };

      toggleDynamicComponent = () =>
        this.setState({
          toggled: !this.state.toggled
        });

      renderDynamicComponent = () => (
        <div
          id="dynamic"
          ref={el => {
            this.dynamicEl = el;
          }}
        >
          <p>Dynamic component!</p>
        </div>
      );

      componentDidUpdate = () => {
        const dynamic = container.querySelector('#dynamic');

        expect(this.dynamicEl).toBe(dynamic);
        if (this.state.toggled) {
          expect(dynamic).not.toBeNull();
        } else {
          expect(dynamic).toBeNull();
        }

        expect(this.staticEl).toBe(container.querySelector('#static'));
      };

      render = () => (
        <div
          id="static"
          ref={el => {
            this.staticEl = el;
          }}
        >
          {this.state.toggled && this.renderDynamicComponent()}
          <button onClick={this.toggleDynamicComponent}>Toggle dynamic component</button>
        </div>
      );
    }

    render(<App />, container);

    const button = container.querySelector('button');

    button.click();
    button.click();
    button.click();
    button.click();
  });
});
