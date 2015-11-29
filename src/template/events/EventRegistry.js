import capturableEvents from './shared/capturableEvents';
import nonBubbleableEvents from './shared/nonBubbleableEvents';
import focusEvents from './shared/focusEvents';
import ExecutionEnvironment from '../../util/ExecutionEnvironment';
import addInfernoRootListener from './addInfernoRootListener';
import listenerSetup from './hooks/listenerSetup';

let EventRegistry = {};

if (ExecutionEnvironment.canUseDOM) {

    let i = 0,
        type;

    for (; i < capturableEvents.length; i++) {

        type = capturableEvents[i];

        EventRegistry[type] = {
            type: type,
            bubbles: true,
            listenersCounter: 0,
            set: false
        };

        if (focusEvents[type]) {

            // 'focusOut' and 'focusIn' are not supported by Firefix
            //https://developer.mozilla.org/en-US/docs/Web/Events/focusout
            if ((typeof InstallTrigger == 'undefined')) {

                EventRegistry[type].setup = function() {
                    let handler = listenerSetup(this.type, e => {
                        addInfernoRootListener(e, this.type);
                    });
                    document.addEventListener(focusEvents[this.type], handler);
                };
                // Feature detect Firefox
            } else {
                EventRegistry[type].setup = function() {
                    document.addEventListener(
                        this.type,
                        listenerSetup(this.type, addInfernoRootListener),
                        true);
                };
            }
        }
    }

    // For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
    for (i = 0; i < nonBubbleableEvents.length; i++) {
        EventRegistry[nonBubbleableEvents[i]] = {
            type: type,
            bubbles: false,
            set: false
        };
    }
}

export default EventRegistry;