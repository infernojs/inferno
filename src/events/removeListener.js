import InfernoNodeID from './InfernoNodeID';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import eventListener from './shared/eventListener';

/**
 * Remove event listeners from a node
 */
export default function removeListener(node, type) {

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
                if (registry.isBubbling) {
                    --registry.counter;
                } else {
                    node.removeEventListener(type, eventListener[type]);
                }
            }
        }
    }
}