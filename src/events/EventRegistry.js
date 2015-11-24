import isEventSupported from './isEventSupported';
import EventConstants from './EventConstants';
import focusEvents from './focusEvents';
import eventHandler from './eventHandler';
import ExecutionEnvironment from '../util/ExecutionEnvironment';

const {
    nativeEvents,
    nonBubbleableEvents
} = EventConstants;

const EventRegistry = {};

if (ExecutionEnvironment.canUseDOM) {

    let i = 0,
        EventType;

    for (; i < nativeEvents.length; i++) {

        EventType = nativeEvents[i];

        EventRegistry[EventType] = {

            type: EventType,
            shouldBubble: true,
            counter: 0,
            isActive: false, // not activated YET!
            setup: null
        }

        // 'focus' and 'blur' is a special case
        if (focusEvents[EventType]) {

            EventRegistry[EventType].setup = isEventSupported(focusEvents[EventType]) ?
                function() {
                    const type = this.type;
                    document.body.addEventListener(
                        focusEvents[type],
                        e => {
                            eventHandler(e, type);
                        });
                } :
                function() {
                    document.body.addEventListener(this.type, eventHandler, true);
                }
        }
    }

    for (i = 0; i < nonBubbleableEvents.length; i++) {
        EventRegistry[nonBubbleableEvents[i]] = {
            type: EventType,
            shouldBubble: false,
            isActive: false
        };
    }
}

export default EventRegistry;