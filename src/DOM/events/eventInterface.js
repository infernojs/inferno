const CustomEvent = {

	stopPropagation() {
		this._isPropagationStopped = true;
		if ( this._stopPropagation ) {
			this._stopPropagation();
		} else {
			this.cancelBubble = true;
		}
	},

	isPropagationStopped() {
		return this._isPropagationStopped;
	},

	stopImmediatePropagation() {
		this._isImmediatePropagationStopped = true;
		this._isPropagationStopped = true;
		if ( this._stopImmediatePropagation ) {
			this._stopImmediatePropagation();
		} else {
			this.cancelBubble = true;
		}
	},

	isImmediatePropagationStopped() {
		return this._isImmediatePropagationStopped;
	},

	preventDefault() {
		this._isDefaultPrevented = true;

		if ( this._preventDefault ) {
			this._preventDefault();
		} else {
			this.returnValue = false;
		}
	},

	isDefaultPrevented() {
		return this._isDefaultPrevented;
	}

};

function eventInterface( nativeEvent ) {

	// Extend nativeEvent
	nativeEvent._stopPropagation = nativeEvent.stopPropagation;
	nativeEvent.stopPropagation = CustomEvent.stopPropagation;
	nativeEvent.isPropagationStopped = CustomEvent.isPropagationStopped;

	nativeEvent._stopImmediatePropagation = nativeEvent.stopImmediatePropagation;
	nativeEvent.stopImmediatePropagation = CustomEvent.stopImmediatePropagation;
	nativeEvent.isImmediatePropagationStopped = CustomEvent.isImmediatePropagationStopped;

	nativeEvent._preventDefault = nativeEvent.preventDefault;
	nativeEvent.preventDefault = CustomEvent.preventDefault;
	nativeEvent.isDefaultPrevented = CustomEvent.isDefaultPrevented;

	return nativeEvent;
}

export default eventInterface;
