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

  it('should have props as 1st argument', async () => {
    interface TestChildProps {
      testProps: string
    }

    class TestChild extends Component<TestChildProps> {
      render(props) {
        return <p>{props.testProps}</p>;
      }
    }

    const output = await renderToStaticMarkup(<TestChild testProps="props-works" />);
    expect(output).toBe('<p>props-works</p>');
  });

  it('should have state as 2nd argument', async () => {
    class TestChild extends Component {

      constructor() {
        super();
        this.state = { testState: 'state-works' };
      }

      render(_props, state) {
        return <p>{state.testState}</p>;
      }
    }
    const output = await renderToStaticMarkup(<TestChild />);
    expect(output).toBe('<p>state-works</p>');
  });

  it('statefull has context as 3rd argument', async () => {
    class TestChild extends Component {
      render(_props, _state, context) {
        return <p>{context.testContext}</p>;
      }
    }

    const output = await renderToStaticMarkup(
      <TestProvider>
        <TestChild />
      </TestProvider>,
    );
    expect(output).toBe('<p>context-works</p>');
  });

  it('stateless has context as 2nd argument', async () => {
    function TestChild(_props, context) {
      return <p>{context.testContext}</p>;
    }

    const output = await renderToStaticMarkup(
      <TestProvider>
        <TestChild />
      </TestProvider>,
    );
    expect(output).toBe('<p>context-works</p>');
  });

  it('nested stateless has context as 2nd argument', async () => {

    function ChildWrapper(props) {
      return props.children;
    }
    function TestChild(_props, context) {
      return <p>{context.testContext}</p>;
    }
    const output = await renderToStaticMarkup(
      <TestProvider>
        <ChildWrapper>
          <ChildWrapper>
            <TestChild />
          </ChildWrapper>
        </ChildWrapper>
      </TestProvider>,
    );
    expect(output).toBe('<p>context-works</p>');
  });

  it('nested providers should have merged context', async () => {
    class TestContext extends Component {
      getChildContext() {
        return { testContextWrap: 'context-wrap-works' };
      }

      render({ children }) {
        return children;
      }
    }
    function TestChild(_props: unknown, context) {
      return (
        <p>
          {context.testContext}|{context.testContextWrap}
        </p>
      );
    }
    const output = await renderToStaticMarkup(
      <TestProvider>
        <TestContext>
          <TestChild />
        </TestContext>
      </TestProvider>,
    );
    expect(output).toBe('<p>context-works|context-wrap-works</p>');
  });
});
