export const EMPTY = {};

function segmentize(url) {
	return strip(url).split('/');
}

function strip(url) {
	return url.replace(/(^\/+|\/+$)/g, '');
}

export function convertToHashbang(url) {
	if (url.indexOf('#') === -1) {
		url = '/';
	} else {
		const splitHashUrl = url.split('#!');
		splitHashUrl.shift();
		url = splitHashUrl.join('');
	}
	return url;
}

// Thanks goes to Preact for this function: https://github.com/developit/preact-router/blob/master/src/util.js#L4
// Wildcard support is added on top of that.
export function exec(url, route, opts = EMPTY) {
	let reg = /(?:\?([^#]*))?(#.*)?$/,
		c = url.match(reg),
		matches = {},
		ret;
	if (c && c[1]) {
		let p = c[1].split('&');
		for (let i = 0; i < p.length; i++) {
			let r = p[i].split('=');
			matches[decodeURIComponent(r[0])] = decodeURIComponent(r.slice(1).join('='));
		}
	}
	url = segmentize(url.replace(reg, ''));
	route = segmentize(route || '');
	let max = Math.max(url.length, route.length);
	let hasWildcard = false;

	for (let i = 0; i < max; i++) {
		if (route[i] && route[i].charAt(0) === ':') {
			let param = route[i].replace(/(^\:|[+*?]+$)/g, ''),
				flags = (route[i].match(/[+*?]+$/) || EMPTY)[0] || '',
				plus = ~flags.indexOf('+'),
				star = ~flags.indexOf('*'),
				val = url[i] || '';
			if (!val && !star && (flags.indexOf('?') < 0 || plus)) {
				ret = false;
				break;
			}
			matches[param] = decodeURIComponent(val);
			if (plus || star) {
				matches[param] = url.slice(i).map(decodeURIComponent).join('/');
				break;
			}
		}
		else if (route[i] !== url[i] && !hasWildcard) {
			if (route[i] === '*' && route.length === i + 1) {
				hasWildcard = true;
			} else {
				ret = false;
				break;
			}
		}
	}
	if (opts.default !== true && ret === false) {
		return false;
	}
	return matches;
}

export function pathRankSort(a, b) {
	let aAttr = a.attrs || EMPTY,
		bAttr = b.attrs || EMPTY;
	let diff = rank(bAttr.path) - rank(aAttr.path);
	return diff || (bAttr.path.length - aAttr.path.length);
}

function rank(url) {
	return (strip(url).match(/\/+/g) || '').length;
}
