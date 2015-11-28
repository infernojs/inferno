function stopPropagation() {
	this._isPropagationStopped = true;
	if (this._stopPropagation) {
		this._stopPropagation();
	} else {
		this.cancelBubble = true;
	}
}

function isPropagationStopped() {
	return this._isPropagationStopped;
}

function stopImmediatePropagation() {
	this._isImmediatePropagationStopped = true;
	this._isPropagationStopped = true;
	if (this._stopImmediatePropagation) {
		this._stopImmediatePropagation();
	} else {
		this.cancelBubble = true;
	}
}

function isImmediatePropagationStopped() {
	return this._isImmediatePropagationStopped;
}

function preventDefault() {
	this._isDefaultPrevented = true;

	if (this._preventDefault) {
		this._preventDefault();
	} else {
		this.returnValue = false;
	}
}

function isDefaultPrevented() {
	return this._isDefaultPrevented;
}

const plugins = {};
export function registerEventSetupPlugin(type, hook) {
	let hooks = plugins[type] = plugins[type] || [];
	hooks.push(hook);
}

function eventSetup(nativeEvent) {
	// Extend nativeEvent
	nativeEvent._stopPropagation = nativeEvent.stopPropagation;
	nativeEvent.stopPropagation = stopPropagation;
	nativeEvent.isPropagationStopped = isPropagationStopped;

	nativeEvent._stopImmediatePropagation = nativeEvent.stopImmediatePropagation;
	nativeEvent.stopImmediatePropagation = stopImmediatePropagation;
	nativeEvent.isImmediatePropagationStopped = isImmediatePropagationStopped;

	nativeEvent._preventDefault = nativeEvent.preventDefault;
	nativeEvent.preventDefault = preventDefault;
	nativeEvent.isDefaultPrevented = isDefaultPrevented;

	// Plugins
	// register other eventHooks elsewhere, which will be called and injected here
	// registerHook('scroll', nativeEvent => {
	//	 // logic here
	// });
	let hooks = plugins[nativeEvent.type];
	if (hooks) {
		let len = hooks.length;
		for(let i = 0; i < len; i++) {
			hooks[i](nativeEvent);
		}
	}

	return nativeEvent;
}

export default eventSetup;