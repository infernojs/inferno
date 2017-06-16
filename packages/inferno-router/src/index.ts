/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { VNode } from "inferno";
import createRoutes, { IPlainRouteConfig } from "./createRoutes";
import doAllAsyncBefore from "./doAllAsyncBefore";
import IndexLink from "./IndexLink";
import IndexRoute from "./IndexRoute";
import Link from "./Link";
import match from "./match";
import Redirect from "./Redirect";
import Route from "./Route";
import Router from "./Router";
import RouterContext from "./RouterContext";

export {
  IndexLink,
  Redirect as IndexRedirect,
  IndexRoute,
  IPlainRouteConfig,
  Link,
  Redirect,
  Route,
  Router,
  RouterContext,
  VNode,
  createRoutes,
  doAllAsyncBefore,
  match
};

export default {
  IndexLink,
  IndexRedirect: Redirect,
  IndexRoute,
  Link,
  Redirect,
  Route,
  Router,
  RouterContext,
  createRoutes,
  doAllAsyncBefore,
  match
};
