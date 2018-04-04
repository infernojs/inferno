import { Component, InfernoChildren } from 'inferno';
import { cloneVNode } from 'inferno-clone-vnode';
import { Children, invariant, warning } from './utils';
import * as H from 'history';

export interface IRouterProps {
  history: H.History;
  children: InfernoChildren;
}

/**
 * The public API for putting history on context.
 */
export class Router extends Component<IRouterProps, any> {
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
      isExact: pathname === '/',
      params: {},
      path: '/',
      url: '/'
    };
  }

  public componentWillMount() {
    const { children, history } = this.props;

    invariant(children == null || Children.count(children) === 1, 'A <Router> may have only one child element');

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
    warning(this.props.history === nextProps.history, 'You cannot change <Router history>');
  }

  public componentWillUnmount() {
    this.unlisten();
  }

  public render(props): any {
    return props.children ? cloneVNode(props.children) : null;
  }
}
