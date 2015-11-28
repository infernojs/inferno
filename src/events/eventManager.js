import getEventID from './getEventID';
import addRootDomEventListeners from './addRootDomEventListeners';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import listenerSetup from './hooks/listenerSetup';

function eventListener(e) {
    listenersStorage[getEventID(e.target)][e.type](e);
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
                        let handler = listenerSetup(type, addRootDomEventListeners);
                        document.addEventListener(type, handler, false);
                    }

                    registry.activated = true;
                }

                const id = getEventID(domNode),
                    listeners = listenersStorage[id] || (listenersStorage[id] = {});

                if (!listeners[type]) {

                    if (registry.bubbles) {
                        ++registry.listenersCounter;
                    } else {
                        let handler = listenerSetup(type, eventListener); 
                        domNode.addEventListener(type, handler, false);
                        domNode._infernoListeners = domNode._infernoListeners || {};
                        domNode._internoListeners[type] = handler;
                    }
                }

                listeners[type] = listener;
            }
        },
        /**
         * Remove event listeners from a node
         */
        removeListener(node, type) {

            const id = getEventID(node, true);

            if (id) {
                const listeners = listenersStorage[id];

                if (listeners && listeners[type]) {
                    listeners[type] = null;

                    const registry = EventRegistry[type];

                    if (registry) {
                        if (registry.bubbles) {
                            --registry.listenersCounter;
                        } else {
                            node.removeEventListener(type, node._infernoListeners[type]);
                            node._infernoListeners[type] = null; 
                        }
                    }
                }
            }
        }
};