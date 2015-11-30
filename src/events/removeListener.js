import InfernoNodeID from './InfernoNodeID';
import EventRegistry from './EventRegistry';
import listenersStorage from './shared/listenersStorage';
import eventListener from './shared/eventListener';
import focusEvents from './shared/focusEvents';

/**
 * Remove event listeners from a node
 */
export default function removeListener(node, type) {

	 if (!node) {
	     return null; // TODO! Should we throw?
	 }
	 	
    const nodeID = InfernoNodeID(node, true);

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
               // TODO Run tests and check if this works, or code should be removed
//				} else if (registry._focusBlur) {
//					node.removeEventListener(type, eventListener[focusEvents[type]]);					
                } else {
                    node.removeEventListener(type, eventListener[type]);
                }
            }
        }
    }
}