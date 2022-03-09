import { Component, Inferno } from 'inferno';
import { warning } from './utils';
import { combineFrom } from 'inferno-shared';
import type { History } from 'history';

export interface IRouterProps {
  history: History;
  children: Inferno.InfernoNode;
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
    const childContext: any = combineFrom(this.context.router, null);

    childContext.history = this.props.history;
    childContext.route = {
      location: childContext.history.location,
      match: this.state?.match
    };

    return {
      router: childContext
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
    const { history } = this.props;

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

  public render(props: IRouterProps) {
    return props.children;
  }
}

if (process.env.NODE_ENV !== 'production') {
  Router.prototype.componentWillReceiveProps = function (nextProps) {
    warning(this.props.history === nextProps.history, 'You cannot change <Router history>');
  };
}
