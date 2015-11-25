let isPropagationStopped = false;
let isDefaultPrevented = false;

function eventHooks(nativeEvent) {

    nativeEvent.stopPropagation = function stopPropagation() {
        isPropagationStopped = true;

        let event = evt.nativeEvent;
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    };
    nativeEvent.isPropagationStopped = function isPropagationStopped() {
        return isPropagationStopped;
    };
    nativeEvent.preventDefault = function preventDefault() {
        isDefaultPrevented = true;

        let event = evt.nativeEvent;

        if (!event) {
            return;
        }

        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    };
    nativeEvent.isDefaultPrevented = function isDefaultPrevented() {
        return isDefaultPrevented;
    };
    return nativeEvent;
}

export default eventHooks;