import { roots } from './rendering';
	

	// var backgroundPageConnection = chrome.runtime.connect({
	// 	name: "panel"
	// });
	
	// window.addEventListener('message', function (event) {
	// 	var backgroundPageConnection = chrome.runtime.connect({
	// 		name: "panel"
	// 	});

	// 	backgroundPageConnection.postMessage({
	// 		name: 'init',
	// 		tabId: chrome.devtools.inspectedWindow.tabId
	// 	});
	// });


export function initDevToolsHooks(global) {
	global.__INFERNO_DEVTOOLS_GLOBAL_HOOK__ = true;

	// we now need to wait for a message?
	global.addEventListener('message', function (event) {
		// the dev tools will need roots, it's the roots of the vdom tree
		// roots
	});
}