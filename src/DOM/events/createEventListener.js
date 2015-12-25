import listenersStorage from '../../shared/listenersStorage';
import createListenerArguments from './createListenerArguments';
import InfernoNodeID from './InfernoNodeID';

export default function createEventListener( type ) {
	return e => {
		const target = e.target;
		const listener = listenersStorage[InfernoNodeID( target )][type];
		const args = listener.originalHandler.length > 1
			? createListenerArguments( target, e )
			: [e];

		listener.originalHandler.apply( target, args );
	};
}