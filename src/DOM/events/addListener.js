import infernoNodeID from './infernoNodeID';
import addRootListener from './addRootListener';
import EventRegistry from './EventRegistry';
import listenersStorage from '../../shared/listenersStorage';
import setHandler from './setHandler';
import createEventListener from './createEventListener';

export default function addListener(vNode, domNode, type, listener) {

	if (!domNode) {
		return null; // TODO! Should we throw?
	}
	const registry = EventRegistry[type];

	// only add listeners for registered events
	if (registry) {
		if (!registry._enabled) {
			// handle focus / blur events
			if (registry._focusBlur) {
				registry._focusBlur();
			} else if (registry._bubbles) {
				document.addEventListener(type, setHandler(type, addRootListener).handler, false);
			}
			registry._enabled = true;
		}
		const nodeID = infernoNodeID(domNode);
		let	listeners;

		if (listenersStorage[nodeID]) {
			listeners = listenersStorage[nodeID];
		} else {
			listenersStorage[nodeID] = {};
			listeners = listenersStorage[nodeID];
		}

		let listenerType =  listeners[type];

		if (listenerType && listenerType.destroy) {
			listenerType.destroy();
		}

		if (registry._bubbles) {
			if (!listenerType) {
				++registry._counter;
			}
			// Fix me! What we do with this?
			listenerType = {
				handler: listener,
				originalHandler: listener
			};
		} else {
			listenerType = setHandler(type, createEventListener(type));
			listenerType.originalHandler = listener;
			domNode.addEventListener(type, listenerType.handler, false);
		}
	} else {
		throw Error('Inferno Error: ' + type + ' has not been registered, and therefor not supported.');
	}
}
