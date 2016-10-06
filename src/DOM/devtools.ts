import { roots } from './rendering';

export const devToolsStatus = {
	connected: false
};

function sendToDevTools(global, data) {
	let event = new CustomEvent('inferno.client.message', {
		detail: JSON.stringify(data)
	});
	global.dispatchEvent(event);
}

export function initDevToolsHooks(global) {
	global.__INFERNO_DEVTOOLS_GLOBAL_HOOK__ = true;

	global.addEventListener('inferno.devtools.message', function (message) {
		const detail = JSON.parse(message.detail);
		const type = detail.type;

		switch (type) {
			case 'get-roots':
				devToolsStatus.connected = true;
				sendRoots(global);
				break;
			default:
				// TODO:?
				break;
		}
	});
}

export function sendRoots(global) {
	sendToDevTools(global, { type: 'roots', data: Array.from(roots.values()) });
}