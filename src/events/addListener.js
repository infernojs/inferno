import InfernoNodeID from './InfernoNodeID';
import addRootListener from './addRootListener';
import EventRegistry from './EventRegistry';
import listenersStorage from './shared/listenersStorage';
import setHandler from './setHandler';
import createEventListener from './createEventListener';
import eventListener from './shared/eventListener';

/**
 * Set a event listeners on a node
 */
export default function addListener(node, type, listener) {
    const registry = EventRegistry[type];
    // only add listeners for registered events
    if (registry) {

        // setup special listeners only on creation
        if (!registry.isActive) {

            if (registry.setup) {
                registry.setup();
            } else if (registry.isBubbling) {
                let handler = setHandler(type, addRootListener).handler;
                document.addEventListener(type, handler, false);
            }

            registry.isActive = true;
        }

        const nodeID = InfernoNodeID(node),
            listeners = listenersStorage[nodeID] || (listenersStorage[nodeID] = {});

        if (listeners[type]) {
            if (listeners[type].destroy) {
                listeners[type].destroy();
            }
        }

        if (registry.isBubbling) {
            if (!listeners[type]) {
                ++registry.counter;
            }
            listeners[type] = {
                handler: listener,
                originalHandler: listener
            };
        } else {
            eventListener[type] = eventListener[type] || createEventListener(type);
            node.addEventListener(type, eventListener[type], false);
            listeners[type] = setHandler(type, listener);
        }

    } else {

        throw Error('Inferno Error: ' + type + ' has not been registered, and therefor not supported.');
    }
}