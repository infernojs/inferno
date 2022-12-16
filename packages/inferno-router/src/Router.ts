import { Component, InfernoNode } from 'inferno';
import { warning } from './utils';
import { combineFrom } from 'inferno-shared';
import type { History } from 'history';
import { Match } from './Route';

export type TLoaderProps<P> = {
  params?: P;
  request: any; // Fetch request
}

export type TLoaderData = {
  res: any;
  err: any;
}
export interface IRouterProps {
  history: History;
  children: InfernoNode;
  loaderData?: TLoaderData;
}

/**
 * The public API for putting history on context.
 */
export class Router extends Component<IRouterProps, any> {
  public unlisten;
  private _loaderCount;

  constructor(props: IRouterProps, context?: any) {
    super(props, context);
    this._loaderCount = 0;
    const { res, err } = props.loaderData ?? {};
    this.state = {
      match: this.computeMatch(props.history.location.pathname),
      loaderRes: res, // TODO: Populate with rehydrated data
      loaderErr: err, // TODO: Populate with rehydrated data
    };
  }

  public getChildContext() {
    const childContext: any = combineFrom(this.context.router, null);
    debugger
    childContext.history = this.props.history;
    childContext.route = {
      location: childContext.history.location,
      match: this.state?.match,
      loaderRes: this.state?.loaderRes,
      loaderErr: this.state?.loaderErr,
    };

    return {
      router: childContext
    };
  }


  public computeMatch(pathname): Match<{}> {
    return {
      isExact: pathname === '/',
      params: {},
      path: '/',
      url: '/',
      loader:  undefined,
    };
  }

  public componentWillMount() {
    const { history } = this.props;

    // Do this here so we can setState when a <Redirect> changes the
    // location in componentWillMount. This happens e.g. when doing
    // server rendering using a <StaticRouter>.
    this.unlisten = history.listen(async () => {
      // Note: Resets counter at 10k to Allow infinite loads
      const currentLoaderCount = this._loaderCount = (this._loaderCount + 1) % 10000;
      const match = this.computeMatch(history.location.pathname);
      let loaderRes;
      let loaderErr;
      if (match.loader) {
        const params = undefined;
        const request = undefined;
        try {
          const res = await match.loader({ params, request });
          // TODO: should we parse json?
          loaderRes = res;
        } catch (err) {
          loaderErr = err;
        }
      }
      // If a new loader has completed prior to current loader,
      // don't overwrite with stale data.
      if (currentLoaderCount === this._loaderCount) {
        this.setState({
          match,
          loaderRes,
          loaderErr,
        });
      }
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
