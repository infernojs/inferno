import { decode, flatten, getURLString, isEmpty, mapSearchParams, pathRankSort, toPartialURL } from './utils';
import { isArray, toArray } from '../shared';

import Inferno from 'inferno';
import pathToRegExp from 'path-to-regexp';

const cache: Map<string, IMatchRegex> = new Map();

/**
 * Returns a node containing only the matched components
 * @param routes
 * @param currentURL
 * @returns {any|VComponent}
 */
export default function match(routes, currentURL: any) {
	const location: string = getURLString(currentURL);
	const renderProps = matchRoutes(toArray(routes), location, '/');
	return renderProps;
}

/**
 * Go through every route and create a new node
 * with the matched components
 * @param _routes
 * @param currentURL
 * @param parentPath
 * @returns {object}
 */
function matchRoutes(_routes, currentURL = '/', parentPath = '/') {

	const routes = isArray(_routes) ? flatten(_routes) : toArray(_routes);
	const [pathToMatch = '/', search = ''] = currentURL.split('?');
	const params = mapSearchParams(search);

	routes.sort(pathRankSort);

	for (let i = 0; i < routes.length; i++) {
		const route = routes[i];
		const routePath = (route.props && route.props.path || '/');
		const location = parentPath + toPartialURL(routePath, parentPath).replace(/\/\//g, '/');
		const isLast = !route.props || isEmpty(route.props.children);
		const matchBase = matchPath(isLast, location, pathToMatch);

		if (matchBase) {
			let children = null;

			if (route.props && route.props.children) {
				const matchChild = matchRoutes(route.props.children, pathToMatch, location);
				if (matchChild) {
					children = matchChild.matched;
					Object.assign(params, matchChild.matched.props.params);
				} else {
					route.props.children = null;
				}
			}

			const matched = Inferno.cloneVNode(route, {
				params: Object.assign(params, matchBase.params)
			}, children);

			return {
				location,
				matched
			};
		}
	}
}

interface IMatchRegex {
	keys: any;
	pattern: RegExp;
}

/**
 * Converts path to a regex, if a match is found then we extract params from it
 * @param end
 * @param routePath
 * @param pathToMatch
 * @returns {any}
 */
function matchPath(end: boolean, routePath: string, pathToMatch: string): any {
	const key = `${routePath}|${end}`;
	let regexp: IMatchRegex = cache.get(key);

	if (!regexp) {
		const keys = [];
		regexp = { pattern: pathToRegExp(routePath, keys, { end }), keys };
		cache.set(key, regexp);
	}

	const m = regexp.pattern.exec(pathToMatch);

	if (!m) {
		return null;
	}

	const path: string = m[0];
	const params = Object.create(null);

	for (let i = 1; i < m.length; i += 1) {
		params[regexp.keys[i - 1].name] = decode(m[i]);
	}

	return {
		path: path === '' ? '/' : path,
		params
	};
}
