/* eslint-disable */
var jsdom = require('jsdom');

// Setup the jsdom environment
// @see https://github.com/facebook/react/issues/5046
global.document = jsdom.jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;
global.usingJSDOM = true;

global.chai = require('chai');
global.expect = global.chai.expect;
global.sinon = require('sinon');

//JSDOM doesn't support localStorage by default, so lets just fake it..
if (!global.window.localStorage) {
	global.window.localStorage = {
		getItem() { return '{}'; },
		setItem() {}
	};
}

// take all properties of the window object and also attach it to the
// mocha global object
propagateToGlobal(global.window);

// from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
function propagateToGlobal (window) {
	for (var key in window) {
		if (!window.hasOwnProperty(key)) continue;
		if (key in global) continue;

		global[key] = window[key];
	}
}
if (!global.requestAnimationFrame) {
	global.requestAnimationFrame = function (func) {
		setTimeout(func, 1000 / 60);
	}
}
