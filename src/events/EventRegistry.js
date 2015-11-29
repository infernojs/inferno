import ExecutionEnvironment from '../util/ExecutionEnvironment';
import addRootListener from './addRootListener';
import setupEventListener from './setupEventListener';

const standardNativeEvents =
    ('click dblclick mouseup mousedown contextmenu '             + // mouse buttons
    'wheel mousewheel '                                          + // mouse wheel
    'mouseover mouseout mousemove selectstart '                  + // mouse movement
    'keydown keypress keyup '                                    + // keyboard
    'copy cut paste '                                            + // text  
    'change reset select submit focusout focusin'                + // form elements

    // W3C native events

    'show '                                                      + // mouse buttons
    'input '                                                     + // form elements
    'touchstart touchmove touchend touchcancel '                 + // touch
    'textinput '                                                 + // TextEvent
    'focus blur '                                                + // Non-standard
    'dragexit dragstart dragenter dragover dragleave drag drop dragend').split(' ') // dnd

const focusEvents = {
    focus: 'focusin', // DOM L3
    blur: 'focusout'  // DOM L3
};

const nonBubbleableEvents = 
('input invalid '                                                + // form elements
 'load '                                                         + // window
 'select '                                                       + // form elements
 'orientationchange '                                            + // mobile
 'unload beforeunload resize '                                   + // window
 'seeked ended durationchange timeupdate play pause ratechange ' + // media
 'loadstart progress suspend emptied stalled  '                  + // media
 'loadeddata canplay canplaythrough playing waiting seeking '    + // media
 'volumechange '                                                 + // media
 'loadedmetadata scroll error abort mouseenter mouseover').split(' '); // misc

let EventRegistry = {};

if (ExecutionEnvironment.canUseDOM) {

    let i = 0;
    let type;

    for (; i < standardNativeEvents.length; i++) {

        type = standardNativeEvents[i];

        EventRegistry[type] = {
            type: type,
            isBubbling: true,
            counter: 0,
            isActive: false
        };

        // 'focus' and 'blur'
        if (focusEvents[type]) {

            if ((typeof InstallTrigger == 'undefined')) {

                EventRegistry[type].setup = function() {
                    let handler = setupEventListener(this.type, e => {
                        addRootListener(e, this.type);
                    });
                    document.addEventListener(focusEvents[this.type], handler);
                };
                // Feature detect Firefox
            } else {
                EventRegistry[type].setup = function() {
                    document.addEventListener(
                        this.type,
                        setupEventListener(this.type, addRootListener),
                        true);
                };
            }
        }
    }

    // For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
    for (i = 0; i < nonBubbleableEvents.length; i++) {
        EventRegistry[nonBubbleableEvents[i]] = {
            type: type,
            isBubbling: false,
            isActive: false
        };
    }
}

export default EventRegistry;