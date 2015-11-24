import SyntheticEvent from './SyntheticEvent';
import getEventID from './getEventID';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';

function rootListener(e, type) {

    type || (type = e.type);

    const config = EventRegistry[type],
        listenersToInvoke = [];

    let target = e.target,
        listenersCount = config.counter,
        listeners,
        listener,
        domNodeId;
    
    for (; 0 < listenersCount && target !== document.body;) {
        if(domNodeId = getEventID(target, true)) {
            listeners = listenersStorage[domNodeId];
            if(listeners && (listener = listeners[type])) {
                listenersToInvoke.push(listener);
                --listenersCount;
            }
        }

        target = target.parentNode;
    }

    if(listenersToInvoke.length) {
        const event = SyntheticEvent(e),
            len = listenersToInvoke.length;

        let i = 0;

        while(i < len) {
            listenersToInvoke[i++](event);
            if(event.isPropagationStopped()) {
                break;
            }
        }
    }

}

export default rootListener;