import { isFunction, isNull, isUndefined } from '../shared';
import { roots, render } from './rendering';

export const devToolsStatus = {
	connected: false
};

const internalIncrementer = {
	id: 0
};

export const componentIdMap = new Map();

export function getIncrementalId() {
	return internalIncrementer.id++;
}

function sendToDevTools(global, data) {
	const event = new CustomEvent('inferno.client.message', {
		detail: JSON.stringify(data, (key, val) => {
			if (!isNull(val) && !isUndefined(val)) {
				if (key === '_vComponent' || !isUndefined(val.nodeType)) {
					return;
				} else if (isFunction(val)) {
					return `$$f:${ val.name }`;
				}
			}
			return val;
		})
	});
	global.dispatchEvent(event);
}

function rerenderRoots() {
	const rootDomNodes = Array.from(roots.keys());

	for (let i = 0; i < rootDomNodes.length; i++) {
		const rootDomNode = rootDomNodes[i];
		const input = roots.get(rootDomNode).input;

		render(input, rootDomNode);
	}
}

export function initDevToolsHooks(global) {
	global.__INFERNO_DEVTOOLS_GLOBAL_HOOK__ = true;

	global.addEventListener('inferno.devtools.message', function (message) {
		const detail = JSON.parse(message.detail);
		const type = detail.type;

		switch (type) {
			case 'get-roots':
				devToolsStatus.connected = true;
				rerenderRoots();
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
