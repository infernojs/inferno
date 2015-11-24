function SyntheticEvent(nativeEvent) {

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