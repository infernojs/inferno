import events              from './shared/events';
import capturedEvents      from './shared/capturedEvents';
import getUniqueId         from './getUniqueId';
import root                from './root';
import addEventListener    from './addEventListener';
import removeEventListener from './removeEventListener';
import rootListeners       from './vars/rootListeners';
import eventsCfg           from './shared/eventsCfg';

/**
 * Add event listeners
 * @param {Object} element
 * @param {String} type
 * @param {String} listener
 */
function addListener (element, type, listener) {

    type = events[type];

    const config = eventsCfg[type];

    if (config) {
        if (!config.set) {
            if (config.setup) {
                config.setup();
            } else if (config.bubbles) {
                addEventListener(document.body, type, root.addRootListener, false);
            }
            config.set = true;
        }

        const uniqueId = getUniqueId(element),
            listeners = rootListeners[uniqueId] || (rootListeners[uniqueId] = {});

        if (!listeners[type]) {

            if (config.bubbles) {
                ++config.countListeners;
            } else {
                addEventListener(element, type, root.eventHandler, false);
            }
        }

        listeners[type] = listener;
    }
}

/**
 * Remove single listener
 * @param {Object} element
 * @param {String} type
 */
function removeListener (element, type) {
    const uniqueID = getUniqueId(element, true);

    if (uniqueID) {
        const listeners = rootListeners[uniqueID];

        type = events[type];

        if (listeners && listeners[type]) {
            listeners[type] = null;

            const cfg = eventsCfg[type];

            if (cfg) {
                if (cfg.bubbles) {
                    --cfg.countListeners;
                } else {
                    removeEventListener(element, type, root.eventHandler);
                }
            }
        }
    }
}


export default {
    addListener,
    removeListener
};