import { isArray } from '../shared';
// import pathToRegExp = require('path-to-regexp');
import pathToRegExp from 'path-to-regexp';

const cache = new Map();
const emptyArray = [];
const emptyObject = {};

function decode(val) {
	return typeof val !== 'string' ? val : decodeURIComponent(val);
}

export function matchPath(end, routePath, urlPath, parentParams?) {
	const key = `${routePath}|${end}`;
	let regexp = cache.get(key);

	if (!regexp) {
		const keys = emptyArray;
		regexp = { pattern: pathToRegExp(routePath, keys, { end }), keys };
		cache.set(key, regexp);
	}

	const m = regexp.pattern.exec(urlPath);

	if (!m) {
		return null;
	}

	const path = m[0];
	const params = emptyObject;
	if (parentParams) {
		Object.assign(params, parentParams);
	}

	for (let i = 1; i < m.length; i += 1) {
		params[regexp.keys[i - 1].name] = decode(m[i]);
	}

	return {
		path: path === '' ? '/' : path,
		params
	};
}

function strip(url) {
	return url.replace(/(^\/+|\/+$)/g, '');
}

function flattenArray(oldArray, newArray) {
	for (let i = 0; i < oldArray.length; i++) {
		const item = oldArray[i];

		if (isArray(item)) {
			flattenArray(item, newArray);
		} else {
			newArray.push(item);
		}
	}
}

export function flatten(oldArray) {
	const newArray = [];

	flattenArray(oldArray, newArray);
	return newArray;
}

export function pathRankSort(a, b) {
	let aAttr = a.props || emptyObject,
		bAttr = b.props || emptyObject;
	let diff = rank(bAttr.path) - rank(aAttr.path);
	return diff || (bAttr.path.length - aAttr.path.length);
}

function rank(url) {
	return (strip(url).match(/\/+/g) || '').length;
}
