function SyntheticEvent(nativeEvent) {

    // SyntheticEvent is based on DOM3 Events as specified by the ECMAScript Language Binding
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    let evt = {
        nativeEvent: nativeEvent,
        isPropagationStopped: false,
        isDefaultPrevented: false,

        stopPropagation: function() {
            evt.isPropagationStopped = true;

            const event = evt.nativeEvent;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },

        isPropagationStopped: function() {
            return evt.isPropagationStopped;
        },

        preventDefault: function() {
            evt.isDefaultPrevented = true;

            const event = evt.nativeEvent;

            if (!event) {
                return;
            }

            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }

            evt.isDefaultPrevented = emptyFunction.thatReturnsTrue;
        },

        isDefaultPrevented: function() {
            return evt.isDefaultPrevented;
        }
    }

    return evt;
}

export default SyntheticEvent;