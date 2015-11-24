import SyntheticEvent from './SyntheticEvent';
import getEventID from './getEventID';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';
import eventHandler from './eventHandler';
import eventProperties from './eventProperties';
import ExecutionEnvironment from '../util/ExecutionEnvironment';
import isEventSupported from './isEventSupported';

function eventListener(e) {
    listenersStorage[getEventID(e.target)][e.type](SyntheticEvent(e));
}

export default {

    isPrefixedEvent: function(evt) {
        return eventProperties[evt] || null;
    },

    unprefixedEvent: function(evt) {

        return eventProperties[evt]
    },

    addListener: function(domNode, type, listener) {

        const EventInfo = eventProperties[type] || null;

        if (EventInfo) {

            const originalEvent = eventProperties[type].eventName;

            const isRegistered = EventRegistry[originalEvent];

            if (isRegistered) {

                if (EventInfo.isNative) {

                    let registry = EventRegistry[originalEvent] = {

                        type: originalEvent,
                        counter: 0,
                        isActive: false, // not activated YET!
                    }

                    if (!isRegistered.isActive) {

                        // 'focus' and 'blur' is a special case
                        if (EventInfo.focusEvent) {

                            if (isEventSupported(EventInfo.focusEvent)) {

                                document.body.addEventListener(EventInfo.focusEvent,
                                    e => {
                                        eventHandler(e, originalEvent);
                                    });

                            } else {
                                document.body.addEventListener(originalEvent, eventHandler, true);
                            }

                        } else {

                            document.body.addEventListener(originalEvent, eventHandler, false);
                        }

                        registry.isActive = true;
                    }

                } else if (EventInfo.shouldNotBubble) {

                    let registry = EventRegistry[originalEvent] = {

                        type: originalEvent,
                        isActive: false
                    }
                }

                const domNodeId = getEventID(domNode),
                    listeners = listenersStorage[domNodeId] || (listenersStorage[domNodeId] = {});

                if (!listeners[originalEvent]) {

                    domNode.addEventListener(originalEvent, eventListener, false);
                }

                listeners[originalEvent] = listener;
            }
        }
    },
    removeListener: function(domNode, type) {

        const EventInfo = eventProperties[type] || null;

        if (EventInfo) {

            const originalEvent = eventProperties[type].eventName;

            const domNodeId = getEventID(domNode, true);

            if (domNodeId) {
                const listeners = listenersStorage[domNodeId];

                if (listeners && listeners[originalEvent]) {
                    listeners[type] = null;

                    const isRegistered = EventRegistry[originalEvent];

                    if (isRegistered) {

                        if (EventInfo.shouldNotBubble) {
                            domNode.removeEventListener(originalEvent, eventListener);
                        } else {
                            --isRegistered.counter;
                        }
                    }
                }
            }
        }
    }
}