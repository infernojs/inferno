import isEventSupported from './isEventSupported';
import SyntheticEvent from './SyntheticEvent';
import getDomNodeId from './getDomNodeId';
import EventConstants from './EventConstants';
import focusEvents from './focusEvents';
import EventRegistry from './EventRegistry';
import listenersStorage from './listenersStorage';

const doc = global.document,
    body = doc && doc.body;


function globalEventListener(e, type) {
    type || (type = e.type);

    const config = EventRegistry[type],
        listenersToInvoke = [];

    let target = e.target,
        listenersCount = config.listenersCounter,
        listeners,
        listener,
        domNodeId;
    
    for (; 0 < listenersCount && target !== body;) {
        if(domNodeId = getDomNodeId(target, true)) {
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

export default globalEventListener;