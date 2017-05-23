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
	createRoutes,
	IndexLink,
	IndexRoute,
	IPlainRouteConfig,
	Link,
	match,
	Redirect as IndexRedirect,
	Redirect,
	Route,
	Router,
	RouterContext,
	VNode
};

export default {
	createRoutes,
	IndexLink,
	IndexRedirect: Redirect,
	IndexRoute,
	Link,
	match,
	Redirect,
	Route,
	Router,
	RouterContext
};
