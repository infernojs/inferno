import isFormElement from '../util/isFormElement';
import getFormElementValues from '../template/getFormElementValues';
import setupHooks from './shared/setupHooks';

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