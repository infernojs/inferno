import registerEventHooks from './hooks/registerEventHooks';
import isArray from '../util/isArray';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import setupHooks from './shared/setupHooks';

let Events = {};

// Don't expose Events interface for server side

if (ExecutionEnvironment.canUseDOM) {

Events = {
     
    /**
     * @param {string} type is a type of event
     * @param {string} nodeName is a DOM node type
     * @param {function} hook is a function(element, event) -> [args...]
     */
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

    registerEventHooks
};

}

/**** HOOKS ******/
import './hooks';

export default Events;