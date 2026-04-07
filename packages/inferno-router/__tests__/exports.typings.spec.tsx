import type { History, Location } from 'history';
import type {
  IBrowserRouterProps,
  IHashRouterProps,
  ILinkProps,
  IMemoryRouterProps,
  NavLinkProps,
  IPromptProps,
  RedirectProps,
  Match,
  RouteComponentProps,
  IRouteProps,
  TLoaderProps,
  TLoader,
  TLoaderData,
  IRouterProps,
  TContextRouter,
  RouterContext,
  IStaticRouterProps,
  IWithRouterProps,
} from 'inferno-router';

describe('inferno-router root type exports', () => {
  it('type checks the public type surface from the package root', () => {
    const match: Match<Record<string, string>> = {
      isExact: true,
      params: {},
      path: '/',
      url: '/',
    };
    const routeComponentProps: RouteComponentProps<Record<string, string>> = {
      history: {} as History,
      location: {} as Location,
      match,
    };
    const browserRouterProps: IBrowserRouterProps = { children: [] };
    const hashRouterProps: IHashRouterProps = { children: null };
    const linkProps: ILinkProps = { to: '/' };
    const memoryRouterProps: IMemoryRouterProps = { children: [] };
    const navLinkProps: NavLinkProps = { to: '/' };
    const promptProps: IPromptProps = { message: 'leave?' };
    const redirectProps: RedirectProps = { to: '/' };
    const routeProps: IRouteProps = { path: '/' };
    const loaderProps: TLoaderProps<Record<string, string>> = {
      request: {} as Request,
    };
    const loader: TLoader<Record<string, string>, Response> = async () =>
      ({} as Response);
    const loaderData: TLoaderData<string, Error> = { res: 'ok' };
    const routerProps: IRouterProps = {
      children: null,
      history: {} as History,
    };
    const contextRouter: TContextRouter = {
      history: {} as History,
      route: {
        location: { pathname: '/' },
        match,
      },
    };
    const routerContext: RouterContext = { router: contextRouter };
    const staticRouterProps: IStaticRouterProps<any> = {
      children: null,
      context: {},
      location: '/',
    };
    const withRouterProps: IWithRouterProps = {};

    expect([
      routeComponentProps,
      browserRouterProps,
      hashRouterProps,
      linkProps,
      memoryRouterProps,
      navLinkProps,
      promptProps,
      redirectProps,
      routeProps,
      loaderProps,
      loader,
      loaderData,
      routerProps,
      contextRouter,
      routerContext,
      staticRouterProps,
      withRouterProps,
    ].length).toBe(17);
  });
});
