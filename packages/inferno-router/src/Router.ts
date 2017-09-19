/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { Component } from "inferno";
import { Children, warning, invariant } from "./utils";

export interface IRouterProps {
  history: {
    listen: (callback: any) => {};
    location: {
      pathname: string;
    };
  };
  children: Array<Component<any, any>>;
}

/**
 * The public API for putting history on context.
 */
class Router extends Component<IRouterProps, any> {
  public unlisten;

  constructor(props: IRouterProps, context?: any) {
    super(props, context);
    this.state = {
      match: this.computeMatch(props.history.location.pathname)
    };
  }

  public getChildContext() {
    return {
      router: {
        ...this.context.router,
        history: this.props.history,
        route: {
          location: this.props.history.location,
          match: this.state.match
        }
      }
    };
  }

  public computeMatch(pathname) {
    return {
      isExact: pathname === "/",
      params: {},
      path: "/",
      url: "/"
    };
  }

  public componentWillMount() {
    const { children, history } = this.props;

    invariant(
      children == null || Children.count(children) === 1,
      "A <Router> may have only one child element"
    );

    // Do this here so we can setState when a <Redirect> changes the
    // location in componentWillMount. This happens e.g. when doing
    // server rendering using a <StaticRouter>.
    this.unlisten = history.listen(() => {
      this.setState({
        match: this.computeMatch(history.location.pathname)
      });
    });
  }

  public componentWillReceiveProps(nextProps) {
    warning(
      this.props.history === nextProps.history,
      "You cannot change <Router history>"
    );
  }

  public componentWillUnmount() {
    this.unlisten();
  }

  public render(props): any {
    return props.children;
  }
}

export default Router;
