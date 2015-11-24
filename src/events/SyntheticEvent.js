function SyntheticEvent(type, nativeEvent) {

    let Syntetic = {
        type: type,
        target: nativeEvent.target,
        nativeEvent: nativeEvent,
        _isPropagationStopped: false,
        _isDefaultPrevented: false,


        stopPropagation: function() {
            Syntetic._isPropagationStopped = true;

            const nativeEvent = Syntetic.nativeEvent;
            nativeEvent.stopPropagation ?
                nativeEvent.stopPropagation() :
                nativeEvent.cancelBubble = true;
        },

        isPropagationStopped: function() {
            return Syntetic._isPropagationStopped;
        },

        preventDefault: function() {
            Syntetic._isDefaultPrevented = true;

            const nativeEvent = Syntetic.nativeEvent;
            nativeEvent.preventDefault ?
                nativeEvent.preventDefault() :
                nativeEvent.returnValue = false;
        },

        isDefaultPrevented: function() {
            return Syntetic._isDefaultPrevented;
        }
    }

    return Syntetic;
}


export default SyntheticEvent;