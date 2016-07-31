import { isBrowser } from '../core/utils';

const routers = [];

function getCurrentUrl() {
	const url = typeof location !== 'undefined' ? location : EMPTY;

	return `${url.pathname || ''}${url.search || ''}${url.hash || ''}`;
}

function getHashbangRoot() {
	const url = typeof location !== 'undefined' ? location : EMPTY;

	return `${url.protocol + '//' || ''}${url.host || ''}${url.pathname || ''}${url.search || ''}#!`;
}

function isActive(path, hashbang) {
	if (hashbang) {
		var currentURL = getCurrentUrl() + (getCurrentUrl().indexOf('#!') === -1 ? '#!' : '');
		var matchURL = currentURL.match(/#!(.*)/);
		var matchHash = matchURL && typeof matchURL[1] !== 'undefined' && (matchURL[1] || '/');
		return matchHash === path;
	}
	return location.pathname === path;
}

function routeTo(url) {
	let didRoute = false;
	for (let i = 0; i < routers.length; i++) {
		if (routers[i].routeTo(url) === true) {
			didRoute = true;
		}
	}
	return didRoute;
}

if (isBrowser) {
	window.addEventListener('popstate', () => routeTo(getCurrentUrl()));
}

export default {
	addRouter(router) {
		routers.push(router);
	},
	removeRouter(router) {
		routers.splice(routers.indexOf(router), 1);
	},
	getCurrentUrl,
	getHashbangRoot,
	isActive
};
