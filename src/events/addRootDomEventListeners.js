import getDomNodeId  from './getEventID';
import listenersStorage from './listenersStorage';
import EventRegistry from './EventRegistry';
import eventSetup from './hooks/eventSetup';
import createListenerArguments from './hooks/createListenerArguments';

function addRootDomEventListeners(e, type) {

	type || (type = e.type);

	const cfg = EventRegistry[type];

	let target = e.target,
		delegateTarget = target,
		listenersCount = cfg.listenersCounter,
		listeners,
		listener,
		domNodeId,
		event,
		args,
		setupArgs = true;

	if (listenersCount > 0) {
		event = eventSetup(e);
		args = [event];
	}

	// NOTE: Only the event blubbling phase is modeled. This is done because
	// handlers specified on props can not specify they are handled on the
	// capture phase.
	while(target !== null
		&& listenersCount > 0
		&& target !== document.parentNode) {
		if( (domNodeId = getDomNodeId(target, true)) ) {
			listeners = listenersStorage[domNodeId];
			if(listeners && (listener = listeners[type])) {
				// lazily instantiate additional arguments in the case
				// where an event handler takes more than one argument
				let numArgs = listener.length;
				if (setupArgs && numArgs > 1) {
					setupArgs = false;
					args = createListenerArguments(delegateTarget, event);
				}
				// 'this' on an eventListener is the element handling the event
				// event.currentTarget is unwriteable, and since these are
				// native events, will always refer to the document. Therefore
				// 'this' is the only supported way of referring to the element
				// whose listener is handling the current event
				listener.apply(target, args);

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

export default addRootDomEventListeners;
