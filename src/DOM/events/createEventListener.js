import listenersStorage from '../../shared/listenersStorage';
import createListenerArguments from './createListenerArguments';
import infernoNodeID from './infernoNodeID';

export default function createEventListener(type) {
	return e => {
		const target = e.target;
		const listener = listenersStorage[infernoNodeID(target)][type];
		const args = listener.originalHandler.length > 1
			? createListenerArguments(target, e)
			: [e];

		listener.originalHandler.apply(target, args);
	};
}