import InfernoNodeID  from './InfernoNodeID';
import listenersStorage from './listenersStorage';
import EventRegistry from './EventRegistry';
import setupEvents from './setupEvents';
import createListenerArguments from './createListenerArguments';

export default function addRootListener(e, type) {

	type || (type = e.type);

	const registry = EventRegistry[type];

	let target = e.target,
		listenersCount = registry.counter,
		listeners,
		listener,
		nodeID,
		event,
		args,
		defaultArgs;

	if (listenersCount > 0) {
		event = setupEvents(e);
		defaultArgs = args = [event];
	}

	// NOTE: Only the event blubbling phase is modeled. This is done because
	// handlers specified on props can not specify they are handled on the
	// capture phase.
	while(target !== null
		&& listenersCount > 0
		&& target !== document.parentNode) {
		if( (nodeID = InfernoNodeID(target, true)) ) {
			listeners = listenersStorage[nodeID];
			if(listeners && (listener = listeners[type])) {
				// lazily instantiate additional arguments in the case
				// where an event handler takes more than one argument
				// listener is a function, and length is the number of
				// arguments that function takes
				let numArgs = listener.length;
				args = defaultArgs;
				if (numArgs > 1) {
					args = createListenerArguments(target, event);
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