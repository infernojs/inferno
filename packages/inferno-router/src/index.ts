import Link from './Link';
import IndexLink from './IndexLink';
import Route from './Route';
import IndexRoute from './IndexRoute';
import Redirect from './Redirect';
import Router from './Router';
import match from './match';
import createRoutes, {IPlainRouteConfig} from './createRoutes';
import RouterContext from './RouterContext';
import { VNode } from 'inferno';

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
