import pathToRegExp0 from 'path-to-regexp';
import pathToRegExp1 = require('path-to-regexp');
import { isArray, toArray } from '../shared';

const pathToRegExp: any = pathToRegExp0 || pathToRegExp1;
const cache: Map<string, IMatchRegex> = new Map();
const emptyObject: Object = {};

function decode(val: any): any {
	return typeof val !== 'string' ? val : decodeURIComponent(val);
}

export function getRoutes(routing, currentURL: string) {
	let params = {};

	function grabRoutes(_routes, url: string, lastPath: string) {
		if (!_routes) {
			return _routes;
		}

		const routes = toArray(_routes);
		routes.sort(pathRankSort);

		for (let i = 0; i < routes.length; i++) {
			const route = routes[i];

			if (isArray(route)) {
				return grabRoutes(route, url, lastPath);
			}

			const { children, path = '/' } = route.props;
			const fullPath = (lastPath + path).replace('//', '/');
			const isLast = isEmpty(children);

			if (children) {
				route.props.children = grabRoutes(children, url, fullPath);
			}

			const match = matchPath(isLast, fullPath, url.replace('//', '/'));
			if (match) {
				route.props.params = Object.assign(params, match.params);
				if (route.instance) {
					return route.type(route.instance.props, route.instance.context);
				} else {
					return route;
				}
			}
		}
	}

	return grabRoutes(routing, currentURL, '');
}

export function isEmpty(children): boolean {
	return !children || !(isArray(children) ? children : Object.keys(children)).length;
}

interface IMatchRegex {
	keys: any;
	pattern: RegExp;
}

export function matchPath(end: boolean, routePath: string, urlPath: string, parentParams?): any {
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

export function pathRankSort(a: any, b: any) {
	const aAttr = a.props || emptyObject;
	const bAttr = b.props || emptyObject;
	const diff = rank(bAttr.path) - rank(aAttr.path);
	return diff || (bAttr.path && aAttr.path) ? (bAttr.path.length - aAttr.path.length) : 0;
}

function strip(url: string): string {
	return url.replace(/(^\/+|\/+$)/g, '');
}

function rank(url: string = ''): number {
	return (strip(url).match(/\/+/g) || '').length;
}
