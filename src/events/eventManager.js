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

export default {

    isPrefixedEvent: function(evt) {
        return EventRegistry[evt] || null;
    },

    unprefixedEvent: function(evt) {

        return EventRegistry[evt]
    },

    addListener: function(element, type, listener) {

        const EventRegistry = EventRegistry[type] || null;
		
        if (EventRegistry) {

            const originalEvent = EventRegistry[type].eventName;

            // only once in a life time
            if (EventRegistry.isNative && !EventRegistry.isActive) {

                // 'focus' and 'blur' is a special case
                if (EventRegistry.focusEvent) {

                    if (isEventSupported(EventRegistry.focusEvent)) {

                        document.addEventListener(EventRegistry.focusEvent,
                            e => {
                                eventHandler(e, originalEvent);
                            });

                    } else {
                        document.addEventListener(originalEvent, eventHandler, true);
                    }

                } else {

                    document.addEventListener(originalEvent, eventHandler, false);
                }

                EventRegistry.isActive = true;
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

        const EventInfo = EventRegistry[type] || null;

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
        }
    }
}

console.log(EventRegistry)