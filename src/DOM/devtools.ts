
	

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
}