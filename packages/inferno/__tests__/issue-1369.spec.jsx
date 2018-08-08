import { render, Component } from 'inferno';

describe('static tree as child nodes', () => {
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

  it('Should patch whole tree even when static - Github #1369', () => {
    let renderCounter = 0;

    class Form extends Component {
      handleClick = () => {
        this.forceUpdate();
      };

      static childContextTypes = {};

      getChildContext() {
        return {};
      }

      render() {
        const { children, ...restProps } = this.props;
        return (
          <div {...restProps}>
            <button onClick={this.handleClick}>test</button>
            {children}
          </div>
        );
      }
    }

    class Test extends Component {
      render() {
        renderCounter++;

        return <div>hello test</div>;
      }
    }

    class App extends Component {
      render() {
        return (
          <Form>
            <div>
              <div>
                <Test />
              </div>
            </div>
          </Form>
        );
      }
    }

    render(<App />, container);

    expect(renderCounter).toBe(1);

    const btn = container.querySelector('button');

    btn.click();

    expect(renderCounter).toBe(2);

    btn.click();

    expect(renderCounter).toBe(3);

    btn.click();

    expect(renderCounter).toBe(4);

    btn.click();

    expect(renderCounter).toBe(5);
  });
});
