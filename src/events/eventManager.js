import getDomNodeId from './getEventID';
import isEventSupported from './isEventSupported';
import addRootDomEventListerners from './addRootDomEventListerners';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';

function eventListener(e) {
    listenersStorage[getDomNodeId(e.target)][e.type](e);
}

export default {

    addListener (domNode, type, listener) {

        const registry = EventRegistry[type];

        if (registry) {

            if (!registry.set) {

                if (registry.setup) {

                    registry.setup();

                } else {

                    registry.bubbles && document.addEventListener(type, addRootDomEventListerners, false);
                }

                registry.set = true;
            }

            const domNodeId = getDomNodeId(domNode),
                listeners = listenersStorage[domNodeId] || (listenersStorage[domNodeId] = {});

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

    removeListener (domNode, type) {
       
	    const domNodeId = getDomNodeId(domNode, true);

        if (domNodeId) {
            const listeners = listenersStorage[domNodeId];

            if (listeners && listeners[type]) {
                listeners[type] = null;

                const registry = EventRegistry[type];

                if (registry) {
                    if (registry.bubbles) {
                        --registry.listenersCounter;
                    } else {
                        domNode.removeEventListener(type, eventListener);
                    }
                }
            }
        }
    }
};