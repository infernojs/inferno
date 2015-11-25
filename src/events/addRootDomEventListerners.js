import getDomNodeId  from './getEventID';
import listenersStorage from './listenersStorage';
import EventRegistry from './EventRegistry';
import eventHooks from './eventHooks';

function addRootDomEventListerners(e, type) {
    
	type || (type = e.type);

    const cfg = EventRegistry[type],
        listenersToInvoke = [];

    let target = e.target,
        listenersCount = cfg.listenersCounter,
        listeners,
        listener,
        domNodeId;

    while(target !== null && listenersCount > 0 && target !== document.parentNode) {
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
		const event = eventHooks(e);
        const len = listenersToInvoke.length;

        let i = 0;

        while(i < len) {
            listenersToInvoke[i++](event);
            if(event.isPropagationStopped()) {
                break;
            }
        }
    }
}

export default addRootDomEventListerners;