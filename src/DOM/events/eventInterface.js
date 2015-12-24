/* eslint no-invalid-this:0 */

function stopPropagation() {
	this._isPropagationStopped = true;
	if ( this._stopPropagation ) {
		this._stopPropagation();
	} else {
		this.cancelBubble = true;
	}
}

	stopPropagation() {
		this._isPropagationStopped = true;
		if ( this._stopPropagation ) {
			this._stopPropagation();
		} else {
			this.cancelBubble = true;
		}
	},

function stopImmediatePropagation() {
	this._isImmediatePropagationStopped = true;
	this._isPropagationStopped = true;
	if ( this._stopImmediatePropagation ) {
		this._stopImmediatePropagation();
	} else {
		this.cancelBubble = true;
	}
}

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

	if ( this._preventDefault ) {
		this._preventDefault();
	} else {
		this.returnValue = false;
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
