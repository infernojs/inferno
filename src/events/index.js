import InfernoNodeID from './InfernoNodeID';
import addRootListener from './addRootListener';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import setHandler from './setHandler';
import createEventListener from './createEventListener';
import isArray from '../util/isArray';
import setupHooks from './shared/setupHooks';
import eventHooks from './shared/eventHooks';
import eventListener from './shared/eventListener';

const Events = {

    registerSetupHooksForType(type, nodeName, hook) {
            let nodeHooks = setupHooks[type] || (setupHooks[type] = {});
            if (isArray(nodeName)) {
                for (let i = 0; i < nodeName.length; i++) {
                    nodeHooks[nodeName[i]] = hook;
                }
            } else {
                nodeHooks[nodeName] = hook;
            }
        },

        /**
         * @param {string} type is a type of event
         * @param {string} nodeName is a DOM node type
         * @param {function} hook is a function(element, event) -> [args...]
         */
        registerSetupHooks(type, nodeName, hook) {
            if (isArray(type)) {
                for (let i = 0; i < type.length; i++) {
                    Events.registerSetupHooksForType(type[i], nodeName, hook);
                }
            } else {
                Events.registerSetupHooksForType(type, nodeName, hook);
            }
        },

        /**
         * Register a wrapper around all events of a certain type
         */
        registerEventHooks(type, hook) {
            if (isArray(type)) {
                for (let i = 0; i < type.length; i++) {
                    eventHooks[type[i]] = hook;
                }
            } else {
                eventHooks[type] = hook;
            }
        },

        /**
         * Set a event listeners on a node
         */

        addListener(node, type, listener) {
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
                    throw Error('Inferno Error: ' + type + ' has already been attached to nodeID ' + nodeID);
                }

                if (registry.isBubbling) {
                    ++registry.counter;
                    listeners[type] = { handler: listener };
                } else {
                    eventListener[type] = eventListener[type] || createEventListener(type);
                    node.addEventListener(type, eventListener[type], false);
                    listeners[type] = setHandler(type, listener);
                }

            } else {

                throw Error('Inferno Error: ' + type + ' has not been registered, and therefor not supported.');
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
};

/**** HOOKS ******/

import register from './hooks';
register(Events.registerEventHooks);

export default Events;