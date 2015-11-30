import ExecutionEnvironment from '../util/ExecutionEnvironment';
import addRootListener from './addRootListener';
import setHandler from './setHandler';

const standardNativeEvents = [
 'click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu',   // mouse buttons
 'wheel', 'mousewheel',                                        // mouse wheel
 'mouseover', 'mouseout', 'mousemove', 'selectstart',          // mouse movement
 'keydown', 'keypress', 'keyup',                               // keyboard
 'copy', 'cut', 'paste',                                       // text
 'change', 'reset', 'select', 'submit', 'focusout', 'focusin', // form elements

 // W3C native events
 'show',                                                       // mouse buttons
 'input',                                                      // form elements
 'touchstart', 'touchmove', 'touchend', 'touchcancel',         // touch
 'textInput',                                                  // TextEvent
 'focus', 'blur',                                              // Non-standard

 // Drag and Drop events
 'drag', 'drop',                                               // dnd
 'dragstart', 'dragend',                                       // dnd
 'dragenter', 'dragleave',                                     // dnd
 'dragover',                                                   // dnd
 'dragexit',                                                   // Not supported
 
 // composition events
  'compositionstart', 'compositionend', 'compositionupdate',   // composition
  'selectionchange'                                            // IE-only
];

const focusEvents = {
    focus: 'focusin', // DOM L3
    blur: 'focusout'  // DOM L3
};

const nonBubbleableEvents = [
 'input', 'invalid',                                             // form elements
 'select',                                                       // form elements
 'load',                                                         // window
 'unload', 'beforeunload', 'resize',                             // window
 'orientationchange',                                            // mobile

 // Media
 'seeked', 'ended', 'durationchange', 'timeupdate', 'play',      // media
 'pause', 'ratechange', 'loadstart', 'progress', 'suspend',      // media
 'emptied', 'stalled', 'loadeddata', 'canplay',                  // media
 'canplaythrough','playing', 'waiting', 'seeking',               // media
 'volumechange',                                                 // media

  // Misc Events
 'loadedmetadata', 'scroll', 'error', 'abort',                   // misc
 'mouseenter', 'mouseleave', 'mouseover'                         // misc
];

let EventRegistry = {};

if (ExecutionEnvironment.canUseDOM) {

    let i = 0;
    let type;

    const nativeFocus = 'onfocusin' in document.documentElement;

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

            if (nativeFocus) {

                EventRegistry[type].setup = function() {
                    let handler = setHandler(this.type, e => {
                        addRootListener(e, this.type);
                    }).handler;
                    document.addEventListener(focusEvents[this.type], handler);
                };
              // firefox doesn't support focusin/focusout events
            } else {
                EventRegistry[type].setup = function() {
                    document.addEventListener(
                        this.type,
                        setHandler(this.type, addRootListener).handler,
                        true);
                };
            }
        }
    }

    // For non-bubbleable events - e.g. scroll - we are setting the events directly on the node
    for (i = 0; i < nonBubbleableEvents.length; i++) {
        type = nonBubbleableEvents[i];
        EventRegistry[type] = {
            type: type,
            isBubbling: false,
            isActive: false
        };
    }
}

export default EventRegistry;
