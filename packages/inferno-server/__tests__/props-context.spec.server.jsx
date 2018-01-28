import { renderToStaticMarkup } from 'inferno-server';
import { Component } from 'inferno';

describe('SSR render() arguments', () => {
  class TestProvider extends Component {
    getChildContext() {
      return { testContext: 'context-works' };
    }
    render({ children }) {
      return children;
    }
  }

  it('should have props as 1st argument', () => {
    class TestChild extends Component {
      render(props) {
        return <p>{props.testProps}</p>;
      }
    }

    const output = renderToStaticMarkup(<TestChild testProps="props-works" />);
    expect(output).toBe('<p>props-works</p>');
  });

  it('should have state as 2nd argument', () => {
    class TestChild extends Component {
      constructor() {
        super();
        this.state = { testState: 'state-works' };
      }
      render(props, state) {
        return <p>{state.testState}</p>;
      }
    }
    const output = renderToStaticMarkup(<TestChild />);
    expect(output).toBe('<p>state-works</p>');
  });

  it('statefull has context as 3rd argument', () => {
    class TestChild extends Component {
      render(props, state, context) {
        return <p>{context.testContext}</p>;
      }
    }

    const output = renderToStaticMarkup(
      <TestProvider>
        <TestChild />
      </TestProvider>
    );
    expect(output).toBe('<p>context-works</p>');
  });

  it('stateless has context as 2nd argument', () => {
    function TestChild(props, context) {
      return <p>{context.testContext}</p>;
    }

    const output = renderToStaticMarkup(
      <TestProvider>
        <TestChild />
      </TestProvider>
    );
    expect(output).toBe('<p>context-works</p>');
  });

  it('nested stateless has context as 2nd argument', () => {
    function ChildWrapper(props, context) {
      return props.children;
    }
    function TestChild(props, context) {
      return <p>{context.testContext}</p>;
    }
    const output = renderToStaticMarkup(
      <TestProvider>
        <ChildWrapper>
          <ChildWrapper>
            <TestChild />
          </ChildWrapper>
        </ChildWrapper>
      </TestProvider>
    );
    expect(output).toBe('<p>context-works</p>');
  });

  it('nested providers should have merged context', () => {
    class TestContext extends Component {
      getChildContext() {
        return { testContextWrap: 'context-wrap-works' };
      }
      render({ children }) {
        return children;
      }
    }
    function TestChild(props, context) {
      return (
        <p>
          {context.testContext}|{context.testContextWrap}
        </p>
      );
    }
    const output = renderToStaticMarkup(
      <TestProvider>
        <TestContext>
          <TestChild />
        </TestContext>
      </TestProvider>
    );
    expect(output).toBe('<p>context-works<!---->|<!---->context-wrap-works</p>');
  });
});
