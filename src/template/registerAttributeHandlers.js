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
                hookPlugins[loc][type[i]] = hook;
            }
        } else {
            hookPlugins[loc][type] = hook;
        }
    }
}

/**
 * HTML Properties
 */
setAttributeHandlers(HTMLProperties, function(node, name, value) {
    if ('' + node[name] !== '' + value) {
        node[name] = value;
    }
}, 'set');

setAttributeHandlers(HTMLProperties, function(node, name) {
    node[name] = '';
}, 'unset');

/**
 * HTML boolean Properties
 */
setAttributeHandlers(HTMLBooleanProperties, function(node, name, value) {
    if ('' + node[name] !== '' + value) {
        node[name] = value;
    }
}, 'set');

/**
 * HTML boolean Properties
 */
setAttributeHandlers(HTMLBooleanProperties, function(node, name, value) {
    node[name] = false;
}, 'unset');

/**
 * Edge cases
 */
for (let edge in edgeCases) {
    setAttributeHandlers(edge, function(node, name, value) {
        node.setAttribute(dgeCases[edge], value);
    }, 'set');
}