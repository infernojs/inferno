import attributeHooks from './attributeHooks';
import isArray from '../util/isArray';

const HTMLProperties = ['resize', 'paused', 'playbackRate', 'scrLang', 'srcObject', 'value', 'volume'];
const HTMLBooleanProperties = ['multiple', 'selected', 'checked', 'checked', 'disabled', 'readOnly', 'required', 'open', 'loop', 'muted', 'controls'];
const edgeCases = {
    acceptCharset: 'accept-charset',
    className: 'class',
    htmlFor: 'for',
    httpEquiv: 'http-equiv',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    viewBox: 'viewBox'
}

function registerAttributeHandlers(type, hook, loc) {
    if (loc) {
        if (isArray(type)) {
            for (let i = 0; i < type.length; i++) {
                attributeHooks[loc][type[i]] = hook;
            }
        } else {
            attributeHooks[loc][type] = hook;
        }
    }
}

/**
 * HTML Properties
 */
registerAttributeHandlers(HTMLProperties, function(node, name, value) {
    if ('' + node[name] !== '' + value) {
        node[name] = value;
    }
}, 'set');

registerAttributeHandlers(HTMLProperties, function(node, name) {
    node[name] = '';
}, 'unset');

/**
 * HTML boolean Properties
 */
registerAttributeHandlers(HTMLBooleanProperties, function(node, name, value) {
    if ('' + node[name] !== '' + value) {
        node[name] = value;
    }
}, 'set');

/**
 * HTML boolean Properties
 */
registerAttributeHandlers(HTMLBooleanProperties, function(node, name, value) {
    node[name] = false;
}, 'unset');

/**
 * Edge cases
 */
for (let edge in edgeCases) {
    registerAttributeHandlers(edge, function(node, name, value) {
        node.setAttribute(dgeCases[edge], value);
    }, 'set');
}

export default registerAttributeHandlers;