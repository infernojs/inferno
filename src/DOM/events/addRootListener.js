import infernoNodeID from './infernoNodeID';
import listenersStorage from '../../shared/listenersStorage';
import EventRegistry from './EventRegistry';
import eventInterface from './eventInterface';
import createListenerArguments from './createListenerArguments';

export default function addRootListener( e, type ) {

	if (!type) {
		type = e.type;
	}

	const registry = EventRegistry[type];

	// Support: Safari 6-8+
	// Target should not be a text node
	if (e.target.nodeType === 3) {
		e.target = e.target.parentNode;
	}

	let target = e.target,
		listenersCount = registry._counter,
		listeners,
		listener,
		nodeID,
		event,
		args,
		defaultArgs;

	if (listenersCount > 0) {
		event = eventInterface(e, type);
		defaultArgs = args = [event];
	}
	// NOTE: Only the event blubbling phase is modeled. This is done because
	// handlers specified on props can not specify they are handled on the
	// capture phase.
	while (target !== null
	&& listenersCount > 0
	&& target !== document.parentNode) {
		if (( nodeID = infernoNodeID(target, true))) {
			listeners = listenersStorage[nodeID];
			if (listeners && listeners[type] && (listener = listeners[type])) {
				// lazily instantiate additional arguments in the case
				// where an event handler takes more than one argument
				// listener is a function, and length is the number of
				// arguments that function takes
				const numArgs = listener.originalHandler.length;

				args = defaultArgs;
				if ( numArgs > 1 ) {
					args = createListenerArguments(target, event);
				}

				// 'this' on an eventListener is the element handling the event
				// event.currentTarget is unwriteable, and since these are
				// native events, will always refer to the document. Therefore
				// 'this' is the only supported way of referring to the element
				// whose listener is handling the current event
				listener.handler.apply( target, args );

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
