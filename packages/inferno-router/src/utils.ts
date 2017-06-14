/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import { isArray, isString } from 'inferno-shared';

export const emptyObject = {};

export function decode(val: any): any {
	return typeof val !== 'string' ? val : decodeURIComponent(val);
}

export function isEmpty(children): boolean {
	return !children || !(isArray(children) ? children : Object.keys(children)).length;
}

export function flatten(oldArray) {
	const newArray = [];

	flattenArray(oldArray, newArray);
	return newArray;
}

export function getURLString(location): string {
	return isString(location) ? location : (location.pathname + location.search);
}

/**
 * Maps a querystring to an object
 * Supports arrays and utf-8 characters
 * @param search
 * @returns {any}
 */
export function mapSearchParams(search): any {
	if (search === '') {
		return {};
	}

	// Create an object with no prototype
	const map = Object.create(null);
	const fragments = search.split('&');

	for (let i = 0, len = fragments.length; i < len; i++) {
		const fragment = fragments[ i ];
		const [ k, v ] = fragment.split('=').map(mapFragment).map(decodeURIComponent);

		if (map[ k ]) {
			map[ k ] = isArray(map[ k ]) ? map[ k ] : [ map[ k ] ];
			map[ k ].push(v);
		} else {
			map[ k ] = v;
		}
	}
	return map;
}

/**
 * Gets the relevant part of the URL for matching
 * @param fullURL
 * @param partURL
 * @returns {string}
 */
export function toPartialURL(fullURL: string, partURL: string) {
	if (fullURL.indexOf(partURL) === 0) {
		return fullURL.substr(partURL.length);
	}
	return fullURL;
}

/**
 * Simulates ... operator by returning first argument
 * with the keys in the second argument excluded
 * @param _args
 * @param excluded
 * @returns {{}}
 */
export function rest(_args, excluded) {
	const t = {};
	for (const p in _args) {
		if (excluded.indexOf(p) < 0) {
			t[ p ] = _args[ p ];
		}
	}
	return t;
}

/**
 * Sorts an array according to its `path` prop length
 * @param a
 * @param b
 * @returns {number}
 */
export function pathRankSort(a: any, b: any) {
	const aAttr = a.props || emptyObject;
	const bAttr = b.props || emptyObject;
	const diff = rank(bAttr.path) - rank(aAttr.path);
	return diff || ((bAttr.path && aAttr.path) ? (bAttr.path.length - aAttr.path.length) : 0);
}

/**
 * Helper function for parsing querystring arrays
 */
function mapFragment(p: string, isVal: number): string {
	return decodeURIComponent(isVal | 0 ? p : p.replace('[]', ''));
}

function strip(url: string): string {
	return url.replace(/(^\/+|\/+$)/g, '');
}

function rank(url: string = ''): number {
	return (strip(url).match(/\/+/g) || '').length;
}

function flattenArray(oldArray, newArray) {
	for (let i = 0, len = oldArray.length; i < len; i++) {
		const item = oldArray[ i ];

		if (isArray(item)) {
			flattenArray(item, newArray);
		} else {
			newArray.push(item);
		}
	}
}
