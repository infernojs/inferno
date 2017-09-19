/**
 * @module Inferno-Router
 */
/** TypeDoc Comment */

import { Component, VNode } from "inferno";
import createElement from "inferno-create-element";
import { invariant, warning } from "./utils";
import { Children } from "./utils";
import matchPath from "./matchPath";

const isEmptyChildren = children => Children.count(children) === 0;

export interface IRouteProps {
  computedMatch: any; // private, from <Switch>
  path: any;
  exact: any;
  strict: any;
  sensitive: any;
  component: any;
  render: any;
  location: any;
  children: Component<any, any>[];
}

/**
 * The public API for matching a single path and rendering.
 */
class Route extends Component<IRouteProps, any> {
  public getChildContext() {
    return {
      router: {
        ...this.context.router,
        route: {
          location: this.props.location || this.context.router.route.location,
          match: this.state.match
        }
      }
    };
  }

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      match: this.computeMatch(props, context.router)
    };
  }

  public computeMatch(
    { computedMatch, location, path, strict, exact, sensitive },
    router
  ) {
    if (computedMatch) {
      // <Switch> already computed the match for us
      return computedMatch;
    }

    invariant(
      router,
      "You should not use <Route> or withRouter() outside a <Router>"
    );

    const { route } = router;
    const pathname = (location || route.location).pathname;

    return path
      ? matchPath(pathname, { path, strict, exact, sensitive })
      : route.match;
  }

  public componentWillMount() {
    warning(
      !(this.props.component && this.props.render),
      "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored"
    );

    warning(
      !(
        this.props.component &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      "You should not use <Route component> and <Route children> in the same route; <Route children> will be ignored"
    );

    warning(
      !(
        this.props.render &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      "You should not use <Route render> and <Route children> in the same route; <Route children> will be ignored"
    );
  }

  public componentWillReceiveProps(nextProps, nextContext) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );

    this.setState({
      match: this.computeMatch(nextProps, nextContext.router)
    });
  }

  public render(): VNode | null {
    const { match } = this.state;
    const { children, component, render } = this.props;
    const { history, route, staticContext } = this.context.router;
    const location = this.props.location || route.location;
    const props = { match, location, history, staticContext };

    if (component) {
      return match ? createElement(component, props) : null;
    }

    if (render) {
      return match ? render(props) : null;
    }

    if (typeof children === "function") {
      return children(props);
    }

    if (children && !isEmptyChildren(children)) {
      return Children.only(children);
    }

    return null;
  }
}

export default Route;
