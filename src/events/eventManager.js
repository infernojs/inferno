import SyntheticEvent from './SyntheticEvent';
import getEventID from './getEventID';
import listenersStorage from './listenersStorage';
import eventHandler from './eventHandler';
import EventRegistry from './EventRegistry';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import isEventSupported from './isEventSupported';

function eventListener(e) {
    listenersStorage[getEventID(e.target)][e.type](SyntheticEvent(e));
}
 /**
   * Stores `listener` at `listenerBank[registrationName][id]`. Is idempotent.
   *
   * @param {string} id ID of the DOM element.
   * @param {string} registrationName Name of listener (e.g. `onClick`).
   * @param {?function} listener The callback to store.
   */
function putListener(element, event) {

        /*    const domNodeId = getEventID(element),
                listeners = listenersStorage[domNodeId] || (listenersStorage[domNodeId] = {});

            if (!listeners[event]) {

                element.addEventListener(event, eventListener, false);
            }

            listeners[event] = listener;*/
}

export default {

    isPrefixedEvent: function(evt) {
        return EventRegistry[evt] || null;
    },

    unprefixedEvent: function(evt) {

        return EventRegistry[evt]
    },

    addListener: function(element, type, listener) {

        const registry = EventRegistry[type] || null;
		
		console.log(registry);
		
        if (registry) {

            const originalEvent = registry.eventName;

            // only once in a life time
            if (registry.isNative && !registry.isActive) {

                // 'focus' and 'blur' is a special case
                if (registry.focusEvent) {

                    if (isEventSupported(registry.focusEvent)) {

                        document.addEventListener(registry.focusEvent,
                            e => {
                                eventHandler(e, originalEvent);
                            });

                    } else {
                        document.addEventListener(originalEvent, eventHandler, true);
                    }

                } else {

                    document.addEventListener(originalEvent, eventHandler, false);
                }

                registry.isActive = true;
            }

            const domNodeId = getEventID(element),
                listeners = listenersStorage[domNodeId] || (listenersStorage[domNodeId] = {});

            if (!listeners[originalEvent]) {

                element.addEventListener(originalEvent, eventListener, false);
            }

            listeners[originalEvent] = listener;
        }
    },
    removeListener: function(element, type) {

      /*  const EventInfo = EventRegistry[type] || null;

        if (EventInfo) {

            const originalEvent = EventRegistry[type].eventName;

            const domNodeId = getEventID(element, true);

            if (domNodeId) {
                const listeners = listenersStorage[domNodeId];

                if (listeners && listeners[originalEvent]) {
                    listeners[type] = null;

                        if (EventInfo.shouldNotBubble) {
                            element.removeEventListener(originalEvent, eventListener);
                        } else {
                            --isRegistered.counter;
                        }
                }
            }
        }*/
    }
}

//console.log(EventRegistry)