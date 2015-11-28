import isArray from '../util/isArray';

const hookPlugins = {};

function registerAttributeHandlers(type, hook) {
    if (isArray(type)) {
        for (let i = 0; i < type.length; i++) {
            hookPlugins[type[i] = hook;
            }
        } else {
            hookPlugins[type] = hook;
        }
    }
}

/**
 * HTML Properties
 */
setAttributeHandlers(['resize', 'paused', 'playbackRate', 'scrLang', 'srcObject', 'value', 'volume'], function(node, name, value) {
    if ('' + node[name] !== '' + value) {
        node[name] = value;
    }
});

export default hookPlugins;