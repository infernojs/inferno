import { StaticRouter } from './StaticRouter';
import { BrowserRouter } from './BrowserRouter';
import { HashRouter } from './HashRouter';
import { MemoryRouter } from './MemoryRouter';
import { Router } from './Router';
import { Route } from './Route';
import { Switch } from './Switch';
import { Link } from './Link';
import { NavLink } from './NavLink';
import { Prompt } from './Prompt';
import { Redirect } from './Redirect';
import { matchPath } from './matchPath';
import { withRouter } from './withRouter';
export * from './resolveLoaders';
export * from './helpers';
export type { IBrowserRouterProps } from './BrowserRouter';
export type { IHashRouterProps } from './HashRouter';
export type { ILinkProps } from './Link';
export type { IMemoryRouterProps } from './MemoryRouter';
export type { NavLinkProps } from './NavLink';
export type { IPromptProps } from './Prompt';
export type { RedirectProps } from './Redirect';
export type { Match, RouteComponentProps, IRouteProps } from './Route';
export type {
  TLoaderProps,
  TLoader,
  TLoaderData,
  IRouterProps,
  TContextRouter,
  RouterContext,
} from './Router';
export type { IStaticRouterProps } from './StaticRouter';
export type { IWithRouterProps } from './withRouter';

export {
  BrowserRouter,
  HashRouter,
  Link,
  MemoryRouter,
  NavLink,
  Prompt,
  Redirect,
  Route,
  Router,
  StaticRouter,
  Switch,
  matchPath,
  withRouter,
};
