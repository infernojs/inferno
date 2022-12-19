import { Component, createComponentVNode, Inferno, InfernoNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { invariant, warning } from './utils';
import { matchPath } from './matchPath';
import { combineFrom, isFunction, isUndefined } from 'inferno-shared';
import type { History, Location } from 'history';
import type { TLoader, TLoaderData, TLoaderProps } from './Router';

export interface Match<P extends Record<string, string>> {
  params: P;
  isExact: boolean;
  path: string;
  url: string;
  loader?(props: TLoaderProps<P>): Promise<any>;
  initialData?: TLoaderData;
}

export interface RouteComponentProps<P extends Record<string, string>> {
  match: Match<P>;
  location: Location;
  history: History;
  staticContext?: any;
}

export interface IRouteProps {
  computedMatch?: any; // private, from <Switch>
  path?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  loader?(props: TLoaderProps<any>): Promise<any>;
  component?: Inferno.ComponentClass<any> | ((props: any, context: any) => InfernoNode);
  render?: (props: RouteComponentProps<any>, context: any) => InfernoNode;
  location?: Partial<Location>;
  children?: ((props: RouteComponentProps<any>) => InfernoNode) | InfernoNode;
}

/**
 * The public API for matching a single path and rendering.
 */
type RouteState = {
  match: Match<any>;
  __loaderData__?: TLoaderData;
}

class Route extends Component<Partial<IRouteProps>, RouteState> {
  public getChildContext() {
    const childContext: any = combineFrom(this.context.router, null);

    childContext.route = {
      location: this.props.location || this.context.router.route.location,
      match: this.state!.match,
    };

    return {
      router: childContext
    };
  }

  constructor(props?: any, context?: any) {
    super(props, context);

    const match = this.computeMatch(props, context.router);

    this.state = {
      match,
      __loaderData__: match?.initialData,
    };
  }

  private runLoader(loader: TLoader<any, any>, params, request, match) {
    // TODO: Pass progress callback to loader
    loader({ params, request })
      .then((res) => {
        // TODO: should we parse json?
        this.setState({ match, __loaderData__: { res } });
      })
      .catch((err) => {
        // Loaders should throw errors
        this.setState({ match, __loaderData__: { err } })
      });
  }

  public computeMatch({ computedMatch, ...props }, router): Match<any> {
    if (computedMatch) {
      // <Switch> already computed the match for us
      return computedMatch;
    }

    const { location, path, strict, exact, sensitive, loader } = props;

    if (process.env.NODE_ENV !== 'production') {
      invariant(router, 'You should not use <Route> or withRouter() outside a <Router>');
    }

    const { route, initialData } = router; // This is the parent route
    const pathname = (location || route.location).pathname;

    return path ? matchPath(pathname, { path, strict, exact, sensitive, loader, initialData }) : route.match;
  }

  public componentDidMount(): void {
    const { match, __loaderData__ } = this.state!;
    // QUESTION: Is there a better way to invoke this on/after first render?
    if (!isUndefined(match?.loader) && isUndefined(__loaderData__)) {
      const params = match.params;
      const request = undefined;
      setTimeout(() => this.runLoader(match.loader!, params, request, match), 0);
    }

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
    const match = this.computeMatch(nextProps, nextContext.router);
    // Am I a match? In which case check for loader

    if (nextProps?.loader) {
      const params = match.params;
      const request = undefined;
      this.runLoader(nextProps.loader, params, request, match);
      return;
    }

    this.setState({ match });
  }

  public render() {
    const { match, __loaderData__ } = this.state!;
    const { children, component, render, loader } = this.props;
    const { history, route, staticContext } = this.context.router;
    const location = this.props.location || route.location;
    const props = { match, location, history, staticContext, component, render, loader, __loaderData__ };

    if (component) {
      if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(component)) {
          throw new Error("Inferno error: <Route /> - 'component' property must be prototype of class or functional component, not vNode.");
        }
      }
      return match ? createComponentVNode(VNodeFlags.ComponentUnknown, component, props) : null;
    }

    if (render) {
      // @ts-ignore
      return match ? render(props, this.context) : null;
    }

    if (typeof children === 'function') {
      return (children as Function)(props);
    }

    return children;
  }
}

if (process.env.NODE_ENV !== 'production') {
  Route.prototype.componentWillMount = function () {
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
