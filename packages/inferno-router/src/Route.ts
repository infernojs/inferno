import { Component, createComponentVNode, IComponentConstructor, InfernoNode, SFC } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { invariant, warning } from './utils';
import { matchPath } from './matchPath';
import * as H from 'history';
import { isFunction, combineFrom } from 'inferno-shared';

export interface Match<P> {
  params: P;
  isExact: boolean;
  path: string;
  url: string;
}

export interface RouteComponentProps<P> {
  match: Match<P>;
  location: H.Location;
  history: H.History;
  staticContext?: any;
}

export interface IRouteProps {
  computedMatch?: any; // private, from <Switch>
  path?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  component?: IComponentConstructor<any> | SFC;
  render?: ((props: RouteComponentProps<any>, context: any) => InfernoNode);
  location?: H.Location;
  children?: ((props: RouteComponentProps<any>) => InfernoNode) | InfernoNode;
}

/**
 * The public API for matching a single path and rendering.
 */
class Route extends Component<IRouteProps, any> {
  public getChildContext() {
    const childContext: any = combineFrom(this.context.router);

    childContext.route = {
      location: this.props.location || this.context.router.route.location,
      match: this.state.match
    };

    return {
      router: childContext
    };
  }

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      match: this.computeMatch(props, context.router)
    };
  }

  public computeMatch({ computedMatch, location, path, strict, exact, sensitive }, router) {
    if (computedMatch) {
      // <Switch> already computed the match for us
      return computedMatch;
    }

    if (process.env.NODE_ENV !== 'production') {
      invariant(router, 'You should not use <Route> or withRouter() outside a <Router>');
    }

    const { route } = router;
    const pathname = (location || route.location).pathname;

    return path ? matchPath(pathname, { path, strict, exact, sensitive }) : route.match;
  }

  public componentWillReceiveProps(nextProps, nextContext) {
    if (process.env.NODE_ENV !== 'production') {
      warning(
        !(nextProps.location && !this.props.location),
        '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
      );

      warning(
        !(!nextProps.location && this.props.location),
        '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
      );
    }

    this.setState({
      match: this.computeMatch(nextProps, nextContext.router)
    });
  }

  public render() {
    const { match } = this.state;
    const { children, component, render } = this.props;
    const { history, route, staticContext } = this.context.router;
    const location = this.props.location || route.location;
    const props = { match, location, history, staticContext };

    if (component) {
      if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(component)) {
          throw new Error("Inferno error: <Route /> - 'component' property must be prototype of class or functional component, not vNode.");
        }
      }
      return match ? createComponentVNode(VNodeFlags.ComponentUnknown, component, props) : null;
    }

    if (render) {
      return match ? render(props, this.context) : null;
    }

    if (typeof children === 'function') {
      return (children as Function)(props);
    }

    return children;
  }
}

if (process.env.NODE_ENV !== 'production') {
  Route.prototype.componentWillMount = function() {
    warning(
      !(this.props.component && this.props.render),
      'You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored'
    );

    warning(
      !(this.props.component && this.props.children),
      'You should not use <Route component> and <Route children> in the same route; <Route children> will be ignored'
    );

    warning(
      !(this.props.render && this.props.children),
      'You should not use <Route render> and <Route children> in the same route; <Route children> will be ignored'
    );
  };
}

export { Route };
