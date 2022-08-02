import { Component, render } from 'inferno';
import { Route, Router } from 'inferno-router';
import { createMemoryHistory } from 'history';
import { IRouteProps } from '../src/Route';

describe('<Route component>', () => {
  const history = createMemoryHistory();
  const node = document.createElement('div');

  it('receives { history, location, match } props', () => {
    type RouteProps = {
      history: any;
      location: any;
      match: any;
    };
    let actual: RouteProps = {
      history: null,
      location: null,
      match: null
    };
    const ComponentAb = (props: RouteProps) => (actual = props) && null;

    render(
      <Router history={history}>
        <Route path="/" component={ComponentAb} />
      </Router>,
      node
    );

    expect(actual.history).toBe(history);
    expect(typeof actual.match).toBe('object');
    expect(typeof actual.location).toBe('object');
  });

  it('type check props class component', () => {
    class ComponentA extends Component<any, any> {
      public render() {
        return 'foo';
      }
    }

    render(
      <Router history={history}>
        <Route path="/" component={ComponentA} />
      </Router>,
      node
    );
  });

  it('type check props render method', () => {
    class ComponentA extends Component<any, any> {
      public render() {
        return 'foo';
      }
    }

    const props: IRouteProps = {
      component: ComponentA
    };

    const C = props.component!;

    render(
      <Router history={history}>
        <Route path="/" render={(_) => <C {...props} />} />
      </Router>,
      node
    );
  });
});
