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
		roouters.splice(routers.indexOf(router), 1);
	},
	getCurrentUrl,
	getHashbangRoot
};
