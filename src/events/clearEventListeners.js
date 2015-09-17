import rootListeners from './shared/rootListeners';
import events        from './shared/events';

export default function clearEventListeners( parentDom, listenerName ) {
	let listeners = rootListeners[events[listenerName]],
		index = 0;

	while ( index < listeners.length ) {
		if ( listeners[index].target === parentDom ) {
			listeners.splice( index, 1 );
			index = 0;
		}
		index++;
	}
}
