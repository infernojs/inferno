import { Component, render } from 'inferno';
import { MemoryRouter, Route, StaticRouter, withRouter } from 'inferno-router';

describe('withRouter', () => {
  let node;

  beforeEach(function () {
    node = document.createElement('div');
    document.body.appendChild(node);
  });

  afterEach(function () {
    render(null, node);
    document.body.removeChild(node);
  });

  it('provides { match, location, history } props', () => {
    const PropsChecker = withRouter((props) => {
      expect(typeof props.match).toBe('object');
      expect(typeof props.location).toBe('object');
      expect(typeof props.history).toBe('object');
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/bubblegum']}>
        <Route path="/bubblegum" render={() => <PropsChecker />} />
      </MemoryRouter>,
      node
    );
  });

  it('provides the parent match as a prop to the wrapped component', () => {
    let parentMatch;
    const PropsChecker = withRouter((props) => {
      expect(props.match).toEqual(parentMatch);
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/bubblegum']}>
        <Route
          path="/:flavor"
          render={({ match }) => {
            parentMatch = match;
            return <PropsChecker />;
          }}
        />
      </MemoryRouter>,
      node
    );
  });

  describe('inside a <StaticRouter>', () => {
    it('provides the staticContext prop', () => {
      const PropsChecker = withRouter((props) => {
        expect(typeof props.staticContext).toBe('object');
        expect(props.staticContext).toBe(context);
        return null;
      });

      const context = {};

      render(
        <StaticRouter context={context}>
          <Route component={PropsChecker} />
        </StaticRouter>,
        node
      );
    });
  });

  it('exposes the wrapped component as WrappedComponent', () => {
    const TestComponent = () => <div />;
    const decorated = withRouter(TestComponent);
    expect(decorated.WrappedComponent).toBe(TestComponent);
  });

  it('exposes the instance of the wrapped component via wrappedComponentRef', () => {
    class WrappedComponent extends Component {
      public render() {
        return null;
      }
    }
    const TestComponent = withRouter(WrappedComponent);

    let ref;
    render(
      <MemoryRouter initialEntries={['/bubblegum']}>
        <Route path="/bubblegum" render={() => <TestComponent wrappedComponentRef={(r) => (ref = r)} />} />
      </MemoryRouter>,
      node
    );

    expect(ref instanceof Component).toBe(true);
  });

  it('hoists non-react statics from the wrapped component', () => {
    class TestComponent extends Component {
      public static hello: string = 'world';

      public static foo() {
        return 'bar';
      }

      public render() {
        return null;
      }
    }

    const decorated = withRouter(TestComponent);

    expect(decorated.hello).toBe('world');
    expect(typeof decorated.foo).toBe('function');
    expect(decorated.foo()).toBe('bar');
  });
});
