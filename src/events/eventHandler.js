import SyntheticEvent from './SyntheticEvent';
import getEventID from './getEventID';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';

function eventHandler(e, type) {

    // TODO! If some 'e' need a fix, do it here

    type = type || e.type;

    const listenersToInvoke = [];

    let target = e.target,
        listenersCount = EventRegistry[type].counter,
        listeners,
        listener;

    for (; target != null && 0 < listenersCount && target !== document.parentNode;) {

        let domNodeId = getEventID(target, true);

        if (domNodeId) {

            listeners = listenersStorage[domNodeId];

            if (listeners && (listener = listeners[type])) {

                listenersToInvoke.push(listener);
                --listenersCount;
            }
        }

        target = target.parentNode;
    }

    if (listenersToInvoke.length) {

        const event = SyntheticEvent(e);

        for (let i = 0; i < listenersToInvoke.length; i++) {
            listenersToInvoke[i](event);
            if (event.isPropagationStopped()) {
                break;
            }
        }
    }
}

export default eventHandler;