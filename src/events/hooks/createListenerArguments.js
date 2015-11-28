import isFormElement from '../../util/isFormElement';
import getFormElementValues from '../../template/getFormElementValues';

// type -> node -> function(target, event)
const plugins = {};

/**
 * type is a type of event
 * nodeName is a DOM node type
 * hook is a function(element, event) -> [args...]
 */
export function registerSetupHooks(type, nodeName, hook) {
    let nodeHooks = plugins[type] = plugins[type] || {};
    nodeHooks[nodeName] = hook;
}

export default function createListenerArguments(target, event) {
    let type = event.type;
    let nodeName = target.nodeName.toLowerCase();
    let tagHooks;
    if ((tagHooks = plugins[type])) {
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