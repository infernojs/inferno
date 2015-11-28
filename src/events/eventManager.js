import getEventID from './getEventID';
import isEventSupported from './isEventSupported';
import addRootDomEventListerners from './addRootDomEventListerners';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';

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

                    } else {
                        registry.bubbles && document.addEventListener(type, addRootDomEventListerners, false);
                    }

                    registry.activated = true;
                }

                const id = getEventID(domNode),
                    listeners = listenersStorage[id] || (listenersStorage[id] = {});

                if (!listeners[type]) {

                    if (registry.bubbles) {
                        ++registry.listenersCounter;
                    } else {
                        domNode.addEventListener(type, eventListener, false);
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
                            node.removeEventListener(type, eventListener);
                        }
                    }
                }
            }
        }
};