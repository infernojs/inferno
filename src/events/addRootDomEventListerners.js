import getDomNodeId  from './getEventID';
import listenersStorage from './listenersStorage';

function addRootDomEventListerners(e, type) {
    
	type || (type = e.type);

    const cfg = eventsCfg[type],
        listenersToInvoke = [];

    let target = e.target,
        listenersCount = cfg.listenersCounter,
        listeners,
        listener,
        domNodeId;

    while(listenersCount > 0 && target !== body) {
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
        const len = listenersToInvoke.length;

        let i = 0;

        while(i < len) {
            listenersToInvoke[i++](e);
            if(e.isPropagationStopped()) {
                break;
            }
        }
    }
}

export default addRootDomEventListerners;