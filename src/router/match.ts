import { toArray, isArray } from '../shared';
import { decode, isEmpty, pathRankSort, mapSearchParams, flatten, getURLString } from './utils';
import { VComponent } from '../core/shapes';
import pathToRegExp0 from 'path-to-regexp';
import pathToRegExp1 = require('path-to-regexp');
import { default as Inferno } from 'inferno';

const pathToRegExp: any = pathToRegExp0 || pathToRegExp1;
const cache: Map<string, IMatchRegex> = new Map();

/**
 * Returns a node containing only the matched components
 * @param routes
 * @param currentURL
 * @returns {any|VComponent}
 */
export default function match(routes, currentURL: any) {
	const location: string = getURLString(currentURL);
	const matched = matchRoutes(toArray(routes), location, '/');
	return matched;
}

/**
 * Go through every route and create a new node
 * with the matched components
 * @param _routes
 * @param urlToMatch
 * @param lastPath
 * @returns {any}
 */
function matchRoutes(_routes, urlToMatch = '/', lastPath = '/') {

	if (!Object.keys(_routes).length) {
		return _routes;
	}

	const routes = isArray(_routes) ? flatten(_routes) : toArray(_routes);
	const [pathToMatch, search = ''] = urlToMatch.split('?');
	const params = mapSearchParams(search);

	routes.sort(pathRankSort);

	for (let i = 0; i < routes.length; i++) {
		const route = routes[i];
		const fullPath = (lastPath + (route.props && route.props.path || '/')).replace('//', '/');
		const isLast = !route.props || isEmpty(route.props.children);
		const matchBase = matchPath(isLast, fullPath, pathToMatch);

		if (matchBase) {
			let children = null;
			if (route.props && route.props.children) {
				const matchChild = match(route.props.children, pathToMatch, fullPath);
				if (matchChild) {
					children = matchChild;
					Object.assign(params, matchChild.props.params);
				}
			}
			const node: VComponent = Inferno.cloneVNode(route, {
				children,
				params: Object.assign(params, matchBase.params),
				component:  route.props.component
			});

			return node;
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
 * @param urlPath
 * @param parentParams
 * @returns {any}
 */
function matchPath(end: boolean, routePath: string, urlPath: string, parentParams?): any {
	const key = `${routePath}|${end}`;
	let regexp: IMatchRegex = cache.get(key);

	if (!regexp) {
		const keys = [];
		regexp = { pattern: pathToRegExp(routePath, keys, { end }), keys };
		cache.set(key, regexp);
	}

	const m = regexp.pattern.exec(urlPath);

	if (!m) {
		return null;
	}

	const path: string = m[0];
	const params = Object.assign({}, parentParams);

	for (let i = 1; i < m.length; i += 1) {
		params[regexp.keys[i - 1].name] = decode(m[i]);
	}

	return {
		path: path === '' ? '/' : path,
		params
	};
}
