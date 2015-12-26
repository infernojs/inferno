import infernoNodeID from './infernoNodeID';
import addRootListener from './addRootListener';
import EventRegistry from './EventRegistry';
import listenersStorage from '../../shared/listenersStorage';
import setHandler from './setHandler';
import createEventListener from './createEventListener';

export default function addListener( vNode, domNode, type, listener ) {
	if ( !domNode ) {
		return null; // TODO! Should we throw?
	}
	const registry = EventRegistry[type];

	// only add listeners for registered events
	if ( registry ) {
		if ( !registry._enabled ) {
			// handle focus / blur events
			if ( registry._focusBlur ) {
				registry._focusBlur();
			} else if ( registry._bubbles ) {
				const handler = setHandler( type, addRootListener ).handler;

				document.addEventListener( type, handler, false );
			}
			registry._enabled = true;
		}
		const nodeID = infernoNodeID( domNode ),
			listeners = listenersStorage[nodeID] || ( listenersStorage[nodeID] = {} );

		if ( listeners[type] ) {
			if ( listeners[type].destroy ) {
				listeners[type].destroy();
			}
		}
		if ( registry._bubbles ) {
			if ( !listeners[type] ) {
				++registry._counter;
			}
			listeners[type] = {
				handler: listener,
				originalHandler: listener
			};
		} else {
			listeners[type] = setHandler( type, createEventListener( type ) );
			listeners[type].originalHandler = listener;
			domNode.addEventListener( type, listeners[type].handler, false );
		}
	} else {
		throw Error( 'Inferno Error: ' + type + ' has not been registered, and therefor not supported.' );
	}
}
