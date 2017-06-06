/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import Inferno from 'inferno';
import { combineFrom, isArray, toArray } from 'inferno-shared';
import pathToRegExp from 'path-to-regexp-es6';
import {
	decode,
	emptyObject,
	flatten,
	getURLString,
	isEmpty,
	mapSearchParams,
	pathRankSort,
	toPartialURL,
} from './utils';

const cache: Map<string, IMatchRegex> = new Map();

/**
 * Returns a node containing only the matched components
 * @param routes
 * @param currentURL
 * @returns {*}
 */
export default function match(routes, currentURL: any) {
	const location: string = getURLString(currentURL);
	return matchRoutes(toArray(routes), encodeURI(location), '/');
}

/**
 * Go through every route and create a new node
 * with the matched components
 * @param _routes
 * @param currentURL
 * @param parentPath
 * @param redirect
 * @returns {object}
 */
function matchRoutes(_routes, currentURL = '/', parentPath = '/', redirect = false) {
	const routes = isArray(_routes) ? flatten(_routes) : toArray(_routes);
	const [pathToMatch = '/', search = ''] = currentURL.split('?');
	const params = mapSearchParams(search);

	routes.sort(pathRankSort);

	for (let i = 0, len = routes.length; i < len; i++) {
		const route = routes[i];
		const props = route.props || emptyObject;
		const routePath = props.from || props.path || '/';
		const location = parentPath + toPartialURL(routePath, parentPath).replace(/\/\//g, '/');
		const isLast = isEmpty(props.children);
		const matchBase = matchPath(isLast, location, pathToMatch);

		if (matchBase) {
			let children = props.children;

			if (props.from) {
				redirect = props.to;
			}
			if (children) {
				const matchChild = matchRoutes(children, currentURL, location, redirect);
				if (matchChild) {
					if (matchChild.redirect) {
						return {
							location,
							redirect: matchChild.redirect,
						};
					}
					children = matchChild.matched;
					const childProps = children.props.params;
					for (const key in childProps) {
						params[key] = childProps[key];
					}
				} else {
					children = null;
				}
			}

			const matched = Inferno.cloneVNode(route, {
				children,
				params: combineFrom(params, matchBase.params),
			});

			return {
				location,
				matched,
				redirect,
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
export function matchPath(end: boolean, routePath: string, pathToMatch: string): any {
	const key = `${routePath}|${end}`;
	let regexp: IMatchRegex | undefined = cache.get(key);

	if (regexp === void 0) {
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

	for (let i = 1, len = m.length; i < len; i += 1) {
		params[regexp.keys[i - 1].name] = decode(m[i]);
	}

	return {
		params,
		path: path === '' ? '/' : path,
	};
}
