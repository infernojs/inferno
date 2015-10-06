import eventsCfg     from './shared/eventsCfg';
import checkKeyboard from './shared/checkKeyboard';
import getUniqueId   from './getUniqueId';
import rootListeners from './vars/rootListeners';

let stopImmediate = false;

function normalizeEvents(ev, type) {

    if (!ev) {
        ev = window.event;
        if (!ev.preventDefault) {
            ev.preventDefault = function() {
                this.defaultPrevented = true;
                this.returnValue = false;
            };
            ev.stopPropagation = function() {
                this.cancelBubble = true;
            };
            ev.defaultPrevented = (ev.returnValue === false);
        }
    }
    
    ev.stopImmediatePropagation = function() {
        stopImmediate = true;
        this.stopPropagation();
    };

    switch (type) {

        case 'keydown':
        case 'keyup':
        case 'keypress':
            // webkit key event issue workaround
            ev = checkKeyboard(ev, type);
            break;
        case 'wheel':
            // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
            'deltaX' in ev ? ev.deltaX : -ev.wheelDeltaX;
            // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
            'deltaY' in ev ? ev.deltaY : -ev.wheelDeltaY;
            break;
    }

    return ev;
}

function eventHandler(e) {
    rootListeners[getUniqueId(e.target)][e.type](normalizeEvents(e, e.type));
}

function addRootListener(e, type) {

    type || (type = e.type);

    const config = eventsCfg[type];

    let target = e.target,
        listenersState = config.countListeners,
        listeners,
        listener,
        uniqueId,
        ev;

    while (listenersState > 0 && target !== document.body) {
        if ((uniqueId = getUniqueId(target, true))) {
            listeners = rootListeners[uniqueId];
            if (listeners && (listener = listeners[type])) {
                listener(ev || (ev = normalizeEvents(e)));
                if (stopImmediate) {
                    stopImmediate = false;
                    break;
                }
                --listenersState;
            }
        }

        target = target.parentNode;
    }
};

export default { eventHandler, addRootListener }