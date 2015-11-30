import registerEventHooks from './hooks/registerEventHooks';
import isArray from '../util/isArray';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import setupHooks from './shared/setupHooks';
import EventRegistry from './EventRegistry';

let Events = {};

// Don't expose Events interface for server side

// TODO! Is there a better way of doing this?

if (ExecutionEnvironment.canUseDOM) {

    Events = {

        /**
         * @param {string} type is a type of event
         * @return {boolean} True if event are registered.
         */
        isRegistered(type) {
                return !!(
                    EventRegistry[type] &&
                    EventRegistry[type]._enabled
                );
            },
            /**
             * @param {string} type is a type of event
             * @param {string} nodeName is a DOM node type
             * @param {function} hook is a function(element, event) -> [args...]
             */
            registerSetupHooksForType(type, nodeName, hook) {

                if (!type) {
                    return;
                }

                let nodeHooks = setupHooks[type] || (setupHooks[type] = {});

                if (typeof nodeName === 'object') {
                    if (isArray(nodeName)) {
                        for (let i = 0; i < nodeName.length; i++) {
                            nodeHooks[nodeName[i]] = hook;
                        }
                    }
                } else { // TODO! What if this is not a string?
                    nodeHooks[nodeName] = hook;
                }
            },

            /**
             * @param {string} type is a type of event
             * @param {string} nodeName is a DOM node type
             * @param {function} hook is a function(element, event) -> [args...]
             */
            registerSetupHooks(type, nodeName, hook) {
                if (!type) {
                    return;
                }
                if (typeof nodeName === 'object') {
                    if (isArray(type)) {
                        for (let i = 0; i < type.length; i++) {
                            Events.registerSetupHooksForType(type[i], nodeName, hook);
                        }
                    }
                } else { // TODO! What if this is not a string?
                    Events.registerSetupHooksForType(type, nodeName, hook);
                }
            },

            registerEventHooks
    };

}

/**** HOOKS ******/
import './hooks';

export default Events;