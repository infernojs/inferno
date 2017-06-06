/**
 * Helper function for parsing plain route configurations
 * based on react-router createRoutes handler.
 *
 * currently supported keys:
 * - path
 * - component
 * - childRoutes
 * - indexRoute
 *
 * Usage example:
 * const routes = createRoutes([
 *  {
 *    path        : '/',
 *    component   : App,
 *    indexRoute  : {
 *      component     : Home,
 *    },
 *    childRoutes : [
 *      {
 *        path : 'films/',
 *        component : Films,
 *        childRoutes : {
 *          path : 'detail/:id',
 *          component : FilmDetail,
 *        }
 *      },
 *      {
 *        path : '/*',
 *        component : NoMatch
 *      }
 *    ]
 *  }
 * ]);
 *
 * Usage on Router JSX
 * <Router history={browserHistory} children={routes} />
 */

import { VNode } from 'inferno';
import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { isArray } from 'inferno-shared';
import Route, { IRouteHook } from './Route';

export interface IPlainRouteConfig {
	path: string;
	component: Component<any, any>;
	indexRoute?: IPlainRouteConfig;
	childRoutes?: IPlainRouteConfig | IPlainRouteConfig[];
	children?: VNode | VNode[];
	onEnter?: IRouteHook;
	onLeave?: IRouteHook;
}

const handleIndexRoute = (indexRouteNode: IPlainRouteConfig): VNode => createElement(Route, indexRouteNode);
const handleChildRoute = (childRouteNode: IPlainRouteConfig): VNode => handleRouteNode(childRouteNode);
const handleChildRoutes = (childRouteNodes: IPlainRouteConfig[]): VNode[] => childRouteNodes.map(handleChildRoute);

function handleRouteNode(routeConfigNode: IPlainRouteConfig): VNode {
	if (routeConfigNode.indexRoute && !routeConfigNode.childRoutes) {
		return createElement(Route, routeConfigNode);
	}

	// create deep copy of config
	const node: IPlainRouteConfig = {} as IPlainRouteConfig;
	for (const key in routeConfigNode) {
		node[key] = routeConfigNode[key];
	}

	node.children = [];

	// handle index route config
	if (node.indexRoute) {
		node.children.push(handleIndexRoute(node.indexRoute));
		delete node.indexRoute;
	}

	// handle child routes config
	if (node.childRoutes) {
		const nodes: IPlainRouteConfig[] = isArray(node.childRoutes) ? node.childRoutes : [node.childRoutes];
		node.children.push(...handleChildRoutes(nodes));
		delete node.childRoutes;
	}

	// cleanup to match native rendered result
	if (node.children.length === 1) {
		node.children = node.children[0];
	}
	if (
		(isArray(node.children) && node.children.length === 0) ||
		(!isArray(node.children) && Object.keys(node.children).length === 0)
	) {
		delete node.children;
	}

	return createElement(Route, node);
}

export default (routeConfig: IPlainRouteConfig[]): VNode[] => routeConfig.map(handleRouteNode);
