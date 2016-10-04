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
	global.addEventListener('message', function(event) {
		console.log(event)
		// Only accept messages from the same frame
		if (event.source !== window) {
			return;
		}

		var message = event.data;

		// Only accept messages that we know are ours
		if (typeof message !== 'object' || message === null ||
			message.source !== 'my-devtools-extension') {
			return;
		}

		global.chrome.runtime.sendMessage('my-devtools-extension', message);
	});
}