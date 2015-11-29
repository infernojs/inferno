import InfernoNodeID from './InfernoNodeID';
import addInfernoRootListener from './addInfernoRootListener';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import setupEventListener from './setupEventListener';
import createEventListener from './createEventListener';
import isArray from '../util/isArray';
import eventHooks from './shared/eventHooks';
import eventListener from './shared/eventListener';
import { requestAnimationFrame } from '../util/requestAnimationFrame';

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
         * type is a type of event
         * nodeName is a DOM node type
         * hook is a function(element, event) -> [args...]
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
         * example: rafDebounce
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
                        let handler = setupEventListener(type, addInfernoRootListener);
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

Events.registerEventHooks(['scroll',
    'mousemove',
    'drag',
    'touchmove'
], {
    setup: function(handler) {
        let free = true;
        return e => {
            if (free) {
                free = false;
                requestAnimationFrame(() => {
                    handler(e);
                    free = true;
                });
            }
        };
    }
});

// 'wheel' is a special case, so let us fix it here
const wheel = ('onwheel' in document || document.documentMode >= 9) ? 'wheel' : 'mousewheel';

Events.registerEventHooks(wheel, {
    setup: function(handler) {
        let free = true;
        return e => {
            handler(e);
        };
    }
});

export default Events;