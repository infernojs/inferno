import isArray from '../../../util/isArray';
import isFormElement from '../../../util/isFormElement';
import getFormElementValues from '../../getFormElementValues';

// type -> node -> function(target, event)
const setupHooks = {};

function registerSetupHooksForType(type, nodeName, hook) {
    let nodeHooks = setupHooks[type] || (setupHooks[type] = {});
    if (isArray(nodeName)) {
        for (let i = 0; i < nodeName.length; i++) {
            nodeHooks[nodeName[i]] = hook;
        }
    } else {
        nodeHooks[nodeName] = hook;
    }
}

/**
 * type is a type of event
 * nodeName is a DOM node type
 * hook is a function(element, event) -> [args...]
 */
export function registerSetupHooks(type, nodeName, hook) {
    if (isArray(type)) {
		for (let i = 0; i < type.length; i++) {
            registerSetupHooksForType(type[i], nodeName, hook);
		}
    } else {
        registerSetupHooksForType(type, nodeName, hook);
    }
}

export default function createListenerArguments(target, event) {
    let type = event.type;
    let nodeName = target.nodeName.toLowerCase();
    let tagHooks;
    if ((tagHooks = setupHooks[type])) {
        let hook = tagHooks[nodeName];
        if (hook) {
            return hook(target, event);
        }
    }

    // Default behavior:
    // Form elements with a value attribute will have the arguments:
    // [event, value]
    if (isFormElement(nodeName)) {

        return [event, getFormElementValues(target)];
    }

    // Fallback to just event
    return [event];
}