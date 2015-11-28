import getDomNodeId  from './getEventID';
import listenersStorage from './listenersStorage';
import EventRegistry from './EventRegistry';
import eventHooks from './eventHooks';

function addRootDomEventListerners(e, type) {

	type || (type = e.type);

	const cfg = EventRegistry[type];

	let target = e.target,
		listenersCount = cfg.listenersCounter,
		listeners,
		listener,
		domNodeId,
		event = listenersCount > 0 && eventHooks(e);

	// NOTE: Only the event blubbling phase is modeled. This is done because
	// handlers specified on props can not specify they are handled on the
	// capture phase.
	while(target !== null
		&& listenersCount > 0
		&& target !== document.parentNode) {
		if(domNodeId = getDomNodeId(target, true)) {
			listeners = listenersStorage[domNodeId];
			if(listeners && (listener = listeners[type])) {
				// 'this' on an eventListener is the element handling the event
				// event.currentTarget is unwriteable, and since these are
				// native events, will always refer to the document. Therefore
				// 'this' is the only supported way of referring to the element
				// whose listener is handling the current event
				listener.call(target, event);

				// Check if progagation stopped. There is only one listener per
				// type, so we do not need to check immediate propagation.
				if (event.isPropagationStopped()) {
					break;
				}

				--listenersCount;
			}
		}

		target = target.parentNode;
	}

}

export default addRootDomEventListerners;