import infernoNodeID from './infernoNodeID';
import EventRegistry from './EventRegistry';
import listenersStorage from '../../shared/listenersStorage';
import eventListener from '../../shared/eventListener';

/**
 * Remove event listeners from a node
 */
export default function removeListener(node, type) {

	if (!node) {
		return null; // TODO! Should we throw?
	}

	const nodeID = infernoNodeID(node, true);

	if (nodeID) {
		const listeners = listenersStorage[nodeID];

		if (listeners && listeners[type]) {
			if (listeners[type] && listeners[type].destroy) {
				listeners[type].destroy();
			}
			listeners[type] = null;

			const registry = EventRegistry[type];

			if (registry) {
				if (registry._bubbles) {
					--registry._counter;
				} else {
					node.removeEventListener(type, eventListener[type]);
				}
			}
		}
	}
}
