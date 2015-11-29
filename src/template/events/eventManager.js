import InfernoNodeID from './InfernoNodeID';
import addInfernoRootListener from './addInfernoRootListener';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import listenerSetup from './hooks/listenerSetup';

const eventListener = {};
function createEventListener(type) {
    return listenerSetup(type, e => listenersStorage[InfernoNodeID(e.target)][type](e));
}

export default {

    /**
     * Set a event listeners on a node
     */

    addListener(node, type, listener) {

            const registry = EventRegistry[type];

            if (registry) {
             
			 // setup special listeners only on creation
                if (!registry.isActive) {

                    if (registry.setup) {
                        registry.setup();
                    } else if (registry.isBubbling) {
                        let handler = listenerSetup(type, addInfernoRootListener);
                        document.addEventListener(type, handler, false);
                    }

                    registry.isActive = true;
                }

                const nodeID = InfernoNodeID(node),
                    listeners = listenersStorage[nodeID] || (listenersStorage[nodeID] = {});

                if (!listeners[type]) {

                    if (registry.isBubbling) {
                        ++registry.counter;
                    } else {
                        eventListener[type] = eventListener[type] || createEventListener(type);
                        node.addEventListener(type, eventListener[type], false);
                    }
                }

                listeners[type] = listener;
            }
        },
        /**
         * Remove event listeners from a node
         */
        removeListener(node, type) {

            const nodeID = InfernoNodeID(node, true);

            if (nodeID) {
                const listeners = listenersStorage[nodeID];

                if (listeners && listeners[type]) {
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
};