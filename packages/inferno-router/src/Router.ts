import { Component, type InfernoNode } from 'inferno';
import { isUndefined } from 'inferno-shared';
import type { History, Location } from 'history';
import { warning } from './utils';
import { type Match } from './Route';
import { resolveLoaders, traverseLoaders } from './resolveLoaders';

export interface TLoaderProps<P extends Record<string, string>> {
  params?: P; // Match params (if any)
  request: Request; // Fetch API Request
  // https://github.com/remix-run/react-router/blob/4f3ad7b96e6e0228cc952cd7eafe2c265c7393c7/packages/router/router.ts#L1004
  // https://github.com/remix-run/react-router/blob/11156ac7f3d7c1c557c67cc449ecbf9bd5c6a4ca/examples/ssr-data-router/src/entry.server.tsx#L66
  // https://github.com/remix-run/react-router/blob/59b319feaa12745a434afdef5cadfcabd01206f9/examples/search-params/src/App.tsx#L43
  // https://github.com/remix-run/react-router/blob/11156ac7f3d7c1c557c67cc449ecbf9bd5c6a4ca/packages/react-router-dom/__tests__/data-static-router-test.tsx#L81

  onProgress?: (perc: number) => void;
}

/**
 * Loader returns Response and throws error
 */
export type TLoader<P extends Record<string, string>, R extends Response> = ({
  params,
  request,
}: TLoaderProps<P>) => Promise<R>;

export interface TLoaderData<Res = any, Err = any> {
  res?: Res;
  err?: Err;
}

type TInitialData = Record<string, TLoaderData>; // key is route path to allow resolving

export interface IRouterProps {
  history: History;
  children: InfernoNode;
  initialData?: TInitialData;
}

export interface TContextRouter {
  history: History;
  route: {
    location: Pick<Location, 'pathname'>; // This was Partial<Location> before but this makes pathname optional causing false type error in code
    match: Match<any> | null;
  };
  initialData?: TInitialData;
  staticContext?: object; // TODO: This should be properly typed
}

export interface RouterContext {
  router: TContextRouter;
}

/**
 * The public API for putting history on context.
 */
export class Router extends Component<IRouterProps, any> {
  public unlisten;
  private _loaderFetchControllers: AbortController[] = [];
  private _loaderIteration = 0;

  constructor(props: IRouterProps, context: { router: TContextRouter }) {
    super(props, context);
    const match = this.computeMatch(props.history.location.pathname);
    this.state = {
      initialData: this.props.initialData,
      match,
    };
  }

  public getChildContext(): RouterContext {
    const parentRouter: TContextRouter = this.context.router;
    const router: TContextRouter = { ...parentRouter };
    router.history = this.props.history;
    router.route = {
      location: router.history.location,
      match: this.state?.match, // Why are we sending this? it appears useless.
    };
    router.initialData = this.state?.initialData; // this is a dictionary of all data available
    return {
      router,
    };
  }

  public computeMatch(pathname): Match<any> {
    return {
      isExact: pathname === '/',
      loader: undefined,
      params: {},
      path: '/',
      url: '/',
    };
  }

  public componentWillMount(): void {
    const { history } = this.props;

    // Do this here so we can setState when a <Redirect> changes the
    // location in componentWillMount. This happens e.g. when doing
    // server rendering using a <StaticRouter>.
    this.unlisten = history.listen(() => {
      const match = this.computeMatch(history.location.pathname);
      this._matchAndResolveLoaders(match);
    });

    // First execution of loaders
    if (isUndefined(this.props.initialData)) {
      this._matchAndResolveLoaders(this.state?.match);
    }
  }

  private _matchAndResolveLoaders(match?: Match<any>): void {
    // Keep track of invokation order
    // Bumping the counter needs to be done first because calling abort
    // triggers promise to resolve with "aborted"
    this._loaderIteration = (this._loaderIteration + 1) % 10000;
    const currentIteration = this._loaderIteration;

    for (const controller of this._loaderFetchControllers) {
      controller.abort();
    }
    this._loaderFetchControllers = [];

    const { history, children } = this.props;
    const loaderEntries = traverseLoaders(history.location.pathname, children);
    if (loaderEntries.length === 0) {
      this.setState({ match });
      return;
    }

    // Store AbortController instances for each matched loader
    this._loaderFetchControllers = loaderEntries.map((e) => e.controller);

    void resolveLoaders(loaderEntries).then((initialData): void => {
      // On multiple pending navigations, only update interface with last
      // in case they resolve out of order
      if (currentIteration === this._loaderIteration) {
        this.setState({
          initialData,
          match,
        });
      }
    });
  }

  public componentWillUnmount(): void {
    this.unlisten();
  }

  public render(props: IRouterProps): InfernoNode {
    return props.children;
  }
}

if (process.env.NODE_ENV !== 'production') {
  Router.prototype.componentWillReceiveProps = function (nextProps) {
    warning(
      this.props.history === nextProps.history,
      'You cannot change <Router history>',
    );
  };
}
