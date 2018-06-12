import { Component, VNode } from 'inferno';
import { cloneVNode } from 'inferno-clone-vnode';
import { Children, invariant, warning } from './utils';
import * as H from 'history';

export interface IRouterProps {
  history: H.History;
  children: undefined | VNode | null;
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

  public componentWillUnmount() {
    this.unlisten();
  }

  public render(props: IRouterProps, state, context): VNode | null {
    return props.children ? cloneVNode(props.children) : null;
  }
}

if (process.env.NODE_ENV !== 'production') {
  Router.prototype.componentWillReceiveProps = function(nextProps) {
    warning(this.props.history === nextProps.history, 'You cannot change <Router history>');
  };
}
