import { Component, createComponentVNode, Inferno, InfernoNode } from 'inferno';
import { VNodeFlags } from 'inferno-vnode-flags';
import { invariant, warning } from './utils';
import { matchPath } from './matchPath';
import { combineFrom, isFunction, isNullOrUndef, isUndefined } from 'inferno-shared';
import type { History, Location } from 'history';
import type { RouterContext, TContextRouter, TLoaderData, TLoaderProps } from './Router';

export interface Match<P extends Record<string, string>> {
  params: P;
  isExact: boolean;
  path: string;
  url: string;
  loader?(props: TLoaderProps<P>): Promise<any>;
  loaderData?: TLoaderData;
}

export interface RouteComponentProps<P extends Record<string, string>> {
  match: Match<P>;
  location: Location;
  history: History;
  staticContext?: any;
}

export interface IRouteProps {
  computedMatch?: Match<any> | null; // private, from <Switch>
  path?: string;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
  loader?(props: TLoaderProps<any>): Promise<any>;
  component?: Inferno.ComponentClass<any> | ((props: any, context: any) => InfernoNode);
  render?: (props: RouteComponentProps<any>, context: any) => InfernoNode;
  location?: Pick<Location, 'pathname'>;
  children?: ((props: RouteComponentProps<any>) => InfernoNode) | InfernoNode;
}

/**
 * The public API for matching a single path and rendering.
 */
type RouteState = {
  match: Match<any> | null;
  __loaderData__?: TLoaderData;
}

class Route extends Component<Partial<IRouteProps>, RouteState> {
  constructor(props: IRouteProps, context: RouterContext) {
    super(props, context);
    const match = this.computeMatch(props, context.router);
    this.state = {
      __loaderData__: match?.loaderData,
      match,
    };
  }

  public getChildContext(): RouterContext {
    const parentRouter: TContextRouter = this.context.router;
    const router: TContextRouter = combineFrom(parentRouter, null);

    router.route = {
      location: this.props.location || parentRouter.route.location,
      match: this.state!.match,
    };

    return {
      router
    };
  }

  public computeMatch({ computedMatch, ...props }: IRouteProps, router: TContextRouter): Match<any> | null {
    if (!isNullOrUndef(computedMatch)) {
      // <Switch> already computed the match for us
      return computedMatch;
    }

    const { path, strict, exact, sensitive, loader } = props;

    if (process.env.NODE_ENV !== 'production') {
      invariant(router, 'You should not use <Route> or withRouter() outside a <Router>');
    }

    const { route, initialData } = router; // This is the parent route
    const pathname = (props.location || route.location).pathname;

    return path ? matchPath(pathname, { path, strict, exact, sensitive, loader, initialData }) : route.match;
  }

  public componentWillReceiveProps(nextProps, nextContext: { router: TContextRouter }) {
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

    this.setState({
      __loaderData__: match?.loaderData,
      match,
    });
  }

  public render(props: IRouteProps, state: RouteState, context: { router: TContextRouter }) {
    const { match, __loaderData__ } = state!;
    const { children, component, render, loader } = props;
    const { history, route, staticContext } = context.router;
    const location = props.location || route.location;
    const renderProps = { match, location, history, staticContext, component, render, loader, __loaderData__ };

    // If we have a loader we don't render until it has been resolved
    if (!isUndefined(loader) && isUndefined(__loaderData__)) {
      return null;
    }

    if (component) {
      if (process.env.NODE_ENV !== 'production') {
        if (!isFunction(component)) {
          throw new Error("Inferno error: <Route /> - 'component' property must be prototype of class or functional component, not vNode.");
        }
      }
      return match ? createComponentVNode(VNodeFlags.ComponentUnknown, component, renderProps) : null;
    }

    if (render) {
      // @ts-ignore
      return match ? render(renderProps, this.context) : null;
    }

    if (typeof children === 'function') {
      return (children as Function)(renderProps);
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
