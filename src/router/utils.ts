import { isArray } from '../shared';
import pathToRegExp0 from 'path-to-regexp';
import pathToRegExp1 = require('path-to-regexp');

const pathToRegExp = pathToRegExp0 || pathToRegExp1;

const cache = new Map();
const emptyObject = {};

function decode(val) {
	return typeof val !== 'string' ? val : decodeURIComponent(val);
}

export function matchPath(end, routePath, urlPath, parentParams?) {
	const key = `${routePath}|${end}`;
	let regexp = cache.get(key);

	if (!regexp) {
		const keys = [];
		regexp = { pattern: pathToRegExp(routePath, keys, { end }), keys };
		cache.set(key, regexp);
	}

	const m = regexp.pattern.exec(urlPath);

	if (!m) {
		return null;
	}

	const path = m[0];
	const params = Object.assign({}, parentParams);

	for (let i = 1; i < m.length; i += 1) {
		params[regexp.keys[i - 1].name] = decode(m[i]);
	}

	return {
		path: path === '' ? '/' : path,
		params
	};
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
	const aAttr = a.props || emptyObject;
	const bAttr = b.props || emptyObject;
	const diff = rank(bAttr.path) - rank(aAttr.path);
	return diff || (bAttr.path && aAttr.path) ? (bAttr.path.length - aAttr.path.length) : 0;
}

function strip(url) {
	return url.replace(/(^\/+|\/+$)/g, '');
}

function rank(url = '') {
	return (strip(url).match(/\/+/g) || '').length;
}
