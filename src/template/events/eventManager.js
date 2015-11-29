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

    addListener(domNode, type, listener) {

            const registry = EventRegistry[type];

            if (registry) {

                // is this activated, YET?
                if (!registry.activated) {

                    if (registry.setup) {
                        registry.setup();
                    } else if (registry.bubbles) {
                        let handler = listenerSetup(type, addInfernoRootListener);
                        document.addEventListener(type, handler, false);
                    }

                    registry.activated = true;
                }

                const nodeID = InfernoNodeID(domNode),
                    listeners = listenersStorage[nodeID] || (listenersStorage[nodeID] = {});

                if (!listeners[type]) {

                    if (registry.bubbles) {
                        ++registry.listenersCounter;
                    } else {
                        eventListener[type] = eventListener[type] || createEventListener(type);
                        domNode.addEventListener(type, eventListener[type], false);
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
                        if (registry.bubbles) {
                            --registry.listenersCounter;
                        } else {
                            node.removeEventListener(type, eventListener[type]);
                        }
                    }
                }
            }
        }
};