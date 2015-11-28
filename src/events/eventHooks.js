function stopPropagation() {
    this._isPropagationStopped = true;
    if (this._stopPropagation) {
        this._stopPropagation();
    } else {
        this.cancelBubble = true;
    }
};

function isPropagationStopped() {
    return this._isPropagationStopped;
};

function stopImmediatePropagation() {
    this._isImmediatePropagationStopped = true;
    this._isPropagationStopped = true;
    if (this._stopImmediatePropagation) {
        this._stopImmediatePropagation();
    } else {
        this.cancelBubble = true;
    }
};

function isImmediatePropagationStopped() {
    return this._isImmediatePropagationStopped;
};

function preventDefault() {
    this._isDefaultPrevented = true;

    if (this._preventDefault) {
        this.preventDefault();
    } else {
        this.returnValue = false;
    }
};

function isDefaultPrevented() {
    return this._isDefaultPrevented;
};

const hookPlugins = {};
export function registerHook(type, hook) {
    let hooks = hookPlugins[type] = hookPlugins[type] || [];
    hooks.push(hook);
}

function eventHooks(nativeEvent) {
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
    //     // logic here
    // });
    let hooks = hookPlugins[nativeEvent.type];
    if (hooks) {
        let len = hookPlugins.length;
        for(let i = 0; i < len; i++) {
            hookPlugins[i](nativeEvent);
        }
    }

    return nativeEvent;
}

export default eventHooks;