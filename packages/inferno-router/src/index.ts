import { VNode } from 'inferno';
import createRoutes, { IPlainRouteConfig } from './createRoutes';
import IndexLink from './IndexLink';
import IndexRoute from './IndexRoute';
import Link from './Link';
import match from './match';
import Redirect from './Redirect';
import Route from './Route';
import Router from './Router';
import RouterContext from './RouterContext';

export {
	VNode,
	Route,
	IndexRoute,
	Redirect,
	Redirect as IndexRedirect,
	Router,
	RouterContext,
	Link,
	IndexLink,
	match,
	createRoutes,
	IPlainRouteConfig
};

export default {
	Route,
	IndexRoute,
	Redirect,
	IndexRedirect: Redirect,
	Router,
	RouterContext,
	Link,
	IndexLink,
	match,
	createRoutes
};
